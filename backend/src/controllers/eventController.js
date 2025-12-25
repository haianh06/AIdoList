const prisma = require('../config/db');

const getEvents = async (req, res) => {
  try {
    const currentUserId = req.user.sub;
    const { start, end, category } = req.query;

    const whereClause = {
      user_id: currentUserId
    };

    if (start && end) {
      whereClause.start_time = { lte: new Date(end) };
      whereClause.end_time = { gte: new Date(start) };
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        exceptions: true 
      }
    });

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      start: event.start_time.toISOString(),
      end: event.end_time.toISOString(),
      category: event.category,
      reminder: event.reminder,
      recurrence: event.recurrence,
      recurrenceCount: event.recurrence_count,
      exceptionDates: event.exceptions ? event.exceptions.map(ex => ex.date) : []
    }));

    return res.status(200).json(formattedEvents);

  } catch (error) {
    console.error("Get Events Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

const createEvent = async (req, res) => {
  try {
    const currentUserId = req.user.sub;
    const data = req.body;

    if (!data.title || !data.start || !data.end) {
      return res.status(400).json({ msg: "Mising fields (title, start, end)" });
    }

    let recCount = 10;
    if (data.recurrenceCount !== undefined && data.recurrenceCount !== null) {
      recCount = parseInt(data.recurrenceCount);
    }

    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        start_time: new Date(data.start),
        end_time: new Date(data.end),
        user_id: currentUserId,
        description: data.description || '',
        location: data.location || '',
        category: data.category || 'default',
        reminder: data.reminder || 'none',
        recurrence: data.recurrence || 'none',
        recurrence_count: recCount
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'create_event',
        details: JSON.stringify({ title: newEvent.title }),
        user_id: currentUserId,
        user_agent: req.headers['user-agent']
      }
    });

    return res.status(201).json({ msg: "Create event successfully", id: newEvent.id });

  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

const createRecurrenceException = async (req, res) => {
  try {
    const currentUserId = req.user.sub;
    const data = req.body;
    
    // Validate đầu vào
    if (!data.originalEventId || !data.exceptionDate || !data.newStart || !data.newEnd) {
        return res.status(400).json({ msg: "Missing fields (originalEventId, exceptionDate, newStart, newEnd)" });
    }

    const originalEventId = parseInt(data.originalEventId);

    // Dùng Transaction: 1 là ghi được cả 2, 2 là không ghi gì cả (tránh rác DB)
    const result = await prisma.$transaction(async (tx) => {
        // 1. Tìm event gốc và check quyền
        const originalEvent = await tx.event.findUnique({
            where: { id: originalEventId }
        });

        if (!originalEvent) throw new Error("EVENT_NOT_FOUND");
        if (originalEvent.user_id !== currentUserId) throw new Error("PERMISSION_DENIED");

        // 2. Tạo record trong bảng Exception (đánh dấu ngày cũ đã bị hủy)
        // createMany hoặc create đều được, ở đây dùng create để bắt lỗi trùng lặp dễ hơn
        await tx.eventException.create({
            data: {
                event_id: originalEventId,
                date: new Date(data.exceptionDate)
            }
        });

        // 3. Tạo Event mới thay thế vào vị trí đó
        const newEvent = await tx.event.create({
            data: {
                title: originalEvent.title, // Copy title cũ hoặc lấy title mới từ req.body nếu muốn
                description: originalEvent.description,
                location: originalEvent.location,
                category: originalEvent.category,
                reminder: originalEvent.reminder,
                
                start_time: new Date(data.newStart),
                end_time: new Date(data.newEnd),
                user_id: currentUserId,
                
                recurrence: 'none',
                recurrence_count: 0
            }
        });

        return newEvent;
    });

    return res.status(201).json({ msg: "Create recurrence exception successfully", newId: result.id });

  } catch (error) {
    if (error.message === "EVENT_NOT_FOUND") return res.status(404).json({ msg: "Cannot find event" });
    if (error.message === "PERMISSION_DENIED") return res.status(403).json({ msg: "Permission denied" });
    if (error.code === 'P2002') return res.status(409).json({ msg: "This date already has an event" });

    console.error("Recurrence Exception Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// --- Helper: Update Event ---
const updateEvent = async (req, res) => {
  try {
    const currentUserId = req.user.sub;
    const eventId = parseInt(req.params.id);
    const data = req.body;

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.user_id !== currentUserId) return res.status(403).json({ msg: "Không có quyền truy cập" });

    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.start) updateData.start_time = new Date(data.start);
    if (data.end) updateData.end_time = new Date(data.end);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.category) updateData.category = data.category;
    if (data.reminder) updateData.reminder = data.reminder;
    if (data.recurrence) updateData.recurrence = data.recurrence;
    
    if (data.recurrenceCount !== undefined && data.recurrenceCount !== null) {
        updateData.recurrence_count = parseInt(data.recurrenceCount);
    }

    await prisma.event.update({
        where: { id: eventId },
        data: updateData
    });

    // Audit Log
    await prisma.auditLog.create({
        data: {
            action: 'update_event',
            details: JSON.stringify({ id: event.id, new_title: updateData.title || event.title }),
            user_id: currentUserId,
            user_agent: req.headers['user-agent']
        }
    });

    return res.status(200).json({ msg: "Cập nhật thành công" });

  } catch (error) {
    console.error("Update Event Error:", error);
    return res.status(500).json({ msg: "Lỗi cập nhật" });
  }
};

// --- Helper: Delete Event ---
const deleteEvent = async (req, res) => {
  try {
    const currentUserId = req.user.sub;
    const eventId = parseInt(req.params.id);

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) return res.status(404).json({ msg: "Event not found" });
    if (event.user_id !== currentUserId) return res.status(403).json({ msg: "Permission denied" });

    await prisma.event.delete({ where: { id: eventId } });

    // Audit Log
    await prisma.auditLog.create({
        data: {
            action: 'delete_event',
            details: JSON.stringify({ id: eventId, title: event.title }),
            user_id: currentUserId,
            user_agent: req.headers['user-agent']
        }
    });

    return res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({ msg: "Lỗi xóa" });
  }
};

module.exports = {
  getEvents,
  createEvent,
  createRecurrenceException,
  updateEvent,
  deleteEvent
};
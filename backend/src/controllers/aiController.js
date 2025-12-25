const prisma = require('../utils/prisma'); // Đảm bảo đường dẫn đúng tới file prisma instance
const AIService = require('../services/aiService');

exports.chatWithAI = async (req, res) => {
  const userId = req.user ? req.user.id : 1; 

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ msg: "Message is required" });
  }

  try {
    const currentTime = new Date().toISOString();
    const aiResponse = await AIService.processChat(message, userId, currentTime);

    if (!aiResponse.success || !Array.isArray(aiResponse.data)) {
      return res.json({ 
        success: true, 
        message: "AI không trích xuất được sự kiện nào.", 
        raw: aiResponse 
      });
    }

    const eventsToCreate = aiResponse.data;
    const results = [];

    for (const event of eventsToCreate) {
      if (event.action === 'create') {
        const parseDate = (dateStr) => {
        if (!dateStr) return null;
        let isoString = dateStr.replace(' ', 'T');
        if (isoString.split(':').length === 2) isoString += ':00'; 
        const userTimezone = "+07:00"; 
        
        return new Date(`${isoString}${userTimezone}`);
        };

        const startTime = parseDate(event.start_time);

        const endTime = event.end_time 
          ? parseDate(event.end_time) 
          : new Date(startTime.getTime() + 60 * 60 * 1000);

        // Gọi Prisma
        const newEvent = await prisma.event.create({
          data: {
            title: event.summary,
            start_time: startTime,
            end_time: endTime,
            location: event.location || null,
            user_id: parseInt(userId),
            category: "generated",
            description: "Created by AI Assistant"
          }
        });

        results.push(newEvent);
      }
    }

    return res.status(200).json({
      success: true,
      msg: `Đã tạo thành công ${results.length} sự kiện`,
      events: results
    });

  } catch (error) {
    console.error("[Backend Controller Error]", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
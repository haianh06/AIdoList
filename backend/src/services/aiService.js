const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

// Sử dụng Singleton pattern cho Prisma để tránh lỗi Too Many Connections
const prisma = new PrismaClient();

class AIService {
  
  /**
   * Xử lý chính: Nhận message -> Gọi Python -> Thực thi DB Node.js
   */
  static async processChat(message, userId, history = []) {
    try {
      const currentTime = new Date().toISOString();

      // 1. Gửi request sang Python Service (The Brain)
      // Python sẽ trả về Intent (ý định) và Data đã được trích xuất
      const aiResponse = await axios.post(`${process.env.AI_SERVICE_URL || 'http://ai_service:8000'}/analyze`, {
        user_id: userId.toString(),
        message: message,
        current_time: currentTime,
        history: history
      }, {
        headers: { 'x-internal-token': process.env.INTERNAL_API_KEY }
      });

      const { intent, response_text, event_data } = aiResponse.data;
      
      let finalMsg = response_text;
      let affectedEvents = [];

      // 2. Thực thi logic DB dựa trên Intent (The Muscle)
      switch (intent) {
        
        // --- CASE 1: TẠO LỊCH ---
        case 'create_event':
          if (event_data && event_data.title && event_data.start_time) {
            try {
              // Mặc định sự kiện kéo dài 1 tiếng nếu AI không trích xuất được end_time
              const startTime = new Date(event_data.start_time);
              const endTime = event_data.end_time 
                ? new Date(event_data.end_time) 
                : new Date(startTime.getTime() + 60 * 60 * 1000);

              const newEvent = await prisma.event.create({
                data: {
                  title: event_data.title,
                  start_time: startTime,
                  end_time: endTime,
                  location: event_data.location || '',
                  category: event_data.category || 'default',
                  user_id: userId,
                  description: "Created by AI Agent"
                }
              });

              affectedEvents = [newEvent];
              finalMsg = `Đã tạo sự kiện: "${newEvent.title}" vào lúc ${startTime.toLocaleString('vi-VN')}`;
            
            } catch (err) {
              console.error("[Create Error]", err);
              finalMsg = "Tôi gặp lỗi khi cố gắng lưu lịch vào hệ thống.";
            }
          }
          break;

        // --- CASE 2: XÓA LỊCH ---
        case 'delete_event':
          if (event_data && (event_data.title || event_data.keywords)) {
            const keyword = event_data.title || event_data.keywords;
            
            // Tìm sự kiện tương lai gần nhất khớp tên
            const eventToDelete = await this.findEventByName(userId, keyword);

            if (eventToDelete) {
              await prisma.event.delete({ where: { id: eventToDelete.id } });
              finalMsg = `Đã xóa sự kiện: "${eventToDelete.title}" (diễn ra lúc ${new Date(eventToDelete.start_time).toLocaleString('vi-VN')})`;
              // Trả về sự kiện rỗng hoặc đánh dấu đã xóa để frontend reload
              affectedEvents = [{ id: eventToDelete.id, _deleted: true }];
            } else {
              finalMsg = `Không tìm thấy sự kiện nào có tên "${keyword}" sắp tới để xóa.`;
            }
          }
          break;

        // --- CASE 3: CẬP NHẬT LỊCH ---
        case 'update_event':
          if (event_data && event_data.old_title) {
            // 1. Tìm sự kiện cũ
            const eventToUpdate = await this.findEventByName(userId, event_data.old_title);

            if (eventToUpdate) {
              // 2. Chuẩn bị dữ liệu update (chỉ update cái gì AI gửi về)
              const updateData = {};
              if (event_data.new_title) updateData.title = event_data.new_title;
              if (event_data.new_start_time) {
                updateData.start_time = new Date(event_data.new_start_time);
                // Nếu đổi giờ bắt đầu mà không nói giờ kết thúc -> Tự dời giờ kết thúc theo
                if (!event_data.new_end_time) {
                    const duration = new Date(eventToUpdate.end_time) - new Date(eventToUpdate.start_time);
                    updateData.end_time = new Date(updateData.start_time.getTime() + duration);
                }
              }
              if (event_data.new_end_time) updateData.end_time = new Date(event_data.new_end_time);

              // 3. Thực hiện Update
              const updatedEvent = await prisma.event.update({
                where: { id: eventToUpdate.id },
                data: updateData
              });

              affectedEvents = [updatedEvent];
              finalMsg = `Đã cập nhật sự kiện "${updatedEvent.title}".`;
            } else {
              finalMsg = `Không tìm thấy sự kiện "${event_data.old_title}" để cập nhật.`;
            }
          }
          break;
          
        // --- CASE 4: CHAT THƯỜNG / HỎI THÔNG TIN ---
        default:
          // Không làm gì với DB, chỉ trả về text của AI
          break;
      }

      // 3. Trả về Response chuẩn cho Frontend
      return { 
        success: true, 
        msg: finalMsg, 
        events: affectedEvents 
      };

    } catch (error) {
      console.error("AI Service Logic Error:", error);
      // Fallback an toàn để Frontend không bị crash
      return { 
        success: false, 
        message: "Hệ thống AI đang bận hoặc gặp sự cố kết nối." 
      };
    }
  }

  /**
   * Helper: Tìm sự kiện theo tên (Keywords)
   * Ưu tiên tìm sự kiện trong tương lai gần nhất
   */
  static async findEventByName(userId, keyword) {
    // 1. Tìm chính xác trong tương lai
    let event = await prisma.event.findFirst({
      where: {
        user_id: userId,
        title: { contains: keyword, mode: 'insensitive' }, // Không phân biệt hoa thường
        start_time: { gte: new Date() } // Lớn hơn thời gian hiện tại
      },
      orderBy: { start_time: 'asc' } // Lấy cái gần nhất
    });

    // 2. Nếu không có trong tương lai, tìm trong quá khứ gần nhất (để sửa/xóa cái vừa diễn ra)
    if (!event) {
      event = await prisma.event.findFirst({
        where: {
          user_id: userId,
          title: { contains: keyword, mode: 'insensitive' }
        },
        orderBy: { start_time: 'desc' }
      });
    }

    return event;
  }
}

module.exports = AIService;
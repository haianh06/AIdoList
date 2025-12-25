const axios = require('axios');

// [REVIEW]: Đổi port nếu cần. Trong docker-compose mày đang để ai_service:8000
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai_service:8000';

class AIService {
  /**
   * @param {string} message 
   * @param {string} userId
   * @param {string} currentTime
   */
  static async processChat(message, userId, currentTime) {
    try {
      // [FIX]: Endpoint phải là /api/v1/chat như bên Python
      const response = await axios.post(`${AI_SERVICE_URL}/api/v1/chat`, {
        message: message,
        current_time: currentTime
      }, {
        timeout: 80000
      });

      return response.data;
    } catch (error) {
      console.error(`[AI Service Error] Chat failed`, error.message);
      if (error.code === 'ECONNREFUSED') throw new Error('AI Service is offline');
      throw error;
    }
  }
}

module.exports = AIService;
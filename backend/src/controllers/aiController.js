const AIService = require('../services/aiService');

exports.chatWithAI = async (req, res) => {
  try {
    const { message, history } = req.body;

    const userId = (req.user && (req.user.sub || req.user.id)) || "anonymous_user";

    const result = await AIService.processChat(message, userId, history);
    
    return res.status(200).json(result);

  } catch (error) {
    console.error("AI Controller Error:", error);
    return res.status(500).json({ success: false, msg: "Server Error", error: error.message });
  }
};
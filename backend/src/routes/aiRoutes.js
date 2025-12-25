const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
// const authMiddleware = require('../middleware/auth'); // Uncomment khi có auth

router.post('/chat', aiController.chatWithAI); // Thêm authMiddleware vào giữa nếu cần

module.exports = router;
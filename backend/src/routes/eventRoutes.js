const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const verifyToken = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', eventController.getEvents);
router.post('/', eventController.createEvent);
router.post('/recurrence-exception', eventController.createRecurrenceException);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;
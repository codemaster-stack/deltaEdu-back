const express = require('express');
const router  = express.Router();
const { getInbox, getSent, sendMessage, markRead, deleteMessage, getUsers, receiveInbound } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/inbox',       protect, getInbox);
router.get('/sent',        protect, getSent);
router.get('/users',       protect, getUsers);
router.post('/',           protect, sendMessage);
router.patch('/:id/read',  protect, markRead);
router.delete('/:id',      protect, deleteMessage);
router.post('/inbound', receiveInbound);

module.exports = router;
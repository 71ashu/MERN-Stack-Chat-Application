const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  chatId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  content: String,
  file: String,
}, {timestamps:true});

const MessageModel = mongoose.model('Message', MessageSchema);

module.exports = MessageModel;
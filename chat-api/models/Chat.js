const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    title: String,
    isGroupChat: { type: Boolean, default: false },
    users: [{ username: String }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

const ChatModel = mongoose.model('Chat', ChatSchema);

module.exports = ChatModel;
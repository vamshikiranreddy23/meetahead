const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  text: String,
  time: String,
});

module.exports = mongoose.model("Message", messageSchema);
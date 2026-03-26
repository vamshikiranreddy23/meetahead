const mongoose = require("mongoose");

const planSchema = new mongoose.Schema({
  location: String,
  dateTime: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Plan", planSchema);
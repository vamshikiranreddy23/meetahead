const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const User = require("./models/User");
const Plan = require("./models/plan");
const Message = require("./models/Message");

const app = express();

// ✅ FIX CORS (IMPORTANT)
app.use(cors({
  origin: "*"
}));

app.use(express.json());

// ✅ ROOT CHECK
app.get("/", (req, res) => {
  res.send("🚀 MeetAhead Backend is Running!");
});

// ✅ MongoDB
mongoose.connect(
  "mongodb://Admin:Vamshi%40230906@ac-nfegoxg-shard-00-00.m0asbjk.mongodb.net:27017,ac-nfegoxg-shard-00-01.m0asbjk.mongodb.net:27017,ac-nfegoxg-shard-00-02.m0asbjk.mongodb.net:27017/mydb?ssl=true&replicaSet=atlas-aym7mc-shard-0&authSource=admin&retryWrites=true&w=majority"
)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log(err));


// ================= AUTH =================
app.post("/api/signup", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json({ success: true, user });
});

app.post("/api/login", async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password
  });

  if (user) res.json({ success: true, user });
  else res.json({ success: false });
});


// ================= PLAN =================
app.post("/api/plan", async (req, res) => {
  const plan = new Plan(req.body);
  await plan.save();
  res.json(plan);
});

app.get("/api/plan", async (req, res) => {
  const plans = await Plan.find().populate("userId");
  res.json(plans);
});


// ================= CHAT =================
app.post("/api/message", async (req, res) => {
  const msg = new Message(req.body);
  await msg.save();
  res.json(msg);
});

app.get("/api/message/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;

  const msgs = await Message.find({
    $or: [
      { senderId: user1, receiverId: user2 },
      { senderId: user2, receiverId: user1 },
    ],
  });

  res.json(msgs);
});


// ================= START =================
app.listen(5000, () => {
  console.log("🔥 Server running on port 5000");
});
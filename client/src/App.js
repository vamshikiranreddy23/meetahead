import { useState, useEffect } from "react";

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("user") ? true : false
  );

  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const [plans, setPlans] = useState([]);
  const [location, setLocation] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [showInbox, setShowInbox] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ================= GET PLANS =================
  const getPlans = async () => {
    const res = await fetch("http://localhost:5000/api/plan");
    const data = await res.json();
    setPlans(data);
  };

  // ================= GET MESSAGES =================
  const getMessages = async () => {
    if (!selectedUser || !user) return;

    const res = await fetch(
      `http://localhost:5000/api/message/${user._id}/${selectedUser._id}`
    );

    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    if (isLoggedIn) getPlans();
  }, [isLoggedIn]);

  useEffect(() => {
    getMessages();
  }, [selectedUser]);

  // ================= AUTH =================
  const handleSubmit = async () => {
    const url = isLogin
      ? "http://localhost:5000/api/login"
      : "http://localhost:5000/api/signup";

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsLoggedIn(true);
    } else {
      alert("Invalid ❌");
    }
  };

  // ================= ADD PLAN =================
  const addPlan = async () => {
    if (!user) return;

    await fetch("http://localhost:5000/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        dateTime: "today",
        userId: user._id,
      }),
    });

    setLocation("");
    getPlans();
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!text || !selectedUser) return;

    await fetch("http://localhost:5000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: user._id,
        receiverId: selectedUser._id,
        text,
        time: new Date().toLocaleTimeString(),
      }),
    });

    setText("");
    getMessages();
  };

  // ================= LOGIN =================
  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h1>MeetAhead 🚀</h1>

        {!isLogin && (
          <>
            <input
              placeholder="Name"
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
            <br /><br />
          </>
        )}

        <input
          placeholder="Email"
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />
        <br /><br />

        <button onClick={handleSubmit}>
          {isLogin ? "Login" : "Signup"}
        </button>

        <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: "pointer" }}>
          {isLogin ? "Create account" : "Already have account?"}
        </p>
      </div>
    );
  }

  // ================= DASHBOARD =================
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>

      {/* 💬 ICON LEFT */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <button onClick={() => setShowInbox(!showInbox)}
          style={{ fontSize: 28 }}>
          💬
        </button>
      </div>

      <h1>Welcome 🎉</h1>

      <button onClick={() => {
        localStorage.removeItem("user");
        setIsLoggedIn(false);
      }}>
        Logout
      </button>

      <br /><br />

      <input
        placeholder="Enter place"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button onClick={addPlan}>Add</button>

      <h2>People going to same place</h2>

      {plans
        .filter(p => p.userId && user && p.userId._id !== user._id && p.location === location)
        .map((p, i) => (
          <div key={i}>
            👤 {p.userId.name}
            <br />
            <button onClick={() => {
              setSelectedUser(p.userId);
              setShowInbox(true); // 🔥 auto open inbox
            }}>
              Chat
            </button>
            <br /><br />
          </div>
        ))}

      <hr />

      {/* 📥 INBOX + CHAT */}
      {showInbox && (
        <div style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 300,
          height: "100%",
          background: "#eee",
          padding: 20,
          borderRight: "2px solid #ccc",
          overflowY: "scroll"
        }}>
          <h3>Inbox 📥</h3>

          {/* USER LIST */}
          {plans
            .filter(p => p.userId && user && p.userId._id !== user._id)
            .map((p, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                👤 {p.userId.name}
                <button onClick={() => setSelectedUser(p.userId)}>
                  Open
                </button>
              </div>
            ))}

          <hr />

          {/* CHAT */}
          {selectedUser && (
            <>
              <h4>Chat with {selectedUser.name}</h4>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>

              {messages.map((m, i) => (
                <div key={i}>
                  <b>{m.senderId === user._id ? "You" : selectedUser.name}:</b>
                  {" "}{m.text}
                </div>
              ))}
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default App;
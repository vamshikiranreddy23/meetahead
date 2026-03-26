import { useState, useEffect } from "react";

function App() {
  const API = "https://meetahead.onrender.com";

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
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchPlans = async () => {
      const res = await fetch(`${API}/api/plan`);
      const data = await res.json();
      setPlans(data);
    };

    fetchPlans();
  }, [isLoggedIn]);

  // ================= AUTO FETCH MESSAGES =================
  useEffect(() => {
    if (!selectedUser || !user) return;

    const fetchMessages = async () => {
      const res = await fetch(
        `${API}/api/message/${user._id}/${selectedUser._id}`
      );
      const data = await res.json();
      setMessages(data);
    };

    fetchMessages();

    const interval = setInterval(fetchMessages, 2000); // 🔥 auto refresh

    return () => clearInterval(interval);
  }, [selectedUser]);

  // ================= AUTH =================
  const handleSubmit = async () => {
    const url = isLogin
      ? `${API}/api/login`
      : `${API}/api/signup`;

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
    if (!user || !location) return;

    await fetch(`${API}/api/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        dateTime: "today",
        userId: user._id,
      }),
    });

    setLocation("");

    const res = await fetch(`${API}/api/plan`);
    const data = await res.json();
    setPlans(data);
  };

  // ================= SEND MESSAGE =================
  const sendMessage = async () => {
    if (!text || !selectedUser) return;

    await fetch(`${API}/api/message`, {
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
  };

  // ================= GET MY LOCATION =================
  const myPlan = plans.find(
    (p) =>
      p.userId &&
      user &&
      p.userId._id.toString() === user._id.toString()
  );

  const myLocation = myPlan?.location;

  // ================= MATCH USERS =================
  const matchedUsers = plans.filter(
    (p) =>
      p.userId &&
      user &&
      p.userId._id.toString() !== user._id.toString() &&
      p.location === myLocation
  );

  // ================= UNIQUE USERS =================
  const inboxUsers = [
    ...new Map(
      matchedUsers.map((p) => [p.userId._id, p.userId])
    ).values(),
  ];

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

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>

      {/* 💬 ICON */}
      <div style={{ position: "absolute", top: 20, left: 20 }}>
        <button onClick={() => setShowInbox(true)} style={{ fontSize: 30 }}>
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

      {/* ADD LOCATION */}
      <input
        placeholder="Enter your place"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button onClick={addPlan}>Add</button>

      <h2>People going to same place</h2>

      {!myLocation && <p>Add your location first 📍</p>}

      {matchedUsers.map((p, i) => (
        <div key={i}>
          👤 {p.userId.name}
          <br />
          <button
            onClick={() => {
              setSelectedUser(p.userId);
              setShowInbox(true);
            }}
          >
            Chat
          </button>
          <br /><br />
        </div>
      ))}

      {/* 📥 INBOX */}
      {showInbox && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: 320,
            height: "100%",
            background: "#f5f5f5",
            padding: 15,
            overflowY: "auto",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid #ccc",
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <button
              onClick={() => {
                setShowInbox(false);
                setSelectedUser(null);
              }}
              style={{ marginRight: 10, fontSize: 18 }}
            >
              ⬅
            </button>

            <h3 style={{ margin: 0 }}>
              {selectedUser ? selectedUser.name : "Inbox 📥"}
            </h3>
          </div>

          {/* USER LIST */}
          {!selectedUser &&
            inboxUsers.map((u, i) => (
              <div key={i}>
                👤 {u.name}
                <button onClick={() => setSelectedUser(u)}>
                  Open
                </button>
                <hr />
              </div>
            ))}

          {/* CHAT */}
          {selectedUser && (
            <>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      m.senderId === user._id
                        ? "flex-end"
                        : "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      background:
                        m.senderId === user._id ? "#4CAF50" : "#ddd",
                      color:
                        m.senderId === user._id ? "white" : "black",
                      padding: "8px 12px",
                      borderRadius: 10,
                      maxWidth: "70%",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              <br />

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
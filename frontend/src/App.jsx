import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await axios.get("http://127.0.0.1:8000/users/");
    setUsers(res.data);
  };

  const addUser = async () => {
    await axios.post("http://127.0.0.1:8000/users/", {
      name,
      email,
    });
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1>User Form</h1>
      <input
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <button onClick={addUser}>Add User</button>

      <h2>Users List</h2>
      {users.map((u) => (
        <p key={u.id}>{u.name} - {u.email}</p>
      ))}
    </div>
  );
}

export default App;

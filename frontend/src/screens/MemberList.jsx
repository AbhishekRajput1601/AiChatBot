import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../context/user.context';

const MemberList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/users/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
        setUsers(res.data.users);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchUsers();
  }, [user]);

  if (loading) return <div>Loading members...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Team Members</h2>
      <ul className="space-y-3">
        {users.map((u) => (
          <li
            key={u._id}
            className="p-4 bg-white shadow rounded-md border border-gray-200"
          >
            <p className="text-lg font-semibold">{u.name}</p>
            <p className="text-sm text-gray-600">{u.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberList;

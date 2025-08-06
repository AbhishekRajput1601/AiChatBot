import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/user.context';

const Logout = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear localStorage and reset user context
    localStorage.removeItem('user');
    setUser(null);
    // Redirect to login page
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;
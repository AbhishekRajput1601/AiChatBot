import React, { useContext } from 'react';
import { UserContext } from '../context/user.context';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate(); // Hook from react-router-dom

    const handleAuthClick = () => {
        if (token) {
            localStorage.removeItem('token');
            setUser(null);
            navigate('/login');
        } else {
            navigate('/login');
        }
    };

    return (
        <nav className="bg-gray-800 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <div className="text-white text-lg font-bold">
                    AichatRoom
                </div>
                <div className="flex space-x-4">
                    <a href="/" className="text-gray-300 hover:text-white">Home</a>
                    <a href="/project" className="text-gray-300 hover:text-white">Projects</a>
                    <a href="/members" className="text-gray-300 hover:text-white">Members</a>
                    <button 
                        onClick={handleAuthClick} 
                        className="text-gray-300 hover:text-white"
                    >
                        {user ? 'Logout' : 'Login'}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

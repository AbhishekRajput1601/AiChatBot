import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../config/axios';
import { UserContext } from '../context/user.context';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const submitHandler = (e) => {
        e.preventDefault();
        setErrorMessage(''); // Reset error message on new submission

        axios.post('/users/register', {
            email,
            password
        })
        .then((res) => {
            console.log(res.data);
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            navigate('/');
        })
        .catch((err) => {
            console.log(err.response.data);
            setErrorMessage(err.response?.data?.message || 'An error occurred during registration.');
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-300">
            <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Register</h2>
                {errorMessage && (
                    <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
                        {errorMessage}
                    </div>
                )}
                <form onSubmit={submitHandler}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email</label>
                        <input
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            id="email"
                            className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2" htmlFor="password">Password</label>
                        <input
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            id="password"
                            className="w-full p-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full p-4 rounded-lg bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Register
                    </button>
                </form>
                <p className="text-gray-600 mt-6 text-center">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-500 hover:underline font-medium">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

// app/register/page.js
'use client'; // Necessary for using hooks in a component

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link'; // Import Link from Next.js

const Registration = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        mobile: '',
        referredBy: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Reset error message
        setSuccess(''); // Reset success message

        try {
            const response = await axios.post('/api/user/register', formData); // Update to your Next.js API route
            setSuccess('User registered successfully');
            // Optionally, you can reset the form here if needed
            setFormData({
                username: '',
                email: '',
                password: '',
                mobile: '',
                referredBy: ''
            });
        } catch (error) {
            setError(error.response?.data?.error || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4">Register</h2>

                {error && <p className="text-red-500 mb-2">{error}</p>}
                {success && <p className="text-green-500 mb-2">{success}</p>}

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="input input-bordered w-full mb-2"
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input input-bordered w-full mb-2"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input input-bordered w-full mb-2"
                />
                <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    className="input input-bordered w-full mb-2"
                />
                <input
                    type="text"
                    name="referredBy"
                    placeholder="Referral Code (optional)"
                    value={formData.referredBy}
                    onChange={handleChange}
                    className="input input-bordered w-full mb-4"
                />
                <button type="submit" className="btn btn-primary w-full">Register</button>
                <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-500 font-semibold hover:underline">
                        Login here
                    </Link>
                </p>
            </form>

            {/* <div className="mt-4 text-center">
                
            </div> */}
        </div>
    );
};

export default Registration;
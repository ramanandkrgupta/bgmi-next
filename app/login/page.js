// app/login/page.js
'use client'; // Necessary for using hooks in a component

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Import useRouter

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter(); // Initialize useRouter

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      setSuccess(data.message);
      // Optionally store the token in local storage or state management
      // localStorage.setItem('token', data.token);
      
      // Redirect to home page after successful login
      router.push('/'); // Redirects to the home page
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Login</h2>

        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input input-bordered w-full mb-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input input-bordered w-full mb-4"
        />
        <button type="submit" className="btn btn-primary w-full">Login</button>
        <p className="text-gray-600 mt-4">
          New Player?{' '}
          <Link href="/signup" className="text-blue-500 font-semibold hover:underline">
            Signup here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
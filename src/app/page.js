"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data from the API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userResponse = await axios.get('http://localhost:5000/api/users/1');
        setUser(userResponse.data); 

        const messageResponse = await axios.get('http://localhost:5000/api/hello');
        setMessage(messageResponse.data.message);

        setLoading(false);
      } catch (error) {
        setError('Error fetching user data');
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Show loading message while data is being fetched
  if (loading) return <p>Loading user data...</p>;

  // Show error message if there's an error
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>This is the main landing page.</p>
      {/* Link to the login page */}
      <Link href="/pages/login">
        <p>Go to login</p>
      </Link>
      {/* Sample axios fetch from flask */}
      <h1>{message}</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Date of Birth:</strong> {user.dob}</p>
      <p><strong>User Profile:</strong> {user.user_profile}</p>
    </div>
  );
}
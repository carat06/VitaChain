// Example: src/components/Auth.jsx
import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Import your initialized Auth and Firestore
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Donor'); // Default role

  // Sign Up
  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up:', userCredential.user);
      // Store user role in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email,
        role: role,
        name: '', // You can add more user details here
      });
      alert('Sign up successful! Role saved.');
    } catch (error) {
      console.error('Error signing up:', error.message);
      alert(error.message);
    }
  };

  // Sign In
  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in:', userCredential.user);
      alert('Sign in successful!');
    } catch (error) {
      console.error('Error signing in:', error.message);
      alert(error.message);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out.');
      alert('Signed out successfully!');
    } catch (error) {
      console.error('Error signing out:', error.message);
      alert(error.message);
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Donor">Donor</option>
        <option value="Hospital">Hospital</option>
        <option value="Lab Technician">Lab Technician</option>
        <option value="Storage Manager">Storage Manager</option>
        <option value="Delivery Person">Delivery Person</option>
      </select>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
}

export default Auth;

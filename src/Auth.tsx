import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // ADD THIS SAFETY CHECK:
    if (!email || !password) return alert("Please type your email and password first!");
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    // ADD THIS SAFETY CHECK:
    if (!email || !password) return alert("Please type your email and password first!");
    
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Account created! You can now click Log In.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <form className="p-8 bg-gray-800 rounded-lg shadow-xl w-96">
        <h1 className="mb-6 text-2xl font-bold text-center">HIREAI Login</h1>
        <input 
          type="email" placeholder="Email Address" 
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 text-black rounded"
        />
        <input 
          type="password" placeholder="Password" 
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 text-black rounded"
        />
        <div className="flex gap-4">
          <button onClick={handleLogin} className="w-1/2 py-2 bg-blue-600 rounded hover:bg-blue-700">Log In</button>
          <button onClick={handleSignUp} className="w-1/2 py-2 bg-green-600 rounded hover:bg-green-700">Sign Up</button>
        </div>
      </form>
    </div>
  );
}
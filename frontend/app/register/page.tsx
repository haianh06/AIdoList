'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import { UserPlus, User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const { username, email, password, confirmPassword } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/register', { 
        username, 
        email, 
        password 
      });
      
      if (res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        if (res.data.user) {
            localStorage.setItem('user', JSON.stringify(res.data.user));
        }
        router.push('/'); 
      } else {
        alert('Registration successful. Please log in.');
        router.push('/login');
      }
    } catch (err: any) {
      alert(err.response?.data?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2548b8] to-[#CD19F0] relative overflow-hidden">

      {/* Card Register */}
      <div className="bg-[#ffffff]/80 w-[330px] p-[30px] rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#ffffff]/20 relative z-[1]">
        
        <div className="text-center">
          <h1 className="text-[#3160F7]">Create Account</h1>
          <p>Join AIdoList to organize your life smarter.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-[15px]">
          
          {/* Username */}
          <div>
            <label>Full Name</label>
            <div className="relative">
                <input
                    type="text"
                    name="username"
                    value={username}
                    onChange={handleChange}
                    className="w-[300px] pl-[10px] pr-[10px] py-[10px] border rounded-[10px] focus:outline-none focus:border-[#3160F7] focus:border-[2px]"
                    placeholder="Your name"
                    required
                />
            </div>
          </div>

          {/* Email */}
          <div>
            <label>Email Address</label>
            <div className="relative">
                <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    className="w-[300px] pl-[10px] pr-[10px] py-[10px] border rounded-[10px] focus:outline-none focus:border-[#3160F7] focus:border-[2px]"
                    placeholder="name@work-email.com"
                    required
                />
            </div>
          </div>
          
          {/* Password */}
          <div>
            <label>Password</label>
            <div className="relative">
                <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    className="w-[300px] pl-[10px] pr-[10px] py-[10px] border rounded-[10px] focus:outline-none focus:border-[#3160F7] focus:border-[2px]"
                    placeholder="••••••••"
                    required
                    minLength={6}
                />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label>Confirm Password</label>
            <div className="relative">
                <input
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    className="w-[300px] pl-[10px] pr-[10px] py-[10px] border rounded-[10px] focus:outline-none focus:border-[#3160F7] focus:border-[2px]"
                    placeholder="••••••••"
                    required
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-[320px] bg-[#3160F7] hover:bg-[#3160F7]/90 text-[#ffffff] text-[15px] font-[500] py-[10px] rounded-[15px] hover:shadow-indigo-500/50 active:scale-[0.98] flex items-center justify-center mt-[10px]"
          >
            {loading ? 'Creating Account...' : (
                <>
                    Sign Up
                </>
            )}
          </button>

          <div className="text-center border-t">
            <p>
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="no-underline hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Gọi API Backend
      const res = await api.post('/auth/forgot-password', { email });
      setMessage(res.data.msg);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-[#CD19F0] to-[#3160F7]">
      <div className="w-[400px] h-[400px] border border-gray-200 bg-[#ffffff] rounded-[15px] shadow-2xl ">

        <h1 className="text-[#3160F7] text-center">Forgot Password</h1>
        <p className="text-center">
            Enter your email and we'll send you a link to reset your password
        </p>

        {message ? (
            <div className="text-center">
                {message}
                <div>Please check your email.</div>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="text-[red] text-center">{error}</div>}
                
                <div className="text-left">
                    <label className="px-[40px] my-[10px] block">Your Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-[300px] px-[10px] mx-[40px] mb-[20px] py-[10px] rounded-[5px] outline-none transition-all border-[2px] border-[#73788B] text-[#000000] focus:border-[#3C62DF] focus:text-[#000000] focus:[#3C62DF]"
                        placeholder="name@example.com"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mx-[40px] my-[5px] w-[322px] h-[40px] bg-[#3C62DF] text-[#ffffff] font-[600] rounded-[5px] text-[16px]"
                >
                    {loading ? 'Loading...' : 'Send Reset Link'}
                </button>
            </form>
        )}

        <button className="mx-[40px] my-[10px] w-[322px] h-[40px] bg-[#3C62DF] text-[#ffffff] font-[600] rounded-[5px] text-[16px]">
          <Link href="/login" className="text-[#ffffff] no-underline hover:no-underline">
            Back to login
          </Link>
        </button>
      </div>
    </div>
  );
}
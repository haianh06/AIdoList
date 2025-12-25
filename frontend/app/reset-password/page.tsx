'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => {
      if (!token) {
          setStatus('error');
          setMsg('Invalid token or link has expired.');
      }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setMsg('Passwords do not match!');
        setStatus('error');
        return;
    }
    
    setLoading(true);
    setMsg('');
    
    try {
      await api.post('/auth/reset-password', { token, new_password: password });
      setStatus('success');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setStatus('error');
      setMsg(err.response?.data?.msg || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
      return (
        <div className="text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
            <p className="text-gray-500 mb-6">Your Password has been successfully changed. You will be redirected to the login page in 3 seconds.</p>
        </div>
      );
  }

    return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="w-100 h-[400px] bg-[#ffffff] rounded-[15px] shadow-2xl p-10 border border-gray-100">
        <h1 className="text-[#3160F7] text-center">
            Reset Password
        </h1>
        <p className=" text-center">
            Please enter your new password.
        </p>

        {message ? (
            <div className="border text-center">
            <p>{message}</p>
            <p>You can now log in with your new password.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-6">

            {error && (
                <div className="border">
                {error}
                </div>
            )}

            {/* Mật khẩu mới */}
            <div>
                <label className="block mx-[40px]">
                New Password
                </label>
                <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-[300px] p-[10px] m-[10px] ml-[40px] border rounded-[10px] focus:outline-none focus:border-[#3160F7] focus:border-[2px]"
                placeholder="••••••••"
                required
                minLength={6}
                />
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
                <label className="block mx-[40px]">
                Confirm Password
                </label>
                <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-[300px] p-[10px] m-[10px] ml-[40px] border rounded-[10px] focus:outline-none focus:border-[#3160F7] focus:border-[2px]"
                placeholder="••••••••"
                required
                />
            </div>

            {/* Nút submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-[322px] rounded-[10px] h-[40px] mx-[40px] bg-[#3C62DF] text-[15px] text-[#ffffff] font-[600] hover:opacity-95 transition-opacity"
            >
                {loading ? 'Loading...' : 'Change Password'}
            </button>
            </form>
        )}

        {/* Nút Back to login - chỉ hiện khi chưa thành công */}
        {!message && (
        <div className="w-[320px] h-[35px] mx-[40px] my-[10px] bg-[#3C62DF] border-[2px] border-[#000000] text-[#ffffff] text-[16px] font-[600] rounded-[10px] hover:opacity-95 transition-opacity ">
            <Link 
            href="/login" 
            className="text-[#ffffff] no-underline hover:no-underline w-full h-full flex items-center justify-center"
            >
            Back to login
            </Link>
        </div>
        )}

        {/* Khi đã đổi thành công thì hiện nút login ngay */}
        {message && (
            <div className="mt-6 text-center">
            <Link 
                href="/login" 
                className="inline-block w-full h-12 bg-[#3160F7] hover:bg-[#2548b8] text-white font-bold rounded-lg transition-all shadow-lg flex items-center justify-center text-lg"
            >
                Login
            </Link>
            </div>
        )}
        </div>
    </div>
    );
}

// Bọc trong Suspense để tránh lỗi build Next.js
export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className="bg-white w-full max-w-[450px] p-8 rounded-2xl shadow-2xl">
                <Suspense fallback={<div>Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    );
}
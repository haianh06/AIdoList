'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);

      try {
        const res = await api.post('/auth/login', { email, password });
        const realToken = res.data.access_token; 
        const userInfo = res.data.user;
        localStorage.setItem('token', realToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        document.cookie = `token=${realToken}; path=/`; 

        router.refresh(); 
        router.push('/dashboard');

      } catch (err) {
        alert('Đăng nhập thất bại: Sai email hoặc mật khẩu');
        console.error(err);
      } finally {
        setLoading(false);
      }
  };

  return (
    // Background Gradient
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-[#CD19F0] to-[#3160F7]">
      
      {/* Card Login */}
      <div className="w-[400px] h-[500px] bg-[#ffffff] rounded-[15px] shadow-[0_0_10px_rgba(0,0,0,0.2)] w-[380px]"> 
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[30px] text-[#3160F7]">AIdoList</h1>
          <p className="text-[#626161] pt-[2px]">Login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          
          {/* Email Input */}
          <div>
            <label className="block pb-[10px] px-[40px]">Email</label>
            <input
              type="email"
              required
              value={email}
              placeholder='aidolist@gmail.com'
              onChange={(e) => setEmail(e.target.value)}
              className="w-[300px] px-[10px] mx-[40px] mb-[20px] py-[10px] rounded-[5px] outline-none border-[2px] border-[#73788B] text-[#000000] focus:border-[#3C62DF] focus:text-[#000000]"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block pb-[10px] px-[40px]">Password</label>
            <input
              type="password"
              required
              value={password}
              placeholder='••••••••'
              onChange={(e) => setPassword(e.target.value)}
              className="w-[300px] px-[10px] mx-[40px] mb-[20px] py-[10px] rounded-[5px] outline-none border-[2px] border-[#73788B] text-[#000000] focus:border-[#3C62DF] focus:text-[#000000] "
            />
          </div>

          {/* Button Đăng nhập */}
          <div className = "text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-[322px] h-[40px] bg-[#3C62DF] text-[#ffffff] font-[600] rounded-[5px] text-[16px] hover:opacity-95"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>
          {/* Link Quên mật khẩu */}
          <div className="text-center p-[10px]">
            <Link href="/forgot-password" className="text-blue-600 no-underline">
                Forgot Password?
            </Link>
          </div>

          {/* Button Tới trang Đăng ký */}
          <Link href="/register" className="block text-center">
            <button
              type="button"
              className="w-[322px] h-[40px] bg-[#3C62DF] text-[#ffffff] font-[600] rounded-[5px] text-[16px] hover:opacity-95"
            >
              Register Now
            </button>
          </Link>
          <Link href="/" className="block text-center">
            <button
              type="button"
              className="w-[322px] h-[40px] mt-[10px] bg-[#3C62DF] text-[#ffffff] font-[600] rounded-[5px] text-[16px] hover:opacity-95"
            >
              Back to Home
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
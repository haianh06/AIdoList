'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Logo from './Logo';
import HomeButton from './HomeButton';
import CalendarButton from './CalendarButton';
import RoadmapButton from './RoadmapButton';
import CommunityButton from './CommunityButton';
import { Settings, Moon, Globe, 
    HelpCircle, MessageSquare, Tag
} from 'lucide-react';
interface NavbarProps {
    lang: string;
    setLang: (l: string) => void;
}

export default function Navbar({ lang, setLang }: NavbarProps) {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const [username, setUsername] = useState('User');
    const [email, setEmail] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user'); 
        if (storedUser) {
            try { const userData = JSON.parse(storedUser);
            setUsername(userData.username || 'User');
            setEmail(userData.email || 'No email');
             } catch(e) {}
        }
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="flex items-center justify-between relative ">
            <div className="flex hover:cursor-pointer hover:opacity-80 pl-[80px] items-center justify-between">
                <Logo height={60} />
            </div>
            {/* Home Navigation */}

            <div className="flex items-center gap-[40px]">
                <div className="flex items-center gap-[40px]">
                    <HomeButton />
                    <CalendarButton />
                    <RoadmapButton />
                    <CommunityButton />
                </div>
                {/* Profile Dropdown */}
                <div className="" ref={dropdownRef}>
                    <button 
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex items-center my-[8px] rounded-full bg-transparent border-[0px]"
                    >
                        <div className="flex items-center justify-center w-[40px] h-[40px] bg-[#3160F7] rounded-full hover:cursor-pointer hover:opacity-80">
                            <span className="text-[18px] font-bold text-[#ffffff]">{username.charAt(0).toUpperCase()}</span>
                        </div>
                    </button>
                    
                    {menuOpen && (
                        <div className="absolute right-[10px] top-full mt-[12px] w-[250px] h-[450px] bg-[#ffffff] rounded-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] py-2 animate-[slide-down-fade_0.2s_ease-in-out] fade-[slide-down-fade] zoom-in-95 duration-[150ms] origin-top-right z-100">
                            
                            <div className="px-[10px]">
                                <p className="text-[20px] ml-[15px] font-bold text-[#1A6EF7] mb-[0px]">{username}</p>
                                <p className="text-xs text-[#625B5B] ml-[15px] truncate mt-[0px]">{email}</p>
                            </div>

                            <div className="">
                                <button className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#625B5B] bg-transparent hover:bg-[#E8E8E8] rounded-lg flex items-center gap-[10px] text-sm transition">
                                    <User size={18} className="text-[#625B5B]" /> 
                                    <span className="font-medium">Profile</span>
                                </button>
                                <button className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#625B5B] bg-transparent hover:bg-[#E8E8E8] rounded-lg flex items-center gap-[10px] text-sm transition">
                                    <Settings size={18} className="text-[#625B5B]" /> 
                                    <span className="font-medium">Settings</span>
                                </button>
                                <button className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#625B5B] bg-transparent hover:bg-[#E8E8E8] rounded-lg flex items-center gap-[10px] text-sm transition">
                                    <Moon size={18} className="text-[#625B5B]" /> 
                                    <span className="font-medium">Dark Mode</span>
                                </button>
                                <button className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#625B5B] bg-transparent hover:bg-[#E8E8E8] rounded-lg flex items-center gap-[10px] text-sm transition">
                                    <Globe size={18} className="text-[#625B5B]" /> 
                                    <span className="font-medium">Language</span>
                                </button>
                            </div>

                            {/* === ĐƯỜNG KẺ NGANG === */}
                            <div className="h-[1px] bg-[#CECECE] my-[10px] mx-[10px]"></div>

                            {/* === PHẦN 3: HỖ TRỢ & THÔNG TIN === */}
                            <div className="">
                                <button className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#625B5B] bg-transparent hover:bg-[#E8E8E8] rounded-lg flex items-center gap-[10px] text-sm transition">
                                    <HelpCircle size={18} className="text-[#625B5B]" /> 
                                    <span className="font-medium">Help Center</span>
                                </button>
                                <button className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#625B5B] bg-transparent hover:bg-[#E8E8E8] rounded-lg flex items-center gap-[10px] text-sm transition">
                                    <MessageSquare size={18} className="text-[#625B5B]" /> 
                                    <span className="font-medium">Feedback</span>
                                </button>
                                <button className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#625B5B] bg-transparent hover:bg-[#E8E8E8] rounded-lg flex items-center gap-[10px] text-sm transition">
                                    <Tag size={18} className="text-[#625B5B]" /> 
                                    <span className="font-medium">About AIdoList</span>
                                </button>
                            </div>

                            {/* === ĐƯỜNG KẺ NGANG === */}
                            <div className="h-[1px] bg-[#CECECE] my-[10px] mx-[10px]"></div>

                            {/* === PHẦN 4: LOGOUT === */}
                            <div className="">
                                <button 
                                    onClick={() => {
                                        localStorage.removeItem('token'); 
                                        router.push('/');
                                    }}
                                    className="w-full border-[0px] text-left px-[10px] py-[10px] text-[#f43f5e] bg-transparent hover: bg-[#E8E8E8] rounded-lg flex items-center gap-3 text-sm transition"
                                >
                                    <LogOut size={18} /> 
                                    <span className="font-medium">Logout</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
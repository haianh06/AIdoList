'use client';
import { translations } from '@/utils/translations';
import { Briefcase, BookOpen, User, Layers } from 'lucide-react';

interface SidebarProps {
    currentFilter: string;
    setFilter: (filter: string) => void;
    lang: string;
}

export default function Sidebar({ currentFilter, setFilter, lang }: SidebarProps) {
    const t = translations[lang as keyof typeof translations] || translations.en;

    const filters = [
        { key: 'all', label: 'Tất cả', color: 'bg-[#6366f1]' },   
        { key: 'work', label: 'Công việc', color: 'bg-[#10b981]' }, 
        { key: 'study', label: 'Học tập', color: 'bg-[#f59e0b]' }, 
        { key: 'personal', label: 'Cá nhân', color: 'bg-[#3b82f6]' }, 
    ];

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    document.dispatchEvent(new CustomEvent('searchEvents', { detail: query }));
    };

    return (
        <aside className="w-[300px] bg[#ffffff] flex-col h-full shrink-0 py-[20px] px-[20px]">
             {/* Center Search */}
            <div className="flex-1 max-w-md ">
                <div className="relative group">
                    <input 
                        type="text" 
                        placeholder="Find your tasks..." 
                        onChange={handleSearch}
                        className="w-[250px] h-[30px] pl-[20px] pr-[30px] py-[5px] bg-slate-50 border-[1px] border-slate-200 rounded-[15px] text-[15px] text-[#625B5B] focus:outline-none focus:bg-[#ffffff] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                </div>
            </div>
            <div className="mb-2">
                <h3 className="text-lg font-bold text-slate-800 px-[20px] mb-[10px]">
                    Bộ lọc
                </h3>
                
                <div className="space-y-1">
                    {filters.map((f) => {
                        const isActive = currentFilter === f.key;

                        return (
                            <div 
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className={`
                                    flex items-center px-[20px] py-[10px] rounded-xl cursor-pointer transition-all font-medium text-[15px]
                                    ${isActive 
                                        ? 'bg-[#CDDDF8] text-[#000000] rounded-[10px]'
                                        : 'text-[#000000] hover:bg-[#E8E8E8] rounded-[10px]' 
                                    }
                                `}
                            >

                                <div className={`w-[20px] h-[20px] rounded-full mr-[10px] ${f.color}`}></div>
                                
                                <span>{f.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
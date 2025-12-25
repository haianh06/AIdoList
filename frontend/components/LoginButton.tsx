'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowBigRight, ArrowUpLeftFromSquareIcon, ArrowUpRightFromSquare } from 'lucide-react';

export default function CalendarButton() {
  return (
    <Link 
      href="/login" 
      className="no-underline gap-[10px] text-[#ffffff] flex items-center border-[1px] border-[#263238] px-[10px] py-[10px] rounded-[10px] bg-gradient-to-tr from-[#CD19F0] to-[#3160F7] hover:cursor-pointer hover:opacity-80"
    >
      Login
    </Link>
    
  );
}
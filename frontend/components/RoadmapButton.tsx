'use client';
import React from 'react';
import Link from 'next/link';

export default function CalendarButton() {
  return (
    <Link 
      href="/dashboard" 
      className="no-underline text-[#263238] flex hover:cursor-pointer hover:opacity-80"
    >
      Roadmap
    </Link>
  );
}
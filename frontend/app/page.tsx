import React from "react";
import Logo from "../components/Logo";
import HomeButton from "@/components/HomeButton";
import CalendarButton from "@/components/CalendarButton";
import RoadmapButton from "@/components/RoadmapButton";
import CommunityButton from "@/components/CommunityButton";
import RegisterButton from "@/components/RegisterButton";
import LoginButton from "@/components/LoginButton";
export default function Home() {
  

  return (
    <div className="flex items-center gap-[500px]">
      <div className="pl-[80px] flex hover:cursor-pointer hover:opacity-80 items-center justify-between">
        <Logo height={60} />
      </div>
      <div className="flex items-center gap-[40px]">
        <div className="flex gap-[40px]">
            <HomeButton />
            <CalendarButton />
            <RoadmapButton />
            <CommunityButton />
        </div>
        <div className="flex flex-row justify-center gap-[10px]">
            <RegisterButton />
            <LoginButton />
        </div>
      </div>
    </div>
  );
}
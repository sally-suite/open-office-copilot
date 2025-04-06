import React from "react";
import Image from "next/image";

interface ILogoProps {
  title: "";
}

export default function Logo() {
  return (
    <a href="/" className=" flex flex-row items-center">
      <Image src="/logo.svg" alt="logo" width={40} height={40} />
      {/* <div>
        <span className=" text-dark font-bold font-sans">Sheet Chat</span>
        <span className=" text-title text-sm ml-1 italic">beta</span>
      </div> */}
      <div>
        <div>
          <span className=" text-dark font-bold font-sans">Sally Suite</span>
          {/* <span className=" text-title text-sm ml-1 italic">beta</span> */}
        </div>
        <div className="hidden text-sm text-gray-400 font-normal sm:block">AI-Agent based Copilot</div>
      </div>
    </a>
  );
}

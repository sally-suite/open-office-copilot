"use client";
import React, { useState } from "react";

export default function DropMenu() {
  const [open, setOpen] = useState(false);
  const onOpenMenu = () => {
    setOpen(!open);
  };
  return (
    <div className={`px-4 text-center text-black  md:hidden`}>
      <button
        onClick={onOpenMenu}
        className={`menu-button ${open ? "active" : ""}`}
      >
        <span className="menu-icon" />
      </button>
      <nav
        className={` bg-white box-border  text-center text-black  transform ${open ? "" : "h-0"
          }  transition-all duration-300 ease-in-out  overflow-hidden`}
      >
        <ul className="flex flex-col">
          <li className=" h-10 leading-10 ">
            <a href="#" className=" hover:text-primary">
              Home
            </a>
          </li>
          <li className=" h-10 leading-10 ">
            <a href="#products" className=" hover:text-primary">
              Products
            </a>
          </li>
          <li className=" h-10 leading-10 ">
            <a href="/pricing" className=" hover:text-primary">
              Pricing
            </a>
          </li>
          <li className=" h-10 leading-10 ">
            <a href="/earn-free-trial" className=" hover:text-primary">
              👉 Free 🎁
            </a>
          </li>
          <li className=" h-10 leading-10 ">
            <a href="#contact" className=" hover:text-primary">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
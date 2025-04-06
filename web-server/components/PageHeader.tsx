"use client";
import React, { useEffect, useState } from "react";
import DropMenu from "./DropMenu";
import Logo from "./Logo";
import Image from "next/image";
import { ArrowDown, ChevronDown, ChevronUp } from "lucide-react";

const Menus = [
  // {
  //   name: "Home",
  //   link: "/",

  // },
  // {
  //   name: "Agents",
  //   link: "/#agents",
  // },
  // {

  //   name: "Products",
  //   code: 'products',
  //   link: "/#products",
  // },
  // {
  //   name: "Pricing",
  //   code: 'pricing',
  //   link: "/pricing",
  // },
  // {
  //   name: "👉 Free",
  //   link: "/#free",
  // },
  // {
  //   name: 'Free Trial🎁',
  //   code: 'earn-free-trial',
  //   link: "/earn-free-trial",
  // },
  {
    name: 'Chat',
    code: 'chat',
    link: "/chat",
  },
  {
    name: "Q & A",
    link: "/#qa",
  },
  {
    name: "Contact",
    code: 'contact',
    link: "/#contact",
  },
  // {
  //   name: "Blog",
  //   target: "_blank",
  //   link: "https://medium.com/@refector",
  // },
  // {
  //   name: "Docs",
  //   doc: "docs",
  //   link: "/introduction",
  //   target: "_blank",
  // },
];

export default function PageHeader() {
  const [hash, setHash] = useState("");
  const [active, setActive] = useState("");

  const onMenuClick = (link: string, e: Event) => {

    setActive(link);
    // if (window.location.hash) {
    //   e.preventDefault();
    //   if (link.indexOf('#') >= 0) {
    //     document.getElementById(link.split('#')[1])?.scrollIntoView({
    //       behavior: 'smooth',
    //       block: 'start',
    //       inline: 'nearest'
    //     })
    //   }
    // }
  };

  useEffect(() => {
    console.log(window.location);
    const { pathname, hash } = window.location;
    if (pathname == "/") {
      setActive("/" + hash);
    } else {
      setActive(pathname);
    }
  }, []);
  return (
    <>
      <header className="bg-white px-0 py-1 shadow sticky top-0 z-20 md:px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className=" text-primary flex flex-row justify-center items-center font-bold text-xl">
            <Logo />
          </div>
          <nav className=" hidden text-black  font-semibold md:block">
            {/* <ul className="flex space-x-6">
              <li>
                <a href="/#" className=" hover:text-primary">
                  Home
                </a>
              </li>
              <li>
                <a href="/#features" className=" hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className=" hover:text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/#contact" className=" hover:text-primary">
                  Contact
                </a>
              </li>
              <li>
                <a href="/docs/introduce" className=" hover:text-primary">
                  Documentation
                </a>
              </li>
            </ul> */}
            <ul className="flex space-x-6">
              {Menus.map(({ name, code, link }) => {
                if (code == 'products') {
                  return (
                    <li key={name} className=" relative group">
                      <a
                        href={link}
                        target={'_self'}
                        className={`flex flex-row items-center hover:text-primary ${active === link ? "text-primary" : ""
                          }`}
                        onClick={onMenuClick.bind(null, link)}
                      >
                        {name}
                        <ChevronDown height={16} width={16} className="ml-1 group-hover:rotate-180 transition-all duration-300" />
                      </a>

                      <div className="flex absolute top-8 left-0 flex-row bg-white shadow-md rounded-md w-96  p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 font-normal border">
                        <div className="flex-1 border-r px-2 border-slate-200">
                          <div className="font-bold mb-1">Microsoft Office</div>
                          <ul className="space-y-1">
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#docs">Word</a>
                            </li>
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#sheets">Excel</a>
                            </li>
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#slides">Powerpoint</a>
                            </li>
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#outlook">Outlook</a>
                            </li>
                          </ul>
                        </div>
                        <div className="flex-1 px-2">
                          <div className="font-bold mb-1">Google Workspace</div>
                          <ul className="space-y-1">
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#docs">Docs</a>
                            </li>
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#sheets">Sheets</a>
                            </li>
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#slides">Slides</a>
                            </li>
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/#chrome">Chrome</a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                }
                if (code == 'pricing') {
                  return (
                    <li key={name} className=" relative group">
                      <a
                        href={link}
                        target={'_self'}
                        className={`flex flex-row items-center hover:text-primary ${active === link ? "text-primary" : ""
                          }`}
                        onClick={onMenuClick.bind(null, link)}
                      >
                        {name}
                        <ChevronDown height={16} width={16} className="ml-1 group-hover:rotate-180 transition-all duration-300" />
                      </a>

                      <div className="flex absolute top-8 left-0 flex-row bg-white shadow-md rounded-md w-64  p-4 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-300 font-normal border">
                        <div className="flex-1 px-2 border-slate-200">
                          <ul className="space-y-1">
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/pricing#flexible">Flexible Version</a>
                            </li>
                            {/* <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/pricing#individual">Individual Plugin Pricing</a>
                            </li> */}
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/pricing#complete">Complete Version</a>
                            </li>
                            <li className=" hover:bg-slate-100 cursor-pointer px-2 py-1 rounded-md">
                              <a className="block" href="/pricing#enterprise">Enterprise Version</a>
                            </li>
                          </ul>

                        </div>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={name}>
                    <a
                      href={link}
                      target={'_self'}
                      className={`hover:text-primary ${active === link ? "text-primary" : ""
                        }`}
                      onClick={onMenuClick.bind(null, link)}
                    >
                      {name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>
      <DropMenu />
    </>
  );
}

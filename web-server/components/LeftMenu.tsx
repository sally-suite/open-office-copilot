'use client'
import { CalendarDays, CreditCard, Gift, KeySquare, LogOut, User } from 'lucide-react'
import { useRouter, usePathname } from "next/navigation";
import { signOut, useSession, signIn } from "next-auth/react";
import Image from "next/image";

import React from 'react'
import { cn } from '@/lib/utils';

const menus = [
  {
    name: 'Profile',
    icon: User,
    href: '/profile'
  },
  {
    name: 'Orders',
    icon: CreditCard,
    href: '/profile/orders'
  },
  {
    name: 'Subscription',
    icon: CalendarDays,
    href: '/profile/subscriptions'
  },
  // {
  //   name: 'Trial Code',
  //   icon: Gift,
  //   href: '/profile/trial-code'
  // },
  {
    name: 'Promo Code',
    icon: Gift,
    href: '/profile/promo-code'
  },
  {
    name: 'License Key',
    icon: KeySquare,
    href: '/profile/license-key'
  },
  // {
  //   name: 'OpenAI API Key',
  //   icon: ({ className }) => <Image className={className} src="/icons/openai.svg" alt="logo" width={16} height={16} />,
  //   href: '/profile/openai-api-key'
  // }
]
export default function LeftMenu() {
  const route = useRouter();
  const pathname = usePathname();
  const onNav = (href: string) => {
    route.push(href)
  }
  const logOut = () => {
    signOut({ callbackUrl: "/" });
  };
  console.log(pathname)
  return (
    <div className=" bg-white rounded-lg shadow mt-4 flex flex-col w-60 h-96 overflow-hidden" >
      {
        menus.map(({ name, href, icon }) => {
          const Icon = icon;
          return (
            <a key={name} className={cn(
              "flex w-full flex-row items-center h-12 hover:bg-gray-100 py-2 px-4 cursor-pointer",
              href == pathname ? "bg-gray-100" : ""
            )} onClick={onNav.bind(null, href)}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{name}</span>
            </a>
          )
        })
      }
      <a className="flex w-full flex-row items-center h-12 hover:bg-gray-100 py-2 px-4 cursor-pointer" onClick={logOut}>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Sign Out</span>
      </a>
    </div>
  )
}

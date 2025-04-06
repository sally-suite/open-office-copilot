"use client"
import React from 'react'
import Button from './Button'
import { signOut } from 'next-auth/react'

export default function SignOutButton() {
    return (
        <div>
            <Button
                variant={"ghost"}
                onClick={() => signOut({ callbackUrl: "/admin" })}
                className="w-full"
            >
                Sign out
            </Button>
        </div>
    )
}

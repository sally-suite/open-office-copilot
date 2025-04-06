"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
export default function SignOut() {
    return (
        <Dialog open={true} >
            <DialogContent closeable={false} className="sm:max-w-[425px]">
                <DialogHeader className=" flex flex-col items-center mb-2">
                    <div className="mb-2" >
                        <Image src="/logo.svg" alt="logo" width={80} height={80} />
                    </div>
                    <DialogTitle className=" text-center">Signout</DialogTitle>
                </DialogHeader>
                <p className=" text-center">
                    Are you sure you want to sign out?
                </p>
                <div className=" py-4 px-10 text-center">
                    <Button
                        variant={"outline"}
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className=" w-40 rounded-full"
                    >
                        Sign out
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

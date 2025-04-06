"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import SignInForm from "./SignInForm";
import { useSearchParams } from "next/navigation";

export default function SignInDialog({
  closeable = true,
  open,
  onOpenChange,
  showEmail = true
}: {
  closeable: boolean;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  callbackUrl?: string;
  showEmail?: boolean;
}) {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = decodeURIComponent(searchParams?.get("callbackUrl") || '/');
  const loading = status == "loading";
  const onSubmit = (values: any) => {
    console.log(values)
    const host = window.location.host;
    const protocol = window.location.protocol;
    signIn('credentials', {
      ...values,
      callbackUrl: `/admin/models`
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent closeable={closeable} className="sm:max-w-[425px]">
        <DialogHeader className=" flex flex-col items-center mb-2">
          <div className="mb-2" >
            <Image src="/logo.svg" alt="logo" width={80} height={80} />
          </div>
          <DialogTitle className=" text-center">Sign in</DialogTitle>
        </DialogHeader>
        <SignInForm onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

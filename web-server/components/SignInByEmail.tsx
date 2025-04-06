"use client";
//@ts-ignore
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  email: z.string().email(),
});

export default function ProfileForm({
  onSubmit,
}: {
  onSubmit: (valeus: any) => void;
}) {
  const [enable, setEnable] = useState(true)
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // 2. Define a submit handler.
  function onFormSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setEnable(false);
    onSubmit(values);

  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={!enable} className={cn("w-full rounded-full", !enable && "bg-gray-300")} variant={"outline"} type="submit">
          Sign In by Email
        </Button>
      </form>
    </Form>
  );
}

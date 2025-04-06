import type { Metadata } from 'next';
import '@/app/globals.css';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AdminSidebar";
import { AlertProvider } from '@/hooks/use-alert';
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: 'Sally Enterprise',
    description: 'Sally Enterprise',
    icons: '/logo.svg',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <main className='w-full min-h-screen flex flex-col'>
                    <SidebarTrigger />
                    <AlertProvider>
                        <div className='p-4 w-full'>
                            {children}
                        </div>
                    </AlertProvider>
                    <Toaster />
                </main>
            </SidebarProvider>
        </>
    );
}

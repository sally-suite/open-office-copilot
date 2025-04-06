import { Bot, Calendar, Cloudy, Database, Home, Image, Inbox, Search, Settings, User, User2 } from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import Button from "./Button"
import { signOut } from "next-auth/react"
import SignOutButton from './SignOutButton'
// Menu items.
const items = [
    {
        title: "Models",
        url: "/admin/models",
        icon: Inbox,
    },
    // {
    //     title: "Providers",
    //     url: "/admin/providers",
    //     icon: Cloudy,
    // },
    // {
    //     title: "Agents",
    //     url: "/admin/agents",
    //     description: "",
    //     icon: Bot,
    // },
    {
        title: "Text Search",
        url: "/admin/search_text",
        description: "",
        icon: Search,
    },
    {
        title: "Image Search",
        url: "/admin/search_image",
        description: "",
        icon: Image,
    },
    // {
    //     title: "Authentication",
    //     url: "/admin/authentication",
    //     description: "",
    //     icon: User2,
    // },
    {
        title: "Manifest",
        url: "/admin/manifest",
        icon: Settings,
    },
    {
        title: "Database",
        url: "/admin/database",
        icon: Database,
    },
    // {
    //     title: "Add Points",
    //     url: "/admin/add-points",
    //     description: "",
    //     icon: User,
    // },
    // {
    //     title: "Subscriptions",
    //     url: "/admin/subscription-list",
    //     description: "",
    //     icon: User,
    // },
    // {
    //     title: "Blacklist",
    //     url: "/admin/blacklist",
    //     description: "",
    //     icon: User,
    // },
    // {
    //     title: "Trial Code",
    //     url: "/admin/trial-codes",
    //     description: "",
    //     icon: User,
    // }
    // {
    //     title: "Mentors",
    //     url: "/admin/mentors",
    //     icon: Calendar,
    // },
    // {
    //     title: "Bookings",
    //     url: "/admin/bookings",
    //     icon: Search,
    // },
    // {
    //     title: "Settings",
    //     url: "#",
    //     icon: Settings,
    // },
]

export function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent className="flex flex-col">
                <div className="flex-1">
                    <SidebarGroup>
                        <SidebarGroupLabel>Sally</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon height={18} width={18} />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>
                <SignOutButton />
            </SidebarContent>
        </Sidebar>
    )
}

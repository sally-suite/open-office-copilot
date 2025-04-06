import {
    Menubar,
    MenubarCheckboxItem,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarRadioGroup,
    MenubarRadioItem,
    MenubarSeparator,
    MenubarShortcut,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger,
} from "@/components/ui/menubar"
import Link from 'next/link'

const Users: { title: string; href: string; description: string }[] = [
    {
        title: "User List",
        href: "/admin/user-list",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    }
]

const Orders: { title: string; href: string; description: string }[] = [
    {
        title: "Order List",
        href: "/admin/order-list",
        description:
            "For sighted users to preview content available behind a link.",
    }
]

const Messages: { title: string; href: string; description: string }[] = [
    {
        title: "Message List",
        href: "/admin/message-list",
        description:
            "For sighted users to preview content available behind a link.",
    }
]

const UserPoints: { title: string; href: string; description: string }[] = [

    {
        title: "User Points",
        href: "/admin/user-points",
        description: "",
    },
    {
        title: "Token Usage",
        href: "/admin/token-usage",
        description: "",
    },
    {
        title: "Add Points",
        href: "/admin/add-points",
        description: "",
    },
    {
        title: "Subscriptions",
        href: "/admin/subscription-list",
        description: "",
    },
    {
        title: "Blacklist",
        href: "/admin/blacklist",
        description: "",
    },
    {
        title: "Trial Code",
        href: "/admin/trial-codes",
        description: "",
    }
]


const menus = [
    {
        title: "User",
        list: Users
    },
    {
        title: "Order",
        list: Orders
    },
    {
        title: "Message",
        list: Messages
    },
    {
        title: "User",
        list: UserPoints
    }
]

export function MenubarDemo() {
    const onMenuClick = () => {

    }
    return (
        <Menubar>
            {
                menus.map((item, i) => {
                    return (
                        <MenubarMenu key={i}>
                            <MenubarTrigger>{item.title}</MenubarTrigger>
                            <MenubarContent>
                                {
                                    item.list.map((item) => {
                                        return (
                                            <MenubarItem key={item.title} >
                                                <Link href={item.href}> {item.title}</Link>
                                            </MenubarItem>
                                        )
                                    })
                                }

                            </MenubarContent>
                        </MenubarMenu>
                    )
                })
            }
        </Menubar>
    )
}

export default MenubarDemo;
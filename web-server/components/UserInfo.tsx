/* eslint-disable @next/next/no-img-element */
"use client";

import { useSession, signOut } from "next-auth/react";
import React from "react";

// import Token from "@/components/Token";
import { UserOutlined } from "@ant-design/icons";
import Loading from './Loading'
// import UCenterHeader from "@/components/UCenterHeader";
const UserProfile = () => {
    const { data: session, status } = useSession();
    // console.log(session, status);
    const logOut = () => {
        signOut({ callbackUrl: "/" });
    };

    if (status === "loading") {
        return (
            <div className=" w-full text-center bg-white rounded-lg shadow p-8">
                <Loading />
            </div>
        )
    }
    if (status === "unauthenticated") {
        window.location.href = "/";
        return null;
    }
    const user = {
        name: session?.user?.name,
        email: session?.user?.email,
        avatar: session?.user?.image,
        // bio: "Frontend Developer passionate about creating amazing user experiences.",
    };

    return (
        <div className=" w-full text-center bg-white rounded-lg shadow p-8">
            {user.avatar && (
                <img
                    src={user.avatar || ""}
                    alt="User Avatar"
                    className="w-20 h-20 rounded-full mx-auto mb-4"
                />
            )}
            {!user.avatar && (
                <div className=" inline-flex  justify-center items-center  w-20 h-20 border rounded-full mb-4">
                    <UserOutlined
                        style={{
                            fontSize: 60,
                            color: "gray",
                        }}
                    />
                </div>
            )}
            <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
            <p className="text-gray-600 mb-4">{user.email}</p>
        </div>
    );
};

export default UserProfile;

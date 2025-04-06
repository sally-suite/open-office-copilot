import React from 'react'

export default function InstallButtton({ text }) {
    return (
        <a
            href="https://workspace.google.com/marketplace/app/sheet_chat/502322973058"
            target="_blank"
            className="w-full px-5 py-4 bg-primary text-center hover:bg-dark hover:cursor-pointer text-white rounded-full md:w-auto md:px-16">
            {
                text || 'INSTALL'
            }
        </a>
    )
}

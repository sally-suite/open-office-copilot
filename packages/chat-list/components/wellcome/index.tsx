import React, { useEffect, useState } from 'react';
import Icon from 'chat-list/components/icon'; // 替换为你的Logo图片路径
import { getLocalStore, setLocalStore } from 'chat-list/local/local';

interface IWelcomePageProps {
    onStart: () => void;
}

const WelcomePage = ({ onStart }: IWelcomePageProps) => {
    useEffect(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.remove();
        }
    }, []);
    return (
        <div className="flex flex-col items-center justify-center h-screen p-2">
            {/* Logo at the top */}
            <Icon name='logo' className="mb-4 text-6xl" />
            {/* Introduction text */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-4">Welcome to Sally Suite</h1>
                <p className="text-gray-600">Sally Suite is an AI Copilot based on Agents. Let the Agent automate your tasks, You can use it in Google Workspace and Microsoft Office. You can find more <a target='_blank' rel="noreferrer" className=' text-blue-500' href="https://www.youtube.com/watch?v=TQgIkTNJxpo&list=PLmp7C8iNFkNBQpmjUyVONTUmgg1EaBHTD">Video Tutorials</a>  here.</p>
                <p className="text-gray-600 mt-2">Now, you can enjoy these services for free if you have OpenAI Key, Or get started with just <a target='_blank' rel="noreferrer" className=' text-blue-500 underline' href="https://www.sally.bot/pricing">$5/month</a>.  </p>
            </div>

            {/* Start Free Trial button */}
            <button className=" bg-primary text-white px-6 py-3 rounded-full" onClick={onStart}>
                Start Free Trial
            </button>
            <p className='py-2'>
                Go to <a target='_blank' rel="noreferrer" className=' text-blue-500 underline' href="https://www.sally.bot">Sally Suite</a> to learn more
            </p>
        </div>
    );
};

export default WelcomePage;


export const withWellcome = (Element: any) => {
    return function Main(props: any) {
        const [wellcome, setWellcome] = useState(getLocalStore('sheet-chat-wellcome'));
        if (wellcome) {
            return <Element {...props} />;
        }

        return (
            <WelcomePage onStart={() => {
                setLocalStore('sheet-chat-wellcome', '1');
                setWellcome('1');
            }} />
        );
    };
};
import PlanEditor from './TaskList'
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation, useParams, useNavigate } from 'react-router-dom';
import PlanList from './PlanList';
import TaskList from './TaskList';
import ChatPanel from 'chat-list/components/chat-panel'
import Header from '../header';
import { PlanProvider } from './planContext'

const App: React.FC = () => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    console.log(location)
    console.log(params)
    return (
        <PlanProvider>
            <div className='flex flex-row h-screen'>
                <div className='flex-1 shrink-0 border-r h-full overflow-auto' >
                    <Routes  >
                        <Route path="/" element={<PlanList />} />
                        <Route path="/add" element={<TaskList />} />
                        <Route path="/plan/:id" element={<TaskList />} />
                    </Routes>
                </div>
                <div className='flex-1 shrink-0 h-full'>
                    <ChatPanel />
                </div>
            </div>
        </PlanProvider>


    );
};

export default App;

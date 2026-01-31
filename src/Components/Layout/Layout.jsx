import React from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
            <Navbar />
            <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
                {/* Left Sidebar */}
                <div className="hidden lg:block w-[280px] xl:w-[320px] p-4 sticky top-14 h-[calc(100vh-56px)] overflow-hidden hover:overflow-y-auto no-scrollbar">
                    <Sidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 lg:px-6 flex justify-center">
                    <div className="w-full max-w-[600px]">
                        <Outlet />
                    </div>
                </div>

                {/* Right Sidebar (Contacts/Ads) */}
                <div className="hidden xl:block w-[280px] xl:w-[320px] p-4 sticky top-14 h-[calc(100vh-56px)] overflow-hidden hover:overflow-y-auto no-scrollbar">
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-500 text-sm mb-4 px-2">Sponsored</h3>
                        {/* Placeholder Ads */}
                        <div className="flex items-center gap-3 hover:bg-gray-200/50 p-2 rounded-lg cursor-pointer transition-colors">
                            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                <img src="https://picsum.photos/seed/ad1/200" className="w-full h-full object-cover" alt="ad" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800 text-sm line-clamp-2">Premium Web Design Course</p>
                                <p className="text-xs text-gray-400">udemy.com</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-semibold text-gray-500 text-sm">Contacts</h3>
                            <div className="flex gap-2">
                                <button className="w-7 h-7 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500 text-sm">⋯</button>
                            </div>
                        </div>
                        {/* Dummy Contacts */}
                        {['Sarah Wilson', 'James Smith', 'Emily Davis', 'Michael Brown', 'Jessica Taylor'].map((name, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200/50 cursor-pointer transition-colors">
                                <div className="relative">
                                    <img src={`https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&bold=true&size=36`} className="w-9 h-9 rounded-full" alt={name} />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#f0f2f5] rounded-full"></span>
                                </div>
                                <span className="font-medium text-gray-800 text-sm">{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

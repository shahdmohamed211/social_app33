import React, { useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell } from 'react-icons/fa';
import { TbMessageCircleFilled } from 'react-icons/tb';
import { IoImages } from 'react-icons/io5';
import Logo from '../../assets/logo.png';

export default function Navbar() {
    const { logOut, userData } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logOut();
        navigate('/login');
    }

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm px-6 h-14 flex justify-between items-center border-b border-gray-100">
            {/* Left - Logo */}
            <div className="flex items-center gap-2">
                <Link to="/home" className="flex items-center gap-2">
                    <img src={Logo} alt="Nexify" className="w-8 h-8 object-contain" />
                    <span className="text-[#4A90D9] text-xl font-bold hidden sm:inline">Nexify</span>
                </Link>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-xl mx-4">
                <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search for friends, groups, pages"
                        className="w-full bg-gray-50 rounded-full py-2.5 pl-10 pr-4 outline-none text-sm placeholder-gray-400 border border-gray-100 focus:border-gray-200 transition-colors"
                    />
                </div>
            </div>

            {/* Right - Icons */}
            <div className="flex items-center gap-1">
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative">
                    <IoImages size={20} className="text-gray-500" />
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative">
                    <TbMessageCircleFilled size={20} className="text-gray-500" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors relative">
                    <FaBell size={18} className="text-gray-500" />
                </button>

                <div className="relative group ml-2">
                    {userData?.photo ? (
                        <img src={userData.photo} className="w-9 h-9 rounded-full cursor-pointer object-cover border-2 border-gray-200" alt="Profile" />
                    ) : (
                        <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full cursor-pointer flex items-center justify-center text-white font-semibold text-sm">
                            {userData?.name?.charAt(0) || 'U'}
                        </div>
                    )}

                    <div className="absolute right-0 top-full mt-2 bg-white shadow-xl rounded-lg p-2 hidden group-hover:block w-52 border border-gray-100 transform transition-all duration-200 origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <p className="font-semibold text-gray-800 truncate">{userData?.name || 'User'}</p>
                            <p className="text-xs text-gray-400 truncate">{userData?.email}</p>
                        </div>
                        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-50 text-gray-700 rounded-md transition-colors mt-1 text-sm font-medium">View Profile</Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-md transition-colors text-sm font-medium">Log Out</button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

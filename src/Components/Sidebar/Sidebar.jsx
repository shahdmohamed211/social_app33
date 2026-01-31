import { RiHome2Fill } from 'react-icons/ri'
import { FaUserFriends, FaUsers } from 'react-icons/fa'
import { FaStore } from 'react-icons/fa'
import { TfiTag } from 'react-icons/tfi'
import { NavLink } from 'react-router-dom'
import { IoFlag } from 'react-icons/io5'

const menuOptions = [
    {
        label: 'Home',
        icon: <RiHome2Fill size={20} className='text-blue-500' />,
        bgColor: 'bg-blue-500/10',
        path: '/home'
    },
    {
        label: 'Friends',
        icon: <FaUserFriends size={20} className='text-green-500' />,
        bgColor: 'bg-green-500/10',
        path: '/friends'
    },
    {
        label: 'Groups',
        icon: <FaUsers size={20} className='text-orange-500' />,
        bgColor: 'bg-orange-500/10',
        path: '/groups'
    },
    {
        label: "Marketplace",
        icon: <FaStore size={20} className='text-violet-500' />,
        bgColor: 'bg-violet-500/10',
        path: '/marketplace'
    },
    {
        label: "Saved",
        icon: <TfiTag size={20} className='text-red-500' />,
        bgColor: 'bg-red-500/10',
        path: '/saved'
    },
    {
        label: "Pages",
        icon: <IoFlag size={20} className='text-sky-500' />,
        bgColor: 'bg-sky-500/10',
        path: '/pages'
    },
    {
        label: "Favorites",
        icon: <RiHome2Fill size={20} className='text-gray-700' />,
        bgColor: 'bg-gray-700/10',
        path: '/favorites'
    },
]

const myGroups = [
    {
        groupIcon: "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?cs=srgb&dl=pexels-wendywei-1190298.jpg&fm=jpg",
        groupName: "Music Lovers",
    },
    {
        groupIcon: "https://images.pexels.com/photos/3182832/pexels-photo-3182832.jpeg?cs=srgb&dl=pexels-fauxels-3182832.jpg&fm=jpg",
        groupName: "Tech Innovators",
    },
    {
        groupIcon: "https://images.pexels.com/photos/414171/pexels-photo-414171.jpeg?cs=srgb&dl=pexels-pixabay-414171.jpg&fm=jpg",
        groupName: "Travel Explorers",
    },
    {
        groupIcon: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?cs=srgb&dl=pexels-fauxels-3184418.jpg&fm=jpg",
        groupName: "Book Club",
    },
];

export default function Sidebar() {
    return (
        <>
            <div className='rounded-lg'>
                <div className='flex flex-col gap-1'>
                    {menuOptions.map((option) => (
                        <NavLink
                            key={option.label}
                            to={option.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 ${isActive ? 'bg-blue-50' : 'hover:bg-gray-100'} p-2.5 rounded-lg transition-colors`
                            }
                        >
                            <div className={`${option.bgColor} p-2 rounded-full`}>
                                {option.icon}
                            </div>
                            <span className='text-sm font-medium text-gray-800'>{option.label}</span>
                        </NavLink>
                    ))}
                </div>
                <div className='mt-6 space-y-3'>
                    <h2 className='text-sm font-semibold text-gray-500 border-t border-gray-200 pt-4 px-2'>My Groups</h2>
                    {myGroups.map((group) => (
                        <div key={group.groupName} className='flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors'>
                            <img src={group.groupIcon} alt={group.groupName} className='w-9 h-9 rounded-lg object-cover' />
                            <span className='text-sm font-medium text-gray-800'>{group.groupName}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

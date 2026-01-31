import { createContext, useState, useEffect } from 'react';
import { authAPI } from '../Services/api';
import { jwtDecode } from 'jwt-decode';

export const UserContext = createContext();

export default function UserContextProvider({ children }) {
    const [userToken, setUserToken] = useState(localStorage.getItem('userToken'));
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (userToken) {
            fetchProfile();
        } else {
            setIsLoading(false);
        }
    }, [userToken]);

    async function fetchProfile() {
        try {
            const { data } = await authAPI.getProfile();
            if (data.user) {
                setUserData(data.user);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            // If profile fetch fails, try to use token data
            try {
                const decoded = jwtDecode(userToken);
                setUserData(decoded);
            } catch (e) {
                logOut();
            }
        } finally {
            setIsLoading(false);
        }
    }

    function logOut() {
        localStorage.removeItem('userToken');
        setUserToken(null);
        setUserData(null);
    }

    function saveToken(token) {
        localStorage.setItem('userToken', token);
        setUserToken(token);
    }

    function updateUserData(newData) {
        setUserData(prev => ({ ...prev, ...newData }));
    }

    return (
        <UserContext.Provider value={{ userToken, userData, saveToken, logOut, updateUserData, isLoading, refetchProfile: fetchProfile }}>
            {children}
        </UserContext.Provider>
    );
}

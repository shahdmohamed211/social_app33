import React, { useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    const { userToken } = useContext(UserContext);

    if (!userToken) {
        return <Navigate to="/login" />;
    }

    return children;
}

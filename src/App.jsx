import { RouterProvider, createBrowserRouter, Navigate } from 'react-router-dom';
import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';
import Home from './Pages/Home/Home';
import Profile from './Pages/Profile/Profile';
import SinglePost from './Pages/SinglePost/SinglePost';
import Layout from './Components/Layout/Layout';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import UserContextProvider from './Context/UserContext';
import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        path: 'home',
        element: <Home />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'post/:postId',
        element: <SinglePost />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      }
    ],
  },
]);

function App() {
  return (
    <UserContextProvider>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </UserContextProvider>
  );
}

export default App;

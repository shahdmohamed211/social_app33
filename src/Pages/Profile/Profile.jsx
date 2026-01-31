import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../Context/UserContext';
import { authAPI, postsAPI } from '../../Services/api';
import PostCard from '../../Components/Post/PostCard';
import { FaCamera, FaLock } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';

export default function Profile() {
    const { userData, refetchProfile } = useContext(UserContext);
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (userData?._id) {
            fetchUserPosts(userData._id);
        }
    }, [userData]);

    async function fetchUserPosts(id) {
        try {
            const { data } = await postsAPI.getUserPosts(id, 50);
            setMyPosts(data.posts || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handlePhotoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            toast.error('Image must be less than 4MB');
            return;
        }

        const formData = new FormData();
        formData.append('photo', file);

        const toastId = toast.loading('Uploading photo...');
        try {
            const res = await authAPI.uploadPhoto(formData);
            if (res.data.message === 'success') {
                toast.success('Profile photo updated', { id: toastId });
                refetchProfile();
            } else {
                toast.error('Upload failed', { id: toastId });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload photo', { id: toastId });
        }
    }

    const passwordFormik = useFormik({
        initialValues: {
            password: '',
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            password: Yup.string().required('Current password is required'),
            newPassword: Yup.string()
                .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least 8 chars, uppercase, lowercase, number and special char')
                .required('New password is required'),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
                .required('Confirm password is required')
        }),
        onSubmit: async (values) => {
            setPasswordLoading(true);
            try {
                const { data } = await authAPI.changePassword({
                    password: values.password,
                    newPassword: values.newPassword
                });
                if (data.message === 'success') {
                    toast.success('Password changed successfully');
                    setShowPasswordModal(false);
                    passwordFormik.resetForm();
                } else {
                    toast.error(data.message || 'Failed to change password');
                }
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to change password');
            } finally {
                setPasswordLoading(false);
            }
        }
    });

    const refreshPosts = () => {
        if (userData?._id) {
            fetchUserPosts(userData._id);
        }
    }

    if (!userData) return (
        <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover */}
                <div className="h-40 bg-gradient-to-r from-[#4A90D9] to-[#7B68EE] relative">
                    <div className="absolute inset-0 bg-black/10"></div>
                </div>

                <div className="px-6 pb-6">
                    {/* Avatar */}
                    <div className="relative -mt-16 mb-4 inline-block">
                        <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                            {userData?.photo ? (
                                <img src={userData.photo} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-4xl font-bold">
                                    {userData?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <label className="absolute bottom-1 right-1 bg-gray-100 p-2.5 rounded-full cursor-pointer hover:bg-gray-200 transition-colors shadow-md border border-white">
                            <FaCamera className="text-gray-600 text-sm" />
                            <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                        </label>
                    </div>

                    {/* User Info */}
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{userData?.name}</h1>
                            <p className="text-gray-500 text-sm">{userData?.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                {userData?.dateOfBirth && (
                                    <span>🎂 {new Date(userData.dateOfBirth).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                )}
                                {userData?.gender && (
                                    <span className="capitalize">• {userData.gender}</span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="mt-4 sm:mt-0 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                        >
                            <FaLock size={12} /> Change Password
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 mt-6 pt-4 border-t border-gray-100">
                        <div className="text-center">
                            <span className="font-bold text-gray-900 text-xl block">{myPosts.length}</span>
                            <span className="text-gray-500 text-sm">Posts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts Section */}
            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">My Posts</h2>
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : myPosts.length > 0 ? (
                    <div className="space-y-4">
                        {myPosts.map(post => <PostCard key={post._id} post={post} onDelete={refreshPosts} />)}
                    </div>
                ) : (
                    <div className="text-gray-500 bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                        <p className="font-medium">No posts shared yet</p>
                        <p className="text-sm mt-1">Share your first post from the home page!</p>
                    </div>
                )}
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Change Password</h3>
                        <form onSubmit={passwordFormik.handleSubmit} className="space-y-4">
                            <div>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Current Password"
                                    className={`w-full px-4 py-3 rounded-lg border ${passwordFormik.touched.password && passwordFormik.errors.password ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500`}
                                    onChange={passwordFormik.handleChange}
                                    onBlur={passwordFormik.handleBlur}
                                    value={passwordFormik.values.password}
                                />
                                {passwordFormik.touched.password && passwordFormik.errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{passwordFormik.errors.password}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="New Password"
                                    className={`w-full px-4 py-3 rounded-lg border ${passwordFormik.touched.newPassword && passwordFormik.errors.newPassword ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500`}
                                    onChange={passwordFormik.handleChange}
                                    onBlur={passwordFormik.handleBlur}
                                    value={passwordFormik.values.newPassword}
                                />
                                {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
                                    <p className="text-red-500 text-xs mt-1">{passwordFormik.errors.newPassword}</p>
                                )}
                            </div>
                            <div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm New Password"
                                    className={`w-full px-4 py-3 rounded-lg border ${passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500`}
                                    onChange={passwordFormik.handleChange}
                                    onBlur={passwordFormik.handleBlur}
                                    value={passwordFormik.values.confirmPassword}
                                />
                                {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">{passwordFormik.errors.confirmPassword}</p>
                                )}
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="flex-1 bg-[#4A90D9] text-white py-2.5 rounded-lg font-medium hover:bg-[#3a7fc8] transition-colors disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

import React, { useContext, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Context/UserContext';
import { authAPI } from '../../Services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
    const { saveToken } = useContext(UserContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const validationSchema = Yup.object({
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const { data } = await authAPI.signin(values);
                if (data.message === 'success') {
                    saveToken(data.token);
                    toast.success('Welcome back!');
                    navigate('/home');
                } else {
                    toast.error(data.message || 'Login failed');
                }
            } catch (err) {
                toast.error(err.response?.data?.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Blue Gradient */}
            <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-b from-[#4A90D9] to-[#2B6CB0] flex-col justify-between p-8 relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-20 left-1/2 w-16 h-16 rounded-full bg-white/10"></div>
                <div className="absolute top-40 right-16 w-12 h-12 rounded-full bg-white/10"></div>
                <div className="absolute bottom-60 left-12 w-10 h-10 rounded-full bg-white/10"></div>
                <div className="absolute bottom-40 right-1/3 w-14 h-14 rounded-full bg-white/10"></div>

                {/* Logo */}
                <div className="flex items-center gap-2 z-10">
                    <img src={logo} alt="Nexify" className="w-8 h-8 object-contain" />
                    <span className="text-white text-xl font-semibold">Nexify</span>
                </div>

                {/* Main text */}
                <div className="z-10">
                    <h1 className="text-white text-5xl font-bold leading-tight mb-8">
                        Stay<br />Connected.<br />Stay You.
                    </h1>
                </div>

                {/* Bottom text */}
                <div className="z-10">
                    <p className="text-white/90 text-lg">
                        Join today and connect instantly —<br />
                        it's fast, easy, and reliable.
                    </p>
                    {/* Pagination dots */}
                    <div className="flex gap-2 mt-6">
                        <div className="w-8 h-2 bg-white rounded-full"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Welcome Back to Nexify <span className="text-2xl">👋🏼</span>
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
                    </div>

                    <form onSubmit={formik.handleSubmit} className="space-y-4">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email*"
                                className={`w-full px-4 py-3 rounded-lg border ${formik.touched.email && formik.errors.email ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                            />
                            {formik.touched.email && formik.errors.email && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Password*"
                                className={`w-full px-4 py-3 rounded-lg border ${formik.touched.password && formik.errors.password ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </button>
                            {formik.touched.password && formik.errors.password && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#4A90D9] hover:bg-[#3a7fc8] text-white font-semibold py-3 px-10 rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Sign In'}
                            </button>
                            <p className="text-gray-600 text-sm">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-[#4A90D9] font-semibold hover:underline">
                                    Register
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

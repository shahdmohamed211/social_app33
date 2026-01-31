import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../Services/api';
import toast from 'react-hot-toast';
import Logo from '../../assets/logo.png';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required').min(3, 'Too short'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must contain at least 8 chars, one uppercase, one lowercase, one number and one special char').required('Password is required'),
        rePassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
        dateOfBirth: Yup.date().required('Date of birth is required'),
        gender: Yup.string().oneOf(['male', 'female'], 'Select gender').required('Gender is required')
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            rePassword: '',
            dateOfBirth: '',
            gender: 'male',
        },
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const { data } = await authAPI.signup(values);
                if (data.message === 'success') {
                    toast.success('Registration successful! Please login.');
                    navigate('/login');
                } else {
                    toast.error(data.message || 'Registration failed');
                }
            } catch (err) {
                toast.error(err.response?.data?.message || err.response?.data?.error || 'Something went wrong');
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
                    <img src={Logo} alt="Nexify" className="w-8 h-8 object-contain" />
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
                                type="text"
                                name="name"
                                placeholder="Name"
                                className={`w-full px-4 py-3 rounded-lg border ${formik.touched.name && formik.errors.name ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                            />
                            {formik.touched.name && formik.errors.name && <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>}
                        </div>

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
                            {formik.touched.email && formik.errors.email && <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>}
                        </div>

                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password*"
                                className={`w-full px-4 py-3 rounded-lg border ${formik.touched.password && formik.errors.password ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.password}
                            />
                            {formik.touched.password && formik.errors.password && <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>}
                        </div>

                        <div>
                            <input
                                type="password"
                                name="rePassword"
                                placeholder="rePassword*"
                                className={`w-full px-4 py-3 rounded-lg border ${formik.touched.rePassword && formik.errors.rePassword ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400`}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.rePassword}
                            />
                            {formik.touched.rePassword && formik.errors.rePassword && <div className="text-red-500 text-xs mt-1">{formik.errors.rePassword}</div>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <input
                                    type="text"
                                    name="dateOfBirth"
                                    placeholder="Birth date*"
                                    onFocus={(e) => e.target.type = 'date'}
                                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; formik.handleBlur(e); }}
                                    className={`w-full px-4 py-3 rounded-lg border ${formik.touched.dateOfBirth && formik.errors.dateOfBirth ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500 transition-colors text-gray-700 placeholder-gray-400`}
                                    onChange={formik.handleChange}
                                    value={formik.values.dateOfBirth}
                                />
                                <p className="text-xs text-gray-400 mt-1">mm/dd/yyyy</p>
                                {formik.touched.dateOfBirth && formik.errors.dateOfBirth && <div className="text-red-500 text-xs mt-1">{formik.errors.dateOfBirth}</div>}
                            </div>
                            <div>
                                <select
                                    name="gender"
                                    className={`w-full px-4 py-3 rounded-lg border ${formik.touched.gender && formik.errors.gender ? 'border-red-400' : 'border-gray-200'} outline-none focus:border-blue-500 transition-colors text-gray-700 bg-white`}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.gender}
                                >
                                    <option value="" disabled>Gender*</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                {formik.touched.gender && formik.errors.gender && <div className="text-red-500 text-xs mt-1">{formik.errors.gender}</div>}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#4A90D9] hover:bg-[#3a7fc8] text-white font-semibold py-3 px-10 rounded-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Loading...' : 'Submit'}
                            </button>
                            <p className="text-gray-600 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#4A90D9] font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postsAPI } from '../../Services/api';
import PostCard from '../../Components/Post/PostCard';
import { FaArrowLeft } from 'react-icons/fa';

export default function SinglePost() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [postId]);

    async function fetchPost() {
        try {
            const { data } = await postsAPI.getSinglePost(postId);
            setPost(data.post);
        } catch (err) {
            setError('Post not found');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = () => {
        navigate('/');
    }

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <p className="text-gray-500 font-medium">{error}</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 text-blue-500 hover:underline font-medium"
                >
                    Go back to feed
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
            >
                <FaArrowLeft size={14} /> Back
            </button>
            {post && <PostCard post={post} onDelete={handleDelete} />}
        </div>
    );
}

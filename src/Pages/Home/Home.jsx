import React, { useEffect, useState, useContext, useRef } from 'react';
import { postsAPI } from '../../Services/api';
import PostCard from '../../Components/Post/PostCard';
import { UserContext } from '../../Context/UserContext';
import { FaVideo, FaImages, FaSmile, FaTimes } from 'react-icons/fa';
import { MdOutlinePhotoLibrary } from 'react-icons/md';
import { BsEmojiSmile } from 'react-icons/bs';
import toast from 'react-hot-toast';

export default function Home() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userData } = useContext(UserContext);

    const [showModal, setShowModal] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [postImage, setPostImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [creatingPost, setCreatingPost] = useState(false);
    const [page, setPage] = useState(1);
    const fileInputRef = useRef(null);

    // Ref to track locally created posts that might not be in API yet
    const localPostsRef = useRef([]);

    useEffect(() => {
        getPosts();
    }, [page, userData]);

    async function getPosts(preserveLocalPosts = true) {
        setLoading(true);
        try {
            // Fetch both global posts and user's own posts
            const [globalPostsRes, userPostsRes] = await Promise.all([
                postsAPI.getAllPosts(50, page),
                userData?._id ? postsAPI.getUserPosts(userData._id, 50) : Promise.resolve({ data: { posts: [] } })
            ]);

            const globalPosts = globalPostsRes.data.posts || [];
            const userPosts = userPostsRes.data.posts || [];

            // Merge and deduplicate posts
            const allPostsMap = new Map();

            // Add global posts first
            globalPosts.forEach(post => {
                allPostsMap.set(post._id || post.id, post);
            });

            // Add user's posts (overwrite if already exists)
            userPosts.forEach(post => {
                allPostsMap.set(post._id || post.id, post);
            });

            // If we should preserve local posts, add them too
            if (preserveLocalPosts && localPostsRef.current.length > 0) {
                // Check if local posts are now in the API response
                const apiPostIds = new Set(allPostsMap.keys());

                // Keep local posts that aren't in API yet
                localPostsRef.current = localPostsRef.current.filter(localPost => {
                    const localId = localPost._id || localPost.id;
                    // Check if a post with similar content from same user exists
                    const foundInApi = Array.from(allPostsMap.values()).some(apiPost =>
                        apiPost.body === localPost.body &&
                        (apiPost.user._id === localPost.user._id || apiPost.user._id === userData?._id)
                    );
                    return !foundInApi && !apiPostIds.has(localId);
                });

                // Add remaining local posts
                localPostsRef.current.forEach(post => {
                    allPostsMap.set(post._id || post.id, post);
                });
            }

            // Convert back to array and sort by date (newest first)
            const mergedPosts = Array.from(allPostsMap.values())
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setPosts(mergedPosts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreatePost(e) {
        e.preventDefault();
        if (!postContent && !postImage) return;

        setCreatingPost(true);
        const formData = new FormData();
        formData.append('body', postContent);
        if (postImage) {
            formData.append('image', postImage);
        }

        try {
            const response = await postsAPI.createPost(formData);
            toast.success('Post created successfully');

            // Get the new post from API response or create optimistic version
            const newPost = response.data?.post || {
                _id: `local_${Date.now()}`, // Temporary ID with prefix
                body: postContent,
                image: imagePreview,
                createdAt: new Date().toISOString(),
                user: {
                    _id: userData?._id,
                    name: userData?.name,
                    photo: userData?.photo,
                },
                comments: [],
                likes: [],
            };

            // Store in local posts ref to preserve during refreshes
            localPostsRef.current = [newPost, ...localPostsRef.current];

            // Add new post to the beginning of the feed
            setPosts(prevPosts => [newPost, ...prevPosts]);

            setPostContent('');
            setPostImage(null);
            setImagePreview(null);
            setShowModal(false);

            // Refresh from API after delay, but preserve local posts
            setTimeout(() => {
                getPosts(true);
            }, 2000);
        } catch (err) {
            toast.error('Failed to create post');
            console.error(err);
        } finally {
            setCreatingPost(false);
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPostImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    }

    const removeImage = () => {
        setPostImage(null);
        setImagePreview(null);
    }

    const refreshPosts = () => {
        getPosts();
    }

    return (
        <div className="space-y-4">
            {/* Create Post Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                        {userData?.photo ? (
                            <img src={userData.photo} className="w-full h-full object-cover" alt="User" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                                {userData?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 text-left text-gray-500 hover:bg-gray-200 transition-colors text-sm"
                    >
                        Whats on your mind, {userData?.name?.split(' ')[0] || 'User'}?
                    </button>
                </div>
                <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <FaVideo className="text-orange-500" />
                        <span className="font-medium text-gray-600 text-sm">Go Live</span>
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <MdOutlinePhotoLibrary className="text-green-500 text-lg" />
                        <span className="font-medium text-gray-600 text-sm">Photo</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <FaVideo className="text-red-500" />
                        <span className="font-medium text-gray-600 text-sm">Video</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <BsEmojiSmile className="text-blue-500 text-lg" />
                        <span className="font-medium text-gray-600 text-sm">Feeling</span>
                    </button>
                </div>
            </div>

            {/* Create Post Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <div></div>
                            <h3 className="font-bold text-xl text-gray-800">Create Post</h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                                <FaTimes className="text-gray-500" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0">
                                {userData?.photo ? (
                                    <img src={userData.photo} className="w-full h-full object-cover" alt="User" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                                        {userData?.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{userData?.name || 'User'}</p>
                                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Public</span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="px-4 pb-4">
                            <textarea
                                placeholder={`What's on your mind, ${userData?.name?.split(' ')[0] || 'User'}?`}
                                className="w-full resize-none outline-none text-gray-700 placeholder-gray-400 min-h-[120px] text-lg"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                autoFocus
                            />

                            {/* Image Preview */}
                            {imagePreview && (
                                <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={imagePreview} alt="Preview" className="w-full max-h-60 object-contain bg-gray-50" />
                                    <button
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 w-8 h-8 bg-gray-800/70 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                                    >
                                        <FaTimes className="text-white text-sm" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Add to Post */}
                        <div className="mx-4 mb-4 p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Add to your post:</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-9 h-9 rounded-full hover:bg-green-50 flex items-center justify-center transition-colors"
                                >
                                    <MdOutlinePhotoLibrary className="text-green-500 text-xl" />
                                </button>
                                <button className="w-9 h-9 rounded-full hover:bg-yellow-50 flex items-center justify-center transition-colors">
                                    <BsEmojiSmile className="text-yellow-500 text-xl" />
                                </button>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>

                        {/* Post Button */}
                        <div className="p-4 pt-0">
                            <button
                                onClick={handleCreatePost}
                                disabled={(!postContent && !postImage) || creatingPost}
                                className="w-full bg-[#4A90D9] text-white py-2.5 rounded-lg font-semibold hover:bg-[#3a7fc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingPost ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}


            {/* Posts Feed */}
            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            ) : posts.length > 0 ? (
                <>
                    {posts.map(post => (
                        <PostCard key={post._id || post.id} post={post} onDelete={refreshPosts} />
                    ))}

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-8 pb-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium">
                            Page {page}
                        </span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={posts.length < 50} // Assuming limit 50, if less then it's last page
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                    <p className="font-medium">No posts yet</p>
                    <p className="text-sm mt-1">Be the first to share something!</p>
                </div>
            )}
        </div>
    )
}

import React, { useContext, useState, useEffect } from 'react';
import { AiOutlineHeart, AiFillHeart, AiOutlineCamera } from 'react-icons/ai';
import { BiMessageRounded, BiShareAlt } from 'react-icons/bi';
import { BsThreeDotsVertical, BsEmojiSmile } from 'react-icons/bs';
import { IoSend } from 'react-icons/io5';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { UserContext } from '../../Context/UserContext';
import { commentsAPI, postsAPI } from '../../Services/api';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';
import { useNavigate } from 'react-router-dom';

export default function PostCard({ post, onDelete, isDetailsPage = false }) {
    const { userData } = useContext(UserContext);
    const [comments, setComments] = useState([]);
    const [commentsLoaded, setCommentsLoaded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.body);
    const [editLoading, setEditLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Comment Edit State
    const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editCommentContent, setEditCommentContent] = useState('');
    const [updateCommentLoading, setUpdateCommentLoading] = useState(false);

    // Like State
    // Pseudo-random counts for "realism"
    const getPseudoRandom = (str, min, max) => {
        let hash = 0;
        for (let i = 0; i < (str || '').length; i++) {
            hash = (str || '').charCodeAt(i) + ((hash << 5) - hash);
        }
        return (Math.abs(hash) % (max - min)) + min;
    };

    const initialLikeOffset = React.useMemo(() => getPseudoRandom(post._id || post.id, 15, 300), [post]);
    const shareCount = React.useMemo(() => getPseudoRandom(post._id || post.id, 2, 30), [post]);

    const [isLiked, setIsLiked] = useState(post.likes?.includes(userData?._id || userData?.id) || false);
    const [likeCount, setLikeCount] = useState((post.likes?.length || 0) + initialLikeOffset);

    const navigate = useNavigate();

    useEffect(() => {
        setIsLiked(post.likes?.includes(userData?._id || userData?.id) || false);
        setLikeCount((post.likes?.length || 0) + initialLikeOffset);

        if (isDetailsPage) {
            loadComments();
            setShowComments(true);
        }
    }, [post, userData, initialLikeOffset, isDetailsPage]);


    async function handleLike() {
        // Optimistic update
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

        try {
            await postsAPI.toggleLike(post._id || post.id);
        } catch (err) {
            // Suppress 404
        }
    }

    async function handleShare() {
        const url = `${window.location.origin}/post/${post._id || post.id}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    }


    const timeAgo = (date) => {
        try {
            const now = new Date();
            const postDate = new Date(date);
            const diffMs = now - postDate;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return postDate.toLocaleDateString();
        } catch { return ''; }
    };

    async function loadComments() {
        if (!commentsLoaded) {
            try {
                const { data } = await commentsAPI.getPostComments(post._id || post.id);
                setComments(data.comments || []);
                setCommentsLoaded(true);
            } catch (err) {
                console.error(err);
            }
        }
    }

    async function handleToggleComments() {
        if (!isDetailsPage) {
            navigate(`/post/${post._id || post.id}`);
            return;
        }

        if (!showComments) {
            await loadComments();
        }
        setShowComments(!showComments);
    }

    const onEmojiClick = (emojiObject) => {
        setCommentContent(prev => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

    async function handleAddComment(e) {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setCommentLoading(true);
        try {
            const { data } = await commentsAPI.createComment({ content: commentContent, post: post._id || post.id });
            if (data.message === 'success') {
                const res = await commentsAPI.getPostComments(post._id || post.id);
                setComments(res.data.comments || []);
                setCommentContent('');
                setCommentsLoaded(true);
                setShowComments(true);
            }
        } catch (err) {
            toast.error('Failed to add comment');
        } finally {
            setCommentLoading(false);
        }
    }

    async function handleDeleteComment(commentId) {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await commentsAPI.deleteComment(commentId);
                setComments(comments.filter(c => c._id !== commentId));
                toast.success('Comment deleted');
            } catch (err) {
                console.error(err);
                const errorMsg = err.response?.data?.message || 'Failed to delete comment';
                toast.error(errorMsg);
            }
        }
        setActiveCommentMenuId(null);
    }

    async function handleUpdateComment(commentId) {
        if (!editCommentContent.trim()) return;
        setUpdateCommentLoading(true);
        try {
            await commentsAPI.updateComment(commentId, editCommentContent);
            setComments(comments.map(c => c._id === commentId ? { ...c, content: editCommentContent } : c));
            toast.success('Comment updated');
            setEditingCommentId(null);
            setEditCommentContent('');
        } catch (err) {
            toast.error('Failed to update comment');
        } finally {
            setUpdateCommentLoading(false);
        }
    }

    function initiateEditComment(comment) {
        setEditingCommentId(comment._id);
        setEditCommentContent(comment.content);
        setActiveCommentMenuId(null);
    }

    async function handleDeletePost() {
        if (window.confirm('Are you sure you want to delete this post?')) {
            try {
                await postsAPI.deletePost(post._id || post.id);
                toast.success('Post deleted');
                if (onDelete) onDelete();
            } catch (err) {
                toast.error('Failed to delete post');
            }
        }
        setMenuOpen(false);
    }

    async function handleUpdatePost() {
        if (!editContent.trim()) return;
        setEditLoading(true);
        try {
            const formData = new FormData();
            formData.append('body', editContent);
            await postsAPI.updatePost(post._id || post.id, formData);
            toast.success('Post updated');
            post.body = editContent;
            setIsEditing(false);
        } catch (err) {
            toast.error('Failed to update post');
        } finally {
            setEditLoading(false);
        }
    }

    const isOwner = userData?._id === post.user._id || userData?.id === post.user._id;

    return (
        <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible mb-4">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {post.user.photo ? (
                            <img
                                src={post.user.photo?.startsWith('http') ? post.user.photo : `https://linked-posts.routemisr.com/${post.user.photo}`}
                                alt={post.user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.style.display = 'none'}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-200">
                                {post.user.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">{post.user.name}</h3>
                        <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
                    </div>
                </div>

                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <BsThreeDotsVertical className="w-5 h-5" />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-full bg-white shadow-lg border border-gray-100 rounded-lg py-1 w-36 z-10">
                                <button
                                    onClick={() => { setIsEditing(true); setMenuOpen(false); }}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium text-gray-700"
                                >
                                    <FaEdit className="text-blue-500" /> Edit Post
                                </button>
                                <button
                                    onClick={handleDeletePost}
                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 font-medium"
                                >
                                    <FaTrash className="text-red-500" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-2">
                {isEditing ? (
                    <div>
                        <textarea
                            className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-400 text-gray-800 resize-none"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleUpdatePost}
                                disabled={editLoading}
                                className="bg-blue-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                            >
                                {editLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); setEditContent(post.body); }}
                                className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap mb-3">
                        {post.body}
                    </p>
                )}
            </div>

            {/* Image */}
            {post.image && (
                <div className="w-full bg-gray-50 mb-3">
                    <img
                        src={post.image}
                        alt="Post content"
                        className="w-full max-h-[500px] object-cover"
                    />
                </div>
            )}

            {/* Stats Bar */}
            <div className="px-4 pb-2 flex items-center gap-6 border-b border-gray-50">
                <button
                    onClick={handleLike}
                    className="flex items-center gap-1.5 group"
                >
                    {isLiked ? (
                        <AiFillHeart className="w-6 h-6 text-red-500 transition-transform group-hover:scale-110" />
                    ) : (
                        <AiOutlineHeart className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                    )}
                    <span className="text-sm font-medium text-gray-600">{likeCount}</span>
                </button>

                <button
                    onClick={handleToggleComments}
                    className="flex items-center gap-1.5 group"
                >
                    <BiMessageRounded className="w-6 h-6 text-gray-500 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-600">{post.comments?.length || 0}</span>
                </button>

                <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 group"
                >
                    <BiShareAlt className="w-6 h-6 text-gray-500 group-hover:text-green-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-600">{shareCount}</span>
                </button>
            </div>

            {/* Comment Input Section (Always Visible) */}
            <div className="px-4 py-3">
                <form onSubmit={handleAddComment} className="flex items-center gap-3 relative">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {userData?.photo ? (
                            <img src={userData.photo} className="w-full h-full object-cover" alt="You" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold bg-gray-200 text-xs">
                                {userData?.name?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2 relative">
                        <input
                            type="text"
                            placeholder="Write your comment..."
                            className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700 placeholder-gray-500"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                        />
                        <div className="flex items-center gap-2 ml-2">
                            <button type="button" className="text-gray-400 hover:text-gray-600">
                                <AiOutlineCamera size={20} />
                            </button>
                            <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            >
                                <BsEmojiSmile size={19} />
                            </button>
                        </div>
                    </div>
                    {/* Send Button only visible if typing? Or always? Keeping it clean as per screenshot implies enter or hidden button? Screenshot didn't show send button in input pill. But I'll keep invisible submit or minimal. I'll rely on Enter for now or add small send button if needed. Screenshot showed clean input. */}
                </form>

                {showEmojiPicker && (
                    <div className="absolute z-50 mt-2">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                )}
            </div>

            {/* Comments List */}
            {(showComments && comments.length > 0) && (
                <div className="px-4 pb-4 space-y-4">
                    {comments.map((comment, index) => (
                        <div key={comment._id} className="flex gap-2.5 items-start group">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                                {comment.commentCreator?.photo ? (
                                    <img
                                        src={comment.commentCreator.photo?.startsWith('http') ? comment.commentCreator.photo : `https://linked-posts.routemisr.com/${comment.commentCreator.photo}`}
                                        className="w-full h-full object-cover"
                                        alt={comment.commentCreator.name}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    comment.commentCreator?.name?.charAt(0) || '?'
                                )}
                            </div>

                            <div className="flex-1">
                                {editingCommentId === comment._id ? (
                                    <div className="w-full">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={editCommentContent}
                                            onChange={(e) => setEditCommentContent(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateComment(comment._id);
                                                if (e.key === 'Escape') setEditingCommentId(null);
                                            }}
                                            className="w-full bg-gray-100 border border-blue-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 mb-2"
                                        />
                                        <div className="flex gap-2 text-xs ml-2">
                                            <button
                                                onClick={() => handleUpdateComment(comment._id)}
                                                disabled={updateCommentLoading}
                                                className="text-blue-500 font-medium hover:underline disabled:opacity-50"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={() => setEditingCommentId(null)}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-100 rounded-2xl px-3 py-2 inline-block">
                                        <p className="text-xs font-bold text-gray-900 mb-0.5">{comment.commentCreator?.name}</p>
                                        <p className="text-sm text-gray-800 leading-snug">{comment.content}</p>
                                    </div>
                                )}
                            </div>

                            {(userData?._id === comment.commentCreator?._id) && (
                                <div className="relative self-center">
                                    <button
                                        onClick={() => setActiveCommentMenuId(activeCommentMenuId === comment._id ? null : comment._id)}
                                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <BsThreeDotsVertical size={16} />
                                    </button>
                                    {activeCommentMenuId === comment._id && (
                                        <div className={`absolute right-0 ${index === comments.length - 1 ? 'bottom-full mb-1' : 'top-full'} bg-white shadow-lg border border-gray-100 rounded-lg py-1 w-32 z-20`}>
                                            <button
                                                onClick={() => initiateEditComment(comment)}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium text-gray-700"
                                            >
                                                <FaEdit className="text-blue-500" /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment._id)}
                                                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600 font-medium"
                                            >
                                                <FaTrash className="text-red-500" /> Delete
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Toggle View Comments if not shown */}
            {!showComments && (post.comments?.length > 0) && (
                <div className="px-4 pb-3">
                    <button
                        onClick={handleToggleComments}
                        className="text-gray-500 text-sm font-medium hover:underline"
                    >
                        View all {post.comments.length} comments
                    </button>
                </div>
            )}
        </div>
    );
}

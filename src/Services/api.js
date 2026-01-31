import axios from 'axios';

const BASE_URL = 'https://linked-posts.routemisr.com';

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
        config.headers.token = token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const authAPI = {
    signup: (userData) => api.post('/users/signup', userData),
    signin: (credentials) => api.post('/users/signin', credentials),
    changePassword: (passwords) => api.patch('/users/change-password', passwords),
    uploadPhoto: (photoData) => api.put('/users/upload-photo', photoData), // photoData should be FormData
    getProfile: () => api.get('/users/profile-data'),
};

export const postsAPI = {
    createPost: (postData) => api.post('/posts', postData), // form-data
    getAllPosts: (limit = 50) => api.get(`/posts?limit=${limit}`),
    getSinglePost: (postId) => api.get(`/posts/${postId}`),
    getUserPosts: (userId, limit = 2) => api.get(`/users/${userId}/posts?limit=${limit}`),
    updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
    deletePost: (postId) => api.delete(`/posts/${postId}`),
    toggleLike: (postId) => api.post(`/posts/like`, { postId }),
};

export const commentsAPI = {
    createComment: (commentData) => api.post('/comments', commentData), // JSON { content, post: POST_ID }
    getPostComments: (postId) => api.get(`/posts/${postId}/comments`),
    updateComment: (commentId, content) => api.put(`/comments/${commentId}`, { content }),
    deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export default api;

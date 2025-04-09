const express = require('express');
const router = express.Router();
const { posts, users } = require('../db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Middleware to handle image uploads
const handleImageUpload = upload.array('images', 5); // Allow up to 5 images

// Récupérer les utilisateurs qui ont aimé un post
router.get('/:id/likes', auth, async (req, res) => {
  try {
    const post = await posts.getById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    // Récupérer tous les utilisateurs
    const allUsers = await users.getAll();
    
    // Filtrer les utilisateurs qui ont aimé le post
    const usersWhoLiked = allUsers
      .filter(user => post.likes.includes(user._id))
      .map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }));
    
    res.json(usersWhoLiked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les publications des amis
router.get('/friends', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Récupérer les IDs d'amis
    const friendIds = req.user.friends || [];
    
    // Récupérer tous les posts
    const allPosts = await posts.getAll();
    
    // Filtrer les posts des amis (publics et privés)
    const friendsPosts = allPosts.filter(post => {
      return friendIds.includes(post.user) || post.user === req.user._id;
    });
    
    // Trier par date de création (du plus récent au plus ancien)
    friendsPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginer
    const paginatedPosts = friendsPosts.slice(skip, skip + limit);
    
    // Obtenir les informations détaillées des utilisateurs
    const allUsers = await users.getAll();
    const usersMap = {};
    allUsers.forEach(user => {
      usersMap[user._id] = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      };
    });
    
    // Ajouter les informations d'utilisateur aux posts et aux commentaires
    const postsWithUserInfo = paginatedPosts.map(post => {
      // Marquer si l'utilisateur actuel a aimé ce post
      const liked = post.likes.includes(req.user._id);
      
      // Format image URLs to be absolute
      const formattedImages = (post.images || []).map(img => {
        if (img.startsWith('http')) return img;
        return `/uploads/${path.basename(img)}`;
      });
      
      // Ajouter des informations utilisateur aux commentaires
      const commentsWithUserInfo = post.comments.map(comment => ({
        ...comment,
        user: usersMap[comment.user] || { _id: comment.user }
      }));
      
      return {
        ...post,
        images: formattedImages,
        user: usersMap[post.user] || { _id: post.user },
        comments: commentsWithUserInfo,
        liked
      };
    });
    
    // Vérifier s'il y a plus de posts
    const hasMore = friendsPosts.length > skip + paginatedPosts.length;
    
    res.json({
      posts: postsWithUserInfo,
      hasMore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Récupérer toutes les publications (publiques uniquement pour les non-amis)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || 'latest';
    
    // Récupérer les IDs d'amis
    const friendIds = req.user.friends || [];
    
    // Récupérer tous les posts
    const allPosts = await posts.getAll();
    
    // Filtrer les posts
    const filteredPosts = allPosts.filter(post => {
      // Si c'est le post de l'utilisateur connecté, le montrer
      if (post.user === req.user._id) return true;
      
      // Si c'est un ami, montrer tous ses posts (publics et privés)
      if (friendIds.includes(post.user)) return true;
      
      // Pour les non-amis, montrer uniquement les posts publics
      return !post.isPrivate;
    });
    
    // Trier selon les paramètres
    if (sort === 'popularity') {
      // Sort by number of comments instead of likes
      filteredPosts.sort((a, b) => {
        const aComments = a.comments ? a.comments.length : 0;
        const bComments = b.comments ? b.comments.length : 0;
        return bComments - aComments;
      });
    } else {
      // Par défaut, trier par date (du plus récent au plus ancien)
      filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    // Paginer
    const paginatedPosts = filteredPosts.slice(skip, skip + limit);
    
    // Obtenir les informations détaillées des utilisateurs
    const allUsers = await users.getAll();
    const usersMap = {};
    allUsers.forEach(user => {
      usersMap[user._id] = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      };
    });
    
    // Ajouter les informations d'utilisateur aux posts et aux commentaires
    const postsWithUserInfo = paginatedPosts.map(post => {
      // Marquer si l'utilisateur actuel a aimé ce post
      const liked = post.likes && post.likes.includes(req.user._id);
      
      // Format image URLs
      const formattedImages = (post.images || []).map(img => {
        if (img.startsWith('http')) return img;
        return `/uploads/${path.basename(img)}`;
      });
      
      // Ajouter des informations utilisateur aux commentaires
      const commentsWithUserInfo = (post.comments || []).map(comment => ({
        id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: usersMap[comment.user] || { id: comment.user }
      }));
      
      return {
        id: post._id,
        content: post.content,
        images: formattedImages,
        isPrivate: post.isPrivate,
        createdAt: post.createdAt,
        likes: post.likes ? post.likes.length : 0,
        liked,
        user: usersMap[post.user] || { id: post.user },
        comments: commentsWithUserInfo
      };
    });
    
    // Vérifier s'il y a plus de posts
    const hasMore = filteredPosts.length > skip + paginatedPosts.length;
    
    console.log(`Sending ${postsWithUserInfo.length} posts to client`);
    
    res.json({
      posts: postsWithUserInfo,
      hasMore
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: error.message });
  }
});

// Récupérer les publications d'un utilisateur spécifique
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log(`Fetching posts for user: ${userId}`);
    
    // Récupérer tous les posts
    const allPosts = await posts.getAll();
    
    // Vérifier si l'utilisateur est l'utilisateur connecté ou un ami
    const isSelf = userId === req.user._id;
    const isFriend = req.user.friends && req.user.friends.includes(userId);
    
    console.log(`User relation - isSelf: ${isSelf}, isFriend: ${isFriend}`);
    
    // Filtrer les posts de l'utilisateur
    let userPosts = allPosts.filter(post => post.user === userId);
    
    console.log(`Found ${userPosts.length} posts for user ${userId}`);
    
    // Si ce n'est pas l'utilisateur lui-même ou un ami, filtrer les posts privés
    if (!isSelf && !isFriend) {
      userPosts = userPosts.filter(post => !post.isPrivate);
      console.log(`After privacy filter: ${userPosts.length} posts`);
    }
    
    // Trier par date de création (du plus récent au plus ancien)
    userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginer
    const paginatedPosts = userPosts.slice(skip, skip + limit);
    
    // Obtenir les informations détaillées des utilisateurs
    const allUsers = await users.getAll();
    const usersMap = {};
    allUsers.forEach(user => {
      usersMap[user._id] = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      };
    });
    
    // Ajouter les informations d'utilisateur aux posts et aux commentaires
    const postsWithUserInfo = paginatedPosts.map(post => {
      // Marquer si l'utilisateur actuel a aimé ce post
      const liked = post.likes.includes(req.user._id);
      
      // Format image URLs
      const formattedImages = (post.images || []).map(img => {
        if (img.startsWith('http')) return img;
        return `/uploads/${path.basename(img)}`;
      });
      
      // Ajouter des informations utilisateur aux commentaires
      const commentsWithUserInfo = post.comments.map(comment => ({
        id: comment._id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: usersMap[comment.user] || { id: comment.user }
      }));
      
      return {
        id: post._id,
        content: post.content,
        images: formattedImages,
        isPrivate: post.isPrivate,
        createdAt: post.createdAt,
        likes: post.likes.length,
        liked,
        user: usersMap[post.user] || { id: post.user },
        comments: commentsWithUserInfo
      };
    });
    
    // Vérifier s'il y a plus de posts
    const hasMore = userPosts.length > skip + paginatedPosts.length;
    
    res.json({
      posts: postsWithUserInfo,
      hasMore
    });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un J'aime à une publication
router.post('/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    
    const result = await posts.toggleLike(postId, userId);
    
    if (!result) {
      return res.status(404).json({ message: 'Publication non trouvée' });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un commentaire à une publication
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    
    if (!content) {
      return res.status(400).json({ message: 'Le contenu du commentaire est requis' });
    }
    
    const comment = await posts.addComment(postId, {
      user: userId,
      content
    });
    
    if (!comment) {
      return res.status(404).json({ message: 'Publication non trouvée' });
    }
    
    // Récupérer les infos de l'utilisateur
    const user = await users.getById(userId);
    
    res.status(201).json({
      id: comment._id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Créer une nouvelle publication
router.post('/', auth, (req, res) => {
  // Handle image upload first
  handleImageUpload(req, res, async (err) => {
    try {
      if (err) {
        console.error("Image upload error:", err);
        return res.status(400).json({ message: err.message });
      }
      
      const { content, isPrivate } = req.body;
      
      console.log("Received post data:", { content, isPrivate, files: req.files });
      
      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ message: 'Le contenu de la publication est requis' });
      }
      
      // Get image file paths
      const imagePaths = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          // Use relative path from server root to ensure proper URL resolution later
          imagePaths.push(file.path.replace(/\\/g, '/'));
        }
        console.log("Saved image paths:", imagePaths);
      }
      
      // Create the post
      const newPost = await posts.create({
        user: req.user._id,
        content: content.trim(),
        images: imagePaths,
        isPrivate: isPrivate === 'true' || isPrivate === true
      });
      
      console.log("New post created:", newPost);
      
      // Récupérer les infos de l'utilisateur
      const user = await users.getById(req.user._id);
      
      // Format images for the response - using just the filename, as the URL is built with the /uploads prefix
      const formattedImages = imagePaths.map(imagePath => {
        // Get just the filename from the path
        const basename = path.basename(imagePath);
        return `/uploads/${basename}`;
      });
      
      res.status(201).json({
        id: newPost._id,
        content: newPost.content,
        images: formattedImages,
        isPrivate: newPost.isPrivate,
        createdAt: newPost.createdAt,
        likes: 0,
        liked: false,
        comments: [],
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error("Post creation error:", error);
      res.status(500).json({ message: error.message });
    }
  });
});

module.exports = router;

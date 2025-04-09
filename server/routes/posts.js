
const express = require('express');
const { posts, users } = require('../db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Créer un nouveau post
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { content, isPrivate } = req.body;
    
    const newPost = await posts.create({
      user: req.user._id,
      content,
      isPrivate: isPrivate === 'true',
      images: req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
    });
    
    // Ajouter les informations de l'utilisateur pour la réponse
    const postWithUser = {
      ...newPost,
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar
      }
    };
    
    res.status(201).json(postWithUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtenir tous les posts (fil d'actualité)
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Récupérer les IDs d'amis
    const friendIds = req.user.friends;
    
    // Récupérer tous les posts
    const allPosts = await posts.getAll();
    
    // Filtrer les posts
    // Posts publics ou posts privés d'amis
    const filteredPosts = allPosts.filter(post => {
      return !post.isPrivate || // Posts publics
             post.isPrivate && (friendIds.includes(post.user) || post.user === req.user._id); // Posts privés d'amis ou de l'utilisateur
    });
    
    // Trier par date de création (du plus récent au plus ancien)
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginer
    const paginatedPosts = filteredPosts.slice(skip, skip + limit);
    
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
      
      // Ajouter des informations utilisateur aux commentaires
      const commentsWithUserInfo = post.comments.map(comment => ({
        ...comment,
        user: usersMap[comment.user] || { _id: comment.user }
      }));
      
      return {
        ...post,
        user: usersMap[post.user] || { _id: post.user },
        comments: commentsWithUserInfo,
        liked
      };
    });
    
    // Vérifier s'il y a plus de posts
    const hasMore = filteredPosts.length > skip + paginatedPosts.length;
    
    res.json({
      posts: postsWithUserInfo,
      hasMore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Aimer/ne plus aimer un post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await posts.getById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    // Vérifier si l'utilisateur peut voir ce post privé
    if (post.isPrivate) {
      const postCreator = await users.getById(post.user);
      const isFriend = postCreator.friends.includes(req.user._id);
      const isSelf = post.user === req.user._id;
      
      if (!isFriend && !isSelf) {
        return res.status(403).json({ message: 'Non autorisé à aimer ce post' });
      }
    }
    
    // Ajouter/retirer le like
    const result = await posts.toggleLike(req.params.id, req.user._id);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un commentaire à un post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Le contenu du commentaire est requis' });
    }
    
    const post = await posts.getById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post non trouvé' });
    }
    
    // Vérifier si l'utilisateur peut voir ce post privé
    if (post.isPrivate) {
      const postCreator = await users.getById(post.user);
      const isFriend = postCreator.friends.includes(req.user._id);
      const isSelf = post.user === req.user._id;
      
      if (!isFriend && !isSelf) {
        return res.status(403).json({ message: 'Non autorisé à commenter ce post' });
      }
    }
    
    // Ajouter le commentaire
    const comment = {
      user: req.user._id,
      content
    };
    
    const newComment = await posts.addComment(req.params.id, comment);
    
    // Ajouter les informations d'utilisateur au commentaire pour la réponse
    const commentWithUser = {
      ...newComment,
      user: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        avatar: req.user.avatar
      }
    };
    
    res.status(201).json(commentWithUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtenir les posts d'un utilisateur
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Vérifier si nous pouvons voir les posts privés de cet utilisateur
    const isOwnProfile = userId === req.user._id;
    const isFriend = req.user.friends.includes(userId);
    
    // Récupérer tous les posts de l'utilisateur
    const userPosts = await posts.getByUser(userId);
    
    // Filtrer les posts selon les permissions
    let filteredPosts = userPosts;
    if (!isOwnProfile && !isFriend) {
      // Si ce n'est pas un ami ou le profil de l'utilisateur, montrer uniquement les posts publics
      filteredPosts = userPosts.filter(post => !post.isPrivate);
    }
    
    // Trier par date de création (du plus récent au plus ancien)
    filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginer
    const paginatedPosts = filteredPosts.slice(skip, skip + limit);
    
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
      
      // Ajouter des informations utilisateur aux commentaires
      const commentsWithUserInfo = post.comments.map(comment => ({
        ...comment,
        user: usersMap[comment.user] || { _id: comment.user }
      }));
      
      return {
        ...post,
        user: usersMap[post.user] || { _id: post.user },
        comments: commentsWithUserInfo,
        liked
      };
    });
    
    // Vérifier s'il y a plus de posts
    const hasMore = filteredPosts.length > skip + paginatedPosts.length;
    
    res.json({
      posts: postsWithUserInfo,
      hasMore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const fs = require('fs').promises;
const path = require('path');

// Chemins vers les fichiers de base de données
const dbDir = path.join(__dirname, 'data');
const usersPath = path.join(dbDir, 'users.json');
const postsPath = path.join(dbDir, 'posts.json');
const chatsPath = path.join(dbDir, 'chats.json');
const popularPostsPath = path.join(dbDir, 'popularPosts.json');
const recentPostsPath = path.join(dbDir, 'recentPosts.json');
const userPostsPath = path.join(dbDir, 'userPosts.json');

// Initialiser la base de données
async function initDB() {
  try {
    // Vérifier si le répertoire data existe, sinon le créer
    try {
      await fs.access(dbDir);
    } catch (error) {
      await fs.mkdir(dbDir, { recursive: true });
      console.log('Répertoire de base de données créé');
    }

    // Initialiser les fichiers s'ils n'existent pas
    const files = [
      { path: usersPath, defaultContent: '[]' },
      { path: postsPath, defaultContent: '[]' },
      { path: chatsPath, defaultContent: '[]' },
      { path: popularPostsPath, defaultContent: '[]' },
      { path: recentPostsPath, defaultContent: '[]' },
      { path: userPostsPath, defaultContent: '[]' }
    ];

    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch (error) {
        await fs.writeFile(file.path, file.defaultContent);
        console.log(`Fichier ${path.basename(file.path)} créé`);
      }
    }

    console.log('Base de données locale initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
}

// Fonctions génériques CRUD
async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erreur de lecture de ${filePath}:`, error);
    return [];
  }
}

async function writeData(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erreur d'écriture dans ${filePath}:`, error);
    return false;
  }
}

// Génération d'un ID unique
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// API pour les utilisateurs
const users = {
  async getAll() {
    return await readData(usersPath);
  },

  async getById(id) {
    const users = await this.getAll();
    return users.find(user => user._id === id) || null;
  },

  async getByEmail(email) {
    const users = await this.getAll();
    return users.find(user => user.email === email) || null;
  },

  async create(userData) {
    const users = await this.getAll();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('Cet utilisateur existe déjà');
    }
    
    // No password hashing
    const newUser = {
      _id: generateId(),
      ...userData,
      friends: [],
      friendRequests: { sent: [], received: [] },
      isOnline: true,
      lastActive: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(newUser);
    await writeData(usersPath, users);
    
    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async update(id, updates) {
    const users = await this.getAll();
    const index = users.findIndex(user => user._id === id);
    
    if (index === -1) return null;
    
    // Mettre à jour l'utilisateur sans hacher le mot de passe
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date()
    };
    
    await writeData(usersPath, users);
    
    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = users[index];
    return userWithoutPassword;
  },

  async delete(id) {
    const users = await this.getAll();
    const filtered = users.filter(user => user._id !== id);
    
    if (filtered.length === users.length) return false;
    
    return await writeData(usersPath, filtered);
  },

  async comparePassword(id, password) {
    const user = await this.getById(id);
    if (!user) return false;
    
    // Simple string comparison 
    return password === user.password;
  }
};

// API pour les posts
const posts = {
  async getAll() {
    return await readData(postsPath);
  },

  async getById(id) {
    const posts = await this.getAll();
    return posts.find(post => post._id === id) || null;
  },

  async getByUser(userId) {
    const posts = await this.getAll();
    return posts.filter(post => post.user === userId);
  },

  async getPopular() {
    const allPosts = await this.getAll();
    // Sort by likes count (descending)
    return [...allPosts].sort((a, b) => b.likes.length - a.likes.length);
  },

  async getRecent() {
    const allPosts = await this.getAll();
    // Sort by date (newest first)
    return [...allPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getFeed(userId, friendIds) {
    const allPosts = await this.getAll();
    return allPosts.filter(post => {
      // Inclure les posts publics ou les posts privés de l'utilisateur ou ses amis
      return !post.isPrivate || post.user === userId || friendIds.includes(post.user);
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async create(postData) {
    const posts = await this.getAll();
    
    const newPost = {
      _id: generateId(),
      ...postData,
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    posts.push(newPost);
    await writeData(postsPath, posts);
    
    // Update categorized posts
    await this._updateCategorizedPosts();
    
    return newPost;
  },

  async update(id, updates) {
    const posts = await this.getAll();
    const index = posts.findIndex(post => post._id === id);
    
    if (index === -1) return null;
    
    posts[index] = {
      ...posts[index],
      ...updates,
      updatedAt: new Date()
    };
    
    await writeData(postsPath, posts);
    
    // Update categorized posts
    await this._updateCategorizedPosts();
    
    return posts[index];
  },

  async delete(id) {
    const posts = await this.getAll();
    const filtered = posts.filter(post => post._id !== id);
    
    if (filtered.length === posts.length) return false;
    
    const success = await writeData(postsPath, filtered);
    
    // Update categorized posts
    if (success) {
      await this._updateCategorizedPosts();
    }
    
    return success;
  },

  async addComment(postId, comment) {
    const posts = await this.getAll();
    const index = posts.findIndex(post => post._id === postId);
    
    if (index === -1) return null;
    
    const newComment = {
      _id: generateId(),
      ...comment,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    posts[index].comments.push(newComment);
    posts[index].updatedAt = new Date();
    
    await writeData(postsPath, posts);
    
    // Update categorized posts
    await this._updateCategorizedPosts();
    
    return newComment;
  },

  async toggleLike(postId, userId) {
    const posts = await this.getAll();
    const index = posts.findIndex(post => post._id === postId);
    
    if (index === -1) return null;
    
    const likeIndex = posts[index].likes.indexOf(userId);
    
    if (likeIndex === -1) {
      // Ajouter un like
      posts[index].likes.push(userId);
    } else {
      // Retirer un like
      posts[index].likes.splice(likeIndex, 1);
    }
    
    posts[index].updatedAt = new Date();
    
    await writeData(postsPath, posts);
    
    // Update categorized posts
    await this._updateCategorizedPosts();
    
    return {
      likes: posts[index].likes.length,
      liked: likeIndex === -1
    };
  },
  
  // Private method to update categorized posts
  async _updateCategorizedPosts() {
    try {
      const allPosts = await this.getAll();
      
      // Create popular posts
      const popularPosts = [...allPosts].sort((a, b) => b.likes.length - a.likes.length);
      await writeData(popularPostsPath, popularPosts);
      
      // Create recent posts
      const recentPosts = [...allPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      await writeData(recentPostsPath, recentPosts);
      
      // Create user posts map
      const userPosts = {};
      allPosts.forEach(post => {
        if (!userPosts[post.user]) {
          userPosts[post.user] = {
            public: [],
            private: []
          };
        }
        
        if (post.isPrivate) {
          userPosts[post.user].private.push(post);
        } else {
          userPosts[post.user].public.push(post);
        }
      });
      
      // Sort posts by date for each user
      for (const userId in userPosts) {
        userPosts[userId].public.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        userPosts[userId].private.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      await writeData(userPostsPath, userPosts);
      
    } catch (error) {
      console.error("Error updating categorized posts:", error);
    }
  }
};

// API pour les chats
const chats = {
  async getAll() {
    return await readData(chatsPath);
  },

  async getById(id) {
    const chats = await this.getAll();
    return chats.find(chat => chat._id === id) || null;
  },

  async getByParticipants(userId1, userId2) {
    const chats = await this.getAll();
    return chats.find(chat => {
      return chat.participants.includes(userId1) && chat.participants.includes(userId2);
    }) || null;
  },

  async getUserChats(userId) {
    const chats = await this.getAll();
    return chats.filter(chat => chat.participants.includes(userId));
  },

  async create(chatData) {
    const chats = await this.getAll();
    
    const newChat = {
      _id: generateId(),
      ...chatData,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    chats.push(newChat);
    await writeData(chatsPath, chats);
    return newChat;
  },

  async addMessage(chatId, message) {
    const chats = await this.getAll();
    const index = chats.findIndex(chat => chat._id === chatId);
    
    if (index === -1) return null;
    
    const newMessage = {
      _id: generateId(),
      ...message,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    chats[index].messages.push(newMessage);
    chats[index].updatedAt = new Date();
    
    await writeData(chatsPath, chats);
    return newMessage;
  },

  async markAsRead(chatId, userId) {
    const chats = await this.getAll();
    const index = chats.findIndex(chat => chat._id === chatId);
    
    if (index === -1) return false;
    
    let updated = false;
    
    chats[index].messages.forEach(message => {
      if (message.sender !== userId && !message.read) {
        message.read = true;
        updated = true;
      }
    });
    
    if (updated) {
      chats[index].updatedAt = new Date();
      await writeData(chatsPath, chats);
    }
    
    return true;
  }
};

// Exporter les modules
module.exports = {
  initDB,
  users,
  posts,
  chats
};

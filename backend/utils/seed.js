const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

const categories = [
  { name: 'Technology', description: 'All things tech', color: '#6366f1', icon: '💻' },
  { name: 'Design', description: 'UI/UX and design thinking', color: '#ec4899', icon: '🎨' },
  { name: 'Programming', description: 'Code, algorithms, and software', color: '#10b981', icon: '⚙️' },
  { name: 'Science', description: 'Scientific discoveries and research', color: '#3b82f6', icon: '🔬' },
  { name: 'Career', description: 'Career growth and productivity', color: '#f59e0b', icon: '🚀' },
  { name: 'Life', description: 'Lifestyle, health, and wellbeing', color: '#ef4444', icon: '🌱' }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Category.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create categories
    const cats = await Category.insertMany(categories);
    console.log(`Created ${cats.length} categories`);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      username: 'admin',
      email: 'admin@inkwell.dev',
      password: 'Admin@123',
      bio: 'Platform administrator and content curator.',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    });

    // Create sample users
    const users = await User.create([
      {
        name: 'Sarah Chen',
        username: 'sarahchen',
        email: 'sarah@inkwell.dev',
        password: 'User@123',
        bio: 'Full-stack developer. Writing about React, Node.js, and building products.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
      },
      {
        name: 'Marcus Blake',
        username: 'marcusblake',
        email: 'marcus@inkwell.dev',
        password: 'User@123',
        bio: 'UX Designer at heart. I write about design systems and human-centered thinking.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'
      }
    ]);

    console.log(`Created ${users.length + 1} users`);

    // Create sample posts
    const posts = await Post.create([
      {
        title: 'Building a Modern Blog Platform with React and Node.js',
        content: `# Building a Modern Blog Platform\n\nIn this comprehensive guide, we'll walk through building a full-featured blog platform from scratch using React, Node.js, and MongoDB.\n\n## Why Build Your Own Platform?\n\nWhile platforms like Medium and Dev.to are great, building your own gives you complete control over features, design, and monetization.\n\n## Tech Stack\n\nWe'll use:\n- **React** for the frontend\n- **Node.js + Express** for the backend API\n- **MongoDB** for data storage\n- **JWT** for authentication\n\n## Getting Started\n\nFirst, let's set up our project structure...`,
        excerpt: 'A comprehensive guide to building a production-ready blog platform with modern tools.',
        author: users[0]._id,
        category: cats[2]._id,
        tags: ['react', 'nodejs', 'mongodb', 'javascript'],
        status: 'published',
        featured: true,
        views: 1240,
        coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
      },
      {
        title: 'The Art of Design Systems: Building for Scale',
        content: `# Design Systems at Scale\n\nDesign systems are the backbone of consistent product experiences. In this article, we explore what makes a great design system and how to build one that scales.\n\n## What is a Design System?\n\nA design system is a collection of reusable components guided by clear standards...\n\n## Core Components\n\n1. **Tokens** - Colors, spacing, typography\n2. **Components** - Buttons, inputs, cards\n3. **Patterns** - Forms, navigation, layouts\n4. **Documentation** - How to use everything`,
        excerpt: 'How to build design systems that scale across products and teams.',
        author: users[1]._id,
        category: cats[1]._id,
        tags: ['design', 'ux', 'design-systems', 'figma'],
        status: 'published',
        featured: true,
        views: 890,
        coverImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800'
      },
      {
        title: 'Understanding JavaScript Closures Once and For All',
        content: `# JavaScript Closures Demystified\n\nClosures are one of those JavaScript concepts that confuse developers at every level. Let's break them down once and for all.\n\n## What is a Closure?\n\nA closure is a function that has access to its outer (enclosing) function's scope even after the outer function has returned.\n\n\`\`\`javascript\nfunction outer() {\n  const message = 'Hello';\n  \n  function inner() {\n    console.log(message); // Accesses outer scope\n  }\n  \n  return inner;\n}\n\nconst greet = outer();\ngreet(); // logs: Hello\n\`\`\`\n\nThis works because \`inner\` closes over \`message\`.`,
        excerpt: 'A clear, practical explanation of JavaScript closures with real examples.',
        author: users[0]._id,
        category: cats[2]._id,
        tags: ['javascript', 'programming', 'fundamentals'],
        status: 'published',
        views: 2100,
        coverImage: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800'
      }
    ]);

    console.log(`Created ${posts.length} posts`);

    // Create comments
    const comment1 = await Comment.create({
      content: 'Great article! This is exactly what I needed to understand the architecture.',
      author: users[1]._id,
      post: posts[0]._id
    });

    await Comment.create({
      content: 'Thanks! Glad it helped. Let me know if you have any questions.',
      author: users[0]._id,
      post: posts[0]._id,
      parent: comment1._id
    });

    console.log('Seed complete!');
    console.log('\n--- Credentials ---');
    console.log('Admin: admin@inkwell.dev / Admin@123');
    console.log('User 1: sarah@inkwell.dev / User@123');
    console.log('User 2: marcus@inkwell.dev / User@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();

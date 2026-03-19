const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// Helper: generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Helper: ensure user is authenticated
const requireAuth = (context) => {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
};

const resolvers = {
  Query: {
    // Get products with pagination, filtering, and sorting
    products: async (_, { page = 1, limit = 10, category, search, sort }) => {
      const skip = (page - 1) * limit;

      const filter = {};
      if (category) filter.category = category;
      if (search) filter.name = { $regex: search, $options: 'i' };

      let sortObj = { createdAt: -1 };
      if (sort) {
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortOrder = sort.startsWith('-') ? -1 : 1;
        sortObj = { [sortField]: sortOrder };
      }

      const total = await Product.countDocuments(filter);
      const products = await Product.find(filter)
        .populate('createdBy', 'name email role createdAt')
        .sort(sortObj)
        .skip(skip)
        .limit(limit);

      return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    },

    // Get single product by ID
    product: async (_, { id }) => {
      const product = await Product.findById(id).populate(
        'createdBy',
        'name email role createdAt'
      );
      if (!product) {
        throw new GraphQLError('Product not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return product;
    },

    // Get current user
    me: async (_, __, context) => {
      const user = requireAuth(context);
      return await User.findById(user.id);
    },

    // Get recent notifications
    notifications: async (_, __, context) => {
      requireAuth(context);
      return await Notification.find()
        .populate('createdBy', 'name email role createdAt')
        .populate('relatedProduct', 'name description price category inStock')
        .sort({ createdAt: -1 })
        .limit(50);
    },
  },

  Mutation: {
    // Signup
    signup: async (_, { name, email, password }, context) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new GraphQLError('User with this email already exists', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const user = await User.create({ name, email, password });
      const token = generateToken(user._id);

      // Create notification
      const notification = await Notification.create({
        message: `${user.name} has joined the platform`,
        type: 'user_joined',
        createdBy: user._id,
      });

      // Emit socket event
      if (context.io) {
        context.io.emit('user_joined', {
          message: `${user.name} has joined the platform`,
          user: { id: user._id, name: user.name, email: user.email },
          notification,
        });
      }

      return { token, user };
    },

    // Login
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new GraphQLError('Invalid credentials', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = generateToken(user._id);
      return { token, user };
    },

    // Create product
    createProduct: async (
      _,
      { name, description, price, category, inStock },
      context
    ) => {
      const user = requireAuth(context);

      const product = await Product.create({
        name,
        description,
        price,
        category,
        inStock: inStock !== undefined ? inStock : true,
        createdBy: user.id,
      });

      await product.populate('createdBy', 'name email role createdAt');

      // Create notification
      const notification = await Notification.create({
        message: `New product "${product.name}" was created by ${user.name}`,
        type: 'product_created',
        relatedProduct: product._id,
        createdBy: user.id,
      });

      // Emit socket event
      if (context.io) {
        context.io.emit('product_created', { product, notification });
      }

      return product;
    },

    // Update product
    updateProduct: async (
      _,
      { id, name, description, price, category, inStock },
      context
    ) => {
      const user = requireAuth(context);

      let product = await Product.findById(id);
      if (!product) {
        throw new GraphQLError('Product not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Only creator or admin can update
      if (
        product.createdBy.toString() !== user.id &&
        user.role !== 'admin'
      ) {
        throw new GraphQLError('Not authorized to update this product', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      const updates = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (category !== undefined) updates.category = category;
      if (inStock !== undefined) updates.inStock = inStock;

      product = await Product.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      }).populate('createdBy', 'name email role createdAt');

      // Create notification
      const notification = await Notification.create({
        message: `Product "${product.name}" was updated by ${user.name}`,
        type: 'product_updated',
        relatedProduct: product._id,
        createdBy: user.id,
      });

      // Emit socket event
      if (context.io) {
        context.io.emit('product_updated', { product, notification });
      }

      return product;
    },

    // Delete product
    deleteProduct: async (_, { id }, context) => {
      const user = requireAuth(context);

      const product = await Product.findById(id);
      if (!product) {
        throw new GraphQLError('Product not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // Only creator or admin can delete
      if (
        product.createdBy.toString() !== user.id &&
        user.role !== 'admin'
      ) {
        throw new GraphQLError('Not authorized to delete this product', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      await Product.findByIdAndDelete(id);

      // Create notification
      const notification = await Notification.create({
        message: `Product "${product.name}" was deleted by ${user.name}`,
        type: 'product_deleted',
        createdBy: user.id,
      });

      // Emit socket event
      if (context.io) {
        context.io.emit('product_deleted', {
          productId: product._id,
          notification,
        });
      }

      return product;
    },

    // Mark notification as read
    markNotificationRead: async (_, { id }, context) => {
      const user = requireAuth(context);

      const notification = await Notification.findById(id);
      if (!notification) {
        throw new GraphQLError('Notification not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (!notification.readBy.includes(user.id)) {
        notification.readBy.push(user.id);
        await notification.save();
      }

      await notification.populate('createdBy', 'name email role createdAt');
      await notification.populate(
        'relatedProduct',
        'name description price category inStock'
      );

      return notification;
    },
  },

  // Custom field resolvers for virtual id fields
  User: {
    id: (parent) => parent._id || parent.id,
  },
  Product: {
    id: (parent) => parent._id || parent.id,
  },
  Notification: {
    id: (parent) => parent._id || parent.id,
  },
};

module.exports = resolvers;

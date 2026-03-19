const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const setupSocket = require('./socket/socketHandler');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const User = require('./models/User');

// Load env vars
dotenv.config();

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Create HTTP server from Express app
const httpServer = http.createServer(app);

// Attach Socket.io to HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Setup Socket.io event handlers
setupSocket(io);

// Middleware
app.use(cors());
app.use(express.json());

// Pass io instance to req so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Product Manager API v3 - REST + GraphQL + WebSocket',
    endpoints: {
      rest: '/api/auth, /api/products, /api/notifications',
      graphql: '/graphql',
      websocket: 'ws://localhost:' + (process.env.PORT || 5000),
    },
  });
});

// Helper: extract user from JWT token for GraphQL context
const getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    return user;
  } catch {
    return null;
  }
};

// Start server
const startServer = async () => {
  // Connect to database
  await connectDB();

  // Create Apollo Server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start Apollo Server
  await apolloServer.start();

  // Apply Apollo middleware to Express at /graphql
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        // Extract token from Authorization header
        const token = req.headers.authorization?.replace('Bearer ', '') || '';
        const user = await getUserFromToken(token);
        return { user, io };
      },
    })
  );

  const PORT = process.env.PORT || 5000;

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`REST API:    http://localhost:${PORT}/api`);
    console.log(`GraphQL:     http://localhost:${PORT}/graphql`);
    console.log(`WebSocket:   ws://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

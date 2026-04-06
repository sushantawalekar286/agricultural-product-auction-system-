import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './server/config/db.js';
import userRoutes from './server/routes/userRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import auctionRoutes from './server/routes/auctionRoutes.js';
import bidRoutes from './server/routes/bidRoutes.js';
import serviceRoutes from './server/routes/serviceRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';
import User from './server/models/User.js';
import { setupBidSocket } from './server/sockets/bidSocket.js';
import { checkAuctions } from './server/services/auctionTimer.js';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startServer = async () => {
  await connectDB();

  // Seed default admin if none exists
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@agribid.com',
        password: 'adminpassword123',
        role: 'admin',
        phone: '1234567890',
        location: 'Headquarters'
      });
      console.log('✅ Default Admin created: admin@agribid.com | adminpassword123');
    }
  } catch (error) {
    console.error('Failed to seed admin:', error);
  }

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/auctions', auctionRoutes);
  app.use('/api/bids', bidRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/admin', adminRoutes);

  // Socket setup
  setupBidSocket(io);

  // Auction Timer - check every 10 seconds
  setInterval(() => {
    checkAuctions(io);
  }, 10000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

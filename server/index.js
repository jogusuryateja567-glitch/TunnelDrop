import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Enable CORS
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// Initialize Socket.io with CORS
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Room management
// Structure: { code: { sender: socketId, receiver: socketId, createdAt: timestamp } }
const rooms = new Map();

// Generate random 4-digit code
function generateCode() {
  let code;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    attempts++;
  } while (rooms.has(code) && attempts < maxAttempts);
  
  if (attempts >= maxAttempts) {
    throw new Error('Unable to generate unique code');
  }
  
  return code;
}

// Clean up expired rooms (older than 10 minutes)
function cleanupExpiredRooms() {
  const now = Date.now();
  const expiryTime = 10 * 60 * 1000; // 10 minutes
  
  for (const [code, room] of rooms.entries()) {
    if (now - room.createdAt > expiryTime) {
      console.log(`Cleaning up expired room: ${code}`);
      rooms.delete(code);
    }
  }
}

// Run cleanup every minute
setInterval(cleanupExpiredRooms, 60000);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Sender creates a new room
  socket.on('create-room', (callback) => {
    try {
      const code = generateCode();
      
      rooms.set(code, {
        sender: socket.id,
        receiver: null,
        createdAt: Date.now()
      });
      
      socket.join(code);
      socket.data.code = code;
      socket.data.role = 'sender';
      
      console.log(`Room created: ${code} by ${socket.id}`);
      
      callback({ success: true, code });
    } catch (error) {
      console.error('Error creating room:', error);
      callback({ success: false, error: error.message });
    }
  });
  
  // Receiver joins existing room
  socket.on('join-room', (code, callback) => {
    const room = rooms.get(code);
    
    if (!room) {
      callback({ success: false, error: 'Invalid code' });
      return;
    }
    
    if (room.receiver) {
      callback({ success: false, error: 'Room is full' });
      return;
    }
    
    room.receiver = socket.id;
    socket.join(code);
    socket.data.code = code;
    socket.data.role = 'receiver';
    
    console.log(`${socket.id} joined room: ${code}`);
    
    // Notify sender that receiver has joined
    io.to(room.sender).emit('peer-joined', {
      peerId: socket.id
    });
    
    callback({ success: true, code });
  });
  
  // Forward WebRTC signaling data to peer
  socket.on('signal', (data) => {
    const code = socket.data.code;
    const room = rooms.get(code);
    
    if (!room) {
      console.error(`Signal error: Room ${code} not found`);
      return;
    }
    
    // Determine target peer
    const targetPeer = socket.data.role === 'sender' ? room.receiver : room.sender;
    
    if (targetPeer) {
      io.to(targetPeer).emit('signal', {
        signal: data.signal,
        from: socket.id
      });
    }
  });
  
  // Handle file metadata sharing
  socket.on('file-metadata', (metadata) => {
    const code = socket.data.code;
    const room = rooms.get(code);
    
    if (!room || socket.data.role !== 'sender') {
      return;
    }
    
    if (room.receiver) {
      io.to(room.receiver).emit('file-metadata', metadata);
    }
  });
  
  // Handle transfer completion
  socket.on('transfer-complete', () => {
    const code = socket.data.code;
    const room = rooms.get(code);
    
    if (!room) return;
    
    // Notify both peers
    io.to(code).emit('transfer-complete');
    
    // Schedule room cleanup in 2 minutes
    setTimeout(() => {
      if (rooms.has(code)) {
        console.log(`Cleaning up completed room: ${code}`);
        rooms.delete(code);
      }
    }, 2 * 60 * 1000);
  });
  
  // Handle transfer cancellation
  socket.on('cancel-transfer', () => {
    const code = socket.data.code;
    const room = rooms.get(code);
    
    if (!room) return;
    
    // Notify peer
    io.to(code).emit('transfer-cancelled');
    
    // Clean up room
    rooms.delete(code);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    const code = socket.data.code;
    const room = rooms.get(code);
    
    if (room) {
      // Notify peer of disconnection
      io.to(code).emit('peer-disconnected');
      
      // Clean up room if sender disconnects or both are gone
      if (socket.data.role === 'sender' || !room.sender || !room.receiver) {
        console.log(`Cleaning up room ${code} after disconnect`);
        rooms.delete(code);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Signaling server running on port ${PORT}`);
  console.log(`📡 CORS enabled for: ${CORS_ORIGIN}`);
});

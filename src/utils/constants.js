// STUN server configuration
export const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
];

// WebRTC configuration
export const CHUNK_SIZE = 16 * 1024; // 16KB chunks
export const MAX_CHUNK_SIZE = 64 * 1024; // 64KB max

// Timeout values
export const CONNECTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
export const WEBRTC_TIMEOUT = 30 * 1000; // 30 seconds

// Signaling server
export const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || 'http://localhost:3001';

// Transfer states
export const TRANSFER_STATES = {
    IDLE: 'idle',
    WAITING: 'waiting',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    TRANSFERRING: 'transferring',
    COMPLETED: 'completed',
    ERROR: 'error',
    CANCELLED: 'cancelled',
};

// File size limits (soft caps)
export const MAX_FILE_SIZE = 100 * 1024 * 1024 * 1024; // 100GB

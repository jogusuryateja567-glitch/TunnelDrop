// STUN/TURN server configuration - Using direct IPs to bypass DNS blocks
export const ICE_SERVERS = [
    // Google STUN IPs
    { urls: 'stun:142.250.141.127:19302' }, // stun.l.google.com
    { urls: 'stun:142.251.2.127:19302' },  // stun1.l.google.com

    // OpenRelay IPs (Metered)
    {
        urls: 'turn:18.225.138.117:80', // openrelay.metered.ca
        username: 'openrelayproject',
        credential: 'openrelayproject'
    },
    {
        urls: 'turns:18.225.138.117:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject'
    }
];

// WebRTC configuration
export const CHUNK_SIZE = 16 * 1024; // 16KB chunks
export const MAX_CHUNK_SIZE = 64 * 1024; // 64KB max

// Timeout values
export const CONNECTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
export const WEBRTC_TIMEOUT = 30 * 1000; // 30 seconds

// Signaling server
const DEV_SERVER = `http://${window.location.hostname}:3001`;
export const SIGNALING_SERVER = import.meta.env.VITE_SIGNALING_SERVER || (import.meta.env.DEV ? DEV_SERVER : window.location.origin);

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

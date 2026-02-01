import { io } from 'socket.io-client';
import { SIGNALING_SERVER } from '../utils/constants';

class SignalingService {
    constructor() {
        this.socket = null;
        this.handlers = new Map();
    }

    connect() {
        if (this.socket?.connected) return this.socket;

        this.socket = io(SIGNALING_SERVER, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Forward events to handlers
        this.socket.onAny((event, ...args) => {
            const handlers = this.handlers.get(event);
            if (handlers) {
                handlers.forEach(handler => handler(...args));
            }
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.handlers.clear();
    }

    // Create room (sender)
    createRoom() {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Not connected to signaling server'));
                return;
            }

            this.socket.emit('create-room', (response) => {
                if (response.success) {
                    resolve(response.code);
                } else {
                    reject(new Error(response.error || 'Failed to create room'));
                }
            });
        });
    }

    // Join room (receiver)
    joinRoom(code) {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Not connected to signaling server'));
                return;
            }

            this.socket.emit('join-room', code, (response) => {
                if (response.success) {
                    resolve();
                } else {
                    reject(new Error(response.error || 'Failed to join room'));
                }
            });
        });
    }

    // Send WebRTC signal
    sendSignal(signal) {
        if (this.socket?.connected) {
            this.socket.emit('signal', { signal });
        }
    }

    // Send file metadata
    sendFileMetadata(metadata) {
        if (this.socket?.connected) {
            this.socket.emit('file-metadata', metadata);
        }
    }

    // Notify transfer complete
    notifyTransferComplete() {
        if (this.socket?.connected) {
            this.socket.emit('transfer-complete');
        }
    }

    // Cancel transfer
    cancelTransfer() {
        if (this.socket?.connected) {
            this.socket.emit('cancel-transfer');
        }
    }

    // Event handlers
    on(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
    }

    off(event, handler) {
        const handlers = this.handlers.get(event);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    // Common events
    onPeerJoined(handler) {
        this.on('peer-joined', handler);
    }

    onSignal(handler) {
        this.on('signal', handler);
    }

    onFileMetadata(handler) {
        this.on('file-metadata', handler);
    }

    onTransferComplete(handler) {
        this.on('transfer-complete', handler);
    }

    onTransferCancelled(handler) {
        this.on('transfer-cancelled', handler);
    }

    onPeerDisconnected(handler) {
        this.on('peer-disconnected', handler);
    }

    onConnect(handler) {
        this.on('connect', handler);
    }

    onDisconnect(handler) {
        this.on('disconnect', handler);
    }

    onError(handler) {
        this.on('error', handler);
    }
}

// Singleton instance
const signalingService = new SignalingService();

export default signalingService;

import { io } from 'socket.io-client';
import { SIGNALING_SERVER } from '../utils/constants';

class SignalingService {
    constructor() {
        this.socket = null;
        this.handlers = new Map();
    }

    connect() {
        if (this.socket?.connected) return Promise.resolve(this.socket);

        return new Promise((resolve, reject) => {
            if (this.socket) {
                this.socket.connect();
            } else {
                this.socket = io(SIGNALING_SERVER, {
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: 5,
                });

                // Forward events to handlers
                this.socket.onAny((event, ...args) => {
                    const handlers = this.handlers.get(event);
                    if (handlers && handlers.size > 0) {
                        handlers.forEach(handler => {
                            if (typeof handler === 'function') {
                                handler(...args);
                            }
                        });
                    }
                });
            }

            const onConnect = () => {
                this.socket.off('connect_error', onConnectError);
                resolve(this.socket);
            };

            const onConnectError = (err) => {
                this.socket.off('connect', onConnect);
                reject(err);
            };

            this.socket.once('connect', onConnect);
            this.socket.once('connect_error', onConnectError);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            // We don't null this.socket here to allow reconnection using the same instance
        }
        this.handlers.clear();
    }

    // Create room (sender)
    async createRoom() {
        await this.connect();
        return new Promise((resolve, reject) => {
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
    async joinRoom(code) {
        await this.connect();
        return new Promise((resolve, reject) => {
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
        if (typeof handler !== 'function') return;
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

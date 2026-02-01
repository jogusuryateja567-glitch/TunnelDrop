import SimplePeer from 'simple-peer';
import { ICE_SERVERS, CHUNK_SIZE } from '../utils/constants';
import signalingService from './signaling';

class WebRTCService {
    constructor() {
        this.peer = null;
        this.file = null;
        this.chunks = [];
        this.receivedSize = 0;
        this.signalBuffer = [];
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
        this.onErrorCallback = null;
    }

    // Initialize peer connection
    createPeer(initiator, stream = null) {
        if (this.peer) {
            this.peer.destroy();
        }

        this.peer = new SimplePeer({
            initiator,
            trickle: false, // Wait for all candidates (more stable)
            config: {
                iceServers: ICE_SERVERS,
            },
            stream,
        });

        // Process buffered signals
        if (this.signalBuffer.length > 0) {
            console.log(`Processing ${this.signalBuffer.length} buffered signals`);
            this.signalBuffer.forEach(sig => this.peer.signal(sig));
            this.signalBuffer = [];
        }

        // Handle signaling
        this.peer.on('signal', (signal) => {
            console.log('Generated WebRTC signal:', signal.type);
            signalingService.sendSignal(signal);
        });

        // Handle connection
        this.peer.on('connect', () => {
            console.log('WebRTC connection established');

            // Verify data channel state
            if (this.peer._channel) {
                console.log('Data channel state:', this.peer._channel.readyState);
            }

            // Verify Buffer polyfill
            try {
                const buf = Buffer.from('test');
                console.log('Buffer polyfill check passed:', Buffer.isBuffer(buf));
            } catch (err) {
                console.error('Buffer polyfill failed:', err);
            }
        });

        // Handle errors
        this.peer.on('error', (err) => {
            console.error('WebRTC error:', err);
            if (this.onErrorCallback) {
                this.onErrorCallback(err);
            }
        });

        // Handle close
        this.peer.on('close', () => {
            console.log('WebRTC connection closed');
        });

        return this.peer;
    }

    // Process remote signal
    signal(signalData) {
        console.log('Received remote signal:', signalData.type);
        if (this.peer) {
            console.log('Passing signal to peer directly');
            this.peer.signal(signalData);
        } else {
            console.log('Buffering signal (peer not ready)');
            this.signalBuffer.push(signalData);
        }
    }

    // Sender: Stream file to receiver
    async sendFile(file, onProgress) {
        this.file = file;
        this.onProgressCallback = onProgress;

        // Wait for peer to be connected
        if (!this.peer) {
            throw new Error('Peer not initialized');
        }

        // If not connected yet, wait for connection
        if (!this.peer.connected) {
            console.log('Waiting for peer connection before sending...');
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Peer connection timeout'));
                }, 20000);

                this.peer.once('connect', () => {
                    clearTimeout(timeout);
                    console.log('Peer connected, starting file transfer');
                    resolve();
                });
            });
        }

        console.log(`Starting file transfer: ${file.name} (${file.size} bytes)`);

        // Small delay to ensure channel is stable
        await new Promise(resolve => setTimeout(resolve, 500));

        const chunkSize = CHUNK_SIZE;
        let offset = 0;
        let lastLoggedProgress = 0;

        const readChunk = () => {
            // Verify channel is still open
            if (this.peer.destroyed || !this.peer.connected) {
                console.error('Peer disconnected during transfer');
                const err = new Error('Connection lost during transfer');
                if (this.onErrorCallback) this.onErrorCallback(err);
                return;
            }

            const slice = file.slice(offset, offset + chunkSize);
            const reader = new FileReader();

            reader.onload = (e) => {
                if (e.target.result) {
                    try {
                        const buffer = Buffer.from(e.target.result);
                        this.peer.send(buffer);
                        offset += e.target.result.byteLength;

                        if (this.onProgressCallback) {
                            this.onProgressCallback(offset);
                        }

                        // Log progress every 10%
                        const progress = (offset / file.size) * 100;
                        if (progress - lastLoggedProgress > 10) {
                            console.log(`Transfer progress: ${Math.round(progress)}%`);
                            lastLoggedProgress = progress;
                        }

                        if (offset < file.size) {
                            // Use setTimeout to allow UI updates and prevent blocking
                            if (offset % (chunkSize * 10) === 0) {
                                setTimeout(readChunk, 0);
                            } else {
                                readChunk();
                            }
                        } else {
                            // Transfer complete
                            console.log('File transfer complete');
                            signalingService.notifyTransferComplete();
                            if (this.onCompleteCallback) {
                                this.onCompleteCallback();
                            }
                        }
                    } catch (err) {
                        console.error('Error sending chunk:', err);
                        if (this.onErrorCallback) {
                            this.onErrorCallback(err);
                        }
                    }
                }
            };

            reader.onerror = (err) => {
                console.error('FileReader error:', err);
                if (this.onErrorCallback) {
                    this.onErrorCallback(err);
                }
            };

            reader.readAsArrayBuffer(slice);
        };

        readChunk();
    }

    // Receiver: Receive file from sender
    receiveFile(fileMetadata, onProgress, onComplete) {
        this.chunks = [];
        this.receivedSize = 0;
        this.onProgressCallback = onProgress;
        this.onCompleteCallback = onComplete;

        if (!this.peer) {
            throw new Error('Peer not initialized');
        }

        this.peer.on('data', (data) => {
            this.chunks.push(data);
            this.receivedSize += data.byteLength;

            if (this.onProgressCallback) {
                this.onProgressCallback(this.receivedSize);
            }

            // Check if complete
            if (this.receivedSize >= fileMetadata.size) {
                this.downloadFile(fileMetadata);
            }
        });
    }

    // Download reconstructed file
    downloadFile(fileMetadata) {
        const blob = new Blob(this.chunks, { type: fileMetadata.type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = fileMetadata.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        console.log('File download initiated');

        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }

    // Set callbacks
    onProgress(callback) {
        this.onProgressCallback = callback;
    }

    onComplete(callback) {
        this.onCompleteCallback = callback;
    }

    onError(callback) {
        this.onErrorCallback = callback;
    }

    // Cleanup
    destroy() {
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }
        this.chunks = [];
        this.receivedSize = 0;
        this.file = null;
        this.onProgressCallback = null;
        this.onCompleteCallback = null;
        this.onErrorCallback = null;
    }
}

// Singleton instance
const webrtcService = new WebRTCService();

export default webrtcService;

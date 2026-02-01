import { useEffect, useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import useTransferStore from '../store/transferStore';
import signalingService from '../services/signaling';
import webrtcService from '../services/webrtc';
import { TRANSFER_STATES } from '../utils/constants';
import { formatFileSize } from '../utils/formatters';

function SenderView({ onBack }) {
    const fileInputRef = useRef(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const {
        file,
        code,
        state,
        setState,
        setRole,
        setCode,
        setFile: setStoreFile,
        startTransfer,
        setProgress,
        completeTransfer,
        setError,
    } = useTransferStore();


    useEffect(() => {
        if (!file) return;

        // Initialize services
        setStoreFile(file);
        setRole('sender');

        // Connect to signaling server
        signalingService.connect();

        // Create room
        signalingService.createRoom()
            .then((roomCode) => {
                setCode(roomCode);
                setState(TRANSFER_STATES.WAITING);
            })
            .catch((err) => {
                setError(err.message);
            });

        // Handle peer joined
        const handlePeerJoined = () => {
            console.log('Receiver joined');
            setState(TRANSFER_STATES.CONNECTING);

            // Create WebRTC peer (initiator)
            webrtcService.createPeer(true);

            // Send file metadata
            signalingService.sendFileMetadata({
                name: file.name,
                size: file.size,
                type: file.type,
            });

            // Handle WebRTC connection
            webrtcService.peer.on('connect', () => {
                console.log('WebRTC connected, waiting for receiver to accept...');
                setState(TRANSFER_STATES.CONNECTED);
            });

            // Wait for receiver to click "Accept"
            const handleReceiverReady = () => {
                console.log('Receiver accepted, starting transfer');
                startTransfer();

                // Start sending file
                webrtcService.sendFile(file, (bytesTransferred) => {
                    setProgress(bytesTransferred);
                });
            };

            signalingService.on('receiver-ready', handleReceiverReady);

            webrtcService.onComplete(() => {
                completeTransfer();
            });

            webrtcService.onError((err) => {
                setError(err.message);
            });
        };

        // Handle signaling
        const handleSignal = ({ signal }) => {
            webrtcService.signal(signal);
        };

        const handleTransferCancelled = () => {
            setError('Transfer cancelled by receiver');
        };

        const handlePeerDisconnected = () => {
            if (state !== TRANSFER_STATES.COMPLETED) {
                setError('Receiver disconnected');
            }
        };

        signalingService.onPeerJoined(handlePeerJoined);
        signalingService.onSignal(handleSignal);
        signalingService.onTransferCancelled(handleTransferCancelled);
        signalingService.onPeerDisconnected(handlePeerDisconnected);

        // Cleanup
        return () => {
            signalingService.off('peer-joined', handlePeerJoined);
            signalingService.off('signal', handleSignal);
            signalingService.off('transfer-cancelled', handleTransferCancelled);
            signalingService.off('peer-disconnected', handlePeerDisconnected);
        };
    }, [file]);

    // Countdown timer
    useEffect(() => {
        if (state !== TRANSFER_STATES.WAITING) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setError('Connection timeout');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [state]);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setStoreFile(selectedFile);
        } else {
            onBack();
        }
    };

    const handleCancel = () => {
        signalingService.cancelTransfer();
        webrtcService.destroy();
        signalingService.disconnect();
        onBack();
    };

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const qrValue = `${window.location.origin}?code=${code}`;

    if (!file) {
        return (
            <div className="card">
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <p className="text-center text-gray-600 dark:text-gray-400">
                    Select a file to send...
                </p>
            </div>
        );
    }

    if (state === TRANSFER_STATES.ERROR) {
        return (
            <div className="card max-w-md animate-fade-in">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Transfer Failed</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{useTransferStore.getState().error}</p>
                    <button onClick={onBack} className="btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card max-w-md animate-fade-in">
            <div className="text-center">
                {/* File info */}
                <div className="mb-6">
                    <div className="text-5xl mb-3">📄</div>
                    <h3 className="text-xl font-semibold mb-1">{file.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{formatFileSize(file.size)}</p>
                </div>

                {/* Code display */}
                <div className="mb-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Share this code:</p>
                    <div className="text-6xl font-bold tracking-wider gradient-text mb-4">
                        {code || '----'}
                    </div>
                </div>

                {/* QR Code */}
                {code && (
                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                            <QRCodeCanvas value={qrValue} size={200} />
                        </div>
                    </div>
                )}

                {/* Status */}
                <div className="mb-6">
                    {state === TRANSFER_STATES.WAITING && (
                        <>
                            <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                                <span>Waiting for receiver...</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Expires in {minutes}:{seconds.toString().padStart(2, '0')}
                            </p>
                        </>
                    )}
                    {state === TRANSFER_STATES.CONNECTING && (
                        <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                            <span>Connecting...</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <button onClick={handleCancel} className="btn-secondary w-full">
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default SenderView;

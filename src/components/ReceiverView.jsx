import { useState, useEffect } from 'react';
import useTransferStore from '../store/transferStore';
import signalingService from '../services/signaling';
import webrtcService from '../services/webrtc';
import { TRANSFER_STATES } from '../utils/constants';
import { formatFileSize, isValidCode, getDeviceInfo } from '../utils/formatters';

function ReceiverView({ onBack }) {
    const [code, setCodeInput] = useState('');
    const [fileMetadata, setFileMetadata] = useState(null);
    const {
        state,
        setState,
        setRole,
        setCode,
        setFileMetadata: setStoreFileMetadata,
        startTransfer,
        setProgress,
        completeTransfer,
        setError,
    } = useTransferStore();

    useEffect(() => {
        // Check for code in URL
        const params = new URLSearchParams(window.location.search);
        const urlCode = params.get('code');
        if (urlCode && isValidCode(urlCode)) {
            setCodeInput(urlCode);
            handleJoinRoom(urlCode);
        }
    }, []);

    const handleJoinRoom = async (roomCode) => {
        if (!isValidCode(roomCode)) {
            setError('Please enter a valid 4-digit code');
            return;
        }

        try {
            setRole('receiver');
            setCode(roomCode);
            setState(TRANSFER_STATES.CONNECTING);

            // Connect to signaling server
            signalingService.connect();

            // Join room
            await signalingService.joinRoom(roomCode);

            // Wait for file metadata
            const handleFileMetadata = (metadata) => {
                setFileMetadata(metadata);
                setStoreFileMetadata(metadata);
                setState(TRANSFER_STATES.WAITING);
            };

            // Handle signaling
            const handleSignal = ({ signal }) => {
                webrtcService.signal(signal);
            };

            const handleTransferCancelled = () => {
                setError('Transfer cancelled by sender');
            };

            const handlePeerDisconnected = () => {
                if (state !== TRANSFER_STATES.COMPLETED) {
                    setError('Sender disconnected');
                }
            };

            signalingService.onFileMetadata(handleFileMetadata);
            signalingService.onSignal(handleSignal);
            signalingService.onTransferCancelled(handleTransferCancelled);
            signalingService.onPeerDisconnected(handlePeerDisconnected);

            // Create WebRTC peer (not initiator)
            webrtcService.createPeer(false);

        } catch (err) {
            setError(err.message);
        }
    };

    const handleAccept = () => {
        if (!fileMetadata) return;

        setState(TRANSFER_STATES.CONNECTED);
        startTransfer();

        // Start receiving file
        webrtcService.receiveFile(
            fileMetadata,
            (bytesTransferred) => {
                setProgress(bytesTransferred);
            },
            () => {
                completeTransfer();
                signalingService.notifyTransferComplete();
            }
        );

        webrtcService.onError((err) => {
            setError(err.message);
        });
    };

    const handleDecline = () => {
        signalingService.cancelTransfer();
        webrtcService.destroy();
        signalingService.disconnect();
        onBack();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleJoinRoom(code);
    };

    if (state === TRANSFER_STATES.ERROR) {
        return (
            <div className="card max-w-md animate-fade-in">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Connection Failed</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{useTransferStore.getState().error}</p>
                    <button onClick={onBack} className="btn-primary">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    // File preview and accept/decline
    if (fileMetadata && state === TRANSFER_STATES.WAITING) {
        return (
            <div className="card max-w-md animate-fade-in">
                <div className="text-center">
                    <div className="text-5xl mb-4">📥</div>
                    <h3 className="text-2xl font-semibold mb-2">Incoming File</h3>

                    <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-6 mb-6">
                        <div className="text-xl font-semibold mb-2">{fileMetadata.name}</div>
                        <div className="text-gray-600 dark:text-gray-400 mb-3">{formatFileSize(fileMetadata.size)}</div>
                        <div className="text-sm text-gray-500">
                            From: {getDeviceInfo()}
                        </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Do you want to accept this file?
                    </p>

                    <div className="flex gap-3">
                        <button onClick={handleDecline} className="btn-secondary flex-1">
                            Decline
                        </button>
                        <button onClick={handleAccept} className="btn-primary flex-1">
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Code entry
    return (
        <div className="card max-w-md animate-fade-in">
            <div className="text-center mb-8">
                <div className="text-5xl mb-4">🔢</div>
                <h3 className="text-2xl font-semibold mb-2">Enter Transfer Code</h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Enter the 4-digit code shared by the sender
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="\d{4}"
                        maxLength={4}
                        value={code}
                        onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="0000"
                        className="input text-center text-3xl tracking-widest font-bold"
                        autoFocus
                        disabled={state === TRANSFER_STATES.CONNECTING}
                    />
                </div>

                {state === TRANSFER_STATES.CONNECTING && (
                    <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400">
                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                        <span>Connecting...</span>
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        className="btn-secondary flex-1"
                        disabled={state === TRANSFER_STATES.CONNECTING}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="btn-primary flex-1"
                        disabled={!isValidCode(code) || state === TRANSFER_STATES.CONNECTING}
                    >
                        Join
                    </button>
                </div>
            </form>

            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                        You can also scan the QR code shown on the sender's device
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ReceiverView;

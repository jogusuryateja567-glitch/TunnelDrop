import useTransferStore from '../store/transferStore';
import { formatFileSize, formatSpeed, formatDuration, calculateProgress } from '../utils/formatters';
import { TRANSFER_STATES } from '../utils/constants';
import signalingService from '../services/signaling';
import webrtcService from '../services/webrtc';

function TransferProgress({ onBack }) {
    const {
        state,
        role,
        fileName,
        fileSize,
        bytesTransferred,
        progress,
        speed,
        getTimeRemaining,
        peerInfo,
    } = useTransferStore();

    const handleCancel = () => {
        signalingService.cancelTransfer();
        webrtcService.destroy();
        signalingService.disconnect();
        onBack();
    };

    const handleDone = () => {
        webrtcService.destroy();
        signalingService.disconnect();
        onBack();
    };

    const timeRemaining = getTimeRemaining();
    const isTransferring = state === TRANSFER_STATES.TRANSFERRING;
    const isCompleted = state === TRANSFER_STATES.COMPLETED;

    return (
        <div className="card max-w-2xl w-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">
                        {role === 'sender' ? '📤' : '📥'}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{fileName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {role === 'sender' ? 'Sending to' : 'Receiving from'} {peerInfo || 'peer'}
                        </p>
                    </div>
                </div>
                {isCompleted && (
                    <div className="text-4xl animate-bounce">✅</div>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">{Math.round(progress)}%</span>
                    <span className="text-gray-600 dark:text-gray-400">
                        {formatFileSize(bytesTransferred)} of {formatFileSize(fileSize)}
                    </span>
                </div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300 progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Transfer Stats */}
            {isTransferring && (
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                            {formatSpeed(speed)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Transfer Speed</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                        <div className="text-2xl font-bold text-accent-600 dark:text-accent-400 mb-1">
                            {timeRemaining ? formatDuration(timeRemaining) : '--:--'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Time Remaining</div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {isCompleted && (
                <div className="mb-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                    <div className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                        Transfer Complete!
                    </div>
                    <p className="text-green-700 dark:text-green-300">
                        {role === 'sender'
                            ? 'File sent successfully'
                            : 'File downloaded successfully'}
                    </p>
                </div>
            )}

            {/* Connecting State */}
            {state === TRANSFER_STATES.CONNECTED && !isTransferring && (
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-3 text-primary-600 dark:text-primary-400">
                        <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse"></div>
                        <span className="font-medium">Preparing transfer...</span>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-center">
                {isCompleted ? (
                    <button onClick={handleDone} className="btn-primary px-12">
                        Done
                    </button>
                ) : (
                    <button onClick={handleCancel} className="btn-danger px-8">
                        Cancel Transfer
                    </button>
                )}
            </div>

            {/* Transfer Animation */}
            {isTransferring && (
                <div className="mt-8 flex justify-center tunnel-effect opacity-20">
                    <div className="relative w-32 h-32">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute inset-0 border-4 border-primary-500 rounded-full animate-tunnel"
                                style={{
                                    animationDelay: `${i * 0.7}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransferProgress;

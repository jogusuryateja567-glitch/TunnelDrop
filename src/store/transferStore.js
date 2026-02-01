import { create } from 'zustand';
import { TRANSFER_STATES } from '../utils/constants';

const useTransferStore = create((set, get) => ({
    // Transfer state
    state: TRANSFER_STATES.IDLE,
    role: null, // 'sender' | 'receiver'

    // Room info
    code: null,

    // File info
    file: null,
    fileName: null,
    fileSize: 0,
    fileType: null,

    // Progress
    bytesTransferred: 0,
    progress: 0,
    speed: 0, // bytes per second
    startTime: null,

    // Peer info
    peerInfo: null,

    // Error
    error: null,

    // Actions
    setState: (state) => set({ state }),

    setRole: (role) => set({ role }),

    setCode: (code) => set({ code }),

    setFile: (file) => set({
        file,
        fileName: file?.name || null,
        fileSize: file?.size || 0,
        fileType: file?.type || null,
    }),

    setFileMetadata: (metadata) => set({
        fileName: metadata.name,
        fileSize: metadata.size,
        fileType: metadata.type,
    }),

    setProgress: (bytesTransferred) => {
        const { fileSize, startTime } = get();
        const progress = fileSize > 0 ? Math.min(100, (bytesTransferred / fileSize) * 100) : 0;

        // Calculate speed
        let speed = 0;
        if (startTime) {
            const elapsed = (Date.now() - startTime) / 1000; // seconds
            if (elapsed > 0) {
                speed = bytesTransferred / elapsed;
            }
        }

        set({
            bytesTransferred,
            progress,
            speed,
        });
    },

    startTransfer: () => {
        set({
            state: TRANSFER_STATES.TRANSFERRING,
            startTime: Date.now(),
            bytesTransferred: 0,
            progress: 0,
            speed: 0,
        });
    },

    completeTransfer: () => {
        set({
            state: TRANSFER_STATES.COMPLETED,
            progress: 100,
        });
    },

    setError: (error) => {
        set({
            state: TRANSFER_STATES.ERROR,
            error: typeof error === 'string' ? error : error?.message || 'An error occurred',
        });
    },

    setPeerInfo: (peerInfo) => set({ peerInfo }),

    reset: () => set({
        state: TRANSFER_STATES.IDLE,
        role: null,
        code: null,
        file: null,
        fileName: null,
        fileSize: 0,
        fileType: null,
        bytesTransferred: 0,
        progress: 0,
        speed: 0,
        startTime: null,
        peerInfo: null,
        error: null,
    }),

    // Computed values
    getTimeRemaining: () => {
        const { bytesTransferred, fileSize, speed } = get();

        if (speed === 0 || bytesTransferred === 0) return null;

        const remaining = fileSize - bytesTransferred;
        return remaining / speed; // seconds
    },
}));

export default useTransferStore;

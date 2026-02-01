import { useRef } from 'react';

function HomePage({ onSendFile, onReceiveFile }) {
    const fileInputRef = useRef(null);

    const handleSendClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onSendFile(file);
        }
    };

    return (
        <div className="w-full max-w-2xl animate-fade-in">
            <div className="text-center mb-12">
                <h2 className="text-5xl font-bold mb-4 gradient-text">
                    Send files at light speed
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    Direct peer-to-peer file transfer with zero upload wait time
                </p>
            </div>

            <div className="card space-y-6">
                {/* Send File Button */}
                <button
                    onClick={handleSendClick}
                    className="w-full btn-primary text-lg py-6 flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Send File
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">or</span>
                    </div>
                </div>

                {/* Receive File Button */}
                <button
                    onClick={onReceiveFile}
                    className="w-full btn-secondary text-lg py-6 flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Receive File
                </button>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6">
                    <div className="text-3xl mb-3">⚡</div>
                    <h3 className="font-semibold mb-2">Instant Start</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Downloads begin immediately, no upload wait
                    </p>
                </div>
                <div className="p-6">
                    <div className="text-3xl mb-3">♾️</div>
                    <h3 className="font-semibold mb-2">No Limits</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        No file size restrictions or artificial caps
                    </p>
                </div>
                <div className="p-6">
                    <div className="text-3xl mb-3">🔒</div>
                    <h3 className="font-semibold mb-2">Private</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Files never stored on servers, 100% P2P
                    </p>
                </div>
            </div>
        </div>
    );
}

export default HomePage;

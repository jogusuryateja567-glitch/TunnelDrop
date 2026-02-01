import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import SenderView from './components/SenderView';
import ReceiverView from './components/ReceiverView';
import TransferProgress from './components/TransferProgress';
import useTransferStore from './store/transferStore';
import { TRANSFER_STATES } from './utils/constants';

function App() {
    const [view, setView] = useState('home'); // 'home' | 'sender' | 'receiver'
    const [darkMode, setDarkMode] = useState(false);
    const { state, reset, setFile: setStoreFile } = useTransferStore();

    useEffect(() => {
        // Check for code in URL (QR scan)
        const params = new URLSearchParams(window.location.search);
        const urlCode = params.get('code');
        if (urlCode && urlCode.length === 4) {
            setView('receiver');
        }
    }, []);

    // Apply dark mode
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Handle navigation
    const handleSendFile = (file) => {
        reset();
        if (file) setStoreFile(file);
        setView('sender');
    };

    const handleReceiveFile = () => {
        reset();
        setView('receiver');
    };

    const handleBackToHome = () => {
        reset();
        setView('home');
    };

    // Show transfer progress when transferring or completed
    const showProgress = [
        TRANSFER_STATES.TRANSFERRING,
        TRANSFER_STATES.COMPLETED,
        TRANSFER_STATES.CONNECTED,
    ].includes(state);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1
                        className="text-2xl font-bold gradient-text cursor-pointer"
                        onClick={handleBackToHome}
                    >
                        TunnelDrop
                    </h1>
                </div>

                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                    aria-label="Toggle dark mode"
                >
                    {darkMode ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                {showProgress ? (
                    <TransferProgress onBack={handleBackToHome} />
                ) : (
                    <>
                        {view === 'home' && (
                            <HomePage
                                onSendFile={handleSendFile}
                                onReceiveFile={handleReceiveFile}
                            />
                        )}
                        {view === 'sender' && (
                            <SenderView onBack={handleBackToHome} />
                        )}
                        {view === 'receiver' && (
                            <ReceiverView onBack={handleBackToHome} />
                        )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="p-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                <p>
                    🔒 Your files never touch our servers • Direct P2P transfer • Zero upload wait
                </p>
            </footer>
        </div>
    );
}

export default App;

import { useState, useEffect } from 'react';

function NetworkGuide({ onDismiss }) {
    const [step, setStep] = useState(1);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Connect to Same Network</h3>
                    <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-8">
                    {[1, 2, 3].map(num => (
                        <div key={num} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                {num}
                            </div>
                            {num < 3 && <div className={`w-12 h-1 mx-2 ${step > num ? 'bg-primary-600' : 'bg-gray-200'}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Enable Hotspot */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="text-5xl text-center mb-4">📱</div>
                        <h4 className="font-semibold text-lg text-center">Step 1: Enable Hotspot</h4>
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">On the SENDER's device:</p>
                            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                                <li>Open Settings → Network & Internet</li>
                                <li>Tap "Hotspot & Tethering"</li>
                                <li>Turn ON "Wi-Fi Hotspot"</li>
                                <li>Note the network name and password</li>
                            </ol>
                        </div>
                        <button onClick={() => setStep(2)} className="btn-primary w-full">
                            Next: Connect Receiver →
                        </button>
                    </div>
                )}

                {/* Step 2: Connect Receiver */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="text-5xl text-center mb-4">📶</div>
                        <h4 className="font-semibold text-lg text-center">Step 2: Connect Receiver</h4>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">On the RECEIVER's device:</p>
                            <ol className="text-sm text-green-800 dark:text-green-200 space-y-2 list-decimal list-inside">
                                <li>Open Wi-Fi settings</li>
                                <li>Look for the sender's hotspot name</li>
                                <li>Connect using the password</li>
                                <li>Wait for connection confirmation</li>
                            </ol>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                                ← Back
                            </button>
                            <button onClick={() => setStep(3)} className="btn-primary flex-1">
                                Next: Transfer File →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Ready to Transfer */}
                {step === 3 && (
                    <div className="space-y-4">
                        <div className="text-5xl text-center mb-4">✅</div>
                        <h4 className="font-semibold text-lg text-center">Step 3: You're All Set!</h4>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 space-y-3">
                            <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Both devices are now on the same network!</p>
                            <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-2">
                                <li>✓ Sender has enabled hotspot</li>
                                <li>✓ Receiver has connected to it</li>
                                <li>✓ Direct P2P connection will work</li>
                                <li>✓ No internet data will be used for transfer</li>
                            </ul>
                        </div>
                        <button onClick={onDismiss} className="btn-primary w-full">
                            Got it! Start Transfer →
                        </button>
                    </div>
                )}

                {/* Alternative method note */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 text-center">
                        💡 Alternative: Both devices can also connect to the same Wi-Fi network
                    </p>
                </div>
            </div>
        </div>
    );
}

export default NetworkGuide;

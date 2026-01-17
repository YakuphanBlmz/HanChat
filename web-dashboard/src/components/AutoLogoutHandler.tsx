import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock } from 'lucide-react';

interface AutoLogoutHandlerProps {
    onLogout: () => void;
    isActive: boolean; // Only run if user is logged in
}

// Configuration
const WARNING_THRESHOLD_MS = 3 * 60 * 1000; // 3 Minutes (Warning appears)
const LOGOUT_THRESHOLD_MS = 5 * 60 * 1000;  // 5 Minutes (Logout happens)

export const AutoLogoutHandler: React.FC<AutoLogoutHandlerProps> = ({ onLogout, isActive }) => {
    const [, setLastActivity] = useState<number>(Date.now());
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    // Use refs for values accessed inside event listeners/intervals to avoid dependency stales
    const lastActivityRef = useRef(Date.now());
    const showWarningRef = useRef(false);

    // Function to reset timer - only works if NOT in warning state
    const resetActivity = useCallback(() => {
        // CRITICAL: If warning is already shown, ignored all passive events (mouse, keyboard)
        // User MUST click the button in the modal to reset.
        if (!showWarningRef.current) {
            const now = Date.now();
            lastActivityRef.current = now;
            setLastActivity(now);
        }
    }, []);

    // Explicit reset from the modal button
    const handleStayLoggedIn = () => {
        const now = Date.now();
        lastActivityRef.current = now;
        setLastActivity(now);

        setShowWarning(false);
        showWarningRef.current = false;
    };

    // Setup event listeners for passive activity monitoring
    useEffect(() => {
        if (!isActive) return;

        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Throttle event listeners to avoid performance hit
        let timeout: NodeJS.Timeout;
        const throttledReset = () => {
            if (!timeout) {
                timeout = setTimeout(() => {
                    resetActivity();
                    // @ts-ignore
                    timeout = null;
                }, 500);
            }
        };

        events.forEach(event => window.addEventListener(event, throttledReset));

        return () => {
            events.forEach(event => window.removeEventListener(event, throttledReset));
            if (timeout) clearTimeout(timeout);
        };
    }, [isActive, resetActivity]);

    // Main Interval Check
    useEffect(() => {
        if (!isActive) return;

        const checkInterval = setInterval(() => {
            const now = Date.now();
            const elapsed = now - lastActivityRef.current;

            // 1. Check for Logout
            if (elapsed >= LOGOUT_THRESHOLD_MS) {
                onLogout();
                clearInterval(checkInterval);
                return;
            }

            // 2. Check for Warning
            if (elapsed >= WARNING_THRESHOLD_MS) {
                if (!showWarningRef.current) {
                    setShowWarning(true);
                    showWarningRef.current = true;
                }

                // Update countdown for UI
                const remaining = Math.max(0, Math.ceil((LOGOUT_THRESHOLD_MS - elapsed) / 1000));
                setTimeLeft(remaining);
            } else {
                // If we went back to safe zone (e.g. manual reset), hide warning
                if (showWarningRef.current) {
                    setShowWarning(false);
                    showWarningRef.current = false;
                }
            }

        }, 1000);

        return () => clearInterval(checkInterval);
    }, [isActive, onLogout]);

    // If not valid or no warning needed, return null
    if (!isActive || !showWarning) return null;

    // Format MM:SS
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1e293b] border border-red-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 text-center transform scale-100 animate-in zoom-in duration-300">

                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <Clock className="w-10 h-10 text-red-500" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                    Oturumunuz Sonlanmak Üzere
                </h2>

                <p className="text-slate-400 mb-6">
                    Güvenliğiniz nedeniyle 5 dakikadır işlem yapmadığınız tespit edildi.
                </p>

                <div className="text-4xl font-mono font-bold text-red-400 mb-8 tracking-wider bg-black/20 py-4 rounded-xl border border-red-500/20">
                    {formattedTime}
                </div>

                <button
                    onClick={handleStayLoggedIn}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                >
                    <span className="text-2xl">✋</span> Buradayım, Devam Et
                </button>

                <p className="mt-4 text-xs text-slate-500">
                    İşlem yapılmazsa otomatik çıkış yapılacaktır.
                </p>

            </div>
        </div>
    );
};

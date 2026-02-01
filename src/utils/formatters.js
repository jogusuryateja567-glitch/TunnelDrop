/**
 * Format bytes to human-readable file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Format transfer speed
 */
export function formatSpeed(bytesPerSecond) {
    if (bytesPerSecond === 0) return '0 B/s';

    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(1024));
    const speed = bytesPerSecond / Math.pow(1024, i);

    return `${speed.toFixed(i < 2 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Format time duration in seconds
 */
export function formatDuration(seconds) {
    if (seconds < 0 || !isFinite(seconds)) return '--:--';
    if (seconds < 60) return `${Math.round(seconds)}s`;

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Validate 4-digit code
 */
export function isValidCode(code) {
    return /^\d{4}$/.test(code);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(transferred, total) {
    if (total === 0) return 0;
    return Math.min(100, Math.round((transferred / total) * 100));
}

/**
 * Get device info string
 */
export function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let os = 'Unknown';

    // Detect browser
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';

    // Detect OS
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
}

// @/utils/inactivity.ts
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let warningTimeoutId: ReturnType<typeof setTimeout> | null = null;
let activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
let options: { warningTime: number; logoutTime: number; onWarning: () => void; onLogout: () => void; onActivity: () => void; } | null = null;

// This flag helps prevent multiple watchers from being initialized
// You might need to make it more robust depending on your app's lifecycle
(startInactivityWatcher as any).__watcherActive = false; 

function resetTimer() {
    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    if (options && options.onActivity) {
        options.onActivity(); // Call onActivity to notify App.vue to reset dialogs
    }
    if (options) { // Only set new timeouts if options exist
        warningTimeoutId = setTimeout(() => {
            if (options && options.onWarning) {
                options.onWarning();
            }
            timeoutId = setTimeout(() => {
                if (options && options.onLogout) {
                    options.onLogout();
                }
                stopInactivityWatcher(); // Stop watcher after logout
            }, options.logoutTime); // Time after warning to logout
        }, options.warningTime); // Time to show warning
    }
}

function handleActivity() {
    resetTimer();
}

export function startInactivityWatcher(userOptions: { warningTime?: number; logoutTime?: number; onWarning: () => void; onLogout: () => void; onActivity: () => void; }) {
    // Only start if not already active or if explicitly re-initializing
    if ((startInactivityWatcher as any).__watcherActive) {
        // If already active, just reset the timer if new options come in (e.g., route change)
        options = {
            warningTime: userOptions.warningTime || 1000 * 60 * 5, // Default 4 mins to warning
            logoutTime: userOptions.logoutTime || 1000 * 60 * 5, // Default 1 min from warning to logout
            onWarning: userOptions.onWarning,
            onLogout: userOptions.onLogout,
            onActivity: userOptions.onActivity
        };
        resetTimer(); // Reset existing watcher with new options/activity
        return;
    }

    options = {
        warningTime: userOptions.warningTime || 1000 * 60 * 5,
        logoutTime: userOptions.logoutTime || 1000 * 60 * 5,
        onWarning: userOptions.onWarning,
        onLogout: userOptions.onLogout,
        onActivity: userOptions.onActivity
    };

    activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity);
    });

    (startInactivityWatcher as any).__watcherActive = true;
    resetTimer(); // Initial start of the timer
}

export function stopInactivityWatcher() {
    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
    activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
    });
    timeoutId = null;
    warningTimeoutId = null;
    options = null;
    (startInactivityWatcher as any).__watcherActive = false; // Reset the flag
}

// Example usage might involve importing this in your main.ts or App.vue
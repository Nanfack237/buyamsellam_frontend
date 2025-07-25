// @/utils/inactivity.ts

// Type definitions for our options object
interface InactivityOptions {
  warningTime: number;
  logoutTime: number;
  onWarning: () => void;
  onLogout: () => void;
  onActivity: () => void;
}

// Global variables to manage timers and options
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let warningTimeoutId: ReturnType<typeof setTimeout> | null = null;
const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart', 'touchend']; // Added touch events for mobile
let options: InactivityOptions | null = null; // Can be null if watcher is not active or stopped

// This flag helps prevent multiple watchers from being initialized
// It's attached to the function itself to avoid global variable conflicts
(startInactivityWatcher as any).__watcherActive = false;

/**
 * Resets the inactivity timers.
 * Clears existing timers and sets new ones based on the current 'options'.
 * Calls onActivity callback if available.
 */
function resetTimer() {
  // Clear any existing timers
  if (timeoutId) clearTimeout(timeoutId);
  if (warningTimeoutId) clearTimeout(warningTimeoutId);

  // Capture the current options. This is crucial for TypeScript's null-safety
  // within the asynchronous setTimeout callbacks.
  const currentOptions = options; // This creates a local, immutable copy

  // If options exist, call the onActivity callback
  if (currentOptions && currentOptions.onActivity) {
    currentOptions.onActivity(); // Notify App.vue or parent component to reset dialogs/UI
  }

  // Only set new timeouts if currentOptions are valid
  if (currentOptions) {
    // Set the warning timeout
    warningTimeoutId = setTimeout(() => {
      // It's good practice to re-check currentOptions inside the callback
      // if there's any chance 'options' might have changed globally *after* the setTimeout was set
      // but *before* the callback fires (e.g., if stopInactivityWatcher was called).
      if (currentOptions.onWarning) { // 'currentOptions' is guaranteed not null here
        currentOptions.onWarning(); // Call the warning callback
      }

      // Set the final logout timeout after the warning period
      timeoutId = setTimeout(() => {
        if (currentOptions.onLogout) { // 'currentOptions' is guaranteed not null here
          currentOptions.onLogout(); // Call the logout callback
        }
        stopInactivityWatcher(); // Stop the watcher after logout to prevent further calls
      }, currentOptions.logoutTime); // *** FIX: Changed from options.logoutTime to currentOptions.logoutTime ***
    }, currentOptions.warningTime); // Use the captured warningTime
  }
}

/**
 * Handles any registered activity event by resetting the timer.
 */
function handleActivity() {
  resetTimer();
}

/**
 * Starts the inactivity watcher.
 * If already active, it updates options and resets the timer.
 * Otherwise, it initializes event listeners and starts the timer.
 * @param userOptions - Configuration for the watcher, including times and callbacks.
 */
export function startInactivityWatcher(userOptions: {
  warningTime?: number;
  logoutTime?: number;
  onWarning: () => void;
  onLogout: () => void;
  onActivity: () => void;
}) {
  // Define default times if not provided
  const defaultWarningTime = 1000 * 60 * 5; // Default 5 minutes to warning
  const defaultLogoutTime = 1000 * 60 * 5; // Default 5 minutes from warning to logout

  // Merge provided options with defaults
  const newOptions: InactivityOptions = {
    warningTime: userOptions.warningTime || defaultWarningTime,
    logoutTime: userOptions.logoutTime || defaultLogoutTime,
    onWarning: userOptions.onWarning,
    onLogout: userOptions.onLogout,
    onActivity: userOptions.onActivity,
  };

  // If the watcher is already active, just update options and reset the timer.
  // This is useful if `startInactivityWatcher` is called on route changes
  // or other events to simply restart the timer with potentially new options.
  if ((startInactivityWatcher as any).__watcherActive) {
    options = newOptions; // Update global options
    resetTimer(); // Reset existing watcher with new options/activity
    return;
  }

  // If not active, initialize for the first time
  options = newOptions;

  // Add event listeners for user activity
  activityEvents.forEach(event => {
    window.addEventListener(event, handleActivity);
  });

  // Set the watcher as active
  (startInactivityWatcher as any).__watcherActive = true;

  // Start the initial timer
  resetTimer();
}

/**
 * Stops the inactivity watcher.
 * Clears all timers, removes event listeners, and resets global state.
 */
export function stopInactivityWatcher() {
  // Clear any active timers
  if (timeoutId) clearTimeout(timeoutId);
  if (warningTimeoutId) clearTimeout(warningTimeoutId);

  // Remove event listeners to prevent memory leaks and unnecessary calls
  activityEvents.forEach(event => {
    window.removeEventListener(event, handleActivity);
  });

  // Reset global state
  timeoutId = null;
  warningTimeoutId = null;
  options = null; // Crucially set options to null when stopping
  (startInactivityWatcher as any).__watcherActive = false; // Reset the activity flag
}
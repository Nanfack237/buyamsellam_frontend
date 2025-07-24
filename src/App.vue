<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>

    <v-dialog v-model="showWarning" persistent max-width="400">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2" color="warning">mdi-alert-octagon</v-icon>
          {{ t('inactiveWarning.title') }}
        </v-card-title>
        <v-card-text v-html="t('inactiveWarning.message', { countdown: formattedCountdown })"></v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="resetWarning">{{ t('inactiveWarning.button') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="reauthenticateDialog" persistent max-width="450">
      <v-card>
        <v-toolbar color="blue-darken-4" density="compact">
          <v-toolbar-title class="text-white text-h6 font-weight-bold">
            <v-icon class="mr-2">mdi-lock</v-icon> {{ t('sessionExpiredDialog.title') }}
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text class="py-5">
          <p class="mb-4">{{ t('sessionExpiredDialog.message') }}</p>
          <v-text-field
            v-model="reauthenticatePassword"
            :label="t('sessionExpiredDialog.passwordLabel')"
            type="password"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-key"
            :error-messages="reauthenticateError"
            @keyup.enter="reauthenticateUser"
            autofocus
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="justify-end pb-4 pr-4">
          <v-btn
            color="red-darken-4"
            variant="flat"
            @click="logoutAndCloseReauth"
          >
            {{ t('sessionExpiredDialog.logoutButton') }}
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="reauthenticateUser"
            :loading="isReauthenticating"
          >
            {{ t('sessionExpiredDialog.continueButton') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from '@/axios'; // Ensure this points to your configured axios instance
import { startInactivityWatcher, stopInactivityWatcher } from '@/utils/inactivity'; // Your inactivity utility

// Initialize i18n for translations
const { t, locale } = useI18n();

const router = useRouter();
const route = useRoute();

// --- Inactivity Warning Dialog Reactive State ---
const showWarning = ref(false); // Controls the visibility of the "You're inactive" warning dialog
const countdown = ref(300); // 5 minutes for warning countdown (in seconds)
let countdownInterval: ReturnType<typeof setInterval> | null = null; // Timer for the warning countdown

// --- Password Re-authentication Dialog Reactive State ---
const reauthenticateDialog = ref(false); // Controls the visibility of the reauthentication dialog
const reauthenticatePassword = ref(''); // Model for the password input in the reauth dialog
const reauthenticateError = ref(''); // Error message for reauthentication attempts
const isReauthenticating = ref(false); // Loading state for the reauthentication button

// --- Snackbar Reactive State (for user feedback) ---
const snackbar = ref(false); // Controls the visibility of the global snackbar
const snackbarMessage = ref(''); // The message displayed in the snackbar
const snackbarColor = ref(''); // The color of the snackbar (e.g., 'success', 'error')
const snackbarTimeout = ref(3000); // How long the snackbar is visible (3 seconds)

// --- Computed Properties ---
// Formats the countdown time into MM:SS format for display
const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60);
  const seconds = countdown.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// --- Utility Functions ---

/**
 * Displays a snackbar notification with a translated message.
 * @param messageKey The i18n translation key for the message.
 * @param color The color of the snackbar (e.g., 'success', 'error', 'warning').
 * @param interpolation Optional object for message interpolation (e.g., { errors: '...' }).
 */
function showSnackbar(messageKey: string, color: string = 'info', interpolation?: Record<string, string>) {
  snackbarMessage.value = t(messageKey, interpolation);
  snackbarColor.value = color;
  snackbarTimeout.value = 3000;
  snackbar.value = true;
}

/**
 * Performs a full logout, clearing session data and redirecting to login.
 * This also clears all inactivity-related dialogs and timers.
 */
function logout() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('storeId');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('userEmail');

  // Clear persistent state for reauthentication dialog from localStorage
  localStorage.removeItem('reauthenticateDialogActive'); // <-- CHANGED

  // Clear any active timers and close dialogs
  showWarning.value = false;
  reauthenticateDialog.value = false;
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  stopInactivityWatcher(); // Stop the global inactivity watcher

  router.push('/login');
}

/**
 * Handles logout specifically when triggered from the reauthentication dialog.
 */
function logoutAndCloseReauth() {
  reauthenticateDialog.value = false;
  logout();
}

/**
 * Resets the inactivity warning state and associated timers/dialogs.
 * This function is called by `onActivity` from inactivity.ts and by user interaction ("I'm still here").
 * It effectively "renews" the user's session from their perspective.
 */
function resetWarning() {
  showWarning.value = false;
  reauthenticateDialog.value = false; // Ensure reauth dialog is also closed
  reauthenticatePassword.value = ''; // Clear password field
  reauthenticateError.value = ''; // Clear error message

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  countdown.value = 300; // Reset countdown for future warnings

  // Clear persistent state on successful "I'm still here" or reauthentication
  localStorage.removeItem('reauthenticateDialogActive'); // <-- CHANGED

  // The `inactivity.ts`'s `onActivity` callback, which calls `resetWarning`,
  // already handles restarting the internal watcher timers for the main watcher.
}

/**
 * Starts the 5-minute countdown for the inactivity warning dialog.
 * This is called when `onWarning` is triggered by the inactivity watcher.
 */
function startCountdown() {
  countdown.value = 300; // Start at 5 minutes
  if (countdownInterval) {
    clearInterval(countdownInterval); // Clear any existing interval
  }
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownInterval as NodeJS.Timeout);
      countdownInterval = null;
      showWarning.value = false; // Close warning dialog

      // When the warning countdown finishes, open the reauthentication dialog
      reauthenticateDialog.value = true;
      reauthenticatePassword.value = ''; // Clear previous password
      reauthenticateError.value = ''; // Clear previous error

      // Store state persistently when reauth dialog opens
      localStorage.setItem('reauthenticateDialogActive', 'true'); // <-- CHANGED
      stopInactivityWatcher(); // Stop the main watcher while reauth dialog is open
    }
  }, 1000);
}

/**
 * Initiates the global inactivity watcher.
 * This watcher is only active if a user is logged in and not on the login page,
 * and the reauthentication dialog is not currently open.
 */
function startWatcher() {
  // Only start if an access token exists, not on the login page,
  // and the reauthenticate dialog is NOT already active (prevent duplicate watchers)
  // Ensure we check localStorage for the reauthenticateDialogActive flag
  if (sessionStorage.getItem('access_token') && route.name !== 'login' && localStorage.getItem('reauthenticateDialogActive') !== 'true') { // <-- CHANGED
    stopInactivityWatcher(); // Ensure any previous watcher is stopped first
    startInactivityWatcher({
      warningTime: 5 * 60 * 1000, // 5 minutes before onWarning is called (show dialog)
      logoutTime: 5 * 60 * 1000,  // 5 minutes AFTER warning before onLogout is called (total 10 min inactivity)
      onWarning: () => {
        // Only show warning if reauthenticate dialog is not already active
        if (!reauthenticateDialog.value) {
          showWarning.value = true;
          startCountdown(); // Start the 5-minute countdown in the warning dialog
        }
      },
      onLogout: () => {
        // This is triggered when the total inactivity time (warningTime + logoutTime) is reached.
        // It means the user ignored the warning or the system automatically timed out.
        if (countdownInterval) { // Ensure countdown for warning is cleared
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        showWarning.value = false; // Close warning dialog

        // Open the reauthentication dialog
        reauthenticateDialog.value = true;
        reauthenticatePassword.value = ''; // Clear previous password
        reauthenticateError.value = ''; // Clear previous error

        // Store persistent state for reauthentication dialog
        localStorage.setItem('reauthenticateDialogActive', 'true'); // <-- CHANGED
        stopInactivityWatcher(); // Stop the main watcher while reauth dialog is open
      },
      onActivity: () => {
        // On any activity, reset all dialogs and clear persistent state.
        // This callback is crucial for the inactivity.ts to signal activity.
        // The `resetWarning` function below will handle the UI and also implicitly allow
        // the inactivity.ts to restart its internal timers.
        resetWarning();
      }
    });
  } else {
    // If conditions for starting watcher are not met (e.g., on login page or no token), ensure it's stopped
    stopInactivityWatcher();
  }
}

/**
 * Attempts to reauthenticate the user by sending password to the backend.
 * This is called when the user submits their password in the reauthentication dialog.
 */
async function reauthenticateUser() {
  reauthenticateError.value = ''; // Clear previous error
  if (!reauthenticatePassword.value) {
    reauthenticateError.value = t('snackbarInactive.passwordRequired');
    return;
  }

  isReauthenticating.value = true;
  try {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
      // This is a critical error; user should be logged out if email is missing
      showSnackbar('snackbarInactive.sessionTimedOut', 'error'); // Inform user
      logout(); // Force logout
      return;
    }

    const response = await axios.post('/api/auth/checkpassword', {
      email: email,
      password: reauthenticatePassword.value,
      // You might also need the storeId in the reauthentication payload if your backend requires it
      // store_id: sessionStorage.getItem('storeId')
    });

    if (response.data.error) {
      reauthenticateError.value = t('snackbarInactive.invalidCredentials');
    } else {
      showSnackbar('snackbarInactive.sessionExtendedSuccess', 'success');
      // On successful reauthentication, reset the warning state, which will
      // also cause the inactivity watcher to restart via `onActivity`.
      resetWarning();
    }
  } catch (error: any) {
    console.error('Reauthentication failed:', error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        reauthenticateError.value = t('snackbarInactive.invalidCredentials'); // Specific message for wrong password
      } else {
        reauthenticateError.value = t('snackbarInactive.unexpectedError', { message: error.response.data.message || 'unknown' });
      }
    } else {
      reauthenticateError.value = t('snackbarInactive.networkError');
    }
  } finally {
    isReauthenticating.value = false;
  }
}

// --- Lifecycle Hooks and Watchers ---

// Watch for route changes to manage the inactivity watcher
watch(
  () => route.name,
  (name) => {
    // If navigating to the login page, ensure all inactivity mechanisms are stopped
    if (name === 'login') {
      stopInactivityWatcher();
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      showWarning.value = false;
      reauthenticateDialog.value = false;
      reauthenticatePassword.value = '';
      reauthenticateError.value = '';
      localStorage.removeItem('reauthenticateDialogActive'); // <-- CHANGED
    } else {
      // If navigating to any other page:
      // If reauth dialog is NOT active, start the main watcher.
      // If it IS active (restored by onMounted), the main watcher should remain stopped.
      if (!reauthenticateDialog.value) {
        startWatcher();
      }
    }
  },
  { immediate: true } // Run immediately when component is mounted to set initial state
);

// On component mount, check for persistent reauthentication state
onMounted(() => {
  const isReauthActive = localStorage.getItem('reauthenticateDialogActive'); // <-- CHANGED

  if (isReauthActive === 'true') {
    // If reauth dialog was active when the page was refreshed/closed, immediately show it again
    reauthenticateDialog.value = true;
    reauthenticatePassword.value = ''; // Clear previous input
    reauthenticateError.value = ''; // Clear previous error
    stopInactivityWatcher(); // Ensure main watcher is stopped while reauth dialog is active
  } else if (sessionStorage.getItem('access_token')) {
    // Only start the watcher if an access token exists and reauth is not active
    startWatcher();
  }
});

// On component unmount, ensure timers are cleared to prevent memory leaks
onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  // The `window.beforeunload` listener handles saving persistent state.
  // `stopInactivityWatcher` is called by `watch` or `logout`.
});

// --- Window `beforeunload` event listener for storing state ---
// This ensures that if the user refreshes or closes the tab while the reauth dialog is open,
// the state (that the dialog was active) is saved in localStorage.
window.addEventListener('beforeunload', () => {
  if (reauthenticateDialog.value) {
    localStorage.setItem('reauthenticateDialogActive', 'true'); // <-- CHANGED
  } else {
    // Clear the state if the reauthenticate dialog is not open
    localStorage.removeItem('reauthenticateDialogActive'); // <-- CHANGED
  }
});
</script>

<style scoped>
/* Any global styles specific to App.vue can go here */
/* For example, if you wanted a specific background color for the entire app */
</style>
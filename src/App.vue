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
import axios from '@/axios';
import { startInactivityWatcher, stopInactivityWatcher } from '@/utils/inactivity';

const { t } = useI18n();

const router = useRouter();
const route = useRoute();

const showWarning = ref(false);
const countdown = ref(300);
let countdownInterval: ReturnType<typeof setInterval> | null = null;

const reauthenticateDialog = ref(false);
const reauthenticatePassword = ref('');
const reauthenticateError = ref('');
const isReauthenticating = ref(false);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = ref(3000);

const formattedCountdown = computed(() => {
  const minutes = Math.floor(countdown.value / 60);
  const seconds = countdown.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

function showSnackbar(messageKey: string, color: string = 'info', interpolation?: Record<string, unknown>) {
  snackbarMessage.value = t(messageKey, interpolation || {});
  snackbarColor.value = color;
  snackbarTimeout.value = 3000;
  snackbar.value = true;
}

function logout() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('storeId');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('userEmail');

  localStorage.removeItem('reauthenticateDialogActive');

  showWarning.value = false;
  reauthenticateDialog.value = false;
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  stopInactivityWatcher();

  router.push('/login');
}

function logoutAndCloseReauth() {
  reauthenticateDialog.value = false;
  logout();
}

function resetWarning() {
  showWarning.value = false;
  reauthenticateDialog.value = false;
  reauthenticatePassword.value = '';
  reauthenticateError.value = '';

  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  countdown.value = 300;

  localStorage.removeItem('reauthenticateDialogActive');
}

function startCountdown() {
  countdown.value = 300;
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
  }
  countdownInterval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (countdownInterval !== null) {
        clearInterval(countdownInterval);
      }
      countdownInterval = null;
      showWarning.value = false;

      reauthenticateDialog.value = true;
      reauthenticatePassword.value = '';
      reauthenticateError.value = '';

      localStorage.setItem('reauthenticateDialogActive', 'true');
      stopInactivityWatcher();
    }
  }, 1000);
}

function startWatcher() {
  if (sessionStorage.getItem('access_token') && (route.name as string) !== 'login' && localStorage.getItem('reauthenticateDialogActive') !== 'true') {
    stopInactivityWatcher();
    startInactivityWatcher({
      warningTime: 5 * 60 * 1000,
      logoutTime: 5 * 60 * 1000,
      onWarning: () => {
        if (!reauthenticateDialog.value) {
          showWarning.value = true;
          startCountdown();
        }
      },
      onLogout: () => {
        if (countdownInterval !== null) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
        showWarning.value = false;

        reauthenticateDialog.value = true;
        reauthenticatePassword.value = '';
        reauthenticateError.value = '';

        localStorage.setItem('reauthenticateDialogActive', 'true');
        stopInactivityWatcher();
      },
      onActivity: () => {
        resetWarning();
      }
    });
  } else {
    stopInactivityWatcher();
  }
}

async function reauthenticateUser() {
  reauthenticateError.value = '';
  if (!reauthenticatePassword.value) {
    reauthenticateError.value = t('snackbarInactive.passwordRequired');
    return;
  }

  isReauthenticating.value = true;
  try {
    const email = sessionStorage.getItem('userEmail');
    if (!email) {
      showSnackbar('snackbarInactive.sessionTimedOut', 'error');
      logout();
      return;
    }

    const response = await axios.post('/api/auth/checkpassword', {
      email: email,
      password: reauthenticatePassword.value,
    });

    if (response.data.error) {
      reauthenticateError.value = t('snackbarInactive.invalidCredentials');
    } else {
      showSnackbar('snackbarInactive.sessionExtendedSuccess', 'success');
      resetWarning();
    }
  } catch (error: any) {
    console.error('Reauthentication failed:', error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        reauthenticateError.value = t('snackbarInactive.invalidCredentials');
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

watch(
  () => route.name,
  (name) => {
    if ((name as string) === 'login') {
      stopInactivityWatcher();
      if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      showWarning.value = false;
      reauthenticateDialog.value = false;
      reauthenticatePassword.value = '';
      reauthenticateError.value = '';
      localStorage.removeItem('reauthenticateDialogActive');
    } else {
      if (!reauthenticateDialog.value) {
        startWatcher();
      }
    }
  },
  { immediate: true }
);

onMounted(() => {
  const isReauthActive = localStorage.getItem('reauthenticateDialogActive');

  if (isReauthActive === 'true') {
    reauthenticateDialog.value = true;
    reauthenticatePassword.value = '';
    reauthenticateError.value = '';
    stopInactivityWatcher();
  } else if (sessionStorage.getItem('access_token')) {
    startWatcher();
  }
});

onBeforeUnmount(() => {
  if (countdownInterval !== null) {
    clearInterval(countdownInterval);
  }
});

window.addEventListener('beforeunload', () => {
  if (reauthenticateDialog.value) {
    localStorage.setItem('reauthenticateDialogActive', 'true');
  } else {
    localStorage.removeItem('reauthenticateDialogActive');
  }
});
</script>

<style scoped>
</style>
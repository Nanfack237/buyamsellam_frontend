<template>
  <v-app-bar class="text-high-emphasis" height="60">
    <v-avatar size="45" class="ml-3">
      <v-img src="@/assets/logo1.svg" alt="BuyamSellam Logo" cover></v-img>
    </v-avatar>
    <v-toolbar-title>
      <span class="text-truncate font-weight-bold text-h6" style="max-width: 100%; color: #496896;">
        {{ $t('appTitlePart1') }}<span style="color: rgba(100, 200, 150, 0.6);">{{ $t('appTitlePart2') }}</span>
      </span>
    </v-toolbar-title>

    <v-spacer />

    <v-btn
      v-if="isStoreSelected"
      icon
      to="/cashier-sales"
      class="mx-3"
      :title="$t('cartSalesPoint')"
    >
      <v-badge
        content="1"
        color="blue-darken-4"
        overlap
        :model-value="cartStore.cartItems.length > 0"
      >
        <v-icon>mdi-cart</v-icon>
      </v-badge>
    </v-btn>

    <div class="px-2">
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="mx-3" :title="$t('toggleLanguage')">
            <i :class="currentFlagClass" class="fi fis"></i>
            <span class="font-weight-bold ml-2">{{ i18nLocale.toUpperCase() }}</span>
          </v-btn>
        </template>

        <v-list>
          <v-list-item @click="setLanguage('en')">
            <template v-slot:prepend>
              <i class="fi fis fi-us"></i> &nbsp;&nbsp;
            </template>
            <v-list-item-title>{{ $t('language_en') }}</v-list-item-title>
          </v-list-item>

          <v-list-item @click="setLanguage('fr')">
            <template v-slot:prepend>
              <i class="fi fis fi-fr"></i> &nbsp;&nbsp;
            </template>
            <v-list-item-title>{{ $t('language_fr') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-btn @click="logoutDialog = true" color="red-darken-1" icon :title="$t('logout')">
        <v-icon>mdi-logout</v-icon>
      </v-btn>

      <v-dialog v-model="logoutDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">
            {{ $t('confirmLogoutTitle') }}
          </v-card-title>
          <v-card-text>{{ $t('logoutConfirmation') }}</v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="logoutDialog = false">{{ $t('cancelButton') }}</v-btn>
            <v-btn color="red" variant="flat" @click="confirmLogout">
              {{ $t('yesLogoutButton') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <v-overlay :model-value="isLanguageChanging" class="align-center justify-center" persistent>
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p> </v-overlay>

    <v-overlay :model-value="logoutLoading" class="align-center justify-center" persistent>
      <v-progress-circular color="primary" size="65" indeterminate></v-progress-circular>
      <p class="my-1 text-h6 text-white">{{ $t('loggingOut') }}</p>
    </v-overlay>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import axios from '@/axios';
import { useRouter } from 'vue-router';
import { useLocale } from 'vuetify';
import { useLoader } from '@/useLoader';
import { useCartStore } from '@/stores/cartStore';
import { useI18n } from 'vue-i18n';

import "flag-icons/css/flag-icons.min.css";

const props = defineProps({
  products: {
    type: Array,
    required: true
  },
  storeIdProp: {
    type: [String, null],
    default: null
  }
});

const { startLoading, stopLoading } = useLoader(); // Assuming these are still used elsewhere
const router = useRouter();

const { current: vuetifyLocale } = useLocale();
const { locale: i18nLocale } = useI18n();

const cartStore = useCartStore();

const isLanguageChanging = ref(false);

const currentFlagClass = computed(() => {
  if (i18nLocale.value === 'en') {
    return 'fi-us'; // US flag for English
  } else if (i18nLocale.value === 'fr') {
    return 'fi-fr'; // French flag for French
  }
  return 'fi-un'; // Fallback
});

// --- IMPORTANT CHANGE START ---
const setLanguage = async (lang) => {
  isLanguageChanging.value = true;

  // Simulate a slight delay for better UX if needed, otherwise remove
  await new Promise(resolve => setTimeout(resolve, 300));

  i18nLocale.value = lang; // Update vue-i18n locale
  vuetifyLocale.value = lang; // Update Vuetify locale

  // Persist the selected language in localStorage
  localStorage.setItem('user_locale', lang);

  isLanguageChanging.value = false;
};
// --- IMPORTANT CHANGE END ---


const logoutDialog = ref(false);
const logoutLoading = ref(false);

const isStoreSelected = computed(() => {
  return props.storeIdProp !== null && props.storeIdProp !== undefined && props.storeIdProp !== '';
});

const confirmLogout = async () => {
  logoutDialog.value = false;
  logoutLoading.value = true;

  try {
    const token = sessionStorage.getItem('access_token');
    const response = await axios.post(
      '/api/logout',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      console.log('Logout successful');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('storeId');
      localStorage.removeItem('reauthenticateDialogActive'); // <-- CHANGED

      cartStore.clearCart();
      router.push('/login');
    } else {
      console.error('Logout failed:', response.data.error || 'No success flag received.');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    logoutLoading.value = false;
  }
};
</script>

<style scoped>
/* No specific styles related to flag images are needed here, as flag-icons handles styling */
/* If flags appear too small, you can add: */
/* .fi {
  font-size: 1.5em; /* Adjust as needed */
/* } */
</style>
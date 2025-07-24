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

    <div class="px-2">
      <v-btn icon @click="cartDialog = true" class="mx-3" :title="$t('cartSalesPoint')">
        <v-badge
          :content="cartStore.totalQuantityInCart"
          color="blue-darken-4"
          overlap
          :model-value="cartStore.totalQuantityInCart > 0"
        >
          <v-icon>mdi-cart</v-icon>
        </v-badge>
      </v-btn>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="mx-2" :title="$t('toggleLanguage')">
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
      <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p>
    </v-overlay>

    <v-overlay :model-value="logoutLoading" class="align-center justify-center" persistent>
      <v-progress-circular color="primary" size="65" indeterminate></v-progress-circular>
      <p class="my-1 text-h6 text-white">{{ $t('loggingOut') }}</p>
    </v-overlay>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app-bar>

  <CartDialog
    v-model="cartDialog"
    :products="products"
    @sale-completed="handleSaleCompleted"
    @refresh-products="handleRefreshProducts"
  />
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import axios from '@/axios';
import { useRouter } from 'vue-router';
import { useLocale } from 'vuetify';
import { useLoader } from '@/useLoader';
import { useCartStore } from '@/stores/cartStore';
import { useI18n } from 'vue-i18n';

// IMPORTANT: Ensure this CSS is imported for flag icons to display correctly!
import "flag-icons/css/flag-icons.min.css";

// Import the CartDialog component
import CartDialog from './CartDialog.vue'; // Adjust path if necessary

// Define Product interface for type safety (should ideally be imported from a shared file)
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image?: string;
  image1?: string;
  image2?: string;
  media?: string[];
  price: number;
  stock: number;
  store_id: number;
  created_at: string;
  updated_at: string;
  quantityToAdd: number;
  baseSellingPriceFromStock: number;
  cashierInputSellingPrice: number;
  stock_id: number | null;
}

const props = defineProps({
  // The 'products' array is passed down from ProductView to HeaderComponent
  // so HeaderComponent can pass it to CartDialog.
  products: {
    type: Array as () => Product[],
    required: true
  },
  // storeIdProp is provided in the props, but in this specific setup,
  // the cart button visibility is no longer tied to it.
  // It can remain if other parts of your application or parent component use it.
  storeIdProp: {
    type: [String, null],
    default: null
  }
});

// HeaderComponent will re-emit the 'sale-completed' event up to its parent (ProductView)
// NOW ALSO RE-EMITTING 'refresh-products'
const emit = defineEmits<{
  (e: 'sale-completed'): void;
  (e: 'refresh-products'): void; // NEW: Declare this emit
}>();

const { startLoading, stopLoading } = useLoader();
const router = useRouter();

const { locale: i18nLocale, t } = useI18n(); // Destructure t for use in script
const { current: vuetifyLocale } = useLocale();

const cartStore = useCartStore();

const logoutDialog = ref(false);
const logoutLoading = ref(false);
const cartDialog = ref(false); // Controls the visibility of the CartDialog
const isLanguageChanging = ref(false); // To control language change overlay

// --- Snackbar State ---
const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000; // 3 seconds

// --- Snackbar Method ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

// This computed property is no longer used for the cart button,
// but can be kept if `storeIdProp` is used elsewhere for conditional rendering.
const isStoreSelected = computed(() => {
  return props.storeIdProp !== null && props.storeIdProp !== undefined && props.storeIdProp !== '';
});

// Computed property to determine the current flag class for the language button
const currentFlagClass = computed(() => {
  if (i18nLocale.value === 'en') {
    return 'fi-us'; // US flag for English
  } else if (i18nLocale.value === 'fr') {
    return 'fi-fr'; // French flag for French
  }
  return 'fi-un'; // Fallback to a generic "unknown" flag
});

// Function to set the language and persist it
const setLanguage = async (lang: string) => {
  if (i18nLocale.value === lang) {
    return;
  }

  isLanguageChanging.value = true;

  // Simulate a slight delay for better UX (e.g., if translations are loaded dynamically later)
  await new Promise(resolve => setTimeout(resolve, 300));

  i18nLocale.value = lang; // Update vue-i18n locale
  vuetifyLocale.value = lang; // Update Vuetify locale

  // Persist the selected language in localStorage
  localStorage.setItem('user_locale', lang);

  isLanguageChanging.value = false;
};

const confirmLogout = async () => {
  logoutDialog.value = false;
  logoutLoading.value = true;

  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(`${t('snackbar.warning')} ${t('snackbar.noAccessToken')}`, 'warning');
      console.warn('No access token found. Logging out locally.');
    } else {
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
        showSnackbar(`${t('snackbar.success')} ${t('snackbar.logoutSuccess')}`, 'success');
        console.log('Logout successful');
      } else {
        showSnackbar(`${t('snackbar.error')} ${response.data.error || t('snackbar.logoutFailed')}`, 'error');
        console.error('Logout failed on server:', response.data.error || 'No success flag received.');
      }
    }
  } catch (error: any) {
    console.error('Logout error (API call failed):', error);
    if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.error) {
      showSnackbar(`${t('snackbar.error')} ${error.response.data.message}`, 'error');
    } else {
      showSnackbar(`${t('snackbar.error')} ${t('snackbar.unexpectedErrorLogout')}`, 'error');
    }
  } finally {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('storeId');
    sessionStorage.removeItem('userEmail');
    localStorage.removeItem('reauthenticateDialogActive'); // <-- CHANGED

    cartStore.clearCart();
    logoutLoading.value = false;
    router.push('/login');
  }
};

// This function will now be called when a sale is completed within the CartDialog
// IMPORTANT: It *re-emits* the event to ProductView, it does NOT call fetchProducts() directly.
function handleSaleCompleted() {
  emit('sale-completed'); // Re-emit the 'sale-completed' event to the parent
  showSnackbar(` ${t('cartdialogue.snackbarsaleCompleted')}`, 'success');
  // Removed `fetchProduct()` here, as `handleRefreshProducts` will trigger the actual product refresh
};

// NEW: This function is called when CartDialog emits 'refresh-products'
function handleRefreshProducts() {
  console.log('HeaderComponent received "refresh-products" from CartDialog. Re-emitting to ProductView.');
  emit('refresh-products'); // Re-emit 'refresh-products' to the parent (ProductView)
}
</script>

<style scoped>
/* No specific styles related to flag images are needed here, as flag-icons handles styling */
/* If flags appear too small, you can add: */
/* .fi {
  font-size: 1.5em; /* Adjust as needed */
/* } */
</style>
<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6">
                {{ $t('saleTransaction.title') }}
              </p>
            </v-col>
            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">{{ formattedDate }}</p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-container fluid class="pa-5">
            <v-card class="pa-4" variant="flat">
              <p class="text-medium-emphasis pb-4">
                {{ $t('saleTransaction.instructions') }}
              </p>
              <v-divider class="mb-9"></v-divider>

              <v-form @submit.prevent="submitSale" ref="saleForm">
                <v-row>
                  <v-col cols="12" sm="6" md="6">
                    <v-autocomplete
                      :label="$t('saleTransaction.selectProductLabel')"
                      v-model="selectedProduct"
                      :items="productLists"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      :rules="[v => !!v || $t('saleTransaction.validation.productRequired')]"
                      prepend-inner-icon="mdi-package-variant"
                      clearable
                      density="comfortable"
                      class="mb-4"
                    />

                    <v-text-field
                      v-model.number="quantity"
                      :label="$t('saleTransaction.enterQuantityLabel')"
                      type="number"
                      variant="outlined"
                      persistent-hint
                      :rules="[
                        v => (v !== null && v !== '') || $t('saleTransaction.validation.quantityRequired'),
                        v => (v && v > 0) || $t('saleTransaction.validation.quantityGreaterThanZero'),
                        v => (v <= getSelectedStockQuantity) || $t('saleTransaction.validation.quantityExceedsStock', { available: getSelectedStockQuantity })
                      ]"
                      prepend-inner-icon="mdi-numeric"
                      density="comfortable"
                      class="mb-4"
                    />

                    <v-text-field
                      v-model="customerName"
                      :label="$t('saleTransaction.enterCustomerNameLabel')"
                      type="text"
                      variant="outlined"
                      persistent-hint
                      :rules="[
                        v => !!v || $t('saleTransaction.validation.customerNameRequired'),
                        v => v.length >= 3 || $t('saleTransaction.validation.customerNameMinLength')
                      ]"
                      prepend-inner-icon="mdi-account"
                      density="comfortable"
                      class="mb-0"
                    />
                  </v-col>

                  <v-col cols="12" sm="6" md="6">
                    <v-select
                      :label="$t('saleTransaction.selectCostPriceLabel')"
                      v-model="selectedStockId"
                      :items="costPriceOptions"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                      :rules="[v => v !== null || $t('saleTransaction.validation.stockCostPriceRequired')]"
                      prepend-inner-icon="mdi-cash"
                      :disabled="!selectedProduct || (costPriceOptions.length === 1 && costPriceOptions[0].value === null)"
                      clearable
                      density="comfortable"
                      class="mb-4"
                    ></v-select>

                    <v-text-field
                      v-model.number="sellingPrice"
                      :label="$t('saleTransaction.enterSellingPriceLabel')"
                      type="number"
                      variant="outlined"
                      persistent-hint
                      :rules="[
                        v => (v !== null && v !== '') || $t('saleTransaction.validation.sellingPriceRequired'),
                        v => (v && v > 0) || $t('saleTransaction.validation.sellingPriceGreaterThanZero')
                      ]"
                      prepend-inner-icon="mdi-tag-plus"
                      density="comfortable"
                      class="mb-4"
                    />

                    <v-text-field
                      v-model="customerContact"
                      :label="$t('saleTransaction.enterTelephoneNumberLabel')"
                      type="number"
                      variant="outlined"
                      persistent-hint
                      :rules="[
                        v => !!v || $t('saleTransaction.validation.telephoneNumberRequired'),
                        v => (v && String(v).length >= 9) || $t('saleTransaction.validation.telephoneNumberMinLength')
                      ]"
                      prepend-inner-icon="mdi-phone"
                      density="comfortable"
                      class="mb-0"
                    />
                  </v-col>
                  <v-col cols="12"> <v-select
                      v-model="payment_method"
                      :label="$t('saleTransaction.paymentMethodLabel')"
                      :items="[
                        { text: $t('saleTransaction.cash'), value: 'cash' },
                        { text: $t('saleTransaction.mobile'), value: 'mobile' }
                      ]"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      persistent-hint
                      :rules="[v => !!v || $t('saleTransaction.validation.paymentMethodRequired')]"
                      prepend-inner-icon="mdi-credit-card"
                      density="comfortable"
                      class=" mb-4"
                    />
                  </v-col>
                </v-row>

                <v-row justify="center" class="mt-5">
                  <v-col cols="12" sm="6" md="2" class="text-center">
                    <v-btn type="submit" :loading="isSubmitting" color="primary" size="large" block>
                      {{ $t('saleTransaction.saveButton') }} <v-icon class="mx-2" right>mdi-content-save</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-container>

          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent scrim="#000000">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios'; // Ensure this path is correct for your project
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t, locale } = useI18n(); // Use i18n

// --- Interfaces ---
interface ProductItem {
  id: number;
  name: string;
}

interface StockItem {
  id: number;
  product_id: number;
  cost_price: number;
  quantity: number;
  // product_name is NOT directly stored on StockItem according to your clarification.
  // It's looked up via product_id from ProductItem.
}

interface CostPriceOption {
  label: string;
  value: number | null; // Value can be null for "not in stock"
}

// Interface for sale receipt item, as expected by sendReceiptToManager
interface SaleReceiptItem {
  product: {
    id: number;
    name: string; // This will now always be a string from productLists
  };
  quantity: number;
  priceAtSale: number;
  totalItemPrice: number;
}

// --- Reactive State ---
const productLists = ref<ProductItem[]>([]);
const stockLists = ref<StockItem[]>([]);

const selectedProduct = ref<number | null>(null);
const selectedStockId = ref<number | null>(null);
const sellingPrice = ref<number | null>(null);
const quantity = ref<number | null>(null);
const payment_method = ref('');
const customerName = ref('');
const customerContact = ref('');
const lastSaleReceiptId = ref('');

const isSubmitting = ref(false);
const isDataLoaded = ref(false);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;

const router = useRouter();
const saleForm = ref<HTMLFormElement | null>(null); // Ref for the v-form component

// --- Refs for Manager/Store Info (will be populated dynamically) ---
const managerEmail = ref<string | null>(null);
const userName = ref<string>(''); // Cashier's name - populated from /api/me
const storeName = ref<string>('');
const storeLocation = ref<string>('');
const storeContact = ref<string>('');
const storeLogoUrl = ref<string | null>(null); // Can be null if no logo

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

const costPriceOptions = computed<CostPriceOption[]>(() => {
  if (selectedProduct.value === null) {
    return [];
  }

  const filtered = stockLists.value.filter(
    stock => stock.product_id === selectedProduct.value
  );

  if (filtered.length === 0) {
    return [{
      label: t('saleTransaction.notInStockMessage'),
      value: null
    }];
  }

  return filtered.map(stock => ({
    label: t('saleTransaction.costPriceLabel', { cost: stock.cost_price, quantity: stock.quantity }),
    value: stock.id
  }));
});

const getSelectedStockQuantity = computed<number>(() => {
  if (selectedStockId.value === null) {
    return 0;
  }
  const selectedStock = stockLists.value.find(stock => stock.id === selectedStockId.value);
  return selectedStock ? selectedStock.quantity : 0;
});


// --- Watchers ---
watch(selectedProduct, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    selectedStockId.value = null;
    quantity.value = null; // Reset quantity when product changes
    sellingPrice.value = null; // Reset selling price when product changes
  }
});

// Watch selectedStockId to potentially auto-fill selling price or quantity hints
watch(selectedStockId, (newVal) => {
  if (newVal !== null) {
    const stock = stockLists.value.find(s => s.id === newVal);
    // You might want to pre-fill sellingPrice based on stock's cost_price or a default if applicable
    // Example: sellingPrice.value = stock ? stock.cost_price * 1.2 : null; // 20% markup example
  }
});


// --- Utility Functions ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Function to get the full URL for an image.
// You need to implement this based on your backend storage configuration (e.g., Laravel's storage link).
function getImageUrl(path: string): string {
  // IMPORTANT: Adjust this URL based on your Laravel backend's public storage setup.
  // Example for Laravel storage link:
  // return `${axios.defaults.baseURL}/storage/${path}`;
  // Or if the logo path is already a full URL:
  return path;
}

function generateUniqueReceiptId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const getReceiptId = computed(() => {
  return lastSaleReceiptId.value || 'N/A';
});

// --- API Fetching Methods ---

async function fetchProducts() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('commonSaleTransactionVue.snackbar.authRequired'), 'error');
        return;
    }
    const response = await axios.get('/api/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    productLists.value = response.data.products || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    showSnackbar(t('commonSaleTransactionVue.snackbar.productFetchError'), 'error');
  }
}

async function fetchStocks() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('commonSaleTransactionVue.snackbar.authRequired'), 'error');
        return;
    }
    const response = await axios.get('/api/stocks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    stockLists.value = response.data.stocks || [];
  } catch (error) {
    console.error('Error fetching stocks:', error);
    showSnackbar(t('commonSaleTransactionVue.snackbar.stockFetchError'), 'error');
  }
}

/**
 * Fetches the currently logged-in user's details (for cashier's name).
 */
async function fetchUser() {
    try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            showSnackbar(t('commonSaleTransactionVue.snackbar.authRequired'), 'error');
            return;
        }
        const response = await axios.get('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.data && response.data.user && response.data.user.name) {
            userName.value = response.data.user.name;
        } else {
            console.warn('User name not found in /api/me response:', response.data);
            userName.value = 'Cashier'; // Fallback
        }
    } catch (error) {
        console.error('Error fetching current user details:', error);
        showSnackbar(t('saleTransaction.snackbar.fetchUserDetailsError'), 'error'); // Add this i18n key
        userName.value = 'Cashier'; // Fallback
    }
}


/**
 * Fetches the manager's email by their user ID.
 * Assumes a backend endpoint like /api/user/{id} that returns user details including email.
 */
async function fetchManagerEmail(managerId: number) {
  const token = sessionStorage.getItem('access_token');
  try {
    const response = await axios.get(`/api/user/${managerId}`, { // Backend needs to expose this endpoint
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.data && response.data.user && response.data.user.email) {
      managerEmail.value = response.data.user.email;
      console.log('Manager email fetched:', managerEmail.value);
    } else {
      console.warn('Manager email not found in user data for ID:', managerId, response.data);
      managerEmail.value = null;
    }
  } catch (error) {
    console.error('Error fetching manager email for ID:', managerId, error);
    managerEmail.value = null;
    showSnackbar(t('saleTransaction.snackbar.fetchManagerEmailError'), 'error'); // Add this i18n key
  }
}

/**
 * Fetches details for the current store, including its associated manager's ID,
 * then uses that ID to fetch the manager's email.
 * Assumes storeId is available in sessionStorage.
 */
async function fetchStoreDetails() {
  const storeId = sessionStorage.getItem('storeId');
  const token = sessionStorage.getItem('access_token');
  try {
    if (!token) {
      showSnackbar(t('saleTransaction.snackbar.authRequiredStoreDetails'), 'error'); // Add this i18n key
      return;
    }
    if (!storeId) {
      console.warn('Store ID not found in session storage. Cannot fetch store details.');
      showSnackbar(t('saleTransaction.snackbar.storeIdMissing'), 'warning'); // Add this i18n key
      return;
    }

    const response = await axios.get(`/api/stores/showstore/${storeId}`, { // Backend needs to expose this endpoint
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Populate store details
    if (response.data && response.data.store) {
      storeName.value = response.data.store.name || '';
      storeContact.value = response.data.store.contact || '';
      storeLocation.value = response.data.store.location || '';
      storeLogoUrl.value = response.data.store.logo ? getImageUrl(response.data.store.logo) : null;

      // Fetch manager's email using the manager_user_id from store details
      const managerUserId = response.data.store.user_id; // Assuming 'user_id' is the manager's ID
      if (managerUserId) {
        await fetchManagerEmail(managerUserId);
      } else {
        console.warn('Manager user ID not found for this store. Cannot fetch manager email.');
        managerEmail.value = null;
      }
    } else {
      console.warn('Store data not found in the response:', response.data);
      showSnackbar(t('saleTransaction.snackbar.storeDataNotFound'), 'warning'); // Add this i18n key
    }

  } catch (error) {
    console.error('Error fetching store details:', error);
    showSnackbar(t('saleTransaction.snackbar.fetchStoreDetailsError'), 'error'); // Add this i18n key
  }
}

/**
 * Sends a sale receipt email to the manager.
 * @param {SaleReceiptItem[]} items - Array of items sold in the transaction.
 * @param {number} total - Total amount of the sale.
 * @param {string} customer - Customer name.
 * @param {string} receiptId - Unique receipt ID for the transaction.
 */
async function sendReceiptToManager(items: SaleReceiptItem[], total: number, customer: string, receiptId: string) {
  const token = sessionStorage.getItem('access_token');
  const currentLocale = localStorage.getItem('user_locale') || 'en';

  // Ensure all necessary data is available before attempting to send the email
  if (!managerEmail.value || !token || !userName.value || !storeName.value || !storeLocation.value || !storeContact.value) {
    console.error('Manager email, access token, or store/user details missing. Cannot send receipt email.');
    showSnackbar(t('saleTransaction.snackbar.receiptConfigError'), 'error');
    return;
  }

  try {
    const saleDetailsForEmail = {
      to_email: managerEmail.value,
      receipt_id: receiptId,
      customer_name: customer,
      cashier_name: userName.value,
      sale_date: new Date().toLocaleDateString(currentLocale),
      items: items.map(item => ({
        name: item.product.name, // This will now correctly use the product name
        quantity: item.quantity,
        unit_price: item.priceAtSale,
        total_price: item.totalItemPrice,
      })),
      total_amount: total,
      store_name: storeName.value,
      store_location: storeLocation.value,
      store_contact: storeContact.value,
      store_logo_url: storeLogoUrl.value,
    };

    const response = await axios.post('/api/sales/send-receipt-email', saleDetailsForEmail, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept-Language': currentLocale,
      }
    });

    if (response.data.success) {
      showSnackbar(t('snackbarReceiptEmailSent'), 'success');
      console.log('Receipt email sent successfully to manager.');
    } else {
      showSnackbar(response.data.message || t('snackbarReceiptEmailFailed'), 'error');
      console.error('Failed to send receipt email:', response.data.message);
    }
  } catch (error) {
    console.error('Error sending receipt email:', error);
    showSnackbar(t('snackbarReceiptEmailError'), 'error');
  }
}

const submitSale = async () => {
  if (!saleForm.value) return;
  const { valid } = await (saleForm.value as any).validate();

  if (!valid) {
    showSnackbar(t('commonSaleTransactionVue.snackbar.formErrors'), 'error');
    return;
  }

  // Ensure a stock item is selected
  if (selectedStockId.value === null) {
    showSnackbar(t('saleTransaction.snackbar.productNotInStock'), 'error');
    return;
  }

  const selectedStock = stockLists.value.find(stock => stock.id === selectedStockId.value);
  if (!selectedStock) {
    showSnackbar(t('saleTransaction.snackbar.invalidStockSelected'), 'error');
    return;
  }
  if (quantity.value! > selectedStock.quantity) {
    showSnackbar(t('saleTransaction.snackbar.insufficientStock', { available: selectedStock.quantity }), 'error');
    return;
  }
  // Also check if quantity is not null and positive
  if (quantity.value === null || quantity.value <= 0) {
    showSnackbar(t('saleTransaction.validation.quantityGreaterThanZero'), 'error');
    return;
  }
  // Also check if sellingPrice is not null and positive
  if (sellingPrice.value === null || sellingPrice.value <= 0) {
    showSnackbar(t('saleTransaction.validation.sellingPriceGreaterThanZero'), 'error');
    return;
  }
    // Also check if customerName is not empty
  if (!customerName.value.trim()) {
    showSnackbar(t('saleTransaction.validation.customerNameRequired'), 'error');
    return;
  }
    // Also check if customerContact is not empty and has min length
  if (!customerContact.value.trim() || String(customerContact.value).length < 9) {
    showSnackbar(t('saleTransaction.validation.telephoneNumberRequired'), 'error');
    return;
  }
    // Also check if payment_method is selected
  if (!payment_method.value) {
    showSnackbar(t('saleTransaction.validation.paymentMethodRequired'), 'error');
    return;
  }


  lastSaleReceiptId.value = generateUniqueReceiptId();
  isSubmitting.value = true;

  try {
    const formData = new FormData();
    formData.append('product_id', String(selectedProduct.value));
    formData.append('stock_id', String(selectedStockId.value));
    formData.append('selling_price', String(sellingPrice.value));
    formData.append('quantity', String(quantity.value));
    formData.append('customer_name', customerName.value);
    formData.append('customer_contact', customerContact.value);
    formData.append('payment_method', payment_method.value);
    formData.append('receipt_code', lastSaleReceiptId.value);

    const token = sessionStorage.getItem('access_token');
    const response = await axios.post<{ success?: string; error?: string; message?: string; quantity_remaining?: number; errors?: Record<string, string[]> }>('/api/sales/store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.data.success) {
      showSnackbar(t('saleTransaction.snackbar.saleSuccess', { remaining: response.data.quantity_remaining }), 'success');

      // --- CORRECTED LOGIC FOR PRODUCT NAME IN RECEIPT ---
      const productDetailsForReceipt = productLists.value.find(
        p => p.id === selectedProduct.value
      );

      const soldItem: SaleReceiptItem = {
        product: {
          id: selectedProduct.value!,
          // Get name from productLists, which has the product name
          name: productDetailsForReceipt ? productDetailsForReceipt.name : 'Product Name Not Found',
        },
        quantity: quantity.value!,
        priceAtSale: sellingPrice.value!,
        totalItemPrice: sellingPrice.value! * quantity.value!,
      };

      // Call sendReceiptToManager after successful sale
      await sendReceiptToManager(
        [soldItem], // Pass as an array, even for a single item sale
        soldItem.totalItemPrice,
        customerName.value,
        lastSaleReceiptId.value
      );

      // Reset form fields after successful submission and receipt sending attempt
      selectedProduct.value = null;
      selectedStockId.value = null;
      sellingPrice.value = null;
      quantity.value = null;
      customerName.value = '';
      customerContact.value = '';
      payment_method.value = '';
      if (saleForm.value) {
          (saleForm.value as any).resetValidation(); // Reset validation state
      }

      // Important: Re-fetch stocks to get updated quantities
      await fetchStocks();

    } else {
      showSnackbar(response.data.error || response.data.message || t('commonSaleTransactionVue.snackbar.unknownError'), 'error');
    }
  } catch (error: any) {
    console.error('Error saving the transaction:', error);
    if (error.response?.data) {
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(t('commonSaleTransactionVue.snackbar.validationError', { errors: errorMessages }), 'error');
      } else if (error.response.data.message) {
        showSnackbar(t('commonSaleTransactionVue.snackbar.apiError', { message: error.response.data.message }), 'error');
      } else {
        showSnackbar(t('commonSaleTransactionVue.snackbar.apiErrorWithStatus', { status: error.response.status }), 'error');
      }
    } else {
      showSnackbar(t('commonSaleTransactionVue.snackbar.networkError'), 'error');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// --- Lifecycle Hook ---
onMounted(async () => {
  isDataLoaded.value = false;
  // Fetch all necessary data concurrently
  await Promise.all([
    fetchProducts(),
    fetchStocks(),
    fetchStoreDetails(), // This also fetches manager email
    fetchUser(),        // Fetches cashier's name (userName)
  ]);
  isDataLoaded.value = true;
});
</script>

<style scoped>
/* No specific styles needed here, Vuetify's classes handle the layout */
</style>
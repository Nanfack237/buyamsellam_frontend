<template>
  <v-dialog v-model="dialog" max-width="550" persistent>
    <v-card class="cart-dialog-card">
      <v-toolbar color="blue-darken-4" density="compact">
        <v-toolbar-title class="text-white text-h6 font-weight-bold">
          {{ t('cartdialogue.title', { count: cartStore.totalQuantityInCart }) }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeDialog" class="dialog-close-btn">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-4 cart-items-container">
        <v-list dense v-if="cartStore.cartItems.length === 0" class="py-10">
          <v-list-item>
            <v-list-item-content class="text-center text-medium-emphasis">
              <v-icon size="64" color="grey-lighten-2">mdi-cart-off</v-icon>
              <p class="mt-4 text-h6 font-weight-regular">{{ t('cartdialogue.emptyCartMessage') }}</p>
              <p class="text-subtitle-1 text-grey-darken-1">{{ t('cartdialogue.emptyCartCallToAction') }}</p>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-list dense v-else>
          <v-list-item
            v-for="item in cartStore.cartItems"
            :key="item.product.id + '-' + item.priceAtSale + '-' + item.stockRecordIdAtSale"
            class="my-3 pa-2 rounded-lg cart-item-card"
          >
            <div class="d-flex align-center">
              <v-avatar size="60" rounded="md" class="mr-4 product-image-avatar">
                <v-img :src="getImageUrl(item.product.image1)" alt="Product Image" />
              </v-avatar>
              <div class="flex-grow-1 product-details">
                <v-list-item-title class="text-subtitle-1 font-weight-medium">{{ item.product.name }}</v-list-item-title>
                <v-list-item-subtitle class="text-body-2 text-grey-darken-1 mt-1">
                  {{ t('cartdialogue.productPriceUnit') }} {{ formatNumberWithThousandsSeparator(item.priceAtSale) }}
                </v-list-item-subtitle>
              </div>
              <div class="d-flex align-center quantity-controls">
                <v-btn icon size="x-small" variant="text" @click="handleDecrementQuantity(item)">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
                <span class="mx-2 font-weight-bold text-subtitle-1">{{ item.quantity }}</span>
                <v-btn icon size="x-small" variant="text" @click="handleIncrementQuantity(item)">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" color="error" @click="handleRemoveFromCart(item)" class="ml-2">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </v-list-item>
        </v-list>

        <v-divider class="my-4"></v-divider>

        <div class="px-2 py-2 customer-info-section">
          <v-select
            v-model="payment_method"
            :label="t('cartdialogue.paymentMethodLabel')"
            :items="[
              { text: t('cartdialogue.paymentMethodCash'), value: 'cash' },
              { text: t('cartdialogue.paymentMethodMobile'), value: 'mobile' }
            ]"
            item-title="text"
            item-value="value"
            variant="outlined"
            :rules="[v => !!v || t('cartdialogue.paymentMethodRequired')]"
            prepend-inner-icon="mdi-credit-card"
            rounded="lg"
            class="mb-3"
            density="compact"
            hide-details
          />
          <v-text-field
            v-model="customerName"
            :label="t('cartdialogue.customerNameLabel')"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-account"
            rounded="lg"
            class="mb-3"
            hide-details
          ></v-text-field>
          <v-text-field
            v-model="customerContact"
            :label="t('cartdialogue.customerContactLabel')"
            density="compact"
            variant="outlined"
            prepend-inner-icon="mdi-phone"
            rounded="lg"
            class="mb-3"
            hide-details
          ></v-text-field>
        </div>
        <v-divider class="my-4"></v-divider>

        <div class="px-2 py-2 totals-section">
          <div class="d-flex justify-space-between text-h6 font-weight-bold total-amount-text">
            <span>{{ t('cartdialogue.totalLabel') }}</span>
            <span>FCFA {{ formatNumberWithThousandsSeparator(cartStore.cartTotal) }}</span>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-4 pb-4 action-buttons">
        <v-btn
          color="success"
          variant="flat"
          rounded="lg"
          size="large"
          class="mb-2"
          @click="checkout"
          :disabled="cartStore.cartItems.length === 0 || processingCheckout || !payment_method"
          :loading="processingCheckout"
        >
          <v-icon left>mdi-cash-register</v-icon> {{ t('cartdialogue.completeSaleButton') }}
        </v-btn>
        <v-btn
          color="red-darken-4"
          variant="outlined"
          class="mb-2"
          rounded="lg"
          size="large"
          @click="handleClearCart"
          :disabled="cartStore.cartItems.length === 0"
        >
          {{ t('cartdialogue.clearCartButton') }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-dialog>

  <v-dialog v-model="printDialog" max-width="400" persistent>
    <v-card>
      <v-toolbar color="blue-darken-4" density="compact">
        <v-toolbar-title class="text-white text-h6 font-weight-bold">
          {{ t('printDialogue.title') }}
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closePrintDialog">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="text-center py-6">
        <v-icon size="64" color="success">mdi-check-circle-outline</v-icon>
        <p class="mt-4 text-h6">{{ t('printDialogue.printQuestion') }}</p>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="primary" variant="flat" rounded @click="printSale">
          <v-icon left>mdi-printer</v-icon> {{ t('printDialogue.printButton') }}
        </v-btn>
        <v-btn color="grey" variant="outlined" rounded @click="closePrintDialog">
          {{ t('printDialogue.noThanksButton') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <div ref="printReceiptSection" class="d-none">
    <div class="receipt-container">
      <div class="header-section">
        <template v-if="storeLogoUrl">
          <img :src="storeLogoUrl" alt="Store Logo" class="receipt-logo">
        </template>
        <h2 class="store-name">{{ storeName }}</h2>
        <p class="store-contact-info">{{ storeLocation }} | {{ storeContact }}</p>
      </div>

      <div class="receipt-title-section">
        <h3 class="receipt-title">{{ t('receipt.receiptTitle') }}</h3>
        <p class="receipt-id">{{ t('receipt.receiptId') }}{{ getReceiptId }}</p>

      </div>

      <div class="info-section">
        <p><strong>{{ t('receipt.customerLabel') }}</strong> {{ receiptCustomerName }}</p>
        <p><strong>{{ t('receipt.cashierLabel') }}</strong> {{ userName }}</p>
        <p><strong>Date :</strong>{{ datePrint }}</p>
      </div>

      <div class="items-table-section">
        <v-table density="compact" class="receipt-table">
          <thead>
            <tr>
              <th>{{ t('receipt.tableHeaderSN') }}</th>
              <th>{{ t('receipt.tableHeaderProduct') }}</th>
              <th>{{ t('receipt.tableHeaderQuantity') }}</th>
              <th>{{ t('receipt.tableHeaderUnitPrice') }}</th>
              <th>{{ t('receipt.tableHeaderTotal') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in lastSaleItems" :key="item.product.id + '-' + item.stockRecordIdAtSale">
              <td>{{ index + 1 }}</td>
              <td>{{ item.product.name }}</td>
              <td>{{ item.quantity }}</td>
              <td>{{ formatNumberWithThousandsSeparator(item.priceAtSale) }}</td>
              <td>{{ formatNumberWithThousandsSeparator(item.totalItemPrice) }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div class="total-section">
        <p>{{ t('receipt.totalLabel') }} <strong>{{ formatNumberWithThousandsSeparator(lastSaleTotal) }} FCFA</strong></p>
      </div>

      <div class="footer-section">
        <p>{{ t('receipt.thankYouMessage') }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, defineProps, defineEmits, nextTick, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useCartStore } from '@/stores/cartStore';
import type { CartItem } from '@/stores/cartStore';
import { useI18n } from 'vue-i18n';

// --- Composables and Utilities ---
const { t, locale } = useI18n();

// Define Product interface to match your Product.vue
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

interface SaleReceiptItem extends CartItem {
  totalItemPrice: number;
}

const props = defineProps<{
  modelValue: boolean;
  products: Product[];
}>();

const emit = defineEmits(['update:modelValue', 'sale-completed', 'refresh-products']);

const router = useRouter();
const cartStore = useCartStore();

const dialog = ref(props.modelValue);
const printDialog = ref(false);
const processingCheckout = ref(false);

const payment_method = ref('');
const customerName = ref('');
const customerContact = ref('');

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = ref(3000);

const printReceiptSection = ref<HTMLElement | null>(null);

const storeName = ref('');
const storeLocation = ref('');
const storeContact = ref('');
const storeLogoUrl = ref<string | null>(null);
const userName = ref('');

const lastSaleItems = ref<SaleReceiptItem[]>([]);
const lastSaleTotal = ref(0);
const lastSaleCustomerName = ref('');
const lastSaleReceiptId = ref('');

// --- MODIFIED: Manager's Email to be fetched dynamically ---
const managerEmail = ref<string | null>(null);

// --- Computed Properties ---
// const formattedDate = computed(() => {
//   const date = new Date();
//   const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//   return date.toLocaleDateString(locale.value, options);
// });

const datePrint = computed(() => {
  const date = new Date();
  // Using 'en-CA' or 'fr-CA' (Canadian English/French) often yields YYYY-MM-DD consistently.
  // Alternatively, you could use 'en-US' and then manually reverse the order if needed, but this is cleaner.
  return new Intl.DateTimeFormat(`${locale.value}-CA`, { // Or 'fr-CA' if you prefer French locale specifically for formatting
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
});

const receiptCustomerName = computed(() => {
  return lastSaleCustomerName.value || t('receipt.anonymousCustomer');
});

// --- Utility Functions ---
function formatNumberWithThousandsSeparator(value: number | string): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value).toLocaleString('en-US');
  }
  return String(value);
}

function showSnackbar(message: string, color: string = 'info', timeout: number = 3000) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbarTimeout.value = timeout;
  snackbar.value = true;
}

const backendUrl = 'http://localhost:8000';
const getImageUrl = (path: string | undefined | null) => {
  if (path && !path.startsWith('http') && !path.includes('storage')) {
    return `${backendUrl}/storage/${path}`;
  }
  return path || 'https://via.placeholder.com/60x60?text=No+Image';
};

// --- Watchers ---
watch(() => props.modelValue, (newVal) => {
  dialog.value = newVal;
});

watch(dialog, (newVal) => {
  emit('update:modelValue', newVal);
});

// --- Handlers for Cart Actions ---
function handleIncrementQuantity(item: CartItem) {
  const productInProducts = props.products.find(p => p.id === item.product.id);
  const currentTotalQuantityInCart = cartStore.cartItems
    .filter(cartItem => cartItem.product.id === item.product.id && cartItem.stockRecordIdAtSale === item.stockRecordIdAtSale)
    .reduce((sum, cartItem) => sum + cartItem.quantity, 0);

  if (productInProducts && currentTotalQuantityInCart < productInProducts.stock) {
    cartStore.incrementQuantity(item);
  } else if (productInProducts && currentTotalQuantityInCart >= productInProducts.stock) {
    showSnackbar(t('cartdialogue.snackbarCannotAddMore', { productName: item.product.name, stock: productInProducts.stock }), 'warning');
  } else {
    showSnackbar(t('cartdialogue.snackbarProductNotFound', { productName: item.product.name }), 'error');
  }
}

function handleDecrementQuantity(item: CartItem) {
  if (item.quantity > 1) {
    cartStore.decrementQuantity(item);
  } else {
    cartStore.removeFromCart(item);
    showSnackbar(t('cartdialogue.snackbarProductRemoved', { productName: item.product.name }), 'info');
  }
}

function handleRemoveFromCart(item: CartItem) {
  cartStore.removeFromCart(item);
  showSnackbar(t('cartdialogue.snackbarProductRemoved', { productName: item.product.name }), 'info');
}

function handleClearCart() {
  cartStore.clearCart();
  customerName.value = '';
  customerContact.value = '';
  payment_method.value = '';
  showSnackbar(t('cartdialogue.snackbarCartCleared'), 'info');
}

function closeDialog() {
  dialog.value = false;
  payment_method.value = '';
  customerName.value = '';
  customerContact.value = '';
}

function closePrintDialog() {
  printDialog.value = false;
  closeDialog();
  setTimeout(() => {
    emit('sale-completed');
    emit('refresh-products');
  }, 300);
}

// --- API Calls and Checkout Logic ---
async function fetchUserName() {
  try {
    const token = sessionStorage.getItem('access_token');
    const response = await axios.get('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    userName.value = response.data.user.name;
  } catch (error) {
    console.error('Error fetching user data for receipt:', error);
  }
}

async function fetchStoreDetails() {
  const storeId = sessionStorage.getItem('storeId');
  const token = sessionStorage.getItem('access_token');
  try {
    if (!token) {
      showSnackbar('Authentication required to fetch store details.', 'error');
      return;
    }
    const response = await axios.get(`/api/stores/showstore/${storeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    storeName.value = response.data.store.name;
    storeContact.value = response.data.store.contact;
    storeLocation.value = response.data.store.location;
    storeLogoUrl.value = response.data.store.logo ? getImageUrl(response.data.store.logo) : null;

    // --- MODIFIED: Fetch manager's email based on manager_id from store details ---
    const managerId = response.data.store.user_id; // Assuming your store object has a 'manager_id'
    if (managerId) {
      await fetchManagerEmail(managerId);
    } else {
      console.warn('Manager ID not found for this store. Cannot fetch manager email.');
      managerEmail.value = null; // Ensure it's explicitly null if no manager ID
    }

  } catch (error) {
    console.error('Error fetching store details:', error);
  }
}

// --- NEW FUNCTION: Fetch manager email by user ID ---
async function fetchManagerEmail(managerId: number) {
  const token = sessionStorage.getItem('access_token');
  try {
    const response = await axios.get(`/api/user/${managerId}`, { // Assuming an API endpoint like /api/users/{id}
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.data && response.data.user && response.data.user.email) {
      managerEmail.value = response.data.user.email;
      console.log('Manager email fetched:', managerEmail.value);
    } else {
      console.warn('Manager email not found in user data:', response.data);
      managerEmail.value = null;
    }
  } catch (error) {
    console.error('Error fetching manager email:', error);
    managerEmail.value = null;
  }
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

async function checkout() {
  if (cartStore.cartItems.length === 0) {
    showSnackbar(t('cartdialogue.snackbarCartEmptyNoProcess'), 'warning');
    return;
  }
  if (!payment_method.value) {
    showSnackbar(t('cartdialogue.paymentMethodRequired'), 'error');
    return;
  }

  processingCheckout.value = true;
  const token = sessionStorage.getItem('access_token');
  const storeId = sessionStorage.getItem('storeId');
  const userId = sessionStorage.getItem('userId');

  if (!token || !storeId || !userId) {
    showSnackbar(t('cartdialogue.snackbarAuthMissing'), 'error');
    processingCheckout.value = false;
    router.push('/login');
    return;
  }

  lastSaleItems.value = [];
  lastSaleTotal.value = 0;
  lastSaleCustomerName.value = customerName.value || t('receipt.anonymousCustomer');

  lastSaleReceiptId.value = generateUniqueReceiptId();
  console.log("Generated Receipt ID for this sale:", lastSaleReceiptId.value);

  const originalCartItems = [...cartStore.cartItems];

  const salesToProcess = originalCartItems.map(item => ({
    product_id: item.product.id,
    stock_id: item.stockRecordIdAtSale ?? null,
    quantity: item.quantity,
    selling_price: item.priceAtSale,
    store_id: Number(storeId),
    user_id: Number(userId),
    payment_method: payment_method.value,
    customer_name: customerName.value || 'Anonymous',
    customer_contact: customerContact.value ? Number(customerContact.value) : 0,
    originalCartItem: item,
    receipt_code: lastSaleReceiptId.value,
  }));

  const successfullyProcessedItems: CartItem[] = [];
  const failedItems: { item: CartItem; error: string }[] = [];

  try {
    const results = await Promise.allSettled(salesToProcess.map(async (payload) => {
      try {
        const response = await axios.post('/api/sales/cashiersale', payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          if (!lastSaleReceiptId.value && response.data.sale_id) {
             lastSaleReceiptId.value = String(response.data.sale_id); // Ensure string for consistency
          }
          return { status: 'fulfilled', item: payload.originalCartItem, responseData: response.data };
        } else {
          return { status: 'rejected', item: payload.originalCartItem, reason: response.data.message || 'Unknown error for item.' };
        }
      } catch (itemError: any) {
        let errorMessage = 'An unexpected error occurred.';
        if (axios.isAxiosError(itemError) && itemError.response) {
          errorMessage = itemError.response.data.message ||
                         (itemError.response.data.errors ? Object.values(itemError.response.data.errors).flat().join('; ') : 'Validation error.');
          if (itemError.response.status === 401) {
            errorMessage = 'Unauthorized. Please log in again.';
            router.push('/login');
          }
        } else {
          errorMessage = 'Network error or client-side issue.';
        }
        console.error(`Error during API call for ${payload.originalCartItem.product.name}:`, itemError);
        return { status: 'rejected', item: payload.originalCartItem, reason: errorMessage };
      }
    }));

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        successfullyProcessedItems.push(result.value.item);
        lastSaleItems.value.push({
          ...result.value.item,
          totalItemPrice: result.value.item.quantity * result.value.item.priceAtSale
        });
        lastSaleTotal.value += result.value.item.quantity * result.value.item.priceAtSale;
      } else if (result.status === 'rejected') {
        failedItems.push({ item: (result as PromiseRejectedResult).reason.item, error: (result as PromiseRejectedResult).reason.reason });
      }
    });

    if (successfullyProcessedItems.length === originalCartItems.length && originalCartItems.length > 0) {
      showSnackbar(t('cartdialogue.snackbarSaleCompleteSuccess'), 'success', 2000);
      cartStore.clearCart();
      payment_method.value = '';
      customerName.value = '';
      customerContact.value = '';

      if (managerEmail.value && lastSaleItems.value.length > 0) {
        await sendReceiptToManager(lastSaleItems.value, lastSaleTotal.value, lastSaleCustomerName.value, lastSaleReceiptId.value);
      } else {
        console.warn('Manager email not found or no items sold. Skipping receipt email.');
        if (!managerEmail.value) {
            showSnackbar('Manager email not configured, receipt not sent.', 'warning');
        }
      }

      setTimeout(() => {
        closeDialog();
        printDialog.value = true;
      }, 2000);
    } else if (successfullyProcessedItems.length > 0 && failedItems.length > 0) {
      showSnackbar(
        t('cartdialogue.snackbarSalePartialSuccess', { soldCount: successfullyProcessedItems.length, failedCount: failedItems.length }),
        'warning',
        5000
      );
      cartStore.setCartItems(failedItems.map(f => f.item));
    } else if (failedItems.length === originalCartItems.length && originalCartItems.length > 0) {
      showSnackbar(t('cartdialogue.snackbarSaleAllFailed'), 'error', 5000);
    } else if (originalCartItems.length === 0) {
      showSnackbar(t('cartdialogue.snackbarCartEmptyNoProcess'), 'info');
    }

  } catch (overallError: any) {
    console.error('An unhandled error occurred during the checkout process:', overallError);
    showSnackbar(t('cartdialogue.snackbarUnexpectedError'), 'error', 5000);
  } finally {
    processingCheckout.value = false;
  }
}

async function sendReceiptToManager(items: SaleReceiptItem[], total: number, customer: string, receiptId: string) {
  const token = sessionStorage.getItem('access_token');

  const currentLocale = localStorage.getItem('user_locale') || 'en';

  if (!managerEmail.value || !token) {
    console.error('Manager email or access token missing. Cannot send receipt email.');
    showSnackbar('Failed to send receipt email: Configuration error.', 'error');
    return;
  }

  try {
    const saleDetailsForEmail = {
      to_email: managerEmail.value,
      receipt_id: receiptId,
      customer_name: customer,
      cashier_name: userName.value,
      sale_date: new Date().toLocaleDateString(),
      items: items.map(item => ({
        name: item.product.name,
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
      showSnackbar(t('snackbarReceiptEmailFailed'), 'error');
      console.error('Failed to send receipt email:', response.data.message);
    }
  } catch (error) {
    console.error('Error sending receipt email:', error);
    showSnackbar(t('snackbarReceiptEmailError'), 'error');
  }
}

function printSale() {
  if (!lastSaleItems.value || lastSaleItems.value.length === 0) {
    showSnackbar(t('printDialogue.snackbarNoPrintData'), 'error');
    closePrintDialog();
    return;
  }

  showSnackbar(t('printDialogue.snackbarPreparingPrint'), 'info', 2000);

  nextTick(() => {
    if (!printReceiptSection.value) {
      console.warn('printReceiptSection is not ready for printing.');
      showSnackbar(t('printDialogue.snackbarPrintContentNotReady'), 'error');
      return;
    }

    const printContent = printReceiptSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('receipt.receiptTitle')}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; font-size: 8px;}
              .receipt-container { width: 300px; margin: 0 auto; padding: 15px; border: 1px dashed #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .header-section { text-align: center; margin-bottom: 15px; }
              .store-name { font-size: 24px; margin-bottom: 5px; color: black; font-weight: bold; }
              .store-contact-info { font-size: 12px; color: #777; margin-top: 0; line-height: 1.2; }

              .receipt-logo {
                max-width: 80px;
                max-height: 50px;
                margin-bottom: 10px;
                display: block !important;
                margin-left: auto;
                margin-right: auto;
                visibility: visible !important;
                opacity: 1 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                filter: none !important;
              }

              .receipt-title-section { text-align: center; margin: 20px 0 15px 0; border-top: 1px dashed #eee; padding-top: 15px;}
              .receipt-title { font-size: 20px; margin-bottom: 5px; color: #555; }
              .receipt-id { font-size: 12px; color: #888; }

              .info-section { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #eee; }
              .info-section p { margin: 5px 0; font-size: 13px; }
              .info-section strong { color: #000; }

              .items-table-section { margin-bottom: 20px; }
              .receipt-table { width: 100%; border-collapse: collapse; }
              .receipt-table th, .receipt-table td { border: 0; padding: 8px 0; text-align: left; font-size: 13px;}
              .receipt-table th { border-bottom: 1px solid #ddd; padding-bottom: 10px; font-weight: bold; color: #444;}
              .receipt-table tbody tr:last-child td { border-bottom: none; }

              .total-section { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; padding-top: 15px; border-top: 2px solid #555; }
              .total-section p { margin: 0; }

              .footer-section { text-align: center; margin-top: 30px; font-size: 12px; color: #666; line-height: 1.5; }
              .powered-by { font-style: italic; margin-top: 10px; }
              .contact-footer { font-size: 10px; color: #999; }

              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .receipt-container {
                  border: none;
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
    } else {
      showSnackbar(t('printDialogue.snackbarPopUpBlocked'), 'error');
    }
  });
  closePrintDialog();
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  await fetchStoreDetails();
  await fetchUserName();
});
</script>

<style scoped>
/* Existing styles remain unchanged */
.cart-dialog-card {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-close-btn {
  margin-right: 8px;
}

.cart-items-container {
  max-height: 50vh; /* Limits height and adds scrollbar if content overflows */
  overflow-y: auto;
  padding-right: 16px !important; /* Space for scrollbar */
}

/* Custom Scrollbar Styling (for WebKit browsers) */
.cart-items-container::-webkit-scrollbar {
  width: 8px;
}

.cart-items-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.cart-items-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 10px;
}

.cart-items-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Cart Item Card Styling */
.cart-item-card {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s ease-in-out;
}

.cart-item-card:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.product-image-avatar {
  border: 1px solid #eee;
}

.product-details {
  flex-basis: 0; /* Allows content to shrink */
  min-width: 0; /* Prevents overflow issues */
}

.quantity-controls {
  flex-shrink: 0; /* Prevents controls from shrinking */
}

/* Section Specific Styling */
.totals-section {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
}

.customer-info-section {
  background-color: #e3f2fd; /* Light blue background */
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.total-amount-text span:last-child {
  color: #4CAF50; /* Green color for total amount */
  font-size: 1.5rem; /* Larger font size for total */
}

.action-buttons .v-btn {
  margin-top: 0;
}

.action-buttons .v-btn:first-child {
  margin-bottom: 8px;
}

/* --- New and Updated Styles for Receipt (copied from your SaleTransactions.vue) --- */
.receipt-container {
  width: 300px; /* Standard receipt width, adjust as needed */
  margin: 0 auto;
  padding: 15px;
  border: 1px dashed #ccc; /* Subtle dashed border for a receipt feel */
  box-shadow: 0 0 10px rgba(0,0,0,0.05); /* Soft shadow */
}

.header-section {
  text-align: center;
  margin-bottom: 15px;
}

.store-name {
  font-size: 24px;
  margin-bottom: 5px;
  color: black; /* Your brand color */
  font-weight: bold;
}

.store-contact-info {
  font-size: 12px;
  color: #777;
  margin-top: 0;
  line-height: 1.2;
}

.receipt-title-section {
  text-align: center;
  margin: 20px 0 15px 0;
  border-top: 1px dashed #eee; /* Separator line */
  padding-top: 15px;
}

.receipt-title {
  font-size: 20px;
  margin-bottom: 5px;
  color: #555;
}

.receipt-id {
  font-size: 12px;
  color: #888;
}

.info-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #eee; /* Separator line */
}

.info-section p {
  margin: 5px 0;
  font-size: 13px;
}

.info-section strong {
  color: #000; /* Ensure strong text is clearly visible */
}

.items-table-section {
  margin-bottom: 20px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
}

.receipt-table th, .receipt-table td {
  border: 0; /* Remove default table borders */
  padding: 8px 0;
  text-align: left;
  font-size: 13px;}

.receipt-table th {
  border-bottom: 1px solid #ddd; /* Only bottom border for headers */
  padding-bottom: 10px;
  font-weight: bold;
  color: #444;}

.receipt-table tbody tr:last-child td {
  border-bottom: none; /* No border for the last row */
}

.total-section {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 2px solid #555; /* Thick top border for total */
}

.total-section p {
  margin: 0;
}

.footer-section {
  text-align: center;
  margin-top: 30px;
  font-size: 12px;
  color: #666;
  line-height: 1.5;
}

.powered-by {
  font-style: italic;
  margin-top: 10px;
}

.contact-footer {
  font-size: 10px;
  color: #999;
}

/* Print specific styles */
@media print {
  body {
    -webkit-print-color-adjust: exact; /* For WebKit browsers */
    print-color-adjust: exact; /* Standard property */
  }
  .receipt-container {
    border: none; /* Hide the dashed border when printing */
    box-shadow: none;
  }
}
</style>
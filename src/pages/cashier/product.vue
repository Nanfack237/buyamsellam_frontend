<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent
          :products="products"
          :storeIdProp="storeIdFromProduct" @sale-completed="handleSaleCompleted"
          @refresh-products="fetchProducts"
        />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-container fluid class="pa-4">
            <v-row justify="space-between" align="center" class="d-flex justify-center pt-2 pb-2">
              <v-col cols="auto">
                <h1 class="text-h5 text-high-emphasis py-1">{{ t('cashierProductVue.productsTitle') }}</h1>
              </v-col>
              <v-col cols="auto">
                <p class="text-subtitle-1 text-medium-emphasis">{{ formattedDate }}</p>
              </v-col>
            </v-row>
            <v-divider class="mb-6"></v-divider>

            <v-row justify="space-between" class="d-flex px-1 pt-1 mb-2 align-center">
              <v-col cols="12" md="auto" sm="6" class="text-md-left text-sm-right text-center">
                <p class="text-high-emphasis py-2">
                  <b>{{ displayedProducts.length }}</b>
                    {{ (displayedProducts?.length ?? 0) === 1 ? t('cashierProductVue.productSingular') : t('cashierProductVue.productPlural') }}
                </p>
              </v-col>

              <v-col cols="12" md="3" sm="6">
                <v-text-field
                  v-model="search"
                  density="compact"
                  :label="t('cashierProductVue.searchLabel')" prepend-inner-icon="mdi-magnify"
                  variant="solo-filled"
                  flat
                  hide-details
                  single-line
                  rounded="lg"
                />
              </v-col>
            </v-row>
            <v-divider class="mb-6"></v-divider>

            <v-row v-if="displayedProducts.length === 0" class="mt-8">
              <v-col cols="12" class="text-center">
                <v-icon size="64" color="grey-lighten-1">mdi-package-variant-closed</v-icon>
                <h2 class="text-h6 text-medium-emphasis mt-4">
                  {{ t('cashierProductVue.noProductsFoundTitle', { searchQuery: search }) }}
                </h2>
                <p class="text-body-1 text-grey-lighten-1 mt-2">
                  {{ t('cashierProductVue.noProductsFoundText') }}
                </p>
                <v-btn
                  v-if="search"
                  color="blue-darken-4"
                  variant="outlined"
                  rounded="lg"
                  class="mt-4"
                  @click="search = ''"
                >
                  {{ t('cashierProductVue.clearSearchButton') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-row v-else dense class="product-grid" no-gutters>
              <v-col
                v-for="product in displayedProducts"
                :key="product.id"
                cols="12" sm="6" md="3" lg="3" class="mb-4 d-flex px-2"
              >
                <v-card class="product-card flex-grow-1" elevation="2">
                  <v-carousel
                    height="200"
                    show-arrows="hover"
                    hide-delimiter-background
                    :continuous="product.media && product.media.length > 1"
                    :cycle="product.media && product.media.length > 1"
                    interval="3000"
                    class="rounded-t-lg"
                  >
                    <v-carousel-item
                      v-for="(imagePath, i) in product.media"
                      :key="i"
                      :src="getImageUrl(imagePath)"
                      cover
                    >
                      <div class="product-price-overlay">
                        FCFA {{ formatNumberWithThousandsSeparator(product.baseSellingPriceFromStock.toFixed(2)) }}
                      </div>
                    </v-carousel-item>
                    <v-carousel-item v-if="!product.media || product.media.length === 0">
                      <v-img
                        src="https://via.placeholder.com/200x200?text=No+Image"
                        height="200"
                        cover
                        class="d-flex align-end image-blur"
                      >
                        <div class="product-price-overlay">
                          FCFA {{ formatNumberWithThousandsSeparator(product.baseSellingPriceFromStock.toFixed(2)) }}
                        </div>
                      </v-img>
                    </v-carousel-item>
                  </v-carousel>

                  <v-card-text class="text-center pb-2">
                    <p class="text-subtitle-1 font-weight-bold mb-1 text-truncate">{{ product.name }}</p>
                    <p class="text-caption text-grey-lighten-1">{{ product.category }}</p>
                    <p
                      class="text-body-2 font-weight-medium mt-2"
                      :class="{'text-error': product.stock === 0, 'text-success': product.stock > 0}"
                    >
                      {{ t('cashierProductVue.stockLabel', { stockCount: product.stock }) }}
                    </p>

                    <v-text-field
                      v-model.number="product.cashierInputSellingPrice"
                      :label="t('cashierProductVue.sellingPriceLabel')"
                      density="compact"
                      hide-details
                      variant="outlined"
                      prepend-inner-icon="mdi-cash"
                      class="mt-3"
                      type="number"
                      min="0"
                      step="0.01"
                      @update:model-value="validateCashierSellingPrice(product)"
                      :disabled="product.stock === 0"
                    ></v-text-field>

                    <v-row class="mt-3 align-center justify-center" no-gutters>
                      <v-col cols="auto">
                        <v-btn
                          icon
                          size="small"
                          variant="flat"
                          @click="decrementQuantity(product)"
                          :disabled="product.quantityToAdd <= 1 || product.stock === 0"
                        >
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                      </v-col>
                      <v-col cols="4" class="px-2">
                        <v-text-field
                          v-model.number="product.quantityToAdd"
                          density="compact"
                          hide-details
                          variant="outlined"
                          class="centered-input product-quantity-input"
                          type="number"
                          min="1"
                          :max="product.stock"
                          @update:model-value="validateQuantity(product)"
                          :disabled="product.stock === 0"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="auto">
                        <v-btn
                          color="green-lighten-5"
                          icon
                          size="small"
                          variant="flat"
                          @click="incrementQuantity(product)"
                          :disabled="product.quantityToAdd >= product.stock || product.stock === 0"
                        >
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card-text>

                  <v-card-actions class="pa-3 pt-0">
                    <v-btn
                      color="blue-darken-4"
                      variant="flat"
                      block
                      rounded="lg"
                      @click="handleAddProductToCart(product)"
                      :disabled="product.stock === 0 || product.quantityToAdd === 0 || product.quantityToAdd > product.stock || product.cashierInputSellingPrice <= 0"
                    >
                      <v-icon left>mdi-cart-plus</v-icon>
                      {{ product.stock === 0 ? t('cashierProductVue.outOfStock') : t('cashierProductVue.addToCart', { quantity: product.quantityToAdd }) }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <v-row class="mt-4" v-if="displayedProducts.length > 0">
              <v-col cols="12" class="text-center">
                <v-btn
                  v-if="filteredProducts.length > initialDisplayLimit && displayLimit === initialDisplayLimit"
                  color="blue-darken-4"
                  variant="outlined"
                  rounded="lg"
                  @click="displayLimit = filteredProducts.length"
                >
                  {{ t('cashierProductVue.viewAll', { count: filteredProducts.length - initialDisplayLimit }) }}
                </v-btn>
                <v-btn
                  v-else-if="displayLimit > initialDisplayLimit"
                  color="blue-darken-4"
                  variant="outlined"
                  rounded="lg"
                  @click="displayLimit = initialDisplayLimit"
                >
                  {{ t('cashierProductVue.showLess') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>

          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
            <template v-slot:actions>
              <v-btn variant="text" @click="snackbar = false">
                <v-icon color="white">mdi-close</v-icon>
              </v-btn>
            </template>
          </v-snackbar>

          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ t('loading') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

---

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import SideBarComponent from '@/components/cashier/CashierSideBarComponent.vue';
import HeaderComponent from '@/components/cashier/CashierHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useCartStore } from '@/stores/cartStore';
import { useI18n } from 'vue-i18n';

// --- Composables and Utilities ---

const { t, locale } = useI18n(); // Destructure t and locale for reactive changes

// --- Interfaces ---
interface StockItem {
  id: number;
  product_id: number;
  quantity: number;
  selling_price: number;
  cost_price: number; // Added cost_price to individual stock items
  expiration_date: string | null;
  batch_number: string | null;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image?: string;
  image1?: string;
  image2?: string;
  media?: string[];
  price: number; // This might be a default or average price, not necessarily from stock
  stock: number; // Total aggregated stock
  store_id: number;
  created_at: string;
  updated_at: string;
  quantityToAdd: number;
  baseSellingPriceFromStock: number; // The selling price from one of the stock records
  cashierInputSellingPrice: number;
  stock_id: number | null; // This might become an array of stock IDs if supporting multiple stock records
  // New property to hold detailed stock information
  detailedStocks: StockItem[];
}

// --- Composables and Stores ---
const router = useRouter();
const cartStore = useCartStore();

// --- Reactive State ---
const products = ref<Product[]>([]);
const search = ref('');
const isDataLoaded = ref(false);
const storeIdFromProduct = ref<string | null>(null); // Correctly named reactive variable

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;

const initialDisplayLimit = 12;
const displayLimit = ref(initialDisplayLimit);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Use the current locale for date formatting
  return date.toLocaleDateString(locale.value, options);
});

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const searchTerm = search.value.toLowerCase();
    return product.name.toLowerCase().includes(searchTerm) ||
           product.category.toLowerCase().includes(searchTerm);
  });
});

function formatNumberWithThousandsSeparator(value: number | string): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value).toLocaleString('en-US');
  }
  return String(value); // Return as string if not a valid number
}

const displayedProducts = computed(() => {
  return filteredProducts.value.slice(0, displayLimit.value);
});

// --- Watcher for search term ---
watch(search, (newSearchTerm, oldSearchTerm) => {
  // Reset displayLimit to initial when search term changes
  displayLimit.value = initialDisplayLimit;
});

// --- Methods ---
function showSnackbar(message: string, color: string = 'info') {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

const backendUrl = 'http://localhost:8000'; // **CRITICAL: Ensure this matches your Laravel backend URL**
const getImageUrl = (path: string | null | undefined) => {
  if (!path) {
    return 'https://via.placeholder.com/200x200?text=No+Image';
  }
  if (!path.startsWith('http://') && !path.startsWith('https://') && !path.includes('/storage/')) {
    return `${backendUrl}/storage/${path}`;
  }
  return path;
};

async function fetchProducts() {
    const token = sessionStorage.getItem('access_token');
    const userId = sessionStorage.getItem('userId');
    let currentStoreId = sessionStorage.getItem('storeId');

    if (!token || !userId) { // Ensure token is also checked here
        showSnackbar('Authentication required. Please log in.', 'error');
        router.push('/login'); // Use path directly
        return;
    }

    if (!currentStoreId) {
        try {
            const employeeResponse = await axios.get('/api/employees/showstore', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (employeeResponse.data.employee?.[0]?.store_id) {
                const fetchedStoreId = employeeResponse.data.employee[0].store_id;
                sessionStorage.setItem('storeId', fetchedStoreId.toString());
                currentStoreId = fetchedStoreId.toString();
                storeIdFromProduct.value = currentStoreId;
                console.log(`Store ID ${fetchedStoreId} fetched and stored for user ${userId}.`);
            } else {
                showSnackbar(t('cashierProductVue.snackbarNoStoreAssociated'), 'warning');
                console.warn('Employee data or store_id not found for this user. Cannot load products.');
                currentStoreId = null;
                storeIdFromProduct.value = null;
                return;
            }
        } catch (employeeError: any) {
            console.error('Error fetching employee details:', employeeError);
            showSnackbar(t('cashierProductVue.snackbarCouldNotRetrieveStore'), 'error');
            currentStoreId = null;
            storeIdFromProduct.value = null;
            return;
        }
    } else {
        storeIdFromProduct.value = currentStoreId;
    }

    if (!currentStoreId) {
        showSnackbar(t('cashierProductVue.snackbarNoStoreIdAvailable'), 'error');
        isDataLoaded.value = true;
        return;
    }

    try {
        const productsResponse = await axios.get(`/api/products`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        const stockResponse = await axios.get(`/api/stocks`, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { store_id: currentStoreId }
        });

        const fetchedProducts = productsResponse.data.products;
        const fetchedStocks: StockItem[] = stockResponse.data.stocks; // Use StockItem interface here

        // Map to aggregate stock details by product ID
        const productDetailedStockMap = new Map<number, StockItem[]>();
        const productTotalStockMap = new Map<number, { totalQuantity: number; firstSellingPrice: number | null; firstStockId: number | null }>();

        fetchedStocks.forEach(stockItem => {
            // Initialize if product not seen yet
            if (!productDetailedStockMap.has(stockItem.product_id)) {
                productDetailedStockMap.set(stockItem.product_id, []);
            }
            productDetailedStockMap.get(stockItem.product_id)?.push(stockItem);

            // For total stock and initial selling price
            const currentAggregated = productTotalStockMap.get(stockItem.product_id) || { totalQuantity: 0, firstSellingPrice: null, firstStockId: null };
            currentAggregated.totalQuantity += Number(stockItem.quantity) || 0;
            
            // The `firstSellingPrice` and `firstStockId` logic can remain the same
            // as we will find the "best" stock_id for display later.
            if (currentAggregated.firstSellingPrice === null && stockItem.selling_price !== undefined && stockItem.selling_price !== null) {
                currentAggregated.firstSellingPrice = Number(stockItem.selling_price);
                currentAggregated.firstStockId = stockItem.id; // Store the stock_id for the first encountered selling price
            }
            productTotalStockMap.set(stockItem.product_id, currentAggregated);
        });

        products.value = fetchedProducts.map((p: any) => {
            const productImages: string[] = [];
            if (p.image1) {
                productImages.push(p.image1);
            }
            if (p.image2) {
                productImages.push(p.image2);
            }
            if (p.image && productImages.length === 0) {
                productImages.push(p.image);
            }

            const associatedDetailedStocks = productDetailedStockMap.get(p.id) || [];
            const associatedAggregatedStockInfo = productTotalStockMap.get(p.id);

            // Find the first stock item with a quantity > 0 for this product,
            // or default to the first one found if all are 0.
            let selectedStockForDisplay: StockItem | undefined;
            if (associatedDetailedStocks.length > 0) {
                // First, try to find a stock with quantity > 0
                selectedStockForDisplay = associatedDetailedStocks.find(s => Number(s.quantity) > 0);
                
                // If no stock with quantity > 0 is found, default to the first detailed stock
                // (this might be a stock with 0 quantity, which is acceptable if no active stock exists)
                if (!selectedStockForDisplay) {
                    selectedStockForDisplay = associatedDetailedStocks[0];
                }
            }


            const initialSellingPrice = selectedStockForDisplay?.selling_price !== undefined && selectedStockForDisplay?.selling_price !== null
                                         ? Number(selectedStockForDisplay.selling_price)
                                         : (Number(p.price) || 0);
            
            const selectedStockId = selectedStockForDisplay?.id || null;
            const totalAggregatedStockQuantity = associatedAggregatedStockInfo?.totalQuantity || 0;

            return {
                ...p,
                price: Number(p.price) || 0, // Original product price
                stock: totalAggregatedStockQuantity, // Total stock across all variations/batches for this product
                quantityToAdd: 1,
                baseSellingPriceFromStock: initialSellingPrice,
                cashierInputSellingPrice: initialSellingPrice,
                stock_id: selectedStockId, // The selected stock_id for display/initial cart addition
                media: productImages,
                detailedStocks: associatedDetailedStocks, // All stock items for this product
            };
        });

    } catch (error: any) {
        console.error('Error fetching products or stock:', error);
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 404) {
                showSnackbar(t('cashierProductVue.snackbarApiNotFound'), 'error');
            } else if (error.response.status === 401) {
                showSnackbar(t('cashierProductVue.snackbarUnauthorized'), 'error');
                router.push('/login'); // Use path directly
            }
            else {
                showSnackbar(t('cashierProductVue.snackbarErrorFetchingData', { errorDetails: error.response.statusText || 'Unknown error' }), 'error');
            }
        } else {
            showSnackbar(t('cashierProductVue.snackbarNetworkError'), 'error');
        }
    } finally {
        isDataLoaded.value = true;
    }
}

function decrementQuantity(product: Product) {
  if (product.quantityToAdd > 1) {
    product.quantityToAdd--;
  }
}

function incrementQuantity(product: Product) {
  if (product.quantityToAdd < product.stock) {
    product.quantityToAdd++;
  } else if (product.stock === 0) {
    showSnackbar(t('cashierProductVue.snackbarProductOutOfStock', { productName: product.name }), 'warning');
  } else {
    showSnackbar(t('cashierProductVue.snackbarCannotAddMore', { stock: product.stock }), 'warning');
  }
}

function validateQuantity(product: Product) {
  if (isNaN(product.quantityToAdd) || product.quantityToAdd < 1) {
    product.quantityToAdd = 1;
    showSnackbar(t('cashierProductVue.snackbarQuantityMin'), 'warning');
  } else if (product.quantityToAdd > product.stock) {
    product.quantityToAdd = product.stock;
    showSnackbar(t('cashierProductVue.snackbarCannotAddMore', { stock: product.stock }), 'warning');
  }
}

function validateCashierSellingPrice(product: Product) {
  if (isNaN(product.cashierInputSellingPrice) || product.cashierInputSellingPrice < 0) {
    product.cashierInputSellingPrice = 0;
    showSnackbar(t('cashierProductVue.snackbarSellingPriceNegative'), 'warning');
  }
}

function handleAddProductToCart(product: Product) {
  if (product.stock === 0) {
    showSnackbar(t('cashierProductVue.snackbarProductOutOfStock', { productName: product.name }), 'error');
    return;
  }
  if (product.quantityToAdd === 0 || isNaN(product.quantityToAdd)) {
    showSnackbar(t('cashierProductVue.snackbarInvalidQuantity'), 'warning');
    return;
  }
  if (product.quantityToAdd > product.stock) {
    showSnackbar(t('cashierProductVue.snackbarExceedStock', { quantity: product.quantityToAdd, productName: product.name, stock: product.stock }), 'error');
    return;
  }
  if (isNaN(product.cashierInputSellingPrice) || product.cashierInputSellingPrice <= 0) {
    showSnackbar(t('cashierProductVue.snackbarInvalidSellingPrice'), 'error');
    return;
  }
  if (product.stock_id === null) {
      showSnackbar(t('cashierProductVue.snackbarNoStockRecordId', { productName: product.name }), 'error');
      return;
  }

  const existingItemInCart = cartStore.cartItems.find(
    item => item.product.id === product.id && item.stockRecordIdAtSale === product.stock_id
  );
  const currentQuantityInCart = existingItemInCart ? existingItemInCart.quantity : 0;

  if (currentQuantityInCart + product.quantityToAdd > product.stock) {
    showSnackbar(
      t('cashierProductVue.snackbarExceedCartStock', { quantity: product.quantityToAdd, currentQuantity: currentQuantityInCart, availableStock: product.stock }),
      'error',
    );
    return;
  }

  cartStore.addToCart(product, product.quantityToAdd, product.cashierInputSellingPrice, product.stock_id);
  showSnackbar(t('cashierProductVue.snackbarAddedToCart', { quantity: product.quantityToAdd, productName: product.name, price: formatNumberWithThousandsSeparator(product.cashierInputSellingPrice.toFixed(2)) }), 'success');

  product.quantityToAdd = 1;
  product.cashierInputSellingPrice = product.baseSellingPriceFromStock;
}

function handleSaleCompleted() {
  fetchProducts(); // Refresh products after a sale
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  isDataLoaded.value = false;
  await fetchProducts();
});
</script>

<style scoped>
/* Main Content Area Styling */

/* Product Cards Grid container for alignment */
.product-grid {
  /* justify-content: center; /* Center the product cards within the row - Keeping this might still cause issues with 4 per row if container is small */
}

/* Product Card Styling */
.product-card {
  background-color: #ffffff; /* White background for individual product cards */
  color: #333; /* Darker text for readability on white background */
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 12px; /* Consistent rounded corners */
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s; /* Smooth transition for hover effects */
}

.product-card:hover {
  transform: translateY(-4px); /* Slight lift effect */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); /* More pronounced shadow on hover */
}

.product-price-overlay {
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 10px;
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  border-radius: 4px;
}

.v-card-text {
  padding-top: 16px;
  padding-bottom: 8px;
}

.v-card-text p {
  line-height: 1.4;
}

.v-card-actions {
  padding: 16px;
  padding-top: 0;
}

.v-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
}

/* Quantity Input Styling */
.centered-input :deep(input) {
  text-align: center;
  -moz-appearance: textfield; /* Firefox */
}
.centered-input :deep(input::-webkit-outer-spin-button),
.centered-input :deep(input::-webkit-inner-spin-button) {
  -webkit-appearance: none;
  margin: 0;
}

.product-quantity-input {
  max-width: 80px;
  margin: 0 auto;
}

/* Stock status colors for better visibility */
.text-success {
  color: #4CAF50 !important;
}
.text-error {
  color: #FF5252 !important;
}
</style>
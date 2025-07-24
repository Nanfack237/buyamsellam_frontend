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
                {{ $t('addPurchaseVue.title') }}
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
                {{ $t('addPurchaseVue.introDescription') }}
              </p>
              <v-divider class="mb-5 pb-3"></v-divider>

              <v-form @submit.prevent="submitPurchase" ref="purchaseForm">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-autocomplete
                      :label="$t('addPurchaseVue.selectProductLabel')"
                      v-model="selectedProduct"
                      :items="productLists"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      :rules="[v => !!v || $t('addPurchaseVue.validation.productRequired')]"
                      prepend-inner-icon="mdi-package-variant"
                      clearable
                      density="comfortable"
                      class="mb-2"
                    />
                    
                    <v-select
                      :label="$t('addPurchaseVue.selectCostPriceLabel')"
                      v-model="selectedCostPriceOption"
                      :items="costPriceOptions"
                      item-title="label"
                      item-value="value"
                      variant="outlined"
                      :rules="[v => v !== undefined && v !== null || $t('addPurchaseVue.validation.costPriceOptionRequired')]"
                      prepend-inner-icon="mdi-cash"
                      :disabled="!selectedProduct"
                      clearable
                      density="comfortable"
                      class="mb-0"
                    />

                    <v-expand-transition>
                      <div v-if="selectedCostPriceOption === -1">
                        <v-divider class="my-4"></v-divider>
                        <p class="text-medium-emphasis mb-3">{{ $t('addPurchaseVue.newUnitPriceDetails') }}</p>
                        <v-text-field
                          v-model.number="manualUnitPrice"
                          :label="$t('addPurchaseVue.enterNewUnitPriceLabel')"
                          type="number"
                          variant="outlined"
                          persistent-hint
                          :rules="selectedCostPriceOption === -1 ? [
                            v => (v !== null && v !== '') || $t('addPurchaseVue.validation.unitPriceRequired'),
                            v => (v && v >= 1) || $t('addPurchaseVue.validation.unitPriceMin')
                          ] : []"
                          prepend-inner-icon="mdi-currency-usd"
                          density="comfortable"
                          class="mb-2"
                        />
                      </div>
                    </v-expand-transition>

                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="quantity"
                      :label="$t('addPurchaseVue.quantityLabel')"
                      type="number"
                      variant="outlined"
                      persistent-hint
                      :rules="[
                        v => (v !== null && v !== '') || $t('addPurchaseVue.validation.quantityRequired'),
                        v => (v && v >= 1) || $t('addPurchaseVue.validation.quantityMin')
                      ]"
                      prepend-inner-icon="mdi-numeric"
                      density="comfortable"
                      class="mb-2"
                    />

                    <v-autocomplete
                      :label="$t('addPurchaseVue.selectSupplierLabel')"
                      v-model="selectedSupplier"
                      :items="supplierOptions"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      :rules="[v => !!v || $t('addPurchaseVue.validation.supplierRequired')]"
                      prepend-inner-icon="mdi-truck"
                      clearable
                      density="comfortable"
                      class="mb-0"
                    />

                    <v-expand-transition>
                      <div v-if="selectedSupplier === -1">
                        <v-divider class="my-4"></v-divider>
                        <p class="text-medium-emphasis mb-3">{{ $t('addPurchaseVue.newSupplierDetails') }}</p>
                        <v-text-field
                          v-model="newSupplierName"
                          :label="$t('addPurchaseVue.newSupplierNameLabel')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="selectedSupplier === -1 ? [v => !!v || $t('addPurchaseVue.validation.supplierNameRequired'), v => v.length >= 3 || $t('addPurchaseVue.validation.supplierNameMinLength')] : []"
                          prepend-inner-icon="mdi-account-plus"
                          density="comfortable"
                          class="mb-2"
                        />
                        <v-text-field
                          v-model="newSupplierAddress"
                          :label="$t('addPurchaseVue.newSupplierAddressLabel')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="selectedSupplier === -1 ? [v => !!v || $t('addPurchaseVue.validation.supplierAddressRequired'), v => v.length >= 5 || $t('addPurchaseVue.validation.supplierAddressMinLength')] : []"
                          prepend-inner-icon="mdi-map-marker"
                          density="comfortable"
                          class="mb-2"
                        />
                        <v-text-field
                          v-model="newSupplierContact"
                          :label="$t('addPurchaseVue.newSupplierContactLabel')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="selectedSupplier === -1 ? [v => !!v || $t('addPurchaseVue.validation.supplierContactRequired'), v => v.length >= 9 || $t('addPurchaseVue.validation.supplierContactMinLength')] : []"
                          prepend-inner-icon="mdi-phone"
                          density="comfortable"
                          class="mb-2"
                        />
                      </div>
                    </v-expand-transition>
                  </v-col>
                
                  <v-col cols="12">
                    <v-text-field
                      v-model.number="selling_price"
                      :label="$t('addPurchaseVue.thresholdSellingPriceLabel')"
                      type="number"
                      variant="outlined"
                      persistent-hint
                      :rules="[
                        v => (v !== null && v !== '') || $t('addPurchaseVue.validation.sellingPriceRequired'),
                        v => (v && v >= 1) || $t('addPurchaseVue.validation.sellingPriceMin'),
                        v => (v && unit_price !== null && v >= unit_price) || $t('addPurchaseVue.validation.sellingPriceComparison')
                      ]"
                      prepend-inner-icon="mdi-cash"
                      density="comfortable"
                      class="mb-0"
                    />
                  </v-col>
                </v-row>

                <v-row justify="center" class="mt-5">
                  <v-col cols="12" sm="6" md="2" class="text-center">
                    <v-btn type="submit" :loading="isSubmitting" color="primary" size="large" block>
                      {{ $t('addPurchaseVue.saveButton') }} <v-icon class="mx-2" right>mdi-content-save</v-icon>
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
import axios from '@/axios';
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n'; // Corrected import from useI1n to useI18n

const { t, locale } = useI18n(); // Initialize useI18n

// --- Interfaces ---
interface ProductItem {
  id: number;
  name: string;
  price: number; // Add 'price' to represent the default selling price
}

interface SupplierItem {
  id: number;
  name: string;
}

interface StockItem {
  id: number;
  product_id: number;
  cost_price: number;
  current_quantity: number; 
}

interface CostPriceOption {
  label: string;
  value: number | null; // Value will be the stock.id, or -1 for "Add New Cost Price", or null for initial state
}

// --- Reactive State ---
const quantity = ref<number | null>(null);
const selling_price = ref<number | null>(null);

const selectedProduct = ref<number | null>(null);
const selectedSupplier = ref<number | null>(null); // Can be -1 for 'Add New Supplier'

// Main state for the cost price dropdown selection - now null by default
const selectedCostPriceOption = ref<number | null>(null); 
// State for the manually entered unit price (only visible if selectedCostPriceOption is -1)
const manualUnitPrice = ref<number | null>(null);

const newSupplierName = ref('');
const newSupplierAddress = ref('');
const newSupplierContact = ref('');

const isSubmitting = ref(false);
const isDataLoaded = ref(false);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;

const productLists = ref<ProductItem[]>([]);
const supplierLists = ref<SupplierItem[]>([]);
const stockLists = ref<StockItem[]>([]);

const router = useRouter();
const purchaseForm = ref<HTMLFormElement | null>(null);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Use the current locale for date formatting
  return date.toLocaleDateString(locale.value, options);
});

const supplierOptions = computed(() => {
  return [{ id: -1, name: t('addPurchaseVue.addNewSupplierOption') }, ...supplierLists.value];
});

// Computed property for the actual unit_price value to be submitted
const unit_price = computed<number | null>(() => {
  if (selectedCostPriceOption.value === -1) {
    return manualUnitPrice.value;
  } else if (selectedCostPriceOption.value !== null) {
    const selectedStock = stockLists.value.find(stock => stock.id === selectedCostPriceOption.value);
    return selectedStock ? selectedStock.cost_price : null;
  }
  return null; // If no option selected
});

// Computed property for cost price options dropdown
const costPriceOptions = computed<CostPriceOption[]>(() => {
  if (selectedProduct.value === null) {
    // If no product is selected, only offer "Add New Cost Price"
    return [{ label: t('addPurchaseVue.addNewCostPriceOption'), value: -1 }];
  }

  const filteredStocks = stockLists.value.filter(
    stock => stock.product_id === selectedProduct.value 
  );

  const options: CostPriceOption[] = [];

  // Always add the "Add New Cost Price" option first
  options.push({ label: t('addPurchaseVue.addNewCostPriceOption'), value: -1 });

  // Add existing stock options if any
  if (filteredStocks.length > 0) {
    filteredStocks.forEach(stock => {
      options.push({
        label: t('addPurchaseVue.costPriceQtyLabel', { cost: stock.cost_price, quantity: stock.quantity }),
        value: stock.id // The value is the stock ID
      });
    });
  }

  return options;
});


// --- Watchers ---
// Clear new supplier fields if "Add New Supplier" is deselected
watch(selectedSupplier, (newVal) => {
  if (newVal !== -1) {
    newSupplierName.value = '';
    newSupplierAddress.value = '';
    newSupplierContact.value = '';
  }
});

// Watch selectedProduct to pre-fill selling_price AND reset cost price selection
watch(selectedProduct, (newProductId) => {
  // Reset fields related to product change
  selling_price.value = null;
  selectedCostPriceOption.value = null; // Reset to null for no default selection
  manualUnitPrice.value = null; // Clear manual input

  if (newProductId !== null) {
    const product = productLists.value.find(p => p.id === newProductId);
    if (product) {
      selling_price.value = product.price; // Pre-fill with the product's default selling price
    }
  }
});

// Watch selectedCostPriceOption to handle manualUnitPrice and validation
watch(selectedCostPriceOption, (newOptionValue) => {
  if (newOptionValue === -1) {
    manualUnitPrice.value = null; // Clear manual input when "Add New Cost Price" is selected
  } else {
    // If an existing stock is selected or no option is selected, clear manualUnitPrice
    manualUnitPrice.value = null;
  }
});


// --- Methods ---
/**
 * Displays a snackbar notification.
 * @param message The message to display.
 * @param color The color of the snackbar (e.g., 'success', 'error').
 */
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

/**
 * Fetches the list of products from the API.
 */
async function fetchProducts() {
  try {
    const token = sessionStorage.getItem('access_token');
    const response = await axios.get<{ products: ProductItem[] }>('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    productLists.value = response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    showSnackbar(t('commonAddproductVue.snackbar.errorFetchingProducts'), 'error');
  }
}

/**
 * Fetches the list of suppliers from the API.
 */
async function fetchSuppliers() {
  try {
    const token = sessionStorage.getItem('access_token');
    const response = await axios.get<{ suppliers: SupplierItem[] }>('/api/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    supplierLists.value = response.data.suppliers;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    showSnackbar(t('commonAddproductVue.snackbar.errorFetchingSuppliers'), 'error');
  }
}

/**
 * Fetches all stock data from the API.
 * This is needed to populate the cost price options dropdown.
 */
async function fetchStocks() {
  try {
    const token = sessionStorage.getItem('access_token');
    const response = await axios.get<{ stocks: StockItem[] }>('/api/stocks', { 
        headers: { 'Authorization': `Bearer ${token}` }
    });
    stockLists.value = response.data.stocks;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    showSnackbar(t('commonAddproductVue.snackbar.errorFetchingStocks'), 'error');
  }
}

/**
 * Creates a new supplier.
 * @returns The ID of the newly created supplier, or null if creation failed.
*/
async function createNewSupplier(): Promise<number | null> {
  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('name', newSupplierName.value);
    formData.append('address', newSupplierAddress.value);
    formData.append('contact', newSupplierContact.value);

    const token = sessionStorage.getItem('access_token');
    const response = await axios.post<{ success?: string; error?: string; supplier?: { id: number }; errors?: Record<string, string[]> }>('/api/suppliers/store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.data.success && response.data.supplier) {
      showSnackbar(t('addPurchaseVue.snackbar.newSupplierAddedSuccess'), 'success');
      await fetchSuppliers(); // Refresh the supplier list to include the new supplier
      return response.data.supplier.id;
    } else {
      showSnackbar(response.data.error || t('addPurchaseVue.snackbar.failedToAddNewSupplier'), 'error');
      return null;
    }
  } catch (error: any) {
    console.error('Error adding new supplier:', error);
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
      showSnackbar(t('commonAddproductVue.snackbar.validationError', { errors: errorMessages }), 'error');
    } else if (error.response?.data?.message) {
      showSnackbar(t('commonAddproductVue.snackbar.generalErrorMessage', { message: error.response.data.message }), 'error');
    } else {
      showSnackbar(t('addPurchaseVue.snackbar.unexpectedErrorAddingSupplier'), 'error');
    }
    return null;
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Handles the submission of the purchase transaction form.
 * Performs client-side validation and sends data to the backend.
 */
const submitPurchase = async () => {
  if (!purchaseForm.value) return;
  const { valid } = await (purchaseForm.value as any).validate();

  if (!valid) {
    showSnackbar(t('commonAddproductVue.snackbar.formErrors'), 'error');
    return;
  }

  // Validate unit_price (computed property) based on the selected option
  if (unit_price.value === null || unit_price.value === '') {
    showSnackbar(t('addPurchaseVue.validation.unitPriceRequiredSelection'), 'error');
    return;
  }

  isSubmitting.value = true;
  let finalSupplierId = selectedSupplier.value;

  // If "Add New Supplier" is selected, create the supplier first
  if (selectedSupplier.value === -1) {
    const newId = await createNewSupplier();
    if (newId === null) {
      isSubmitting.value = false;
      return;
    }
    finalSupplierId = newId;
  }

  try {
    const formData = new FormData();
    formData.append('product_id', selectedProduct.value);
    formData.append('supplier_id', finalSupplierId); // Use finalSupplierId
    formData.append('unit_price', unit_price.value); // unit_price is now a computed property

    // Only include stock_id if an existing stock was selected (not -1 for new cost price)
    if (selectedCostPriceOption.value !== null && selectedCostPriceOption.value !== -1) {
        formData.append('stock_id', String(selectedCostPriceOption.value));
    }
    
    formData.append('quantity', quantity.value);
    formData.append('selling_price', selling_price.value);

    const token = sessionStorage.getItem('access_token');
    const response = await axios.post<{ success?: string; message?: string; error?: string; errors?: Record<string, string[]> }>('/api/purchases/store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.data.success) {
      if (response.data.status = 201){
          showSnackbar(t('addPurchaseVue.snackbar.successDoingPurchaseAddedStock'), 'success');
       
      } else {
        showSnackbar(t('addPurchaseVue.snackbar.successDoingPurchaseNewStock'), 'success');
        
      }
      // Reset form fields
      selectedProduct.value = null;
      selectedSupplier.value = null;
      selectedCostPriceOption.value = null; // Reset to null for no default selection
      manualUnitPrice.value = null; // Clear manual input
      selling_price.value = null;
      quantity.value = null;
      newSupplierName.value = '';
      newSupplierAddress.value = '';
      newSupplierContact.value = '';
      (purchaseForm.value as any).resetValidation();
      

      await fetchStocks(); // Re-fetch stocks to reflect changes
    } else {
      showSnackbar(response.data.error || response.data.message || t('addPurchaseVue.snackbar.errorDoingPurchase'), 'error');
    }
  } catch (error: any) {
    console.error('Error occurred doing purchase:', error);
    if (error.response?.data) {
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(t('commonAddproductVue.snackbar.validationError', { errors: errorMessages }), 'error');
      } else if (error.response.data.message) {
        showSnackbar(t('commonAddproductVue.snackbar.generalErrorMessage', { message: error.response.data.message }), 'error');
      } else {
        showSnackbar(t('commonAddproductVue.snackbar.apiError'), 'error');
      }
    } else {
      showSnackbar(t('commonAddproductVue.snackbar.networkError'), 'error');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// --- Lifecycle Hook ---
onMounted(async () => {
  isDataLoaded.value = false; // Set to false to show overlay immediately
  await Promise.all([
    fetchProducts(),
    fetchSuppliers(),
    fetchStocks(),
  ]);
  isDataLoaded.value = true;
});
</script>

<style scoped>
/* No specific styles needed here, Vuetify's classes handle the layout */
</style>
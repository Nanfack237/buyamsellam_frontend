<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-5 pb-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6">
                {{ $t('saleTransactionsVue.titleCheckReceipt') }}
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-row justify="end" class="d-flex px-5 pt-2">
            <v-col cols="12" sm="6" md="4" lg="3">
              <v-text-field
                v-model="filters.receiptCode"
                density="compact"
                :label="$t('saleTransactionsVue.searchByReceiptCode')"
                prepend-inner-icon="mdi-receipt"
                variant="solo-filled"
                flat
                hide-details
                single-line
                clearable
                @keyup.enter="searchSalesByReceiptCode"
                @click:clear="clearReceiptCodeSearch"
              >
                <template v-slot:append-inner>
                  <v-btn
                    icon="mdi-magnify"
                    variant="text"
                    size="small"
                    @click="searchSalesByReceiptCode"
                  ></v-btn>
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row class="px-7" v-if="displaySalesTable">
            <v-card elevation="4" width="3000" class="my-2 py-2 px-5">
              <p class="text-high-emphasis py-2">
                <b>{{ selectedSales.length || filteredSale.length }}</b>
                {{ (selectedSales?.length ?? 0) === 1 ? t('saleTransactionsVue.transactionSingular') : t('saleTransactionsVue.transactionPlural') }}
              </p>

              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredSale"
                :headers="headers"
                item-value="id"
                class="centered-headers"
                show-select
                v-model="selectedSales"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template v-slot:item.costPrice="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.costPrice) }}
                </template>

                <template v-slot:item.selling_price="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.selling_price) }}
                </template>

                <template v-slot:item.total_price="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.total_price) }}
                </template>
              </v-data-table>
            </v-card>
            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" :title="$t('saleTransactionsVue.buttons.excel')" @click="downloadExcel" class="mb-4">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ $t('saleTransactionsVue.buttons.excel') }}
                </v-btn>

                <v-btn color="primary" :title="$t('saleTransactionsVue.buttons.receipt')" @click="printReceipt" class="mb-4 mx-2">
                  <v-icon>mdi-receipt-text-outline</v-icon> {{ $t('saleTransactionsVue.buttons.receipt') }}
                </v-btn>

                <v-btn color="secondary" :title="$t('saleTransactionsVue.buttons.print')" @click="printSelectedSale" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ $t('saleTransactionsVue.buttons.print') }}
                </v-btn>

                <div ref="printSection" class="d-none">
                  <div class="report-container">
                    <div class="report-header-section">
                      <template v-if="storeLogoUrl && storeLogoUrl !== 'https://via.placeholder.com/60x60?text=No+Image'">
                        <img :src="storeLogoUrl" alt="Store Logo" class="receipt-logo">
                      </template>
                      <div class="store-info">
                        <h2 class="report-store-name">{{ storeName }}</h2>
                        <p class="report-store-contact-info">{{ storeLocation }} | +237 {{ storeContact }}</p>
                      </div>
                    </div>

                    <div class="report-title-section">
                      <h3 class="report-title">{{ $t('saleTransactionsVue.printReport.checkReceiptreportTitle') }}</h3>
                      <p class="report-date">{{ $t('saleTransactionsVue.receipt.date') }}: {{ new Date().toLocaleDateString() }}</p>
                    </div>

                    <div class="report-summary">
                      <p>
                        {{ t('saleTransactionsVue.printReport.totalEntries') }}: <b>{{ selectedSales.length }}</b> {{ selectedSales.length > 1 ? t('saleTransactionsVue.transactionPlural') : t('saleTransactionsVue.transactionSingular') }}
                      </p>
                    </div>

                    <div class="report-table-section">
                      <table class="report-table">
                        <thead>
                          <tr>
                            <th>{{ $t('saleTransactionsVue.printReport.tableHeaders.sn') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.product') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.costPrice') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.sellingPrice') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.quantity') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.total') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.customer') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.cashier') }}</th>
                            <th class="text-left">{{ $t('saleTransactionsVue.printReport.tableHeaders.date') }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(s, index) in selectedSales" :key="s.id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ s.productName }}</td>
                            <td>{{ formatNumberWithThousandsSeparator(s.costPrice) }}</td>
                            <td>{{ formatNumberWithThousandsSeparator(s.selling_price) }}</td>
                            <td>{{ s.quantity }}</td>
                            <td>{{ formatNumberWithThousandsSeparator(s.total_price) }}</td>
                            <td>{{ s.customer_name }}</td>
                            <td>{{ s.cashierName }}</td>
                            <td>{{ s.date }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="report-footer-section">
                      <p class="powered-by">{{ $t('saleTransactionsVue.printReport.poweredBy') }}</p>
                    </div>
                  </div>
                </div>

                <div ref="printSectionReceipt" class="d-none">
                  <div class="receipt-container">
                    <div class="header-section">
                      <template v-if="storeLogoUrl && storeLogoUrl !== 'https://via.placeholder.com/60x60?text=No+Image'">
                        <img :src="storeLogoUrl" alt="Store Logo" class="receipt-logo">
                      </template>
                      <h2 class="store-name">{{ storeName }}</h2>
                      <p class="store-contact-info">{{ storeLocation }} | {{ storeContact }}</p>
                    </div>

                    <div class="receipt-title-section">
                      <h3 class="receipt-title">{{ $t('saleTransactionsVue.receipt.customerReceiptTitle') }}</h3>
                      <p class="receipt-id">{{ $t('saleTransactionsVue.receipt.receiptId') }} {{ getReceiptId() }}</p>
                    </div>

                    <div class="info-section">
                      <p><strong>{{ $t('saleTransactionsVue.receipt.customer') }} :</strong> {{ customerName }}</p>
                      <p><strong>{{ $t('saleTransactionsVue.receipt.cashier') }} :</strong> {{ receiptCashierName }}</p> 
                      <p><strong>{{ $t('saleTransactionsVue.receipt.date') }}: </strong>{{ datePrint }}</p>
                    </div>

                    <div class="items-table-section">
                      <table density="compact" class="receipt-table">
                        <thead>
                          <tr>
                            <th>{{ $t('saleTransactionsVue.receipt.tableHeaders.sn') }}</th>
                            <th>{{ $t('saleTransactionsVue.receipt.tableHeaders.product') }}</th>
                            <th>{{ $t('saleTransactionsVue.receipt.tableHeaders.quantity') }}</th>
                            <th>{{ $t('saleTransactionsVue.receipt.tableHeaders.unitPrice') }}</th>
                            <th>{{ $t('saleTransactionsVue.receipt.tableHeaders.total') }}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(s, index) in selectedSales" :key="s.id">
                            <td>{{ index + 1 }}</td>
                            <td>{{ s.productName }}</td>
                            <td>{{ s.quantity }}</td>
                            <td>{{ formatNumberWithThousandsSeparator(s.selling_price) }}</td>
                            <td>{{ formatNumberWithThousandsSeparator(s.total_price) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="total-section">
                      <p>{{ $t('saleTransactionsVue.receipt.grandTotal') }}: <strong>{{ formatNumberWithThousandsSeparator(grandTotal) }} FCFA</strong></p>

                      <div class="footer-section">
                      <p>{{ $t('saleTransactionsVue.receipt.thankYouMessage') }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-row>
          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>
          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent>
          <v-progress-circular color="primary" size="65" indeterminate></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ t('loading') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import SideBarComponent from '@/components/cashier/CashierSideBarComponent.vue';
import HeaderComponent from '@/components/cashier/CashierHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader();
const router = useRouter();
const { t, locale } = useI18n();

// Adjust this backend URL if your Laravel API is hosted elsewhere
const backendUrl = 'http://localhost:8000';

// --- Helper Function for Logo URL ---
const getLogoUrl = (logoPath: string | undefined | null) => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image'; // This is the fallback
};


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


// --- Reactive State ---
const sales = ref<any[]>([]); // All sales data from API
const products = ref<any[]>([]);
const stocks = ref<any[]>([]);
const users = ref<any[]>([]); // This array will hold user data including names
const selectedSales = ref<any[]>([]); // Sales selected in the table (for print/excel)

// Removed userName ref as it's no longer needed for display on receipt or table
// const userName = ref(''); // No longer used for cashier name display

const storeName = ref('');
const storeLocation = ref('');
const storeContact = ref('');
const storeLogoUrl = ref<string>('');

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;

const filters = ref({
  receiptCode: '', // Only this filter will be initially visible/active
});

// Controls visibility of the main sales table and generic filters
const hasReceiptCodeSearchActive = ref(false); // True when a search has been initiated

const printSection = ref<HTMLElement | null>(null);
const printSectionReceipt = ref<HTMLElement | null>(null);

const isDataLoaded = ref(false);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

const grandTotal = computed(() => {
  return selectedSales.value.reduce((sum, s) => sum + s.total_price, 0);
});

const customerName = computed(() => {
  if (selectedSales.value.length > 0) {
    const uniqueCustomers = new Set(selectedSales.value.map(s => s.customer_name));
    return uniqueCustomers.size === 1 ? selectedSales.value[0].customer_name : t('saleTransactionsVue.tableCustomerMultiple');
  }
  return t('saleTransactionsVue.tableCustomerN_A');
});

// New computed property for the cashier name on the receipt
const receiptCashierName = computed(() => {
  if (selectedSales.value.length > 0) {
    // If multiple sales are selected, but they all have the same cashier, display that name
    const uniqueCashiers = new Set(selectedSales.value.map(s => s.cashierName));
    return uniqueCashiers.size === 1 ? selectedSales.value[0].cashierName : t('saleTransactionsVue.tableCashierMultiple');
  }
  // If no sales are selected (e.g., initial load or search cleared), display N/A
  return t('saleTransactionsVue.tableCustomerN_A');
});


const headers = computed(() => [
  { title: t('saleTransactionsVue.tableHeaders.product'), value: 'productName', align: 'center' },
  { title: t('saleTransactionsVue.tableHeaders.costPrice'), value: 'costPrice', align: 'center' },
  { title: t('saleTransactionsVue.tableHeaders.sellingPrice'), value: 'selling_price', align: 'center' },
  { title: t('saleTransactionsVue.tableHeaders.quantity'), value: 'quantity', align: 'center' },
  { title: t('saleTransactionsVue.tableHeaders.total'), value: 'total_price', align: 'center' },
  { title: t('saleTransactionsVue.tableHeaders.customer'), value: 'customer_name', align: 'center' },
  { title: t('saleTransactionsVue.tableHeaders.method'), value: 'payment_method', align: 'center' },
  { title: t('saleTransactionsVue.tableHeaders.cashier'), value: 'cashierName', align: 'center' }, // This uses the derived property
  { title: t('saleTransactionsVue.tableHeaders.date'), value: 'date', align: 'center' },
]);

// The main data source for the table, based on the receipt code filter
const filteredSale = computed(() => {
  if (filters.value.receiptCode && hasReceiptCodeSearchActive.value) {
    return sales.value.filter((sale: any) =>
      sale.receipt_code && sale.receipt_code.toLowerCase().includes(filters.value.receiptCode.toLowerCase())
    );
  }
  return []; // Return an empty array if no active search or no receipt code
});

// Controls when the sales table is displayed
const displaySalesTable = computed(() => {
  return hasReceiptCodeSearchActive.value && filters.value.receiptCode !== '';
});


// --- Methods ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

async function fetchProducts() {
  try {
    const res = await axios.get('/api/products', { headers: getAuthHeaders() });
    products.value = res.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadProducts'), 'error');
  }
}

async function fetchStocks() {
  try {
    const res = await axios.get('/api/stocks', { headers: getAuthHeaders() });
    stocks.value = res.data.stocks;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadStock'), 'error');
  }
}

async function fetchUsers() {
  try {
    const res = await axios.get('/api/users', { headers: getAuthHeaders() });
    users.value = res.data.users; // Ensure users data is stored
  } catch (error) {
    console.error('Error fetching users:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadUsers'), 'error');
  }
}

// Removed fetchUser() as it's no longer needed for getting the *connected* user's name for receipts
// async function fetchUser() {
//   try {
//     const response = await axios.get('/api/me', { headers: getAuthHeaders() });
//     userName.value = response.data.user.name;
//   } catch (error) {
//     console.error('Error fetching user data:', error);
//     showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadUserInformation'), 'error');
//   }
// }

async function fetchSales() {
  try {
    const response = await axios.get('/api/sales', { headers: getAuthHeaders() });
    sales.value = response.data.sales.map((sale: any) => {
      const prod = products.value.find(p => p.id === sale.product_id);
      const sto = stocks.value.find(s => s.product_id === sale.product_id);
      // Find the cashier name using sale.user_id from the fetched users array
      const cashier = users.value.find(u => u.id === sale.user_id);

      return {
        ...sale,
        productName: prod ? prod.name : t('saleTransactionsVue.tableCustomerN_A'),
        costPrice: sto ? sto.cost_price : t('saleTransactionsVue.tableCustomerN_A'),
        cashierName: cashier ? cashier.name : t('saleTransactionsVue.tableCustomerN_A'), // Assign derived cashier name
      };
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadSales'), 'error');
  } finally {
    isDataLoaded.value = true;
  }
}

async function fetchStore() {
  
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
    storeLogoUrl.value = getLogoUrl(response.data.store.logo);
  } catch (error) {
    console.error('Error fetching store details:', error);
    // showSnackbar('Error fetching store details', 'error'); // Only show if critical
  }
}


function getReceiptId(): string {
  if (selectedSales.value.length > 0 && selectedSales.value[0].receipt_code) {
    return selectedSales.value[0].receipt_code;
  }
  // If no sales are selected but a search was active, use the search term
  if (hasReceiptCodeSearchActive.value && filters.value.receiptCode) {
    return filters.value.receiptCode;
  }
  return t('saleTransactionsVue.tableCustomerN_A');
}

function formatNumberWithThousandsSeparator(value: number | string): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value).toLocaleString('en-US');
  }
  return String(value);
}

// Function to handle search by receipt code
function searchSalesByReceiptCode() {
  if (filters.value.receiptCode.trim() !== '') {
    hasReceiptCodeSearchActive.value = true;
    selectedSales.value = []; // Clear any previous selections
    nextTick(() => { // Ensure filteredSale updates before checking length
      if (filteredSale.value.length === 0) {
        showSnackbar(t('saleTransactionsVue.snackbar.noSaleFoundForReceiptCode'), 'info');
      } else {
        selectedSales.value = [...filteredSale.value]; // Auto-select all results
      }
    });
  } else {
    // If the search field is empty, clear the search and hide the table
    clearReceiptCodeSearch();
  }
}

// Function to clear the receipt code search
function clearReceiptCodeSearch() {
  filters.value.receiptCode = '';
  hasReceiptCodeSearchActive.value = false;
  selectedSales.value = []; // Clear selections when clearing search
}

function printReceipt() {
  if (selectedSales.value.length === 0) {
    showSnackbar(t('saleTransactionsVue.snackbar.printSelectOneItemReceipt'), 'error');
    return;
  }

  const uniqueCustomers = new Set(selectedSales.value.map(s => s.customer_name));
  if (uniqueCustomers.size > 1) {
    showSnackbar(t('saleTransactionsVue.snackbar.printMultipleCustomersReceipt'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSectionReceipt.value) {
      console.warn('printSectionReceipt is not ready for printing.');
      showSnackbar(t('saleTransactionsVue.snackbar.printFunctionUnavailable'), 'error');
      return;
    }

    const printContent = printSectionReceipt.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>customer_receipt_${date.replace(/\//g, '-')}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; font-size: 14px;}
              .receipt-container { width: 300px; margin: 0 auto; padding: 15px; border: 1px dashed #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
              .header-section { text-align: center; margin-bottom: 15px; }
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
              .store-name { font-size: 24px; margin-bottom: 5px; color: black; font-weight: bold; }
              .store-contact-info { font-size: 12px; color: #777; margin-top: 0; line-height: 1.2; }

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
      showSnackbar(t('saleTransactionsVue.snackbar.popupsBlocked'), 'error');
    }
  });
}

function printSelectedSale() {
  if (selectedSales.value.length === 0) {
    showSnackbar(t('saleTransactionsVue.snackbar.printSelectOneItemReport'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSection.value) {
      console.warn('printSection is not ready for printing.');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString().split('T')[0]
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>sale_report_${date}</title>
             <style>
             body { font-family: Arial, sans-serif; padding: 10px; }
             .report-container { width: 100%; margin: 0 auto; padding: 0px; }

             .report-header-section {
               text-align: center;
               margin-bottom: 10px;
               display: flex;
               align-items: center;
               justify-content: center;
               flex-wrap: wrap;
             }
             .report-logo {
               max-width: 100px;
               max-height: 80px;
               margin-right: 15px;
               margin-bottom: 10px;
               display: block !important;
               visibility: visible !important;
               opacity: 1 !important;
               -webkit-print-color-adjust: exact !important;
               print-color-adjust: exact !important;
               filter: none !important;
             }
             .store-info {
               display: flex;
               flex-direction: column;
               align-items: flex-start;
             }
             .report-store-name {
               font-size: 28px;
               margin-bottom: 5px;
               color: #333;
               font-weight: bold;
               text-align: left;
             }
             .report-store-contact-info {
               font-size: 14px;
               color: #777;
               margin-top: 0;
               line-height: 1.5;
               text-align: left;
             }

             .report-title-section { text-align: center; margin: 15px 0 10px 0; border-top: 1px solid #ddd; padding-top: 10px;}
             .report-title { font-size: 22px; margin-bottom: 10px; color: #444; }
             .report-date { font-size: 14px; color: #888; }

             .report-summary { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #eee; font-size: 14px; }
             .report-summary strong { color: #000; }

             .report-table-section { margin-bottom: 30px; margin-top: 30px; }
             .report-table { width: 100%; border-collapse: collapse; }
             .report-table th, .report-table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px;}
             .report-table th { background-color: #f5f5f5; font-weight: bold; color: #333;}
             .report-table tbody tr:nth-child(even) { background-color: #f9f9f9; }

             .report-summary { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #eee; font-size: 14px; }
             .report-summary strong { color: #000; }

             .report-table-section { margin-bottom: 30px; margin-top: 30px; }
             .report-table { width: 100%; border-collapse: collapse; }
             .report-table th, .report-table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px;}
             .report-table th { background-color: #f5f5f5; font-weight: bold; color: #333;}
             .report-table tbody tr:nth-child(even) { background-color: #f9f9f9; }

             .report-footer-section {
               margin-top: 10px;
               position: fixed;
               bottom: 0;
               left: 0;
               width: 100%;
               padding: 15px;
               text-align: center;
               z-index: 1000;
               font-size: 8px;
               color: #666;
             }
             .powered-by { font-style: italic; margin-top: 10px; }


             .watermark {
                 position: absolute;
                 top: 50%;
                 left: 50%;
                 transform: translate(-50%, -50%) rotate(-45deg);
                 font-size: 80px;
                 color: rgba(0, 0, 0, 0.1);
                 pointer-events: none;
                 user-select: none;
                 white-space: nowrap;
                 z-index: -8;
                 -webkit-print-color-adjust: exact !important;
                 print-color-adjust: exact !important;
             }
           </style>
          </head>
          <body>
            <div class="watermark">${ storeName.value}</div>
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
      showSnackbar(t('saleTransactionsVue.snackbar.popupsBlocked'), 'error');
    }
  });
}

function downloadExcel() {
  if (selectedSales.value.length === 0) {
    showSnackbar(t('saleTransactionsVue.snackbar.noSaleSelectedForExport'), 'error');
    return;
  }

  const headers = [
    t('saleTransactionsVue.printReport.tableHeaders.sn'),
    t('saleTransactionsVue.printReport.tableHeaders.product'),
    t('saleTransactionsVue.printReport.tableHeaders.costPrice'),
    t('saleTransactionsVue.printReport.tableHeaders.sellingPrice'),
    t('saleTransactionsVue.printReport.tableHeaders.quantity'),
    t('saleTransactionsVue.printReport.tableHeaders.total'),
    t('saleTransactionsVue.printReport.tableHeaders.customer'),
    t('saleTransactionsVue.printReport.tableHeaders.cashier'),
    t('saleTransactionsVue.printReport.tableHeaders.date')
  ];

  const rows = selectedSales.value.map((sale, index) => [
    index + 1, // SN
    sale.productName,
    formatNumberWithThousandsSeparator(sale.costPrice),
    formatNumberWithThousandsSeparator(sale.selling_price),
    sale.quantity,
    formatNumberWithThousandsSeparator(sale.total_price),
    sale.customer_name,
    sale.cashierName,
    sale.date
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => {
      let value = String(field);
      if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('saleTransactionsVue.snackbar.exportSuccess'), 'success');
  } else {
    showSnackbar(t('saleTransactionsVue.snackbar.browserDownloadNotSupported'), 'error');
  }
}

// No need for a watch on other filters, as they are now removed.
// We only watch the receiptCode to react to clearing it.
watch(() => filters.value.receiptCode, (newValue) => {
  if (newValue === '') { // If the receipt code input is cleared by the user
    clearReceiptCodeSearch(); // Reset the state
  }
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  isDataLoaded.value = false;
  startLoading();
  try {
    await Promise.all([
      fetchProducts(),
      fetchStocks(),
      fetchUsers(), // Make sure users are fetched BEFORE sales
      fetchStore(),
      // fetchUser() is removed as per requirements, no need to get the "connected" user's name
    ]);
    await fetchSales(); // This will now correctly map cashier names based on sale.user_id
  } catch (error) {
    console.error('Error during initial data fetch:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadAllData'), 'error');
  } finally {
    stopLoading();
  }
});
</script>

<style scoped>
/* You can keep your existing styles here */
</style>
<template>
  <v-app>
    <SideBarComponent />
    <HeaderComponent :products="products" /> <v-main class="main-content">
      <v-container fluid class="page-wrapper">
        <v-row>
          <v-col cols="12">
            <h1 class="page-title">{{ t('saleTransactionsVue.pageTitle') }}</h1>
          </v-col>
        </v-row>

        <v-row class="mb-4">
          <v-col cols="12" md="6">
            <v-card class="elevation-2 pa-4">
              <v-card-title class="headline">{{ t('saleTransactionsVue.searchFilterTitle') }}</v-card-title>
              <v-card-text>
                <v-row align="center">
                  <v-col cols="12" sm="8">
                    <v-text-field
                      v-model="filters.receiptCode"
                      :label="t('saleTransactionsVue.receiptCodePlaceholder')"
                      prepend-inner-icon="mdi-receipt"
                      variant="outlined"
                      clearable
                      @keyup.enter="searchSalesByReceiptCode"
                      @click:clear="clearReceiptCodeSearch"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-btn
                      color="primary"
                      block
                      @click="searchSalesByReceiptCode"
                      :disabled="!filters.receiptCode.trim()"
                    >
                      <v-icon left>mdi-magnify</v-icon>
                      {{ t('saleTransactionsVue.searchButton') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" v-if="displaySalesTable">
            <v-card class="elevation-2 pa-4">
              <v-card-title class="headline">{{ t('saleTransactionsVue.actionsTitle') }}</v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="teal"
                      block
                      @click="printReceipt"
                      :disabled="selectedSales.length === 0"
                    >
                      <v-icon left>mdi-printer</v-icon>
                      {{ t('saleTransactionsVue.printReceiptButton') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-btn
                      color="orange"
                      block
                      @click="printSelectedSale"
                      :disabled="selectedSales.length === 0"
                    >
                      <v-icon left>mdi-file-pdf-box</v-icon>
                      {{ t('saleTransactionsVue.printReportButton') }}
                    </v-btn>
                  </v-col>
                  <v-col cols="12">
                    <v-btn
                      color="green"
                      block
                      @click="downloadExcel"
                      :disabled="selectedSales.length === 0"
                    >
                      <v-icon left>mdi-file-excel</v-icon>
                      {{ t('saleTransactionsVue.downloadExcelButton') }}
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row v-if="displaySalesTable">
          <v-col cols="12">
            <v-card class="elevation-2">
              <v-card-title class="d-flex align-center pe-2">
                <v-icon icon="mdi-receipt-text"></v-icon> &nbsp;
                {{ t('saleTransactionsVue.saleTransactionsTitle') }}
              </v-card-title>

              <v-divider></v-divider>

              <v-data-table
                v-model="selectedSales"
                :headers="headers"
                :items="filteredSale"
                :loading="!isDataLoaded"
                item-value="id"
                show-select
                class="elevation-1"
                :no-data-text="t('saleTransactionsVue.tableNoData')"
              >
                <template v-slot:item.total_price="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.total_price) }} CFA
                </template>
                <template v-slot:item.costPrice="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.costPrice) }} CFA
                </template>
                <template v-slot:item.selling_price="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.selling_price) }} CFA
                </template>
              </v-data-table>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout">
        {{ snackbarMessage }}
      </v-snackbar>

      <div ref="printSection" style="display: none;">
        <div class="report-container">
          <div class="report-header-section">
            <img :src="storeLogoUrl" alt="Store Logo" class="report-logo" v-if="storeLogoUrl" />
            <div class="store-info">
              <h1 class="report-store-name">{{ storeName }}</h1>
              <p class="report-store-contact-info">{{ storeLocation }} | {{ storeContact }}</p>
            </div>
          </div>
          <div class="report-title-section">
            <h2 class="report-title">{{ t('saleTransactionsVue.printReport.reportTitle') }}</h2>
            <p class="report-date">{{ formattedDate }}</p>
          </div>

          <div class="report-summary">
            <p><strong>{{ t('saleTransactionsVue.printReport.receiptID') }}:</strong> {{ getReceiptId() }}</p>
            <p><strong>{{ t('saleTransactionsVue.printReport.customerName') }}:</strong> {{ customerName }}</p>
            <p><strong>{{ t('saleTransactionsVue.printReport.cashierName') }}:</strong> {{ receiptCashierName }}</p>
            <p><strong>{{ t('saleTransactionsVue.printReport.totalSales') }}:</strong> {{ formatNumberWithThousandsSeparator(grandTotal) }} CFA</p>
          </div>

          <div class="report-table-section">
            <table class="report-table">
              <thead>
                <tr>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.sn') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.product') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.costPrice') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.sellingPrice') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.quantity') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.total') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.customer') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.cashier') }}</th>
                  <th>{{ t('saleTransactionsVue.printReport.tableHeaders.date') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sale, index) in selectedSales" :key="sale.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ sale.productName }}</td>
                  <td>{{ formatNumberWithThousandsSeparator(sale.costPrice) }} CFA</td>
                  <td>{{ formatNumberWithThousandsSeparator(sale.selling_price) }} CFA</td>
                  <td>{{ sale.quantity }}</td>
                  <td>{{ formatNumberWithThousandsSeparator(sale.total_price) }} CFA</td>
                  <td>{{ sale.customer_name }}</td>
                  <td>{{ sale.cashierName }}</td>
                  <td>{{ sale.date }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="report-footer-section">
            <p>{{ t('saleTransactionsVue.printReport.thankYou') }}</p>
            <p class="powered-by">Powered by POS System - {{ datePrint }}</p>
          </div>
        </div>
      </div>

      <div ref="printSectionReceipt" style="display: none;">
        <div class="receipt-container">
          <div class="header-section">
            <img :src="storeLogoUrl" alt="Store Logo" class="receipt-logo" v-if="storeLogoUrl" />
            <h1 class="store-name">{{ storeName }}</h1>
            <p class="store-contact-info">{{ storeLocation }}</p>
            <p class="store-contact-info">{{ storeContact }}</p>
          </div>

          <div class="receipt-title-section">
            <h2 class="receipt-title">{{ t('saleTransactionsVue.printReceipt.receiptTitle') }}</h2>
            <p class="receipt-id">ID: {{ getReceiptId() }}</p>
          </div>

          <div class="info-section">
            <p><strong>{{ t('saleTransactionsVue.printReceipt.date') }}:</strong> {{ formattedDate }}</p>
            <p><strong>{{ t('saleTransactionsVue.printReceipt.customer') }}:</strong> {{ customerName }}</p>
            <p><strong>{{ t('saleTransactionsVue.printReceipt.cashier') }}:</strong> {{ receiptCashierName }}</p>
          </div>

          <div class="items-table-section">
            <table class="receipt-table">
              <thead>
                <tr>
                  <th>{{ t('saleTransactionsVue.printReceipt.tableHeaders.product') }}</th>
                  <th>{{ t('saleTransactionsVue.printReceipt.tableHeaders.qty') }}</th>
                  <th>{{ t('saleTransactionsVue.printReceipt.tableHeaders.price') }}</th>
                  <th>{{ t('saleTransactionsVue.printReceipt.tableHeaders.total') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sale in selectedSales" :key="sale.id">
                  <td>{{ sale.productName }}</td>
                  <td>{{ sale.quantity }}</td>
                  <td>{{ formatNumberWithThousandsSeparator(sale.selling_price) }}</td>
                  <td>{{ formatNumberWithThousandsSeparator(sale.total_price) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="total-section">
            <p>{{ t('saleTransactionsVue.printReceipt.grandTotal') }}: {{ formatNumberWithThousandsSeparator(grandTotal) }} CFA</p>
          </div>

          <div class="footer-section">
            <p>{{ t('saleTransactionsVue.printReceipt.thankYou') }}</p>
            <p class="powered-by">Powered by POS System - {{ datePrint }}</p>
          </div>
        </div>
      </div>
    </v-main>

    <AppFooter />
  </v-app>
</template>

<script lang="ts" setup>
import { ref, nextTick, onMounted, computed, watch } from 'vue';

import axios from '@/axios';
import { useLoader } from '@/useLoader';
import SideBarComponent from '@/components/cashier/CashierSideBarComponent.vue';
import HeaderComponent from '@/components/cashier/CashierHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';


// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader();
// Removed `router` if not directly used, keeping if there's a future navigation intent
// const router = useRouter(); 
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
  { title: t('saleTransactionsVue.tableHeaders.product'), value: 'productName', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.costPrice'), value: 'costPrice', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.sellingPrice'), value: 'selling_price', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.quantity'), value: 'quantity', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.total'), value: 'total_price', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.customer'), value: 'customer_name', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.method'), value: 'payment_method', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.cashier'), value: 'cashierName', align: 'center' as const }, // This uses the derived property
  { title: t('saleTransactionsVue.tableHeaders.date'), value: 'date', align: 'center' as const },
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
/* Scoped styles for this component */

.main-content {
  padding-top: 64px; /* Adjust based on your header's height */
  padding-bottom: 64px; /* Adjust based on your footer's height */
  background-color: #f5f5f5; /* Light grey background */
}

.page-wrapper {
  max-width: 1200px; /* Limit content width */
  margin: 0 auto; /* Center the content */
  padding: 24px;
}

.page-title {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
}

.v-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.v-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #555;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 15px;
}

.v-text-field {
  margin-bottom: 15px;
}

.v-btn {
  font-weight: 500;
  text-transform: capitalize;
  letter-spacing: normal;
  border-radius: 5px;
}

/* Data table specific styles */
.v-data-table {
  background-color: #fff;
  border-radius: 8px;
}

.v-data-table th {
  background-color: #e0e0e0;
  font-weight: bold;
  color: #333;
  font-size: 0.95rem;
}

.v-data-table td {
  font-size: 0.9rem;
  color: #444;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .page-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .page-title {
    font-size: 1.8rem;
  }

  .v-card-title {
    font-size: 1.3rem;
  }

  .v-btn {
    width: 100%;
    margin-bottom: 10px;
  }
}

/* Print Styles (remain hidden on screen) */
/* These styles are applied when the print function is triggered */
/* Ensure these match the styles defined in the print functions for consistency */
</style>
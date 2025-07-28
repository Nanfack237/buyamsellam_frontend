<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent :products="products" :store-id-prop="storeId" />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-5 pb-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6">
                {{ $t('saleTransactionsVue.title') }}
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-row class="d-flex px-5 pt-2">
            <v-col cols="12" md="4" sm="4">
              <v-text-field
                v-model="filters.product"
                density="compact"
                :label="$t('saleTransactionsVue.searchByProduct')"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
                clearable
              />
            </v-col>

            <v-col cols="12" md="4" sm="4">
              <v-text-field
                v-model="filters.customer"
                density="compact"
                :label="$t('saleTransactionsVue.searchByCustomer')"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
                clearable
              />
            </v-col>

            <v-col cols="12" md="4" sm="4">
              <v-text-field
                v-model="filters.date"
                type="date"
                density="compact"
                :label="$t('saleTransactionsVue.searchByDate')"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
                clearable
              />
            </v-col>
          </v-row>
          <v-row class="px-7">
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
                      <p><strong>{{ $t('saleTransactionsVue.receipt.cashier') }} :</strong> {{ userName }}</p>
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
import { ref, nextTick, onMounted, computed } from 'vue';
// import { useRouter } from 'vue-router'; // Fix 3: Removed useRouter
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import SideBarComponent from '@/components/cashier/CashierSideBarComponent.vue';
import HeaderComponent from '@/components/cashier/CashierHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader();
// const router = useRouter(); // Fix 3: Removed as it's not used
const { t, locale} = useI18n();

// --- Helper Function for Logo URL ---
const backendUrl = 'http://localhost:8000';

const getLogoUrl = (logoPath: string | undefined | null): string => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image';
};

// --- Reactive State ---
const sales = ref<any[]>([]);
const products = ref<any[]>([]); // Keep products reactive for HeaderComponent prop
const stocks = ref<any[]>([]);
const users = ref<any[]>([]);
const selectedSales = ref<any[]>([]);

const userName = ref<string>('');
const storeName = ref<string>('');
const storeLocation = ref<string>('');
const storeContact = ref<string>('');
const storeLogoUrl = ref<string>('');
const storeId = ref<string | null>(null); // Fix 1: Added storeId reactive variable

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

// Fix 4: Removed hasReceiptCodeSearchActive as it's not used with the current filters
// const hasReceiptCodeSearchActive = ref(false);

const filters = ref({
  product: '',
  customer: '',
  date: ''
  // Fix 4: Removed receiptCode from filters
  // receiptCode: ''
});

const printSectionReceipt = ref<HTMLElement | null>(null);
// const printSectionReport = ref<HTMLElement | null>(null); // Commented out for Print Report

const isDataLoaded = ref<boolean>(false);

// --- Computed Properties ---
const formattedDate = computed<string>(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

const datePrint = computed<string>(() => {
  const date = new Date();
  return new Intl.DateTimeFormat(`${locale.value}-CA`, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
});

const grandTotal = computed<number>(() => {
  return selectedSales.value.reduce((sum, s) => sum + s.total_price, 0);
});

const customerName = computed<string>(() => {
  if (selectedSales.value.length > 0) {
    const uniqueCustomers = new Set(selectedSales.value.map(s => s.customer_name));
    return uniqueCustomers.size === 1 ? selectedSales.value[0].customer_name : t('saleTransactionsVue.tableCustomerMultiple');
  }
  return t('saleTransactionsVue.tableCustomerN_A');
});

const headers = computed(() => [
  // Fix 2: Add 'as const' to align values
  { title: t('saleTransactionsVue.tableHeaders.product'), value: 'productName', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.costPrice'), value: 'costPrice', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.sellingPrice'), value: 'selling_price', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.quantity'), value: 'quantity', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.total'), value: 'total_price', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.customer'), value: 'customer_name', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.method'), value: 'payment_method', align: 'center' as const },
  { title: t('saleTransactionsVue.tableHeaders.date'), value: 'date', align: 'center' as const },
]);

const filteredSale = computed<any[]>(() => {
  const filtered = sales.value.filter((sale: any) => {
    const matchProduct = filters.value.product
      ? sale.productName.toLowerCase().includes(filters.value.product.toLowerCase())
      : true;
    const matchCustomer = filters.value.customer
      ? sale.customer_name.toLowerCase().includes(filters.value.customer.toLowerCase())
      : true;
    const matchDate = filters.value.date
      ? sale.date === filters.value.date
      : true;

    // Fix 4: Removed condition that relied on filters.value.receiptCode
    // if (hasReceiptCodeSearchActive.value && filters.value.receiptCode) {
    //   return filters.value.receiptCode;
    // }

    return matchProduct && matchCustomer && matchDate;
  });
  return filtered;
});

// --- Methods ---
function showSnackbar(message: string, color: string): void {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

const getAuthHeaders = (): { Authorization?: string } => {
  const token = sessionStorage.getItem('access_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

async function fetchProducts(): Promise<void> {
  try {
    const res = await axios.get('/api/products', { headers: getAuthHeaders() });
    products.value = res.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadProducts'), 'error');
  }
}

async function fetchStocks(): Promise<void> {
  try {
    const res = await axios.get('/api/stocks', { headers: getAuthHeaders() });
    stocks.value = res.data.stocks;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadStock'), 'error');
  }
}

async function fetchUsers(): Promise<void> {
  try {
    const res = await axios.get('/api/users', { headers: getAuthHeaders() });
    users.value = res.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadUsers'), 'error');
  }
}

async function fetchUser(): Promise<void> {
  try {
    const response = await axios.get('/api/me', { headers: getAuthHeaders() });
    userName.value = response.data.user.name;
  } catch (error) {
    console.error('Error fetching current user data:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadUserInformation'), 'error');
  }
}

async function fetchSales(): Promise<void> {
  try {
    const response = await axios.get('/api/sales/cashierlist', { headers: getAuthHeaders() });
    sales.value = response.data.sales.map((sale: any) => {
      const prod = products.value.find(p => p.id === sale.product_id);
      const sto = stocks.value.find(s => s.product_id === sale.product_id);

      return {
        ...sale,
        productName: prod ? prod.name : 'Product Data Missing',
        costPrice: sto ? sto.cost_price : 'N/A',
      };
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    showSnackbar(`${t('snackbar.error')} ${t('errorFetchingData')} ${t('noStoreIdAvailable')}`, 'error');
  } finally {
    isDataLoaded.value = true;
  }
}

async function fetchStore(): Promise<void> {
  storeId.value = sessionStorage.getItem('storeId'); // Fix 1: Assign to reactive storeId
  const token = sessionStorage.getItem('access_token');
  try {
    if (!token) {
      showSnackbar('Authentication required to fetch store details.', 'error');
      return;
    }
    const response = await axios.get(`/api/stores/showstore/${storeId.value}`, {
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
  // Fix 4: Removed the conditional check for hasReceiptCodeSearchActive and filters.value.receiptCode
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

// Consolidated print logic for both receipt and report (report functionality remains commented out)
function printContent(contentRef: HTMLElement | null, title: string, isReceipt: boolean = true): void {
  if (!contentRef) {
    console.warn(`${title} print section is not ready.`);
    showSnackbar(t('saleTransactionsVue.snackbar.printFunctionUnavailable'), 'error');
    return;
  }

  const printContentHtml = contentRef.innerHTML;
  const printWindow = window.open('', '_blank', 'width=900,height=700');

  if (printWindow) {
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; font-size: 14px;}

            /* General print styles */
            .receipt-logo, .report-logo {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              filter: none !important;
            }

            /* Receipt specific styles */
            ${isReceipt ? `
            .receipt-container { width: 300px; margin: 0 auto; padding: 15px; border: 1px dashed #ccc; box-shadow: 0 0 10px rgba(0,0,0,0.05); }
            .receipt-logo { max-width: 80px; max-height: 50px; margin-bottom: 10px; display: block !important; margin-left: auto; margin-right: auto; }
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
            ` : `
            /* Report specific styles (currently not used in this version) */
            .report-container { width: 100%; margin: 0 auto; padding: 20px; }
            .report-header-section { text-align: center; margin-bottom: 20px; display: flex; align-items: center; justify-content: center; }
            .report-logo { max-width: 100px; max-height: 70px; margin-right: 20px; }
            .report-store-name { font-size: 28px; margin: 0; color: black; font-weight: bold; }
            .report-store-contact-info { font-size: 14px; color: #777; margin-top: 5px; }
            .report-title-section { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #eee; padding-bottom: 15px; }
            .report-title { font-size: 24px; margin-bottom: 10px; color: #333; }
            .report-date { font-size: 14px; color: #666; }
            .report-summary { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed #eee; }
            .report-summary p { margin: 5px 0; font-size: 15px; }
            .report-table-section { margin-bottom: 30px; }
            .report-table { width: 100%; border-collapse: collapse; }
            .report-table th, .report-table td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            .report-table th { background-color: #f2f2f2; font-weight: bold; color: #333; }
            .report-table tr:nth-child(even) { background-color: #f9f9f9; }
            .report-footer-section { text-align: center; margin-top: 40px; font-size: 13px; color: #666; }
            `}

            @media print {
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .receipt-container, .report-container {
                border: none;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          ${printContentHtml}
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

// Functionality for print report (kept commented out as requested)
/*
function printSelectedSale(): void {
  if (selectedSales.value.length === 0) {
    showSnackbar(t('saleTransactionsVue.snackbar.noSaleSelectedForPrint'), 'error');
    return;
  }

  nextTick(() => {
    printContent(printSectionReport.value, `sales_report_${new Date().toLocaleDateString().replace(/\//g, '-')}`, false);
  });
}
*/

function downloadExcel(): void {
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

// --- Lifecycle Hooks ---
onMounted(async () => {
  isDataLoaded.value = false;
  startLoading();
  try {
    await Promise.all([
      fetchProducts(),
      fetchStocks(),
      fetchUsers(),
      fetchStore(),
      fetchUser()
    ]);
    await fetchSales();
  } catch (error) {
    console.error('Error during initial data fetch:', error);
    showSnackbar(t('saleTransactionsVue.snackbar.failedToLoadAllData'), 'error');
  } finally {
    stopLoading();
  }
});
</script>

<style scoped>
/* You can add or adjust your scoped styles here */
/* For printing, ensure critical styles are inline or in the <style> tag passed to printWindow */

/* Example: Adjusting for the print styles if needed */
.receipt-logo, .report-logo {
  /* Ensure images are visible when printing */
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  filter: none !important; /* Prevents filters from being applied in print */
}
</style>
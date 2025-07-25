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
                {{ t('purchaseTransactionsVue.title') }}
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
                :label="t('purchaseTransactionsVue.searchByProduct')"
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
                v-model="filters.supplier"
                density="compact"
                :label="t('purchaseTransactionsVue.searchBySupplier')"
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
                :label="t('purchaseTransactionsVue.searchByDate')"
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
                <b>{{ selectedPurchase.length || filteredPurchase.length }}</b>
                {{ (selectedPurchase?.length ?? 0) === 1 ? t('purchaseTransactionsVue.transactionSingular') : t('purchaseTransactionsVue.transactionPlural') }}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredPurchase"
                :headers="headers"
                item-value="id"
                class="centered-headers"
                show-select
                v-model="selectedPurchase"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template v-slot:item.unit_price="{ item }">
                    {{ formatNumberWithThousandsSeparator(item.unit_price) }}
                </template>
                
                <!-- <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" :title="t('purchaseTransactionsVue.viewTransactionTitle')" class="mx-2" color="secondary" @click="viewPurchase(item)">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template> -->

              </v-data-table>
            </v-card>
            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" :title="t('purchaseTransactionsVue.downloadExcelTitle')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ t('purchaseTransactionsVue.excelButton') }}
                </v-btn>

                <v-btn color="secondary" @click="printPurchases" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ t('purchaseTransactionsVue.printButton') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>

          <div ref="printSection" class="d-none">
            <div class="report-container">
              <div class="report-header-section">
                <template v-if="storeLogoUrl  && storeLogoUrl !== 'https://via.placeholder.com/60x60?text=No+Image'">
                  <img :src="storeLogoUrl" :alt="t('purchaseTransactionsVue.storeLogoAlt')" class="report-logo">
                </template>
                <div class="store-info">
                  <h2 class="report-store-name">{{ storeName }}</h2>
                  <p class="report-store-contact-info">{{ storeLocation }} | +237 {{ storeContact }}</p>
                </div>
              </div>

              <div class="report-title-section">
                <h3 class="report-title">{{ t('purchaseTransactionsVue.purchaseReportTitle') }}</h3>
                <p class="report-date">{{ t('purchaseTransactionsVue.reportDateLabel') }}: {{ datePrint}}</p>
              </div>

              <div class="report-summary">
                <p>
                  {{ t('purchaseTransactionsVue.totalEntries') }}: <b>{{ selectedPurchase.length }}</b> {{ selectedPurchase.length > 1 ? t('purchaseTransactionsVue.transactionPlural') : t('purchaseTransactionsVue.transactionSingular') }}
                </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>{{ t('purchaseTransactionsVue.snHeader') }}</th>
                      <th class="text-left">{{ t('purchaseTransactionsVue.productHeader') }}</th>
                      <th class="text-left">{{ t('purchaseTransactionsVue.costPriceHeader') }}</th>
                      <th class="text-left">{{ t('purchaseTransactionsVue.quantityHeader') }}</th>
                      <th class="text-left">{{ t('purchaseTransactionsVue.supplierHeader') }}</th>
                      <th class="text-left">{{ t('purchaseTransactionsVue.recordedByHeader') }}</th>
                      <th class="text-left">{{ t('purchaseTransactionsVue.dateHeader') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, index) in selectedPurchase" :key="p.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ p.productName }}</td>
                      <td>{{ formatNumberWithThousandsSeparator(p.unit_price) }}</td> <td>{{ p.quantity }}</td>
                      <td>{{ p.supplierName }}</td>
                      <td>{{ p.recordedBy }}</td>
                      <td>{{ p.date }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="report-footer-section">
                <p class="powered-by">{{ t('purchaseTransactionsVue.poweredBy') }}</p>
              </div>
            </div>
          </div>

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
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';

import type { VDataTable } from 'vuetify/components';

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader();
const router = useRouter();
const { t, locale } = useI18n(); // Destructure t and locale for reactive changes

type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;

// 2. Then, get the type of a single item from that NonNullable array
type DataTableHeader<T> = VDataTableInternalHeaders[number] & {
  value?: keyof T | 'data-table-expand' | 'data-table-select' | (string & {});
};
const backendUrl = 'http://localhost:8000';

const getLogoUrl = (logoPath: string | undefined | null) => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image';
};

interface Purchase {
  id: number;
  productName: string;
  unit_price: Number;
  quantity: number;
  supplierName: string;
  recordedBy: string; // Original path from DB for image 1
  date: string;
 
}

// --- Reactive State ---
const purchases = ref<any[]>([]);
const products = ref<any[]>([]);
const suppliers = ref<any[]>([]);
const users = ref<any[]>([]);

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;

const filters = ref({
  product: '',
  supplier: '',
  date: ''
});

const selectedPurchase = ref<any[]>([]);

const storeName = ref('');
const storeLocation = ref('');
const storeContact = ref('');
const storeLogoUrl = ref<string>('');

const printSection = ref<HTMLElement | null>(null);

const isDataLoaded = ref(false);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Use the current locale for date formatting
  return date.toLocaleDateString(locale.value, options);
});

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

// THIS IS THE KEY CHANGE: Make headers a computed property
const headers = computed<DataTableHeader<Purchase>[]>(() => [
  { title: t('purchaseTransactionsVue.productHeader'), value: 'productName', align: 'center' as const },
  { title: t('purchaseTransactionsVue.costPriceHeader'), value: 'unit_price', align: 'center' as const },
  { title: t('purchaseTransactionsVue.quantityHeader'), value: 'quantity', align: 'center' as const},
  { title: t('purchaseTransactionsVue.supplierHeader'), value: 'supplierName', align: 'center' as const},
  { title: t('purchaseTransactionsVue.recordedByHeader'), value: 'recordedBy', align: 'center' as const},
  { title: t('purchaseTransactionsVue.dateHeader'), value: 'date', align: 'center' as const},

]);

const filteredPurchase = computed(() => {
  const filtered = purchases.value.filter((purchase: any) => {
    const matchProduct = filters.value.product
      ? purchase.productName.toLowerCase().includes(filters.value.product.toLowerCase())
      : true;
    const matchSupplier = filters.value.supplier
      ? purchase.supplierName.toLowerCase().includes(filters.value.supplier.toLowerCase())
      : true;
    const matchDate = filters.value.date
      ? purchase.date === filters.value.date
      : true;

    return matchProduct && matchSupplier && matchDate;
  });
  return filtered;
});

// --- Methods ---
/**
 * Displays a snackbar notification.
 * @param messageKey The translation key for the message.
 * @param color The color of the snackbar (e.g., 'success', 'error').
 * @param interpolation Optional object for message interpolation.
 */
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}
// New: Function to format numbers with thousand separators
function formatNumberWithThousandsSeparator(value: number | string): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value).toLocaleString('en-US');
  }
  return String(value);
}


async function fetchProducts() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('commonPurchaseTransactions.snackbar.authRequired'), 'error');
        return;
    }
    const res = await axios.get('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    products.value = res.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    showSnackbar(t('commonPurchaseTransactions.snackbar.errorFetchingProducts'), 'error');
  }
}

async function fetchSuppliers() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('commonPurchaseTransactions.snackbar.authRequired'), 'error');
        return;
    }
    const res = await axios.get('/api/suppliers', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    suppliers.value = res.data.suppliers;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    showSnackbar(t('commonPurchaseTransactions.snackbar.errorFetchingSuppliers'), 'error');
  }
}

async function fetchUsers() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('commonPurchaseTransactions.snackbar.authRequired'), 'error');
      return;
    }
    const res = await axios.get('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    users.value = res.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    showSnackbar(t('commonPurchaseTransactions.snackbar.errorFetchingUsers'), 'error');
  }
}

async function fetchStore() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('commonPurchaseTransactions.snackbar.authRequired'), 'error');
      return;
    }
    const response = await axios.get('/api/stores/show', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    storeName.value = response.data.stores.name;
    storeContact.value = response.data.stores.contact;
    storeLocation.value = response.data.stores.location;
    storeLogoUrl.value = getLogoUrl(response.data.stores.logo);
  } catch (error) {
    console.error('Error fetching store details:', error);
    // showSnackbar('Error fetching store details', 'error'); // Only show if critical
  }
}

async function fetchPurchase() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('commonPurchaseTransactions.snackbar.authRequired'), 'error');
        return;
    }
    const response = await axios.get('/api/purchases', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    purchases.value = response.data.purchases.map((purchase: any) => {
      const prod = products.value.find(p => p.id === purchase.product_id);
      const supp = suppliers.value.find(s => s.id === purchase.supplier_id);
      const user = users.value.find(u => u.id === purchase.user_id);

      return {
        ...purchase,
        productName: prod ? prod.name : t('purchaseTransactionsVue.productDataMissing'),
        supplierName: supp ? supp.name : t('purchaseTransactionsVue.supplierDataMissing'),
        recordedBy: user ? user.name : t('purchaseTransactionsVue.userDataMissing'),
      };
    });
  } catch (error: any) {
    console.error('Error fetching purchase:', error);
    if (error.response && error.response.status === 401) {
        showSnackbar(t('commonPurchaseTransactions.snackbar.authRequired'), 'error');
        router.push('/login');
    } else {
        showSnackbar(t('commonPurchaseTransactions.snackbar.errorFetchingPurchases'), 'error');
    }
  } finally {
    isDataLoaded.value = true;
  }
}

function printPurchases() {
  if (!selectedPurchase.value.length) {
    showSnackbar(t('purchaseTransactionsVue.selectProductForReport'), 'error');
    return;
  }

  // Use nextTick to ensure the DOM is updated before trying to print
  nextTick(() => {
    if (!printSection.value) {
      console.warn('Print section HTML element is not available.');
      showSnackbar(t('commonPurchaseTransactions.snackbar.printUnavailable'), 'error');
      return;
    }

      const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date =  new Date().toLocaleDateString();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('purchaseTransactionsVue.printFileName', { date: date.replace(/\//g, '-') })}</title>
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
                /* Aggressive print styles for the logo */
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                -webkit-print-color-adjust: exact !important; /* For WebKit browsers like Chrome, Edge */
                print-color-adjust: exact !important; /* Standard property */
                filter: none !important; /* Remove any CSS filters that might hide it */
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
                    transform: translate(-50%, -50%) rotate(-45deg); /* Center and rotate */
                    font-size: 80px; /* Adjust size as needed */
                    color: rgba(0, 0, 0, 0.1); /* Light black with low opacity */
                    pointer-events: none; /* Allows clicks to pass through */
                    user-select: none; /* Prevents text selection */
                    white-space: nowrap; /* Keeps watermark on one line */
                    z-index: -8; /* Ensures it's behind content */
                    -webkit-print-color-adjust: exact !important; /* Ensure it prints as defined */
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
      showSnackbar(t('commonPurchaseTransactions.snackbar.printWindowBlocked'), 'error');
    }
  });
}

function downloadExcel() {
  if (selectedPurchase.value.length === 0) {
    showSnackbar(t('purchaseTransactionsVue.noTransactionSelectedExport'), 'error');
    return;
  }

  const headers = [
    t('purchaseTransactionsVue.snHeader'),
    t('purchaseTransactionsVue.productHeader'),
    t('purchaseTransactionsVue.costPriceExcelHeader'),
    t('purchaseTransactionsVue.quantityExcelHeader'),
    t('purchaseTransactionsVue.supplierExcelHeader'),
    t('purchaseTransactionsVue.recordedByExcelHeader'),
    t('purchaseTransactionsVue.dateExcelHeader')
  ];

  const rows = selectedPurchase.value.map((purchase, index) => [
    index + 1,
    purchase.productName,
    purchase.unit_price,
    purchase.quantity,
    purchase.supplierName,
    purchase.recordedBy,
    new Date(purchase.date).toLocaleDateString(locale.value)
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => {
      // Ensure all fields are treated as strings and properly escaped for CSV
      let value = String(field);
      // Escape double quotes by doubling them, then enclose the whole field in double quotes
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
    link.setAttribute('download', `${t('purchaseTransactionsVue.exportFileName')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('purchaseTransactionsVue.transactionsExportedSuccess'), 'success');
  } else {
    showSnackbar(t('commonPurchaseTransactions.snackbar.downloadNotSupported'), 'error');
  }
}


// function viewPurchase(item: any) {
//   console.log('Viewing purchase for:', item);
//   showSnackbar('purchaseTransactionsVue.viewingTransactionId', 'info', { id: item.id });
// }

// --- Lifecycle Hooks ---
onMounted(async () => {
  isDataLoaded.value = false;
  startLoading();
  try {
    // Ensure all prerequisite data is fetched before processing purchases
    await Promise.all([
      fetchProducts(),
      fetchSuppliers(),
      fetchUsers(),
      fetchStore()
    ]);
    await fetchPurchase(); // This now relies on products, suppliers, and users being populated
  } catch (error) {
    console.error('Error during initial data fetch:', error);
    showSnackbar(t('commonPurchaseTransactions.snackbar.initialDataLoadError'), 'error');
  } finally {
    stopLoading();
  }
});
</script>

<style scoped>
.centered-headers th {
  text-align: center !important;
}
</style>
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
                {{ t('stockStatusTitle') }}
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-row justify="space-between" class="d-flex px-5 pt-2">
            <v-col cols="12" md="7" sm="6">
              {{ t('quantityInStock') }}: <b style="font-size: larger;">{{ formatNumberWithThousandsSeparator(totalStockQtty) || 0 }}</b>
            </v-col>
             <v-col cols="12" md="3" sm="6">
              <v-text-field
                v-model="search"
                density="compact"
                :label="t('searchByNameLabel')"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
              />
            </v-col>
            <v-col cols="12" md="2" sm="6">
              <v-select
                v-model="stockStatusFilter"
                density="compact"
                :label="t('filterByStockStatusLabel')"
                :items="stockStatusFilterOptions"
                item-title="text"
                item-value="value"
                variant="solo-filled"
                flat
                hide-details
                single-line
              />
            </v-col>
          </v-row>
          <v-row class="px-7">
            <v-card elevation="4" width="3000" class="my-2 py-2 px-5">
              <v-row class="my-1">
                <v-col cols="12" md="6">
                  <p class="text-high-emphasis py-2">
                    {{ t('totalEntriesLabel') }}: <b>{{ formatNumberWithThousandsSeparator(selectedStock.length || filteredStock.length) }}</b>
                  </p>
                </v-col>
                <v-col cols="12" md="6">
                  {{ t('productInShortageLabel') }}: <span style="color: red;"><b>{{ formatNumberWithThousandsSeparator(shortage.length) }}</b></span>
                </v-col>
              </v-row>

              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredStock"
                :headers="headers"
                item-value="id"
                class="centered-headers"
                show-select
                v-model="selectedStock"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template #item.quantity="{ item }">
                  <span :style="{ color: item.quantity > item.threshold_quantity ? '' : 'red' }">
                    {{ formatNumberWithThousandsSeparator(item.quantity) }}
                  </span>
                </template>
                <template #item.cost_price="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.cost_price) }}
                </template>
                <template #item.selling_price="{ item }">
                  {{ formatNumberWithThousandsSeparator(item.selling_price) }}
                </template>
                <template #item.status="{ item }">
                  <v-icon :color="item.status_color">
                    {{ item.status_icon }}
                  </v-icon>
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" :title="t('addStockBtnTitle')" class="mx-2" color="info" @click="openAddStockDialog(item)">
                    <v-icon>mdi-package-variant-plus mdi-icon</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" :title="t('downloadExcelBtnTitle')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ t('excelBtn') }}
                </v-btn>

                <v-btn color="secondary" @click="printStocks" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ t('printBtn') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>

          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title class="text-h5 text-center py-4">{{ t('addStockDialogTitle', { productName: editedItem.productName }) }}</v-card-title>
              <v-card-text>
                <v-form ref="form" @submit.prevent="saveStock">
                  <v-text-field
                    v-model.number="editedItem.quantityToAdd"
                    :label="t('quantityToAddLabel')"
                    type="number"
                    min="1"
                    :rules="[v => !!v || t('quantityRequired'), v => v > 0 || t('quantityPositive')]"
                    required
                    prepend-inner-icon="mdi-numeric"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>

                  <v-select
                    v-model="editedItem.supplier_id"
                    :items="suppliers"
                    item-title="name"
                    item-value="id"
                    :label="t('selectSupplierLabel')"
                    prepend-inner-icon="mdi-truck-outline"
                    variant="outlined"
                    clearable
                    class="mb-4"
                  ></v-select>
                  <center>
                  <v-btn style="width: fit-content;" color="primary" class="my-1 mx-2" type="submit" :loading="loading">
                    {{ t('saveBtn') }}
                  </v-btn>
                  <v-btn style="width: fit-content" color="error" class="my-1 mx-2" @click="closeDialog">
                    {{ t('cancelBtn') }}
                  </v-btn>
                  </center>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>

          <div ref="printSection" class="d-none">
            <div class="report-container">
              <div class="report-header-section">
              <template v-if="storeLogoUrl && storeLogoUrl !== 'https://via.placeholder.com/60x60?text=No+Image'">
                <img :src="storeLogoUrl" alt="Store Logo" class="report-logo">
              </template>
                <div class="store-info">
                  <h2 class="report-store-name">{{ storeName }}</h2>
                  <p class="report-store-contact-info">{{ storeLocation }} | +237 {{ storeContact }}</p>
                </div>
              </div>

              <div class="report-title-section">
                <h3 class="report-title">{{ t('stockStatusReportTitle') }}</h3>
                <p class="report-date">{{ t('dateLabel') }}: {{ datePrint }}</p>
              </div>

              <div class="report-summary">
                <p>
                  <span style="margin-right: 20px;">
                    {{ t('quantityInStock') }}: <b> {{ formatNumberWithThousandsSeparator(totalStockQtty) }}</b>
                  </span>
                  <span style="margin-right: 20px;">
                    {{ t('productInStock') }}: <b>{{ formatNumberWithThousandsSeparator(selectedStock.length) }}</b>
                  </span>
                  <span>
                    {{ t('productInShortageLabel') }}: <span style="color: red;"><b>{{ formatNumberWithThousandsSeparator(shortage.length) }}</b></span>
                  </span>
                </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>{{ t('snLabel') }}</th>
                      <th class="text-left">{{ t('productLabel') }}</th>
                      <th class="text-left">{{ t('costPriceLabel') }} (FCFA)</th>
                      <th class="text-left">{{ t('currentQuantityLabel') }}</th>
                      <th class="text-left">{{ t('lastQuantityLabel') }}</th>
                      <th class="text-left">{{ t('defaultSellingPriceLabel') }} (FCFA)</th>
                      <th class="text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(stock, index) in selectedStock" :key="stock.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ stock.productName }}</td>
                      <td>{{ formatNumberWithThousandsSeparator(stock.cost_price) }}</td>
                      <td :style="{ color: stock.quantity > stock.threshold_quantity ? '' : 'red' }">
                        {{ formatNumberWithThousandsSeparator(stock.quantity) }}
                      </td>
                      <td>{{ formatNumberWithThousandsSeparator(stock.last_quantity) }}</td>
                      <td>{{ formatNumberWithThousandsSeparator(stock.selling_price) }}</td>
                      <td>{{ stock.status > 0 ? $t('stockVue.status_high') : $t('stockVue.status_low') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="report-footer-section">
                <p class="powered-by">{{ t('poweredBy') }}</p>
              </div>
            </div>
          </div>
          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>
          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center">
          <v-progress-circular color="primary" class="my-1" size="65" indeterminate></v-progress-circular><br />
          <p class="my-1 text-h6 text-white text-center">{{ t('loadingLabel') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import axios from '@/axios';
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';

import type { VDataTable } from 'vuetify/components';

type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;
type DataTableHeader<T> = VDataTableInternalHeaders[number] & {
  value?: keyof T | 'data-table-expand' | 'data-table-select' | (string & {});
};

// --- Internationalization setup ---
const { t, locale } = useI18n();

// --- Configuration for Backend URL ---
const backendUrl = 'https://api.buyam-sellam.oc-classic.com';

const getLogoUrl = (logoPath: string | undefined | null) => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image';
};

interface Stock {
  id: number;
  productName: string;
  cost_price: number;
  quantity: number;
  last_quantity: number;
  selling_price: number;
  total_price: number;
  status: number;
  threshold_quantity: number; // Added threshold_quantity
  status_icon?: string; // Optional property for icon
  status_color?: string; // Optional property for color
  updated_at: string;
}

// --- Reactive State ---
const stocks = ref<Stock[]>([]);
const products = ref<any[]>([]);
const suppliers = ref<any[]>([]);
const shortage = ref<any[]>([]);
const totalStockQtty = ref(0);
const search = ref('');
const stockStatusFilter = ref<string | null>(null); // New reactive variable for stock status filter

const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;

const selectedStock = ref<Stock[]>([]);

const storeName = ref('');
const storeContact = ref('');
const storeLocation = ref('');
const storeLogoUrl = ref('');

const printSection = ref<HTMLElement | null>(null);

const isDataLoaded = ref(false);

// --- Dialog State for Add Stock ---
const dialog = ref(false);
const loading = ref(false);
const editedItem = ref<any>({
  id: null,
  product_id: null,
  productName: '',
  quantityToAdd: 0,
  newCostPrice: null,
  supplier_id: null,
});
const defaultItem = {
  id: null,
  product_id: null,
  productName: '',
  quantityToAdd: 0,
  newCostPrice: null,
  supplier_id: null,
};

// Form reference for validation
const form = ref<any>(null);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

function formatDateDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

const today = new Date();
const datePrint = formatDateDDMMYYYY(today);

const stockStatusFilterOptions = computed(() => [
  { text: t('allStocksLabel'), value: null },
  { text: t('belowAtThresholdLabel'), value: 'low' },
  { text: t('aboveThresholdLabel'), value: 'high' },
]);

// Headers computed property to react to locale changes
const headers = computed<DataTableHeader<Stock>[]>(() => [
  { title: t('productLabel'), value: 'productName', align: 'center' as const },
  { title: t('costPriceLabel') + ' (FCFA)', value: 'cost_price', align: 'center' as const},
  { title: t('currentQuantityLabel'), value: 'quantity', align: 'center' as const},
  { title: t('lastQuantityLabel'), value: 'last_quantity', align: 'center' as const},
  { title: t('thresholdSellingPriceLabel') + ' (FCFA)', value: 'selling_price', align: 'center' as const},
  { title: t('statusLabel'), value: 'status', align: 'center' as const},
  { title: t('actionsLabel'), value: 'actions', align: 'center' as const, sortable: false },
]);

const filteredStock = computed(() => {
  let filtered = stocks.value;

  // Apply search filter
  if (search.value) {
    filtered = filtered.filter(stock =>
      stock.productName.toLowerCase().includes(search.value.toLowerCase())
    );
  }

  // Apply stock status filter
  if (stockStatusFilter.value === 'low') {
    filtered = filtered.filter(stock => stock.quantity <= stock.threshold_quantity);
  } else if (stockStatusFilter.value === 'high') {
    filtered = filtered.filter(stock => stock.quantity > stock.threshold_quantity);
  }

  return filtered;
});

// --- Methods ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
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

async function fetchProducts() {
  try {
    const res = await axios.get('/api/products');
    products.value = res.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    showSnackbar(t('snackbar.failedToLoadProducts'), 'error');
  }
}

async function fetchSuppliers() {
  try {
    const res = await axios.get('/api/suppliers');
    suppliers.value = res.data.suppliers;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    showSnackbar(t('snackbar.failedToLoadSuppliers'), 'error');
  }
}

async function fetchStock() {
  try {
    const response = await axios.get('/api/stocks');
    stocks.value = response.data.stocks.map((stock: any) => {
      const prod = products.value.find(p => String(p.id) === String(stock.product_id));
      return {
        ...stock,
        productName: prod ? prod.name : t('productNotFound'),
        status_icon: stock.quantity <= stock.threshold_quantity ? 'mdi-arrow-down-bold-circle' : 'mdi-arrow-up-bold-circle',
        status_color: stock.quantity <= stock.threshold_quantity ? 'red' : 'green'
      };
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    showSnackbar(t('snackbar.failedToLoadStockData'), 'error');
  } finally {
    isDataLoaded.value = true;
  }
}

async function shortageCount() {
  try {
    const res = await axios.get('/api/stocks/shortage');
    shortage.value = res.data.shortage;
  } catch (error) {
    console.error('Error fetching shortage count:', error);
    // showSnackbar(t('snackbar.failedToLoadShortageCount'), 'error');
  }
}

async function fetchStore() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('snackbar.authRequired'), 'error');
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
  }
}

async function totalStock() {
  try {
    const res = await axios.get('/api/stocks/totalStock');
    totalStockQtty.value = res.data.totalStock || 0;
  } catch (error) {
    console.error('Error fetching total stock quantity:', error);
    showSnackbar(t('snackbar.failedToLoadTotalStockQuantity'), 'error');
  }
}

function printStocks() {
  if (selectedStock.value.length === 0) {
    showSnackbar(t('snackbar.selectItemToPrint'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSection.value) {
      console.warn('printSection is not ready.');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '', 'width=900,height=700');

    const dateForFilename = new Date().toLocaleDateString(locale.value); 
    
    if (printWindow) {
      if (printContent) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${t('stockStatusReportFilename', { date: dateForFilename.replace(/\//g, '-') })}</title>
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
        showSnackbar(t('snackbar.printError'), 'error');
      }
    } else {
      showSnackbar(t('snackbar.popupBlocked'), 'warning');
    }
  });
}
/**
 * Downloads the selected stock items as an Excel-compatible CSV file.
 */
function downloadExcel() {
  if (selectedStock.value.length === 0) {
    showSnackbar(t('snackbar.noStockSelectedForExport'), 'error');
    return;
  }

  const headers = [
    t('snLabel'),
    t('productLabel'),
    t('costPriceLabel') + ' (FCFA)',
    t('currentQuantityLabel'),
    t('thresholdQuantityLabel'), 
    t('lastQuantityLabel'),
    t('statusLabel'),
    t('lastUpdatedLabel') 
  ];

  const rows = selectedStock.value.map((stock, index) => [
    index + 1, // SN
    stock.productName,
    stock.cost_price, 
    stock.quantity,
    stock.threshold_quantity,
    stock.last_quantity,
    stock.quantity <= stock.threshold_quantity ? t('statusShortage') : t('statusInStock'), // Translated status
    new Date(stock.updated_at).toLocaleDateString(locale.value) // Format date for clarity using locale
  ]);

  // Combine headers and rows
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
    link.setAttribute('download', `${t('stockStatusExportFilename', { date: new Date().toISOString().split('T')[0] })}.csv`); // Translate filename
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('snackbar.stockExportSuccess'), 'success');
  } else {
    showSnackbar(t('snackbar.downloadNotSupported'), 'error');
  }
}

// --- Dialog Methods for Add Stock ---
function openAddStockDialog(item: any) {
  editedItem.value = {
    ...item,
    product_id: item.product_id,
    productName: item.productName,
    quantityToAdd: 0,
    newCostPrice: item.cost_price,
    supplier_id: null,
    selling_price: item.selling_price,
  };
  dialog.value = true;
}

function closeDialog() {
  dialog.value = false;
  editedItem.value = { ...defaultItem };
  if (form.value) {
    form.value.resetValidation();
  }
}

async function saveStock() {
  const { valid } = await form.value.validate();
  if (!valid) {
    showSnackbar(t('snackbar.correctFormErrors'), 'error');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      product_id: editedItem.value.product_id,
      quantity: editedItem.value.quantityToAdd,
      unit_price: editedItem.value.newCostPrice,
      supplier_id: editedItem.value.supplier_id,
      selling_price: editedItem.value.selling_price,
      date: new Date().toISOString().substring(0, 10),
    };

    const response = await axios.post('/api/purchases/store', payload);

    if (response.data.success) {
      showSnackbar(t('snackbar.stockAddedSuccess'), 'success');
      // Re-fetch all data to ensure the UI is up-to-date with new stock levels
      await Promise.all([
        fetchProducts(),
        fetchStock(),
        totalStock(),
        shortageCount(),
      ]);
      closeDialog();
    } else {
      showSnackbar(response.data.message || t('snackbar.failedToAddStock'), 'error');
    }
  } catch (error: any) {
    console.error('Error adding stock:', error);
    if (error.response && error.response.data && error.response.data.message) {
      showSnackbar(error.response.data.message, 'error');
    } else {
      showSnackbar(t('snackbar.unexpectedErrorAddingStock'), 'error');
    }
  } finally {
    loading.value = false;
  }
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  isDataLoaded.value = false;
  await fetchProducts();
  await Promise.all([
    fetchSuppliers(),
    fetchStock(),
    totalStock(),
    fetchStore(), 
    shortageCount(),
  ]);
});

// Watch locale changes to ensure all dynamic elements sensitive to locale (dates, numbers, productNotFound) are updated.
watch(locale, async () => {
  isDataLoaded.value = false;
  await fetchProducts(); 
  await Promise.all([
    fetchSuppliers(),
    fetchStock(),
    totalStock(),
    fetchStore(), 
    shortageCount(),
  ]);
}, { immediate: false });
</script>

<style scoped>
/* No component-scoped styles needed here as print styles are injected directly */
</style>
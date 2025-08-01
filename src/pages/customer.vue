<template>
  <v-app>
    <v-card style="height: max-content;">
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-5 pb-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6">
                {{ $t('customerVue.customer_list_title') }}
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
            <v-col cols="12" md="3" sm="6">
              <v-text-field
                v-model="search"
                density="compact"
                :label="$t('customerVue.search_by_name_label')"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                clearable
                flat
                hide-details
                single-line
              />
            </v-col>
          </v-row>

          <v-row class="px-7">
            <v-card elevation="4" width="3000" class="my-2 py-2 px-5">
              <p class="text-high-emphasis py-2">
                <b>{{ selectedCustomer.length || filteredCustomer.length }}</b>
                {{ (selectedCustomer?.length ?? 0) === 1 ? t('customerVue.customerSingular') : t('customerVue.customerPlural') }}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredCustomer"
                :headers="headers"
                item-value="id"
                class="centered-headers"
                show-select
                v-model="selectedCustomer"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template v-slot:item.contact="{ item }">
                  {{ !item.contact || item.contact === '0' ? $t('customerVue.no_contact_label') : item.contact }}
                </template>

                <template v-slot:item.created_at="{ item }">
                  {{ item.created_at ? item.created_at.slice(0, 10) : '' }}
                </template>
              </v-data-table>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" :title="$t('customerVue.download_excel_button')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ $t('customerVue.download_excel_button') }}
                </v-btn>

                <v-btn color="secondary" @click="printCustomers" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ $t('customerVue.print_button') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>

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
                <h3 class="report-title">{{ $t('customerVue.report_title_customer_list') }}</h3>
                <p class="report-date">{{ $t('customerVue.report_date_label') }} {{ datePrint }}</p>
              </div>

              <div class="report-summary">
                <p>
                  {{ t('customerVue.totalEntries') }}: <b>{{ selectedCustomer.length }}</b> {{ selectedCustomer.length === 1 ? t('customerVue.customerSingular') : t('customerVue.customerPlural') }}
                </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>{{ $t('customerVue.report_table_sn') }}</th>
                      <th>{{ $t('customerVue.table_header_name') }}</th>
                      <th>{{ $t('customerVue.table_header_contact') }}</th>
                      <th>{{ $t('customerVue.table_header_date_added') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(customer, index) in selectedCustomer" :key="customer.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ customer.name }}</td>
                      <td>{{ !customer.contact || customer.contact === '0' ? $t('customerVue.no_contact_label') : customer.contact }}</td>
                      <td>{{ new Date(customer.created_at).toLocaleDateString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="report-footer-section">
              <p class="powered-by">{{ $t('customerVue.powered_by_message') }}</p>
            </div>
          </div>

          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>
          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent>
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p>
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
const { t, locale } = useI18n();

type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;

// 2. Then, get the type of a single item from that NonNullable array
type DataTableHeader<T> = VDataTableInternalHeaders[number] & {
  value?: keyof T | 'data-table-expand' | 'data-table-select' | (string & {});
};
// --- Interfaces ---
interface Customer {
  id: number;
  name: string;
  contact: string; // Keep as string
  created_at: string;
}

// --- Reactive State ---
const customers = ref<Customer[]>([]);
const search = ref<string>('');
const selectedCustomer = ref<Customer[]>([]);

const storeName = ref<string>('');
const storeContact = ref<string>('');
const storeLocation = ref<string>('');
const storeLogoUrl = ref<string>('');

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

const isDataLoaded = ref<boolean>(false);

const printSection = ref<HTMLElement | null>(null);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

function formatDateDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0'); // Get day (1-31) and pad with '0' if single digit
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-11) so add 1, pad with '0'
  const year = date.getFullYear(); // Get full year

  return `${day}-${month}-${year}`;
}

// Example Usage:
const today = new Date(); // Or any other date object
const datePrint = formatDateDDMMYYYY(today);


const filteredCustomer = computed<Customer[]>(() => {
  if (!search.value) {
    return customers.value;
  }
  const lowerCaseSearch = search.value.toLowerCase();
  return customers.value.filter(customer =>
    customer.name.toLowerCase().includes(lowerCaseSearch)
  );
});

// Corrected headers with 'as const' for align properties
const headers = computed<DataTableHeader<Customer>[]>(() => [
  { title: t('customerVue.table_header_name'), value: 'name', align: 'start' as const },
  { title: t('customerVue.table_header_contact'), value: 'contact', align: 'start' as const},
  { title: t('customerVue.table_header_date_added'), value: 'created_at', align: 'center' as const}
]);

// --- Methods ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

const backendUrl = 'https://api.buyam-sellam.oc-classic.com';

const getLogoUrl = (logoPath: string | undefined | null) => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image'; // This is the fallback
};


async function fetchCustomers() {
  try {
    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');

    if (!token || !storeId) {
      showSnackbar(t('customerVue.snackbar_auth_missing'), 'error');
      router.push('/login');
      return;
    }

    const response = await axios.get('/api/customers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Store-ID': storeId,
      }
    });
    customers.value = response.data.customers;
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    showSnackbar(t('customerVue.snackbar_failed_load_customer'), 'error');
  }
}

async function fetchStore() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('customerVue.snackbar_auth_required_store'), 'error');
      return;
    }
    const response = await axios.get('/api/stores/show', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const storeData = response.data.stores;
    storeName.value = storeData.name;
    storeContact.value = storeData.contact;
    storeLocation.value = storeData.location;
    storeLogoUrl.value = getLogoUrl(storeData.logo);
  } catch (error) {
    console.error('Error fetching store details:', error);
    // Decide if you want to show a snackbar for this, as it might not be critical for customer list
  }
}

function printCustomers() {
  if (selectedCustomer.value.length === 0) {
    showSnackbar(t('customerVue.snackbar_select_customer_print'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSection.value) {
      console.warn('printSection is not ready for printing.');
      showSnackbar(t('customerVue.snackbar_print_section_not_ready'), 'error');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('customerVue.print_title_prefix')}${date.replace(/\//g, '-')}</title>
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
      showSnackbar(t('customerVue.snackbar_print_window_failed'), 'error');
    }
  });
}

function downloadExcel() {
  if (selectedCustomer.value.length === 0) {
    showSnackbar(t('customerVue.snackbar_select_customer_excel'), 'error');
    return;
  }

  const headers = [
    t('customerVue.report_table_sn'),
    t('customerVue.table_header_name'),
    t('customerVue.table_header_contact'),
    t('customerVue.table_header_date_added')
  ];

  const rows = selectedCustomer.value.map((customer, index) => [
    index + 1,
    customer.name,
    !customer.contact || customer.contact === '0' ? t('customerVue.no_contact_label') : customer.contact, // Updated logic
    new Date(customer.created_at).toLocaleDateString()
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
    link.setAttribute('download', ` ${t('customerVue.customer_list_title')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('customerVue.snackbar_excel_exported_success'), 'success');
  } else {
    showSnackbar(t('customerVue.snackbar_browser_no_download'), 'error');
  }
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  startLoading(); // Start loading
  isDataLoaded.value = false;
  try {
    await Promise.all([
      fetchCustomers(),
      fetchStore()
    ]);
  } catch (error) {
    console.error("Initial data loading failed:", error);
    // Consider showing a generic error snackbar if both fail
  } finally {
    isDataLoaded.value = true;
    stopLoading(); // Stop loading
  }
});
</script>

<style scoped>
/* Any component-specific styles can go here */
/* For example, you might add styles for .centered-headers if needed */

/* Example: Adjusting Vuetify table header alignment */
/*
.centered-headers th {
  text-align: center !important;
}
*/
</style>
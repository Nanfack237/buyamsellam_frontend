<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />
        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 pb-2 my-2">
            <v-col cols="auto" class="">
              <p class="text-high-emphasis text-h6">
                {{ t('adminStoreVue.stores_list') }}
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
                :label="t('adminStoreVue.search_store_name')"
                prepend-inner-icon="mdi-magnify"
                variant="solo-filled"
                flat
                hide-details
                single-line
              />
            </v-col>

            <v-col cols="12" md="2" sm="4">
              <v-select
                v-model="statusFilter"
                density="compact"
                :label="t('adminStoreVue.filter_by_status')"
                :items="statusFilterOptions"
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
              <p class="text-high-emphasis py-2">
                <b>{{ selectedStore.length || filteredAndSearchedStores.length}}</b>
                {{ (selectedStore.length ?? 0) === 1 ? t('adminStoreVue.storeCountSingular') : t('adminStoreVue.storeCountPlural') }}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredAndSearchedStores" :headers="headers"
                item-value="id"
                class="centered-headers"
                hide-default-footer
                :sort-by="[{ key: 'id', order: 'asc' }]"
                show-select
                v-model="selectedStore"
                return-object
              >
                <template #item.index="{ index }">
                  {{ index + 1 }}
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-switch
                    v-model="item.tempStatus"
                    @click="promptToggle(item)"
                    color="success"
                    hide-details
                    inset
                  />
                </template>
              </v-data-table>

              <v-dialog v-model="dialog.visible" persistent max-width="400">
                <v-card>
                  <v-card-title class="text-h6">
                    {{ t('adminStoreVue.confirmStatusChange') }}
                  </v-card-title>
                  <v-card-text>
                    {{ t('adminStoreVue.confirmStatusQuestion') }}
                    <strong>{{ dialog.nextStatus === 1 ? t('adminStoreVue.activate') : t('adminStoreVue.deactivate') }}</strong>
                    {{ t('adminStoreVue.thisStore') }}
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="grey" @click="cancelToggle">{{ t('adminStoreVue.cancelButton') }}</v-btn>
                    <v-btn color="success" variant="flat" @click="confirmToggle">{{ t('adminStoreVue.yesButton') }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" :title="t('adminStoreVue.downloadExcelTitle')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-file-download</v-icon> {{ t('adminStoreVue.excelButton') }}
                </v-btn>

                <v-btn color="secondary" @click="printStores" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ t('adminStoreVue.printButton') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>
          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>

          <div ref="printSection" class="d-none">
            <div class="report-container">
               <div class="watermark">BuyamSellam</div>
              <div class="report-header-section">
                
                  <img src="@/assets/logo1.svg" alt="App Logo" class="report-logo">
                
                <div class="app-info">
                  <h2 class="report-user-name">BuyamSellam</h2>
                  <p class="report-user-contact-info">{{ userAddress }} | +237 {{ userContact }}</p>
                </div>
              </div>

              <div class="report-title-section">
                <h3 class="report-title">{{ $t('adminStoreVue.stores_list') }}</h3>
                <p class="report-date">{{ t('adminStoreVue.report_date_label') }}: {{ datePrint }}</p>
              </div>

              <div class="report-summary">
                <p class="text-high-emphasis py-2">
                   <b>{{ selectedStore.length }}</b> {{ (selectedStore.length ?? 0) === 1 ? t('adminStoreVue.storeCountSingular') : t('adminStoreVue.storeCountPlural') }}
                </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>{{ t('adminStoreVue.sn') }}</th>
                      <th>{{ t('adminStoreVue.name') }}</th>
                      <th>{{ t('adminStoreVue.category') }}</th>
                      <th>{{ t('adminStoreVue.location') }}</th>
                      <th>{{ t('adminStoreVue.contact') }}</th>
                      <th>{{ t('adminStoreVue.description') }}</th>
                      <th>Status</th>
                      <th>{{ t('adminStoreVue.created_by') }}</th>
                      <th>Date</th>
                     
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(s, index) in filteredAndSearchedStores" :key="s.id"> <td>{{ index + 1 }}</td>
                      <td>{{ s.name }}</td>
                      <td>{{ s.category }}</td>
                      <td>{{ s.location }}</td>
                      <td>{{ s.contact }}</td>
                      <td>{{ s.description }}</td>
                      <td>{{ s.status > 0 ? t('adminStoreVue.active') : t('adminStoreVue.deactivateStatus') }}</td>
                      <td>{{ s.created_by_user_name }}</td>
                      <td>{{ s.created_at.slice(0, 10) }}</td>
                      
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="report-footer-section">
              <p class="powered-by">{{ t('adminStoreVue.powered_by_message') }}</p>
            </div>
          </div>

          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent>
          <v-progress-circular color="primary" size="65" indeterminate></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ t('adminStoreVue.loading') }}</p>
        </v-overlay>

      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import SideBarComponent from '@/components/admin/AdminSideBarComponent.vue';
import HeaderComponent from '@/components/admin/AdminHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useLoader } from '@/useLoader';
import { useI18n } from 'vue-i18n';

import type { VDataTable } from 'vuetify/components';

// --- Composables and Utilities ---
const router = useRouter();
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;

type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;
type DataTableHeader<T> = VDataTableInternalHeaders[number] & {
  value?: keyof T | 'data-table-expand' | 'data-table-select' | (string & {});
};

interface Store {
  id: number;
  name: string;
  category: string;
  location: string;
  contact: string;
  status: number;
  tempStatus: boolean;
  created_at: string;
  logo: string | null;
  description: string;
  user_id: number;
  created_by_user_name?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const userContact = ref<string>('');
const userAddress = ref<string>('');

const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

const { startLoading, stopLoading } = useLoader();
const { t, locale } = useI18n();

const isDataLoaded = ref(false);

function formatDateDDMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

const today = new Date();
const datePrint = formatDateDDMMYYYY(today);

// --- Store Settings Data ---
const stores = ref<Store[]>([]);
const users = ref<User[]>([]);
const selectedStore = ref<Store[]>([]);

// Search and Status Filters
const search = ref(''); // For the text search input
const statusFilter = ref<number | null>(null); // null for "All", 1 for Active, 0 for Inactive

// Watcher to reset status filter when search is used
watch(search, (newValue) => {
  if (newValue) { // If search input has any value
    statusFilter.value = null; // Set status filter to "All Stores"
  }
});

// Options for the status filter dropdown
const statusFilterOptions = computed(() => [
  { text: t('adminStoreVue.all_stores'), value: null },
  { text: t('adminStoreVue.active'), value: 1 },
  { text: t('adminStoreVue.deactivateStatus'), value: 0 },
]);

// Computed property for filtered and searched stores
const filteredAndSearchedStores = computed(() => {
  let filtered = stores.value;

  // Apply status filter
  if (statusFilter.value !== null) {
    filtered = filtered.filter(store => store.status === statusFilter.value);
  }

  // Apply search filter (ONLY BY NAME now)
  if (search.value) {
    const lowerCaseSearch = search.value.toLowerCase();
    filtered = filtered.filter(store =>
      // This is the updated line to search ONLY by store name
      store.name.toLowerCase().includes(lowerCaseSearch)
    );
  }

  return filtered;
});


const headers = computed<DataTableHeader<Store>[]>(() => [
  { title: t('adminStoreVue.sn'), value: 'index', sortable: false },
  { title: t('adminStoreVue.name'), value: 'name', align: 'center' as const},
  { title: t('adminStoreVue.category'), value: 'category', align: 'center' as const},
  { title: t('adminStoreVue.location'), value: 'location', align: 'center' as const},
  { title: t('adminStoreVue.contact'), value: 'contact', align: 'center' as const},
  { title: t('adminStoreVue.description'), value: 'description', align: 'center' as const},
  { title: t('adminStoreVue.created_by'), value: 'created_by_user_name', align: 'center' as const},
  { title: t('adminStoreVue.actions'), value: 'actions', sortable: false },
]);

async function fetchStores() {
  try {
    const response = await axios.get('/api/admin/storelist');
    stores.value = response.data.stores.map((store: any) => ({
      ...store,
      tempStatus: store.status === 1,
    })) as Store[];
  } catch (error) {
    console.error('Error fetching stores:', error);
    showSnackbar(t('adminStoreVue.errorLoadingStores'), 'error');
  }
}

async function fetchUsers() {
  try {
    const token = sessionStorage.getItem('access_token');

    if (!token) {
      showSnackbar(t('userVue.authentication_missing'), 'error');
      router.push('/login');
      return;
    }

    const response = await axios.get('/api/admin/userlist', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    users.value = response.data.users;

  } catch (error: any) {
    console.error('Error fetching users:', error);
  }
}

function mapUserNamesToStores() {
    if (stores.value.length > 0 && users.value.length > 0) {
        stores.value = stores.value.map(store => {
            const creator = users.value.find(user => user.id === store.user_id);
            return {
                ...store,
                created_by_user_name: creator ? creator.name : t('adminStoreVue.unknown_user')
            };
        });
    }
}


// --- Dialog State for Status Toggle ---
const dialog = ref<{
  visible: boolean;
  store: Store | null;
  nextStatus: number;
}>({
  visible: false,
  store: null,
  nextStatus: 0
});

function promptToggle(store: Store) {
  dialog.value.store = store;
  dialog.value.nextStatus = store.tempStatus ? 0 : 1;
  dialog.value.visible = true;
}

async function confirmToggle() {
  loading.value = true;
  startLoading();
  const store = dialog.value.store;
  const status = dialog.value.nextStatus;

  if (!store) return;

  try {
    const response = await axios.put(`/api/admin/stores/edit/${store.id}/status`, { status });

    store.status = status;
    store.tempStatus = status === 1;

    if (response.data.success) {
      showSnackbar( t('adminStoreVue.storeStatusChanged'), 'success');
    } else {
      console.error('Error occurred doing purchase:', response.data.error);
      showSnackbar(response.data.error || t('adminStoreVue.errorChangingStatus'), 'error');
    }
  } catch (err) {
    console.error('Error updating store status', err);
    showSnackbar(t('adminStoreVue.failedToUpdateStatus'), 'error');
  } finally {
    loading.value = false;
    stopLoading();
    dialog.value.visible = false;
  }
}

function cancelToggle() {
  if (dialog.value.store) {
    dialog.value.store.tempStatus = dialog.value.store.status === 1;
  }
  dialog.value.visible = false;
}

// --- User and Store Details for Print/Report ---
const userEmail = ref('');
const userName = ref('');
const userImageUrl = ref<string | null>(null);
const storeName = ref<string>('');
const storeContact = ref<string>('');
const storeLocation = ref<string>('');
const storeLogoUrl = ref<string>('');
const backendUrl = 'http://localhost:8000';

const getImageUrl = (imagePath: string | null, isUserImage: boolean = false): string => {
  if (!imagePath) {
    return isUserImage ? 'https://via.placeholder.com/80x80?text=User' : 'https://via.placeholder.com/150x80?text=No+Logo';
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${backendUrl}/storage/${imagePath}`;
};


async function fetchUserDetails() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const response = await axios.get('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    userEmail.value = response.data.user.email;
    userName.value = response.data.user.name || response.data.user.email;
    userContact.value = response.data.user.contact;
    userAddress.value = response.data.user.address;
    userImageUrl.value = getImageUrl(response.data.user.image, true);
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
}

async function fetchStoreDetails() {
  try {
    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');
    if (!token || !storeId) return;

    const response = await axios.get(`/admin/stores/edit/${storeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const storeData = response.data.store;
    storeName.value = storeData.name;
    storeContact.value = storeData.contact;
    storeLocation.value = storeData.location;
    storeLogoUrl.value = getImageUrl(storeData.logo, false);
  } catch (error) {
    console.error('Error fetching store details for print:', error);
  }
}


// --- Snackbar Helper ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

// --- Lifecycle Hook ---
onMounted(async () => {
  isDataLoaded.value = false;
  startLoading();
  try {
    await Promise.all([
      fetchStores(),
      fetchUserDetails(),
      fetchStoreDetails(),
      fetchUsers()
    ]);
    mapUserNamesToStores();
  } catch (error) {
    console.error('Error during initial data fetch:', error);
    showSnackbar(t('adminStoreVue.failedToLoadAllData'), 'error');
  } finally {
    isDataLoaded.value = true;
    stopLoading();
  }
});

// --- Print Function ---
const printSection = ref<HTMLElement | null>(null);
function printStores() {
  if (selectedStore.value.length === 0) {
    showSnackbar(t('adminStoreVue.no_stores_selected_to_print'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSection.value) {
      console.warn('printSection is not ready for printing.');
      showSnackbar(t('adminStoreVue.snackbar_print_section_not_ready'), 'error');
      return;
    }

    // Now, use the modified HTML content for printing
    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    const date = new Date().toLocaleDateString();

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('adminStoreVue.print_title_prefix_store')}${date.replace(/\//g, '-')}</title>
            <style>
              /* Embedded Print Styles - Keep these consistent */
              body { font-family: Arial, sans-serif; padding: 10px; margin: 0; }
              .report-container { width: 100%; margin: 0 auto; padding: 0px; box-sizing: border-box; }

              .report-header-section {
                text-align: center;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-wrap: wrap;
                padding-bottom: 10px;
                border-bottom: 2px solid #eee;
              }
              .report-logo {
                max-width: 100px;
                max-height: 80px;
                margin-right: 20px;
                margin-bottom: 10px;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                filter: none !important;
              }
              .user-info {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
              }
              .report-user-name {
                font-size: 28px;
                margin-bottom: 5px;
                color: #333;
                font-weight: bold;
                text-align: left;
              }
              .report-user-contact-info {
                font-size: 14px;
                color: #777;
                margin-top: 0;
                line-height: 1.5;
                text-align: left;
              }
              .user-image-print {
                max-width: 100px;
                max-height: 80px;
                margin-right: 20px;
                margin-bottom: 10px;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                filter: none !important;
                border-radius: 50%;
                object-fit: cover;
              }

              .report-title-section { text-align: center; margin: 20px 0 15px 0; padding-top: 10px;}
              .report-title { font-size: 24px; margin-bottom: 10px; color: #444; font-weight: bold; }
              .report-date { font-size: 14px; color: #888; }

              .report-summary { margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #eee; font-size: 14px; }
              .report-summary strong { color: #000; }

              .report-table-section { margin-bottom: 40px; margin-top: 20px; }
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
              .report-table img {
                height: 40px;
                width: 40px;
                object-fit: cover;
                border-radius: 50%;
                display: inline-block;
                vertical-align: middle;
              }
              .d-flex { display: flex; align-items: center; }

              .watermark {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-45deg);
                  font-size: 100px;
                  color: rgba(0, 0, 0, 0.08);
                  pointer-events: none;
                  user-select: none;
                  white-space: nowrap;
                  z-index: -8;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
              }

              @media print {
                  body {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                  }
                  .report-logo {
                      filter: none !important;
                  }
                  .report-table td {
                      word-wrap: break-word;
                      white-space: normal;
                  }
                  .report-footer-section {
                    position: static;
                    margin-top: 20mm;
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
      showSnackbar(t('adminStoreVue.store_list_printed_successfully'), 'success');
    } else {
      showSnackbar(t('adminStoreVue.snackbar_print_window_failed'), 'error');
    }
  });
}
// --- Excel Download Function (optional, but good practice to filter here too) ---
function downloadExcel() {
  // Determine which stores to export: selected ones or all if none selected
  if (selectedStore.value.length === 0) {
    showSnackbar(t('adminStoreVue.no_stores_selected_to_export'), 'error');
    return;
  }

  const exportHeaders = [
    t('adminStoreVue.sn'),
    t('adminStoreVue.name'),
    t('adminStoreVue.category'),
    t('adminStoreVue.location'),
    t('adminStoreVue.contact'),
    t('adminStoreVue.description'),
    t('adminStoreVue.created_by'),
    t('adminStoreVue.status'),
    t('adminStoreVue.date_added')
  ];

  const rows = selectedStore.value.map((store, index) => [
    index + 1,
    store.name,
    store.category,
    store.location,
    store.contact,
    store.description,
    store.created_by_user_name,
    store.status === 1 ? t('adminStoreVue.active') : t('adminStoreVue.deactivateStatus'),
    new Date(store.created_at).toLocaleDateString(locale.value)
  ]);

  const csvContent = [
    exportHeaders.join(','),
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
    link.setAttribute('download', `store_list_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('adminStoreVue.store_list_exported_successfully'), 'success');
  } else {
    showSnackbar(t('adminStoreVue.browser_does_not_support_download'), 'error');
  }
}
</script>

<style scoped>
/* Any component-specific styles go here */
.opacity-50 {
  opacity: 0.5;
  cursor: not-allowed;
}

.centered-headers th {
  text-align: center !important;
}

/* Specific styles for the dialog image to ensure good fit */
.v-avatar img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

/* Adjust header alignment for better readability */
.v-data-table .v-data-table-header th {
  text-align: start;
}

/* Re-apply center alignment for specific columns if desired */
.v-data-table .v-data-table-header [aria-label="Profile"],
.v-data-table .v-data-table-header [aria-label="Status"],
.v-data-table .v-data-table-header [aria-label="Actions"] {
    text-align: center !important;
}

/* New style for the inverted rectangle avatar */
.inverted-rectangle-avatar {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.inverted-rectangle-avatar .v-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Styles for the image preview in the edit dialog */
.image-preview-container {
  max-height: 200px; /* Adjust height as needed */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px; /* Keep consistent height with image-preview-container */
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px dashed #ccc;
  color: #aaa;
  width: 100%; /* Ensure it takes full width of parent col */
}
</style>
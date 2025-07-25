<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />
        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-2 my-2">
            <v-col cols="auto" class="">
              <p class="text-high-emphasis text-h6">
                {{ t('settings.userSettings') }}
              </p>
            </v-col>

            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>
          <v-card class="pa-4 mx-5 my-4">
            <v-card-title>
              <v-icon class="mr-2" color="warning">mdi-alert-octagon</v-icon>
              {{ t('settings.changePassword') }}
            </v-card-title>
            <v-card-text>
              <form ref="formRef" @submit.prevent="changePassword">
                <v-row class="d-flex px-5 pt-2">

                  <v-col cols="12" md="4" sm="4">
                    <v-text-field
                      v-model="form.current_password"
                      :label="t('settings.currentPassword')"
                      type="password"
                      variant="outlined"
                      prepend-inner-icon="mdi-lock"
                    />
                  </v-col>
                  <v-col cols="12" md="4" sm="4">
                    <v-text-field
                      v-model="form.new_password"
                      :label="t('settings.newPassword')"
                      type="password"
                      variant="outlined"
                      prepend-inner-icon="mdi-form-textbox-password"
                    />
                  </v-col>
                  <v-col cols="12" md="4" sm="4">
                    <v-text-field
                      v-model="form.new_password_confirmation"
                      :label="t('settings.confirmNewPassword')"
                      type="password"
                      variant="outlined"
                      prepend-inner-icon="mdi-check-decagram"
                    />
                  </v-col>
                  <v-row>
                    <v-col cols="12">
                      <v-responsive style="text-align: right">
                        <v-btn color="primary" class="my-4" type="submit">
                          {{ t('settings.saveButton') }} &nbsp;&nbsp;<v-icon>mdi-content-save</v-icon>
                        </v-btn>
                      </v-responsive>
                    </v-col>
                  </v-row>

                </v-row>
              </form>
            </v-card-text>
          </v-card>

          <v-row justify="space-between" class="d-flex justify-center px-5 pb-2 my-2">
            <v-col cols="auto" class="">
              <p class="text-high-emphasis text-h6">
                {{ t('settings.storeSettings') }}
              </p>
            </v-col>

            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-row class="px-7">
            <v-card elevation="4" width="3000" class="my-2 py-2 px-5">
              <p class="text-high-emphasis py-2">
                <b>{{ stores.length}}</b>
                {{ (stores?.length ?? 0) === 1 ? t('settings.storeCountSingular') : t('settings.storeCountPlural') }}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table :items="stores" :headers="headers" item-value="id" class="centered-headers"
                hide-default-footer :sort-by="[{ key: 'id', order: 'asc' }]">
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
                    {{ t('settings.confirmStatusChange') }}
                  </v-card-title>
                  <v-card-text>
                    {{ t('settings.confirmStatusQuestion') }}
                    <strong>{{ dialog.nextStatus === 1 ? t('settings.activate') : t('settings.deactivate') }}</strong>
                    {{ t('settings.thisStore') }}
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="grey" @click="cancelToggle">{{ t('settings.cancelButton') }}</v-btn>
                    <v-btn color="success" variant="flat" @click="confirmToggle">{{ t('settings.yesButton') }}</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">

                <v-btn color="green-darken-2" :title="t('settings.downloadExcelTitle')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-file-download</v-icon> {{ t('settings.excelButton') }}
                </v-btn>

                <v-btn color="secondary" @click="printStores" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ t('settings.printButton') }}
                </v-btn>

              </v-col>
            </v-row>
          </v-row>
          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>

          <div ref="printSection" class="d-none">
            <div class="report-container">
              <div class="report-header-section">
                <img v-if="userImageUrl" :src="userImageUrl" alt="User Image" class="user-image-print">
                </div>

              <div class="report-title-section">
                <h3 class="report-title">{{ t('settings.report_title_store_list') }}</h3>
                <p class="report-date">{{ t('settings.report_date_label') }} {{ datePrint }}</p>
                <p class="user-info">{{ t('settings.report_user_label') }}: {{ userName }} ({{ userEmail }})</p>
              </div>

              <div class="report-summary">
                <p class="text-high-emphasis py-2">
                  <b>{{ stores.length}}</b>
                  {{ (stores?.length ?? 0) === 1 ? t('settings.storeCountSingular') : t('settings.storeCountPlural') }}
                </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>{{ t('settings.report_table_sn') }}</th>
                      <th>{{ t('settings.name') }}</th>
                      <th>{{ t('settings.category') }}</th>
                      <th>{{ t('settings.location') }}</th>
                      <th>{{ t('settings.contact') }}</th>
                      <th>{{ t('settings.description') }}</th>
                      <th>{{ t('settings.status') }}</th>
                      <th>{{ t('settings.date_added') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(s, index) in stores" :key="s.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ s.name }}</td>
                      <td>{{ s.category }}</td>
                      <td>{{ s.location }}</td>
                      <td>{{ s.contact }}</td>
                      <td>{{ s.description }}</td>
                      <td>{{ s.status > 0 ? t('settings.active') : t('settings.deactivateStatus') }}</td>
                      <td>{{ new Date(s.created_at).toLocaleDateString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="report-footer-section">
              <p class="powered-by">{{ t('settings.powered_by_message') }}</p>
            </div>
          </div>

          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent>
          <v-progress-circular color="primary" size="65" indeterminate></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ t('settings.loading') }}</p>
        </v-overlay>

      </v-layout>
    </v-card>
  </v-app>
</template>


<script lang="ts" setup>
import { ref, onMounted, reactive, nextTick, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useI18n } from 'vue-i18n';

import type { VDataTable } from 'vuetify/components';

// --- Composables and Utilities ---
const router = useRouter();
const loading = ref(false); // Make sure this is reactive and controls the overlay
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000; // Define snackbarTimeout

type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;

// 2. Then, get the type of a single item from that NonNullable array
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
  created_at: string; // Add created_at for potential date info in export and print
  logo: string | null; // Add logo path
  description: string; // Added description based on your print template
}

const { startLoading, stopLoading } = useLoader();
const { t, locale } = useI18n(); // Initialize useI18n

const isDataLoaded = ref(false); // New reactive variable to control the overlay

// --- User Settings ---
const form = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
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

const formRef = ref(null);

const changePassword = async () => {
  loading.value = true;
  startLoading();

  try {
    const token = sessionStorage.getItem('access_token');

    if (form.new_password === form.new_password_confirmation) {
      const response = await axios.put('/api/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
        new_password_confirmation: form.new_password_confirmation
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })

      if (response.data.error) {
        showSnackbar(response.data.error, 'error');
      } else if (response.data.success) {
        showSnackbar(response.data.success, 'success');
        setTimeout(() => router.push('/GeneralSettings'), 2000);
      }
    } else {
      showSnackbar(t('settings.newPasswordsMismatch'), 'error');
    }
  } catch (error) {
    console.error('Password change error:', error);
    showSnackbar(t('settings.passwordChangeError'), 'error');
  } finally {
    loading.value = false;
    stopLoading();
  }
}

// --- Store Settings Data ---
const stores = ref<Store[]>([]); // **FIXED: Explicitly type the ref with your Store interface**


// Headers are now a computed property to react to locale changes
const headers = computed<DataTableHeader<Store>[]>(() => [ // **FIXED: Use 'Store' instead of 'store'**
  { title: t('settings.sn'), value: 'index', sortable: false },
  { title: t('settings.name'), value: 'name', align: 'center' as const},
  { title: t('settings.category'), value: 'category', align: 'center' as const},
  { title: t('settings.location'), value: 'location', align: 'center' as const},
  { title: t('settings.contact'), value: 'contact', align: 'center' as const},
  { title: t('settings.description'), value: 'description', align: 'center' as const}, // Added description header
  { title: t('settings.actions'), value: 'actions', sortable: false },
]);

async function fetchStores() {
  loading.value = true;
  startLoading();
  try {
    const response = await axios.get('/api/stores');
    stores.value = response.data.stores.map((store: any) => ({
      ...store,
      tempStatus: store.status === 1
    })) as Store[]; // **FIXED: Cast the mapped array to Store[] to ensure type safety**
  } catch (error) {
    console.error('Error fetching stores:', error);
    showSnackbar(t('settings.errorLoadingStores'), 'error');
  } finally {
    loading.value = false;
    stopLoading();
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
    const response = await axios.put(`/api/stores/edit/${store.id}/status`, { status });

    store.status = status;
    store.tempStatus = status === 1;

    if (response.data.success) {
      showSnackbar( t('settings.storeStatusChanged'), 'success');
    } else {
      console.error('Error occurred doing purchase:', response.data.error);
      showSnackbar(response.data.error || t('settings.errorChangingStatus'), 'error');
    }
  } catch (err) {
    console.error('Error updating store status', err);
    showSnackbar(t('settings.failedToUpdateStatus'), 'error');
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
const userImageUrl = ref<string | null>(null); // New ref for user's image URL
const storeName = ref<string>('');
const storeContact = ref<string>('');
const storeLocation = ref<string>('');
const storeLogoUrl = ref<string>('');
const backendUrl = 'http://localhost:8000'; // Define backendUrl

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
    // Assuming response.data.user.profile_image exists and is the path to the image
    userImageUrl.value = getImageUrl(response.data.user.profile_image, true);
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
}

async function fetchStoreDetails() {
  try {
    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');
    if (!token || !storeId) return;

    const response = await axios.get(`/api/stores/${storeId}`, {
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
      fetchStoreDetails()
    ]);
  } catch (error) {
    console.error('Error during initial data fetch:', error);
    showSnackbar(t('settings.failedToLoadAllData'), 'error');
  } finally {
    isDataLoaded.value = true;
    stopLoading();
  }
});

// --- Print Function ---
const printSection = ref<HTMLElement | null>(null);

function printStores() {
  if (stores.value.length === 0) {
    showSnackbar(t('settings.no_stores_to_print'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSection.value) {
      console.warn('printSection is not ready for printing.');
      showSnackbar(t('settings.snackbar_print_section_not_ready'), 'error');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString();

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('settings.print_title_prefix_store')}${date.replace(/\//g, '-')}</title>
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
              /* Style for store logo */
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
              /* Style for user image */
              .user-image-print {
                max-width: 80px; /* Smaller for a profile image */
                max-height: 80px;
                border-radius: 50%; /* Make it circular */
                object-fit: cover; /* Ensures image covers the area without distortion */
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
              .report-date, .user-info { font-size: 14px; color: #888; }
              .user-info { margin-top: 5px; }

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
                filter: none !important;
              }
            </style>
          </head>
          <body>
            <div class="watermark">${ storeName.value }</div>
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
      showSnackbar(t('settings.snackbar_print_window_failed'), 'error');
    }
  });
}

// --- Excel Download Function (already adjusted in previous response) ---
function downloadExcel() {
  if (stores.value.length === 0) {
    showSnackbar(t('settings.no_stores_to_export'), 'error');
    return;
  }

  const exportHeaders = [
    t('settings.sn'),
    t('settings.name'),
    t('settings.category'),
    t('settings.location'),
    t('settings.contact'),
    t('settings.status'),
    t('settings.date_added')
  ];

  const rows = stores.value.map((store: Store, index: number) => [
    index + 1,
    store.name,
    store.category,
    store.location,
    store.contact,
    store.status === 1 ? t('settings.active') : t('settings.deactivateStatus'),
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
    showSnackbar(t('settings.store_list_exported_successfully'), 'success');
  } else {
    showSnackbar(t('settings.browser_does_not_support_download'), 'error');
  }
}
</script>

<style scoped>
/* Any component-specific styles go here */
/* Example for an inactive store card visual cue */
.opacity-50 {
  opacity: 0.5;
  cursor: not-allowed;
  /* Indicate it's not fully interactive */
}
</style>
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
                {{ $t('supplierListVue.title') }}
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
                :label="$t('supplierListVue.searchByNameLabel')"
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
              <p class="font-weight-medium py-2">
                <b>{{ selectedSupplier.length || filteredSupplier.length }}</b>
                {{ (selectedSupplier?.length ?? 0) === 1 ? $t('supplierListVue.supplierCountSingular') : $t('supplierListVue.supplierCountPlural') }}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredSupplier"
                :headers="headers"
                item-value="id"
                class="centered-headers"
                show-select
                v-model="selectedSupplier"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" :title="$t('supplierListVue.editButtonTitle')" class="mx-2" color="warning" @click="openEditDialog(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" :title="$t('supplierListVue.deleteButtonTitle')" color="error" @click="confirmDelete(item)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" title="Download excel file" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ $t('supplierListVue.downloadExcelButton') }}
                </v-btn>

                <v-btn color="secondary" @click="printSuppliers" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ $t('supplierListVue.printButton') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>

          <v-dialog v-model="editDialog" max-width="500px" persistent>
            <v-card>
              <v-card-title class="text-h5 text-center py-4">
                {{ $t('supplierListVue.editDialog.title') }}
              </v-card-title>
              <v-card-text>
                <v-form ref="supplierForm" @submit.prevent="saveSupplier">
                  <v-text-field
                    v-model="editedItem.name"
                    :label="$t('supplierListVue.editDialog.supplierNameLabel')"
                    :rules="[v => !!v || $t('supplierListVue.editDialog.validation.nameRequired')]"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                  <v-text-field
                    v-model="editedItem.address"
                    :label="$t('supplierListVue.editDialog.addressLabel')"
                    :rules="[v => !!v || $t('supplierListVue.editDialog.validation.addressRequired')]"
                    prepend-inner-icon="mdi-map-marker"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                  <v-text-field
                    v-model="editedItem.contact"
                    :label="$t('supplierListVue.editDialog.contactLabel')"
                    :rules="contactRules"
                    prepend-inner-icon="mdi-phone"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                  <center>
                    <v-btn color="primary" type="submit" class="my-3 mx-1" :loading="loadingDialog">
                      {{ $t('supplierListVue.editDialog.saveChangesButton') }}
                    </v-btn>
                    <v-btn color="error" class="my-3 mx-1" @click="closeEditDialog">
                      {{ $t('supplierListVue.editDialog.cancelButton') }}
                    </v-btn>
                  </center>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-dialog v-model="confirmDeleteDialog" max-width="400px" persistent>
            <v-card>
              <v-card-title class="text-h5 text-center py-4">{{ $t('supplierListVue.deleteDialog.title') }}</v-card-title>
              <v-card-text class="text-center">
                <i18n-t keypath="supplierListVue.deleteDialog.confirmationText" tag="p">
                  <template #supplierName>
                    <strong>{{ supplierToDelete ? supplierToDelete.name : '' }}</strong>
                  </template>
                </i18n-t>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn color="error" variant="flat" @click="executeDelete" :loading="loading">{{ $t('supplierListVue.deleteDialog.deleteButton') }}</v-btn>
                <v-btn color="secondary" @click="cancelDelete">{{ $t('supplierListVue.deleteDialog.cancelButton') }}</v-btn>
              </v-card-actions>
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
                <h3 class="report-title">{{ $t('supplierListVue.printReport.reportTitle') }}</h3>
                <p class="report-date">{{ $t('supplierListVue.printReport.dateLabel') }} {{ datePrint }}</p>
              </div>

              <div class="report-summary">
                {{ $t('supplierListVue.printReport.totalEntries') }} <b>{{ selectedSupplier.length }}</b>
                {{ selectedSupplier.length > 1 ? $t('supplierListVue.supplierCountPlural') : $t('supplierListVue.supplierCountSingular') }}
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>{{ $t('supplierListVue.printReport.snHeader') }}</th>
                      <th>{{ $t('supplierListVue.printReport.nameHeader') }}</th>
                      <th>{{ $t('supplierListVue.printReport.addressHeader') }}</th>
                      <th>{{ $t('supplierListVue.printReport.contactHeader') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(supplier, index) in selectedSupplier" :key="supplier.id">
                      <td>{{ index + 1 }}</td>
                      <td>{{ supplier.name }}</td>
                      <td>{{ supplier.address }}</td>
                      <td>{{ supplier.contact }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="report-footer-section">
              <p class="powered-by">{{ $t('supplierListVue.printReport.poweredBy') }}</p>
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
import { ref, onMounted, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios'; // Assuming this is your configured Axios instance
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t, locale } = useI18n(); // Use i18n

// --- Interfaces ---
interface Supplier {
  id: number;
  name: string;
  address: string;
  contact: string;
  created_at: string;
}

// --- Main Component Reactive State ---
const suppliers = ref<Supplier[]>([]);
const search = ref<string>('');
const selectedSupplier = ref<Supplier[]>([]);

const storeName = ref<string>('');
const storeContact = ref<string>('');
const storeLocation = ref<string>('');
const storeLogoUrl = ref<string | null>(null);

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

const isDataLoaded = ref<boolean>(false);

const printSection = ref<HTMLElement | null>(null);

const router = useRouter();

// --- Edit Supplier Dialog State ---
const editDialog = ref<boolean>(false);
const supplierForm = ref<any>(null); // Ref for the v-form component
const loadingDialog = ref(false); // Controls loading state for dialog buttons
const loading = ref<boolean>(false); // For submit button loading state

const editedItem = ref<Supplier>({
  id: 0, // Default to a placeholder ID; will be overwritten when opening dialog for edit
  name: '',
  address: '',
  contact: '',
  created_at: '', // Will be populated from the existing item
});

// --- Delete Confirmation Dialog State ---
const confirmDeleteDialog = ref<boolean>(false);
const supplierToDelete = ref<Supplier | null>(null);

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

const filteredSupplier = computed<Supplier[]>(() => {
  return suppliers.value.filter(supplier => {
    return supplier.name.toLowerCase().includes(search.value.toLowerCase());
  });
});

const headers = computed(() =>[
  { title: t('supplierListVue.tableHeaders.name'), value: 'name', align: 'start' },
  { title: t('supplierListVue.tableHeaders.address'), value: 'address', align: 'start' },
  { title: t('supplierListVue.tableHeaders.contact'), value: 'contact', align: 'start' },
  { title: t('supplierListVue.tableHeaders.actions'), value: 'actions', align: 'center', sortable: false },
]);

// --- Validation Rules (for dialog) ---
const contactRules = [
  (v: string) => !!v || t('supplierListVue.editDialog.validation.contactRequired'),
  (v: string) => /^\+?\d{6,15}$/.test(v) || t('supplierListVue.editDialog.validation.contactInvalid'),
];


// --- General Methods ---
/**
 * Displays a snackbar notification with a given message and color.
 * @param message The message to display.
 * @param color The color of the snackbar (e.g., 'success', 'error', 'info', 'warning').
 */
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

/**
 * Constructs the full image URL for the store logo.
 * @param path The relative path to the image, or null if no logo.
 * @returns The absolute URL for the image or a default logo path.
 */
const backendUrl = 'http://localhost:8000';

const getLogoUrl = (logoPath: string | undefined | null) => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image';
};

// --- Supplier Edit Dialog Methods ---

/**
 * Opens the Edit Supplier dialog and populates it with the selected supplier's data.
 * @param item The supplier object to be edited.
 */
function openEditDialog(item: Supplier) {
  // Deep copy the item to editedItem to prevent direct mutation of the table data
  Object.assign(editedItem.value, item);
  editDialog.value = true;
  nextTick(() => {
    if (supplierForm.value) {
      supplierForm.value.resetValidation(); // Clear previous validation messages from a prior open/save
    }
  });
}

/**
 * Closes the Edit Supplier dialog and resets the form.
 */
function closeEditDialog() {
  editDialog.value = false;
  // Reset editedItem to a clean state after dialog closes
  nextTick(() => {
    Object.assign(editedItem.value, {
      id: 0,
      name: '',
      address: '',
      contact: '',
      created_at: '',
    });
    if (supplierForm.value) {
      supplierForm.value.resetValidation();
    }
  });
}

/**
 * Saves changes to an existing supplier via API call.
 * This method is now solely for updating existing suppliers.
 */
async function saveSupplier() {
  const { valid } = await supplierForm.value.validate();
  if (!valid) {
    showSnackbar(t('commonSupplierListVue.snackbar.formErrors'), 'error');
    return;
  }

  loadingDialog.value = true;
  try {
    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');

    if (!token || !storeId) {
      showSnackbar(t('supplierListVue.snackbar.authOrStoreMissing'), 'error');
      router.push('/login');
      return;
    }

    // API call to update the existing supplier
    const response = await axios.put(`/api/suppliers/edit/${editedItem.value.id}`, editedItem.value, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Store-ID': storeId, // Ensure store_id is sent for authorization/ownership check on backend
      },
    });

    if (response.data.success) {
      showSnackbar(t('supplierListVue.snackbar.updateSuccess'), 'success'); // Use specific success message
      await fetchSuppliers(); // Re-fetch the list to display the updated data
      closeEditDialog();
    } else {
      // Handle cases where API returns non-success in its data payload
      showSnackbar(response.data.error || t('supplierListVue.snackbar.updateFailed'), 'error');
    }
  } catch (error: any) {
    console.error('Error saving supplier:', error);
    if (error.response && error.response.data) {
      // Handle validation errors from Laravel
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(t('commonSupplierListVue.snackbar.validationError', { errors: errorMessages }), 'error');
      }
      // Handle generic error messages from Laravel backend (e.g., 'error' or 'message' keys)
      else if (error.response.data.error) {
        showSnackbar(t('commonSupplierListVue.snackbar.apiErrorWithMessage', { message: error.response.data.error }), 'error');
      } else if (error.response.data.message) {
        showSnackbar(t('commonSupplierListVue.snackbar.apiErrorWithMessage', { message: error.response.data.message }), 'error');
      } else {
        showSnackbar(t('commonSupplierListVue.snackbar.apiErrorGeneric'), 'error');
      }
    } else {
      // Handle network errors or other unexpected issues
      showSnackbar(t('commonSupplierListVue.snackbar.networkError'), 'error');
    }
  } finally {
    loadingDialog.value = false;
  }
}

// --- Delete Confirmation Dialog Methods ---

/**
 * Opens the delete confirmation dialog, setting the supplier to be deleted.
 * @param item The supplier object to be deleted.
 */
function confirmDelete(item: Supplier) {
  supplierToDelete.value = item;
  confirmDeleteDialog.value = true;
}

/**
 * Executes the delete operation after user confirmation.
 * Includes a check for backend response indicating linked purchases.
 */
async function executeDelete() {
  if (!supplierToDelete.value) return; // Should not happen if dialog opened correctly

  loading.value = true;
   // Show loading state on delete button
  try {
    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');

    if (!token || !storeId) {
      showSnackbar(t('supplierListVue.snackbar.authOrStoreMissing'), 'error');
      router.push('/login'); // Redirect to login if auth is missing
      return;
    }

    const response = await axios.delete(`/api/suppliers/delete/${supplierToDelete.value.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Store-ID': storeId, // Ensure store_id is sent for authorization/ownership check on backend
      },
    });

    if (response.status === 200) { // Assuming 200 OK for successful deletion
      showSnackbar(t('supplierListVue.snackbar.deleteSuccess'), 'success');
      await fetchSuppliers(); // Refresh the supplier list
      cancelDelete(); // Close the dialog
    } else {
      showSnackbar(response.data.error || t('supplierListVue.snackbar.deleteFailed'), 'error');
    }
  } catch (error: any) {
    console.error('Error deleting supplier:', error);
    if (error.response && error.response.data) {
      if (error.response.status === 409) { // Example: Conflict if supplier is referenced elsewhere
        showSnackbar(t('supplierListVue.snackbar.deleteConflict', { message: error.response.data.message || error.response.data.error }), 'warning');
      } else {
        showSnackbar(error.response.data.message || t('commonSupplierListVue.snackbar.apiErrorGeneric'), 'error');
      }
    } else {
      showSnackbar(t('commonSupplierListVue.snackbar.networkError'), 'error');
    }
  } finally {
    loading.value = false; // Deactivate loading state
  }
}

/**
 * Cancels the delete operation and closes the confirmation dialog.
 */
function cancelDelete() {
  confirmDeleteDialog.value = false;
  supplierToDelete.value = null; // Clear the supplier to delete
}

// --- Data Fetching Methods ---
/**
 * Fetches the list of suppliers from the backend API.
 */
async function fetchSuppliers() {
  try {
    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');

    if (!token || !storeId) {
      showSnackbar(t('supplierListVue.snackbar.authOrStoreMissing'), 'error');
      router.push('/login'); // Redirect to login page if essential data is missing
      return;
    }

    const response = await axios.get('/api/suppliers', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Store-ID': storeId,
      }
    });
    suppliers.value = response.data.suppliers;
  } catch (error: any) {
    console.error('Error fetching suppliers:', error);
    showSnackbar(t('supplierListVue.snackbar.fetchError'), 'error');
  } finally {
    // isDataLoaded.value is handled in onMounted to ensure all initial fetches complete
  }
}

/**
 * Fetches general store information (name, contact, location, logo) from the backend.
 */
async function fetchStore() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('supplierListVue.snackbar.authOrStoreMissing'), 'error'); // More specific message for this context
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

// --- Printing and Exporting Methods ---

/**
 * Initiates the printing of selected suppliers.
 * Generates a new print window with styled content.
 */
function printSuppliers() {
  if (selectedSupplier.value.length === 0) {
    showSnackbar(t('supplierListVue.snackbar.selectSupplierToPrint'), 'error');
    return;
  }

  nextTick(() => { // Ensures the DOM update (if any) for printSection is complete
    if (!printSection.value) {
      console.warn('printSection is not ready for printing.');
      showSnackbar(t('supplierListVue.snackbar.printSectionNotReady'), 'error');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString(); // Format date for filename/title
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>supplier_list_${date.replace(/\//g, '-')}</title>
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
      showSnackbar(t('supplierListVue.snackbar.popupsBlocked'), 'error');
    }
  });
}

/**
 * Handles the download of the selected supplier list as an Excel (CSV) file.
 */
function downloadExcel() {
  if (selectedSupplier.value.length === 0) {
    showSnackbar(t('supplierListVue.snackbar.selectSupplierToExport'), 'error');
    return;
  }

  // Define CSV headers
  const csvHeaders = [
    t('supplierListVue.printReport.snHeader'),
    t('supplierListVue.printReport.nameHeader'),
    t('supplierListVue.printReport.addressHeader'),
    t('supplierListVue.printReport.contactHeader'),
    t('commonSupplierListVue.tableHeaders.dateAdded') // Assuming you add this to common table headers
  ];

  // Map selected supplier data to CSV rows
  const rows = selectedSupplier.value.map((supplier, index) => [
    index + 1,
    supplier.name,
    supplier.address,
    supplier.contact,
    new Date(supplier.created_at).toLocaleDateString() // Format date for CSV
  ]);

  // Create CSV content, handling commas and quotes within fields
  const csvContent = [
    csvHeaders.join(','),
    ...rows.map(row => row.map(field => {
      let value = String(field);
      // Enclose fields in double quotes if they contain commas, double quotes, or newlines
      if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes within the field
      }
      return value;
    }).join(','))
  ].join('\n'); // Join rows with newline characters

  // Create a Blob and a download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // Check if browser supports download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `supplier_list_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden'; // Hide the link
    document.body.appendChild(link);
    link.click(); // Programmatically click the link to trigger download
    document.body.removeChild(link); // Clean up the link
    showSnackbar(t('supplierListVue.snackbar.excelExportSuccess'), 'success');
  } else {
    showSnackbar(t('supplierListVue.snackbar.downloadNotSupported'), 'error');
  }
}

// --- Lifecycle Hooks ---
/**
 * `onMounted` hook: Called after the component has been mounted.
 * Initiates fetching of suppliers and store information.
 */
onMounted(async () => {
  isDataLoaded.value = false; // Set loading state to true
  try {
    // Await all initial data fetches concurrently for faster loading
    await Promise.all([
      fetchSuppliers(),
      fetchStore()
    ]);
  } catch (error) {
    console.error("Initial data loading failed:", error);
    showSnackbar(t('supplierListVue.snackbar.initialDataLoadFailed'), 'error');
  } finally {
    isDataLoaded.value = true; // Set loading state to false once all fetches are complete (or failed)
  }
});
</script>

<style scoped>
/* Scoped styles for the component */
.centered-headers th {
  text-align: center !important;
}

/* Adjust header alignment for better readability in the data table */
.v-data-table .v-data-table-header th {
  text-align: start; /* Default to left alignment for most headers */
}

/* Re-apply center alignment specifically for the "Actions" column header */
.v-data-table .v-data-table-header [aria-label="Actions"] {
    text-align: center !important;
}
</style>
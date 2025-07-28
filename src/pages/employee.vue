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
                {{ $t('employeeVue.employee_list') }}
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
                :label="$t('employeeVue.search_by_name')"
                prepend-inner-icon="mdi-magnify"
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
                <b>{{ selectedEmployee.length || filteredEmployee.length }}</b>
                {{ (selectedEmployee?.length ?? 0) === 1 ? 'Employee' : 'Employees' }}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredEmployee"
                :headers="headers"
                item-value="id"
                class="centered-headers"
                show-select
                v-model="selectedEmployee"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template #item.index="{ index }">
                  {{ index + 1 }}
                </template>
                <template v-slot:item.image="{ item }">
                  <img
                    :src="getLogoUrl(item.image)"
                    :alt="$t('employeeVue.employee_photo')"
                    style="height: 50px; width: 50px; border-radius: 25px; object-fit: cover;"
                    class="my-1"
                  />
                </template>

                <template #item.created_at="{ item }">
                  {{ item.created_at ? item.created_at.slice(0, 10) : 'N/A' }}
                </template>
                <template #item.status="{ item }">
                  
                  <v-chip v-if="item.status === 0" color="red" class="ma-2" label>
                   {{ $t('inactive') }} 
                  </v-chip>
                  <v-chip v-else color="success" class="ma-2" label>
                   {{ $t('active') }} 
                  </v-chip>
                </template>

                <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" class="mx-2" color="warning" @click="openEditDialog(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>

                  <v-btn icon size="small" :title="$t('employeeVue.view_employee')" class="mx-2" color="secondary" @click="viewEmployee(item)">
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" :title="$t('employeeVue.download_excel_file')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ $t('employeeVue.excel') }}
                </v-btn>

                <v-btn color="secondary" @click="printEmployees" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ $t('employeeVue.print') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>

          <v-dialog v-model="editDialog" max-width="700px" persistent>
            <v-card>
              <v-card-title class="text-h5 text-center py-4">
                {{ isNewEmployee ? $t('employeeVue.add_employee') : $t('employeeVue.edit_employee') }}
              </v-card-title>
              <v-card-text>
                <v-form ref="employeeForm" @submit.prevent="saveEmployee">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.name"
                        :label="$t('employeeVue.name')"
                        :rules="[v => !!v || $t('employeeVue.name_required')]"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.email"
                        :label="$t('employeeVue.email')"
                        :rules="emailRules"
                        prepend-inner-icon="mdi-email"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.contact"
                        :label="$t('employeeVue.contact')"
                        :rules="contactRules"
                        prepend-inner-icon="mdi-phone"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="editedItem.address"
                        :label="$t('employeeVue.address')"
                        :rules="[v => !!v || $t('employeeVue.address_required')]"
                        prepend-inner-icon="mdi-map-marker"
                        variant="outlined"
                        class="mb-0"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="editedItem.role"
                       :items="[
                          $t('addEmployeeVue.cashier'),$t('addEmployeeVue.stock_controller'),$t('addEmployeeVue.staff') ]"
                        :label="$t('employeeVue.role')"
                        :rules="[v => !!v || $t('employeeVue.role_required')]"
                        prepend-inner-icon="mdi-briefcase"
                        variant="outlined"
                        class="mb-0"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-select
                        v-model="editedItem.status"
                        :items="[{ title: $t('employeeVue.active'), value: 1 }, { title: $t('employeeVue.inactive'), value: 0 }]"
                        :label="$t('employeeVue.status')"
                        :rules="[v => v !== null && v !== undefined || $t('employeeVue.status_required')]"
                        prepend-inner-icon="mdi-check-circle"
                        variant="outlined"
                        class="mb-0"
                      ></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-file-input
                        :label="$t('employeeVue.employee_photo_optional')"
                        accept="image/*"
                        prepend-inner-icon=""
                        append-inner-icon="mdi-camera"
                        variant="outlined"
                        show-size
                        clearable
                        counter
                        :rules="imageUploadRules"
                        class="mb-2"
                        v-model="editedItem.imageFile"
                        @change="onFileSelected"
                        :hint="$t('employeeVue.max_2mb_image_types')"
                        persistent-hint
                      ></v-file-input>
                    </v-col>
                  </v-row>

                  <div v-if="editedItem.selectedImagePreview" class="image-preview-container mb-2">
                      <v-img :src="editedItem.selectedImagePreview" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                  </div>
                  <div v-else-if="editedItem.originalImagePath" class="image-preview-container mb-2">
                      <v-img :src="getLogoUrl(editedItem.originalImagePath)" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                  </div>
                  <div v-else class="no-image-placeholder mb-4">
                      <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                      <p class="text-caption text-grey-lighten-1 mt-2">{{ $t('employeeVue.no_photo_selected') }}</p>
                  </div>

                  <center>
                    <v-btn color="primary" type="submit" class="my-4 mx-1" :loading="loadingDialog">
                      {{ isNewEmployee ? $t('employeeVue.add_employee') : $t('employeeVue.save_changes') }}
                    </v-btn>
                    <v-btn color="error" class="my-3 mx-1" @click="closeEditDialog">
                      {{ $t('employeeVue.cancel') }}
                    </v-btn>
                  </center>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>

          <div ref="printSection" class="d-none">
            <div class="report-container">
              <div class="watermark">{{ storeName }}</div>
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
                <h3 class="report-title">{{ $t('employeeVue.employee_list') }}</h3>
                <p class="report-date">Date: {{ datePrint }}</p>
              </div>

              <div class="report-summary">
               <p>
                  {{ t('employeeVue.totalEntries') }}: <b>{{ selectedEmployee.length }}</b> {{ selectedEmployee.length === 1 ? 'Employee' : 'Employees' }}
                </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>SN</th>
                      <th>{{ $t('employeeVue.name') }}</th>
                      <th>{{ $t('employeeVue.email') }}</th>
                      <th>{{ $t('employeeVue.contact') }}</th>
                      <th>{{ $t('employeeVue.address') }}</th>
                      <th>{{ $t('employeeVue.role') }}</th>
                      <th>{{ $t('employeeVue.status') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(employee, index) in selectedEmployee" :key="employee.id ?? index">
                      <td>{{ index + 1 }}</td>
                      <td>{{ employee.name }}</td>
                      <td>{{ employee.email }}</td>
                      <td>{{ employee.contact }}</td>
                      <td>{{ employee.address }}</td>
                      <td>{{ employee.role }}</td>
                      <td>{{ employee.status > 0 ? $t('employeeVue.active') : $t('employeeVue.inactive') }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="report-footer-section">
              <p class="powered-by">{{ $t('employeeVue.powered_by') }}</p>
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

        <v-dialog v-model="showEmployeeDialog" max-width="700">
          <v-card>
            <v-card-title class="d-flex align-center">
              {{ $t('employeeVue.employee_details') }}
              <v-spacer></v-spacer>
              <v-btn icon flat @click="showEmployeeDialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text v-if="currentEmployee">
              <v-row>
                <v-col cols="12" md="5" class="d-flex justify-content-center align-center">
                  <div class="inverted-rectangle-avatar elevation-4">
                    <v-img :src="getImageUrl(currentEmployee.image)" :alt="$t('employee_photo')"></v-img>
                  </div>
                </v-col>
                <v-col cols="12" md="7">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('employeeVue.name') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentEmployee.name }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('employeeVue.email') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentEmployee.email }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('employeeVue.contact') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentEmployee.contact }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('employeeVue.address') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentEmployee.address }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('employeeVue.role') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ currentEmployee.role }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('employeeVue.status') }}:</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip :color="currentEmployee.status === 1 ? 'green' : 'grey'" label outlined small>
                          {{ currentEmployee.status === 1 ? $t('employeeVue.active') : $t('employeeVue.inactive') }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title class="font-weight-medium">{{ $t('employeeVue.date_hired') }}:</v-list-item-title>
                      <v-list-item-subtitle>{{ new Date(currentEmployee.created_at).toLocaleDateString() }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="error" @click="showEmployeeDialog = false">{{ $t('employeeVue.close') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n'; // Import useI18n

import type { VDataTable } from 'vuetify/components';

const { t, locale } = useI18n(); // Destructure the t (translate) function


type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;

// 2. Then, get the type of a single item from that NonNullable array
type DataTableHeader<T> = VDataTableInternalHeaders[number] & {
  value?: keyof T | 'data-table-expand' | 'data-table-select' | (string & {});
};
// --- Interfaces ---
interface Employee {
  id: number | null; // Nullable for new employees
  name: string;
  email: string;
  contact: string;
  address: string;
  role: string;
  status: 0 | 1; // 0 for inactive, 1 for active
  image: string | null; // Can be null if no image is uploaded
  created_at: string; // Date of creation/hiring
}

// --- Main Component Reactive State ---
const employees = ref<Employee[]>([]);
const search = ref<string>('');
const selectedEmployee = ref<Employee[]>([]);

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

// Dialog specific states for Employee Details (View)
const showEmployeeDialog = ref<boolean>(false);
const currentEmployee = ref<Employee | null>(null);

// --- Employee Edit/Add Dialog State (INTEGRATED) ---
const editDialog = ref<boolean>(false); // Controls visibility of the edit/add dialog
const employeeForm = ref<any>(null); // Ref for the v-form inside the dialog
const loadingDialog = ref(false); // Loading state for the dialog's save button

const editedItem = ref<Employee & { imageFile: File[] | null; selectedImagePreview: string | null; originalImagePath: string | null; }>({
  id: null,
  name: '',
  email: '',
  contact: '',
  address: '',
  role: '',
  status: 1, // Default to Active
  image: null, // This will hold the path from DB
  created_at: new Date().toISOString(), // Default for new, will be overwritten for edit
  imageFile: null,            // Holds the newly selected File object (as an array)
  selectedImagePreview: null, // Holds the URL.createObjectURL for client-side preview
  originalImagePath: null,    // Stores the *original* image path from DB when dialog opens
});

const isNewEmployee = computed(() => !editedItem.value.id); // Determine if it's a new employee or edit

const router = useRouter(); // Initialize router

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


const filteredEmployee = computed<Employee[]>(() => {
  return employees.value.filter(employee => {
    return employee.name.toLowerCase().includes(search.value.toLowerCase());
  });
});

const headers = computed<DataTableHeader<Employee>[]>(() => [
  { title: t('employeeVue.photo'), value: 'image', align: 'center' as const},
  { title: t('employeeVue.name'), value: 'name', align: 'center' as const},
  { title: t('employeeVue.email'), value: 'email', align: 'center' as const},
  { title: t('employeeVue.contact'), value: 'contact', align: 'center'as const },
  { title: t('employeeVue.address'), value: 'address', align: 'center' as const},
  { title: t('employeeVue.role'), value: 'role', align: 'center' as const},
  { title: t('employeeVue.date_hired'), value: 'created_at', align: 'center' as const},
  { title: t('employeeVue.status'), value: 'status', align: 'center' as const},
  { title: t('employeeVue.actions'), value: 'actions', align: 'center' as const, sortable: false },
]);


// --- Validation Rules (for dialog) ---
const emailRules = [
  (v: string) => !!v || t('employeeVue.email_required'),
  (v: string) => /.+@.+\..+/.test(v) || t('employeeVue.email_must_be_valid'),
];

const contactRules = [
  (v: string) => !!v || t('employeeVue.contact_required'),
  (v: string) => /^\+?\d{6,15}$/.test(v) || t('employeeVue.contact_must_be_valid'),
];

const imageUploadRules = computed(() => [
  (v: File[] | null) => {
    if (!v || v.length === 0) return true; // Image is optional
    const file = v[0];
    const maxSize = 2 * 1024 * 1024; // 2 MB
    return file.size < maxSize || t('employeeVue.image_size_less_than_2mb');
  },
  (v: File[] | null) => {
    if (!v || v.length === 0) return true;
    const file = v[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type) || t('employeeVue.only_allowed_image_types');
  },
]);


// --- General Methods ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

/**
 * Constructs the full image URL.
 * @param path The relative path to the image, a File object, or null.
 * @returns The absolute URL for the image.
 */
const backendUrl = 'http://localhost:8000';

const getLogoUrl = (logoPath: string | undefined | null) => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image'; // This is the fallback
};

const getImageUrl = (imagePath: string | null): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/150x80?text=No+Logo'; // Placeholder if no logo path
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath; // Already a full URL
  }
  return `${backendUrl}/storage/${imagePath}`; // Assume Laravel storage path
};

/**
 * Fetches the list of employees from the backend.
 */
async function fetchEmployees() {
  try {
    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');

    if (!token || !storeId) {
      showSnackbar(t('employeeVue.authentication_missing'), 'error');
      router.push('/login');
      return;
    }

    const response = await axios.get('/api/employees', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Store-ID': storeId,
      }
    });
    employees.value = response.data.employees;
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    showSnackbar(t('employeeVue.failed_to_load_employees'), 'error');
  }
}

/**
 * Fetches store information from the backend.
 */
async function fetchStore() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('employeeVue.authentication_missing'), 'error');
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
    // showSnackbar(t('error_fetching_store_details'), 'error'); // Only show if critical
  }
}

/**
 * Handles the view action for an employee, opening a dialog.
 * @param item The employee item to view.
 */
function viewEmployee(item: Employee) {
  currentEmployee.value = item;
  showEmployeeDialog.value = true;
}

// --- Employee Edit/Add Dialog Methods ---

/**
 * Opens the EmployeeEditDialog for editing an existing employee or adding a new one.
 * @param item Optional. The employee object to be edited. If null, a new employee form is prepared.
 */
function openEditDialog(item: Employee | null = null) {
  if (item) {
    editedItem.value = {
      ...item,
      status: item.status === 1 ? 1 : 0, // Simplified: status is already 0 or 1
      imageFile: null, // No new file selected initially
      selectedImagePreview: null, // No new file preview initially
      originalImagePath: item.image, // Store current image path
    };
  } else {
    // Reset for a new employee
    Object.assign(editedItem.value, {
      id: null,
      name: '',
      email: '',
      contact: '',
      address: '',
      role: '',
      status: 1, // Default to Active
      image: null,
      created_at: new Date().toISOString(), // This will be set by backend on creation
      imageFile: null,
      selectedImagePreview: null,
      originalImagePath: null,
    });
  }
  editDialog.value = true;
  nextTick(() => {
    // This nextTick ensures the form is rendered before attempting to access its ref
    if (employeeForm.value) {
      employeeForm.value.resetValidation();
    }
  });
}

/**
 * Handles file selection for the employee image in the dialog.
 */
const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  editedItem.value.selectedImagePreview = null; // Clear existing preview when new selection is made

  if (files && files.length > 0) {
    const file = files[0];
    let isValidFile = true;

    // Validate the new file against rules
    for (const rule of imageUploadRules.value) {
      const result = rule([file]);
      if (typeof result === 'string') {
        showSnackbar(result, 'error');
        isValidFile = false;
        break;
      }
    }

    if (isValidFile) {
      editedItem.value.imageFile = [file]; // Set the file input model to an array containing the file
      editedItem.value.selectedImagePreview = URL.createObjectURL(file); // Create local preview URL
    } else {
      editedItem.value.imageFile = null;
      editedItem.value.selectedImagePreview = null;
    }
  } else {
    // Scenario: User cleared the file input (no files selected)
    editedItem.value.imageFile = null;
    editedItem.value.selectedImagePreview = null;
    // THIS IS CRUCIAL: Signal to the backend that the image should be removed
    // Only set originalImagePath to null if it's an existing employee AND the user cleared the file input.
    // If it's a new employee, originalImagePath will already be null.
    if (!isNewEmployee.value) {
      editedItem.value.originalImagePath = null;
    }
      // No need to set editDialog.value = true here, it's already true if the dialog is open.
      // The original line `editDialog.value = true;` seemed out of place inside onFileSelected.
    nextTick(() => {
      if (employeeForm.value) {
        employeeForm.value.resetValidation(); // Reset Vuetify validation state
      }
    });
  }
};

/**
 * Saves or updates the employee data from the dialog.
 */
async function saveEmployee() {
  // Ensure employeeForm.value is not null before calling validate()
  if (!employeeForm.value) {
    console.error("Form reference 'employeeForm' is null. Cannot validate.");
    showSnackbar(t('employeeVue.form_not_ready'), 'error'); // A user-friendly message
    return;
  }

  const { valid } = await employeeForm.value.validate();
  if (!valid) {
    showSnackbar(t('employeeVue.please_correct_form_errors'), 'error');
    return;
  }
  
  loadingDialog.value = true;
  try {
    const formData = new FormData();

    // Append text fields
    formData.append('name', editedItem.value.name);
    formData.append('email', editedItem.value.email);
    formData.append('contact', editedItem.value.contact);
    formData.append('address', editedItem.value.address);
    formData.append('role', editedItem.value.role);
    formData.append('status', editedItem.value.status.toString()); // Convert to string for FormData

    // Image Handling Logic
    if (editedItem.value.imageFile && editedItem.value.imageFile.length > 0) {
      // Scenario 1: New image uploaded
      formData.append('image', editedItem.value.imageFile[0]);
    } else if (editedItem.value.originalImagePath === null && !isNewEmployee.value) {
      // Scenario 2: Existing image explicitly cleared by user on an existing employee
      formData.append('image', 'CLEAR_IMAGE'); // Backend needs to interpret this
    }
    // If no new image and originalImagePath is not null (i.e., untouched), no 'image' field is sent.

    const token = sessionStorage.getItem('access_token');
    const storeId = sessionStorage.getItem('storeId');

    if (!token || !storeId) {
      showSnackbar(t('employeeVue.authentication_missing'), 'error');
      loadingDialog.value = false;
      return;
    }

    let response;
    if (isNewEmployee.value) {
      // Add new employee
      formData.append('store_id', storeId); // Associate with the current store
      response = await axios.post('/api/employees/store', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
    } else {
      // Update existing employee
      formData.append('_method', 'PUT'); // Important for Laravel PUT/PATCH with FormData
      response = await axios.post(`/api/employees/edit/${editedItem.value.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
    }

    if (response.data.success) {
      showSnackbar(response.data.success, 'success');
      await fetchEmployees(); // Re-fetch the list to show updates
      closeEditDialog();
    } else {
      showSnackbar(response.data.error || t('failed_to_save_employee'), 'error');
    }
  } catch (error: any) {
    console.error('Error saving employee:', error);
    if (error.response && error.response.data) {
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(`${t('employeeVue.validation_error')} ${errorMessages}`, 'error');
      } else if (error.response.data.message) {
        showSnackbar(`${t('employeeVue.error')}: ${error.response.data.message}`, 'error');
      } else {
        showSnackbar(t('employeeVue.an_api_error_occurred'), 'error');
      }
    } else {
      showSnackbar(t('employeeVue.unexpected_error_occurred'), 'error');
    }
  } finally {
    loadingDialog.value = false;
  }
}

function closeEditDialog() {
  editDialog.value = false;
  nextTick(() => {
    // Reset editedItem to default values only after dialog is fully closed
    Object.assign(editedItem.value, {
      id: null,
      name: '',
      email: '',
      contact: '',
      address: '',
      role: '',
      status: 1,
      image: null,
      created_at: new Date().toISOString(), // Default for new, will be set by backend for add
      imageFile: null,
      selectedImagePreview: null,
      originalImagePath: null,
    });
    if (employeeForm.value) {
      employeeForm.value.resetValidation();
    }
  });
}

// Watch for changes in the dialog's internal state to reset if closed externally (e.g., escape key)
watch(editDialog, (newVal) => {
  if (!newVal) {
    closeEditDialog(); // Ensure full reset if dialog is closed by means other than the cancel button
  }
});

// --- Print and Excel Methods ---

/**
 * Initiates the printing of selected employees.
 */
function printEmployees() {
  if (selectedEmployee.value.length === 0) {
    showSnackbar(t('employeeVue.select_employee_to_print'), 'error');
    return;
  }

  nextTick(() => {
    if (!printSection.value) {
      console.warn('printSection is not ready for printing.');
      showSnackbar(t('employeeVue.print_section_not_ready'), 'error');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('employee_list')}_${date.replace(/\//g, '-')}</title>
            <style>
              /* Embedded Print Styles */
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
                position: fixed;
                bottom: 0;
                left: 0;
                width: 100%;
                padding: 15px;
                text-align: center;
                background-color: #fff; /* Ensure it prints on white background */
                z-index: 1000;
                font-size: 10px;
                color: #666;
                border-top: 1px solid #eee;
              }
              .powered-by { font-style: italic; margin-top: 10px; }
              
              /* Image styles for print (for employee photos within table) */
              .report-table img {
                height: 40px;
                width: 40px;
                object-fit: cover;
                border-radius: 50%; /* Make them round if desired */
                display: inline-block;
                vertical-align: middle;
              }
              .d-flex { display: flex; align-items: center; } /* To align images side-by-side */
              
              .watermark {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-45deg);
                  font-size: 100px; /* Larger watermark */
                  color: rgba(0, 0, 0, 0.08); /* Lighter watermark */
                  pointer-events: none;
                  user-select: none;
                  white-space: nowrap;
                  z-index: -8;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
              }

              /* Specific adjustments for print media */
              @media print {
                  body {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                  }
                  .report-logo {
                      filter: none !important; /* Ensure logo colors are printed */
                  }
                  /* Break long text that might overflow table cells */
                  .report-table td {
                      word-wrap: break-word;
                      white-space: normal;
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
      showSnackbar(t('employeeVue.could_not_open_print_window'), 'error');
    }
  });
}

/**
 * Handles the download of the employee list as an Excel (CSV) file.
 */
function downloadExcel() {
  if (selectedEmployee.value.length === 0) {
    showSnackbar(t('employeeVue.select_employee_to_export'), 'error');
    return;
  }

  const headers = [
    t('employeeVue.sn'),
    t('employeeVue.name'),
    t('employeeVue.email'),
    t('employeeVue.contact'),
    t('employeeVue.address'),
    t('employeeVue.role'),
    t('employeeVue.status'),
    t('employeeVue.date_hired')
  ];

  const rows = selectedEmployee.value.map((employee, index) => [
    index + 1, // SN
    employee.name,
    employee.email,
    employee.contact,
    employee.address,
    employee.role,
    employee.status === 1 ? t('employeeVue.active') : t('employeeVue.inactive'),
    new Date(employee.created_at).toLocaleDateString()
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
  if (link.download !== undefined) { // Feature detection for HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${t('employeeVue.employee_list') }_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('employeeVue.employee_list_exported_successfully'), 'success');
  } else {
    showSnackbar(t('employeeVue.browser_does_not_support_download'), 'error');
  }
}

// --- Lifecycle Hooks ---
onMounted(async () => {
  isDataLoaded.value = false;
  try {
    await Promise.all([
      fetchEmployees(),
      fetchStore()
    ]);
  } catch (error) {
    console.error("Initial data loading failed:", error);
  } finally {
    isDataLoaded.value = true;
  }
});
</script>

<style scoped>
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
.v-data-table .v-data-table-header [aria-label="Photo"],
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
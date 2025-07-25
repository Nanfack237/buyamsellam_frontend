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
                {{ t('products.title') }}
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
                :label="t('products.searchPlaceholder')"
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
                <b>{{ selectedProduct.length || filteredProduct.length }}</b>
                {{ (selectedProduct?.length ?? 0) === 1 ? t('products.countSingular'): t('products.countPlural')}}
              </p>
              <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>

              <v-data-table
                :items="filteredProduct"
                item-value="id"
                :headers="headers"
                class="centered-headers"
                show-select
                v-model="selectedProduct"
                return-object
                :sort-by="[{ key: 'id', order: 'desc' }]"
              >
                <template v-slot:item.images="{ item }">
                  <div class="d-flex my-1 align-center justify-center">
                    <img
                      v-if="item.image1"
                      :src="getImageUrl(item.image1)"
                      alt="Product Image 1"
                      style="height: 55px; width: 55px; border-radius: 10px; object-fit: cover; margin-right: 5px;"
                    />
                    <!-- <img
                      v-if="item.image2"
                      :src="getImageUrl(item.image2)"
                      alt="Product Image 2"
                      style="height: 55px; width: 55px; border-radius: 10px; object-fit: cover;"
                    /> -->
                    <span v-if="!item.image1 && !item.image2">{{ t('common.noImage') }}</span>
                  </div>
                </template>
                <template v-slot:item.created_at="{ item }">
                  {{ item.created_at ? item.created_at.slice(0, 10) : t('common.na') }}
                </template>
                <template v-slot:item.actions="{ item }">
                  <v-btn icon size="small" class="mx-2" color="warning" @click="openEditDialog(item)">
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                  <v-btn icon size="small" color="error" @click="openConfirmDeleteDialog(item)">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <template v-slot:no-data>
                  <v-alert :value="true" color="info" icon="mdi-information-outline">
                    {{ t('products.noData') }}
                  </v-alert>
                </template>
              </v-data-table>
            </v-card>

            <v-row justify="end" class="my-1">
              <v-col cols="auto">
                <v-btn color="green-darken-2" variant="flat" :title="t('products.export.buttonTooltip')" @click="downloadExcel" class="mb-4 mx-2">
                  <v-icon>mdi-microsoft-excel</v-icon> {{ t('products.export.buttonText') }}
                </v-btn>

                <v-btn color="secondary" @click="printProducts" class="mb-4">
                  <v-icon>mdi-printer</v-icon> {{ t('products.print.buttonText') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-row>

          <v-dialog v-model="editDialog" width="600">
            <v-card>
              <v-card-title class="text-h5 text-center py-4">{{ t('products.editDialog.title') }}</v-card-title>
              <v-card-text>
                <v-form ref="editForm" @submit.prevent="saveProduct">
                  <v-text-field
                    v-model="editedItem.name"
                    :label="t('products.editDialog.productNameLabel')"
                    :rules="[v => !!v || t('products.validation.required', { field: t('products.editDialog.productNameLabel') })]"
                    required
                    prepend-inner-icon="mdi-package-variant"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>

                  <v-text-field
                    v-model="editedItem.category"
                    :label="t('products.editDialog.categoryLabel')"
                    :rules="[v => !!v || t('products.validation.required', { field: t('products.editDialog.categoryLabel') })]"
                    required
                    prepend-inner-icon="mdi-shape"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>

                  <v-textarea
                    v-model="editedItem.description"
                    :label="t('products.editDialog.descriptionLabel')"
                    prepend-inner-icon="mdi-note-text"
                    variant="outlined"
                    rows="3"
                    class="mb-4"
                  ></v-textarea>

                  <v-row>
                    <v-col cols="12" md="6">
                      <v-file-input
                        :label="t('products.editDialog.image1Label')"
                        accept="image/*"
                        prepend-inner-icon=""
                        append-inner-icon="mdi-camera"
                        variant="outlined"
                        show-size
                        clearable
                        counter
                        :rules="imageUploadRules"
                        class="mb-4"
                        v-model="editedItem.image1File"
                        @change="onEditFileSelected($event, 'image1')"
                        :hint="t('products.editDialog.imageHint')"
                        persistent-hint
                      ></v-file-input>

                      <div v-if="editedItem.selectedImage1Preview" class="image-preview-container mt-4">
                            <v-img :src="editedItem.selectedImage1Preview" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                      </div>
                      <div v-else-if="editedItem.originalImage1Path" class="image-preview-container mt-4">
                            <v-img :src="getImageUrl(editedItem.originalImage1Path)" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                      </div>
                      <div v-else class="no-image-placeholder mb-4">
                            <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                            <p class="text-caption text-grey-lighten-1 mt-2">{{ t('products.editDialog.noImageSelected') }}</p>
                      </div>
                    </v-col>

                    <v-col cols="12" md="6">
                      <v-file-input
                        :label="t('products.editDialog.image2Label')"
                        accept="image/*"
                        prepend-inner-icon=""
                        append-inner-icon="mdi-camera"
                        variant="outlined"
                        show-size
                        clearable
                        counter
                        :rules="imageUploadRules"
                        class="mb-4"
                        v-model="editedItem.image2File"
                        @change="onEditFileSelected($event, 'image2')"
                        :hint="t('products.editDialog.imageHint')"
                        persistent-hint
                      ></v-file-input>

                      <div v-if="editedItem.selectedImage2Preview" class="image-preview-container mt-4">
                            <v-img :src="editedItem.selectedImage2Preview" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                      </div>
                      <div v-else-if="editedItem.originalImage2Path" class="image-preview-container mt-4">
                            <v-img :src="getImageUrl(editedItem.originalImage2Path)" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                      </div>
                      <div v-else class="no-image-placeholder mb-4">
                            <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                            <p class="text-caption text-grey-lighten-1 mt-2">{{ t('products.editDialog.noImageSelected') }}</p>
                      </div>
                    </v-col>
                  </v-row>
                  <center>
                    <v-btn color="primary" type="submit" class="my-3 mx-1" :loading="loading">
                      {{ t('products.editDialog.saveButton') }}
                    </v-btn>
                    <v-btn color="error" class="my-3 mx-1" @click="closeEditDialog">
                      {{ t('products.editDialog.cancelButton') }}
                    </v-btn>
                  </center>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>

          <v-dialog v-model="deleteConfirmDialog" max-width="400px">
            <v-card>
              <v-card-title class="text-h6 text-center py-4">{{ t('products.deleteDialog.title') }}</v-card-title>
              <v-card-text class="text-center">
                {{ t('products.deleteDialog.message', { productName: itemToDelete ? itemToDelete.name : '' }) }}
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn color="error" variant="flat" @click="deleteProduct" :loading="loading">{{ t('products.deleteDialog.deleteButton') }}</v-btn>
                <v-btn color="secondary" @click="closeConfirmDeleteDialog">{{ t('products.deleteDialog.cancelButton') }}</v-btn>
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
                <h3 class="report-title">{{ t('report.title') }}</h3>
                <p class="report-date">{{ t('report.datePrefix') }} {{ datePrint }}</p>
              </div>

              <div class="report-summary">
                 <p class="text-high-emphasis py-2">
                    <b>{{ selectedProduct.length || filteredProduct.length }}</b>
                    {{ (selectedProduct?.length ?? 0) === 1 ? t('products.countSingular'): t('products.countPlural')}}
                  </p>
              </div>

              <div class="report-table-section">
                <table class="report-table">
                  <thead>
                    <tr>
                      <th>{{ t('snLabel') }}</th>
                      <!-- <th class="text-left">{{ t('products.tableHeaders.images') }}</th> -->
                      <th class="text-left">{{ t('products.tableHeaders.name') }}</th>
                      <th class="text-left">{{ t('products.tableHeaders.category') }}</th>
                      <th class="text-left">{{ t('products.tableHeaders.description') }}</th>
                      <th class="text-left">{{ t('products.tableHeaders.dateAdded') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(product, index) in selectedProduct" :key="product.id">
                      <td>{{ index + 1 }}</td>
                      <!-- <td>
                        <div class="d-flex">
                          <img
                            v-if="product.image1"
                            :src="getImageUrl(product.image1)"
                            alt="Image 1"
                            style="height: 30px; width: 30px; object-fit: cover; margin-right: 5px;"
                          />
                          <img
                            v-if="product.image2"
                            :src="getImageUrl(product.image2)"
                            alt="Image 2"
                            style="height: 30px; width: 30px; object-fit: cover;"
                          />
                          <span v-if="!product.image1 && !product.image2">{{ t('common.noImage') }}</span>
                        </div>
                      </td> -->
                      <td>{{ product.name }}</td>
                      <td>{{ product.category }}</td>
                      <td>{{ product.description }}</td>
                      
                      <td>{{ new Date(product.created_at).toLocaleDateString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="report-footer-section">
                <p class="powered-by">{{ t('report.poweredBy') }}</p>
              </div>
            </div>
          </div>

          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>

          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent scrim="#000000">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ t('common.loading') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n'; // Import useI18n
import axios from '@/axios'; // Ensure this path is correct for your axios instance
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';

import type { VDataTable } from 'vuetify/components';

// Initialize i18n
const { t, locale } = useI18n();

// Define your backend URL (adjust if different in production)
const backendUrl = 'http://localhost:8000';

type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;

// 2. Then, get the type of a single item from that NonNullable array
type DataTableHeader<T> = VDataTableInternalHeaders[number] & {
  value?: keyof T | 'data-table-expand' | 'data-table-select' | (string & {});
};

// --- Interfaces for Type Safety (Highly Recommended) ---
interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image1: string | null; // Original path from DB for image 1
  image2: string | null; // Original path from DB for image 2
  created_at: string;
  updated_at: string;
}

// --- Reactive State ---
const products = ref<Product[]>([]);
const search = ref<string>(''); // For data table search
const selectedProduct = ref<Product[]>([]); // For selected items in data table
const isDataLoaded = ref<boolean>(false); // Controls loading overlay

// Snackbar for user feedback
const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

// Store details for printing report
const storeName = ref<string>('');
const storeContact = ref<string>('');
const storeLocation = ref<string>('');
const storeLogoUrl = ref<string>('');

const printSection = ref<HTMLElement | null>(null); // Reference to the hidden print section

// --- Edit Product Dialog State ---
const editDialog = ref<boolean>(false);
const loading = ref<boolean>(false); // For submit button loading state

const editedItem = ref<any>({
  id: null,
  name: '',
  category: '',
  description: '',
  image1File: null,            // Holds the newly selected File object (as an array from v-file-input)
  selectedImage1Preview: null, // Holds the URL.createObjectURL for client-side preview of new file
  originalImage1Path: null,    // Stores the *original* image path from DB when dialog opens

  image2File: null,
  selectedImage2Preview: null,
  originalImage2Path: null,
});

// Default state for resetting the editedItem
const defaultItem = {
  id: null,
  name: '',
  category: '',
  description: '',
  image1File: null,
  selectedImage1Preview: null,
  originalImage1Path: null,
  image2File: null,
  selectedImage2Preview: null,
  originalImage2Path: null,
};
const editForm = ref<any>(null); // Ref for the v-form component in edit dialog

// --- Confirm Delete Dialog State ---
const deleteConfirmDialog = ref<boolean>(false);
const itemToDelete = ref<Product | null>(null);

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


const filteredProduct = computed<Product[]>(() => {
  return products.value.filter(product => {
    return product.name.toLowerCase().includes(search.value.toLowerCase());
  });
});

const headers = computed<DataTableHeader<Product>[]>(() => [
  { title: t('products.tableHeaders.images'), value: 'images', align: 'center' as const, sortable: false },
  { title: t('products.tableHeaders.name'), value: 'name', align: 'start' as const },
  { title: t('products.tableHeaders.category'), value: 'category', align: 'start' as const},
  { title: t('products.tableHeaders.description'), value: 'description', align: 'start' as const},
  { title: t('products.tableHeaders.dateAdded'), value: 'created_at', align: 'center' as const},
  { title: t('products.tableHeaders.actions'), value: 'actions', align: 'center' as const, sortable: false },
]);

const imageUploadRules = computed(() => [
  (v: File[] | null) => {
    // If no file is selected (v is null or empty array), rule passes (image is optional)
    if (!v || v.length === 0) return true;
    const file = v[0]; // Get the actual File object from the array
    const maxSize = 2 * 1024 * 1024; // 2 MB
    return file.size < maxSize || t('products.validation.imageSize');
  },
  (v: File[] | null) => {
    if (!v || v.length === 0) return true;
    const file = v[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type) || t('products.validation.imageType');
  },
]);

// --- Methods ---

/**
 * Displays a snackbar notification.
 * @param messageKey The translation key for the message to display.
 * @param color The color of the snackbar (e.g., 'success', 'error', 'warning').
 * @param interpolation Optional object for message interpolation.
 */
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

/**
 * Generates a URL for an image, handling local files (new uploads) and remote paths (existing images).
 * @param imageSource The image path (string from DB) or a File array (from v-file-input).
 * @returns A string URL for the image.
 */
const getImageUrl = (imageSource: string | File[] | null): string => {
  if (!imageSource) {
    return 'https://via.placeholder.com/55x55?text=No+Image'; // Placeholder for no image
  }

  // If it's a File array (meaning a new file selected from input)
  if (Array.isArray(imageSource) && imageSource.length > 0) {
    return URL.createObjectURL(imageSource[0]); // Create a temporary URL for browser preview
  }
  // If it's a string path (existing image from backend or already a full URL)
  if (typeof imageSource === 'string') {
    if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
      return imageSource; // Already a full URL
    }
    // Assume it's a relative path from storage, prepend backend URL
    return `${backendUrl}/storage/${imageSource}`;
  }

  // Fallback for unexpected types or empty file inputs
  return 'https://via.placeholder.com/55x55?text=' + t('common.invalidImageSource'); // Translated placeholder
};

/**
 * Helper function to construct a URL for the store logo.
 * @param logoPath The path to the logo from the backend.
 * @returns A full URL for the logo.
 */

const getLogoUrl = (logoPath: string | undefined | null) => {
  if (logoPath && !logoPath.startsWith('http') && !logoPath.includes('storage')) {
    return `${backendUrl}/storage/${logoPath}`;
  }
  return logoPath || 'https://via.placeholder.com/60x60?text=No+Image'; // This is the fallback
};
/**
 * Fetches the list of products from the backend API.
 */
async function fetchProducts() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('common.snackbar.authRequired'), 'error');
      // router.push('/login'); // Uncomment if you want to redirect to login
      isDataLoaded.value = true;
      return;
    }

    const response = await axios.get('/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    products.value = response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    showSnackbar(t('common.snackbar.errorFetchingProducts'), 'error');
  } finally {
    isDataLoaded.value = true; // Data fetching attempted, hide overlay
  }
}

/**
 * Fetches store details (name, contact, location, logo) from the backend.
 */
async function fetchStore() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('common.snackbar.authRequiredFetchStore'), 'error');
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

/**
 * Handles the file selection and preview for image inputs in the edit dialog.
 * Crucially distinguishes between selecting a new file and clearing the input.
 * @param event The change event from the file input.
 * @param imageKey A string indicating which image file is being handled ('image1', 'image2').
 */
const onEditFileSelected = (event: Event, imageKey: 'image1' | 'image2') => {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  // Determine which properties of editedItem to update based on imageKey
  const fileRef = imageKey === 'image1' ? 'image1File' : 'image2File';
  const previewRef = imageKey === 'image1' ? 'selectedImage1Preview' : 'selectedImage2Preview';
  const originalPathRef = imageKey === 'image1' ? 'originalImage1Path' : 'originalImage2Path';

  if (files && files.length > 0) {
    const file = files[0];

    // Reset local preview if a new file is being selected
    editedItem.value[previewRef] = null;

    let isValidFile = true;
    for (const rule of imageUploadRules.value) {
      const result = rule([file]); // Pass the file in an array to match rule signature
      if (typeof result === 'string') {
        showSnackbar(result, 'error'); // Pass the actual error string
        editedItem.value[fileRef] = null; // Clear the input if invalid
        editedItem.value[previewRef] = null; // Clear preview too
        isValidFile = false;
        break;
      }
    }

    if (isValidFile) {
      // Set the file input model to an array containing the file
      editedItem.value[fileRef] = [file];
      // Create a URL for the new file to show client-side preview
      editedItem.value[previewRef] = URL.createObjectURL(file);
      // When a new file is selected, it implicitly replaces the original.
      // We don't need to change originalPathRef here, as saveProduct will prioritize fileRef.
    } else {
      editedItem.value[fileRef] = null;
      editedItem.value[previewRef] = null;
    }
  } else {
    // Scenario: User cleared the file input (no files selected)
    editedItem.value[fileRef] = null; // Clear the file input model
    editedItem.value[previewRef] = null; // Clear the local preview

    // THIS IS CRUCIAL: Explicitly set the original path to null.
    // This will signal to the backend in saveProduct that the existing image should be removed.
    editedItem.value[originalPathRef] = null;
  }
};

/**
 * Opens the edit product dialog and populates it with the selected product's data.
 * @param item The product object to be edited.
 */
function openEditDialog(item: Product) {
  // Deep copy the item to ensure original product data is not mutated
  // Initialize file inputs and previews for the dialog
  editedItem.value = {
    ...item, // Copies id, name, category, description, image1, image2
    image1File: null,           // New file selection for image 1
    selectedImage1Preview: null,  // Preview URL for new image 1
    originalImage1Path: item.image1, // Store the actual path from the DB for image 1

    image2File: null,             // New file selection for image 2
    selectedImage2Preview: null,  // Preview URL for new image 2
    originalImage2Path: item.image2, // Store the actual path from the DB for image 2
  };
  editDialog.value = true;
  nextTick(() => {
    if (editForm.value) {
      editForm.value.resetValidation(); // Reset Vuetify validation state
    }
  });
}

/**
 * Closes the edit product dialog and resets the edited item state.
 */
function closeEditDialog() {
  editDialog.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem }; // Reset editedItem to its default clean state
    if (editForm.value) {
      editForm.value.resetValidation();
    }
  });
}

/**
 * Saves the edited product data, including image updates, to the backend API.
 */
async function saveProduct() {
  const { valid } = await editForm.value.validate(); // Validate the form
  if (!valid) {
    showSnackbar(t('common.snackbar.formErrors'), 'error');
    return;
  }

  loading.value = true; // Activate loading state for the submit button
  try {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Important for Laravel's PUT/PATCH request handling with FormData

    // Append text fields
    formData.append('name', editedItem.value.name);
    formData.append('category', editedItem.value.category);
    formData.append('description', editedItem.value.description || ''); // Ensure description is sent, even if empty

    // --- Image 1 Handling Logic ---
    if (editedItem.value.image1File && editedItem.value.image1File.length > 0) {
      // Scenario 1: User selected a NEW image for image1
      formData.append('image1', editedItem.value.image1File[0]);
      console.log('Sending new image1 file.');
    } else if (editedItem.value.originalImage1Path === null) {
      // Scenario 2: User EXPLICITLY CLEARED the image1 input (original path is now null)
      // Send a specific string signal to the backend to remove the existing image
      formData.append('image1', 'CLEAR_IMAGE'); // Backend needs to interpret this
      console.log('Sending signal to CLEAR image1.');
    } else {
      // Scenario 3: Image1 input was UNTOUCHED and there was an original image.
      // Do nothing for 'image1' field in FormData. Backend will assume to KEEP existing.
      console.log('Image1 untouched, keeping existing.');
    }

    // --- Image 2 Handling Logic (same as image 1) ---
    if (editedItem.value.image2File && editedItem.value.image2File.length > 0) {
      formData.append('image2', editedItem.value.image2File[0]);
      console.log('Sending new image2 file.');
    } else if (editedItem.value.originalImage2Path === null) {
      formData.append('image2', 'CLEAR_IMAGE');
      console.log('Sending signal to CLEAR image2.');
    } else {
      console.log('Image2 untouched, keeping existing.');
    }

    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('common.snackbar.authRequired'), 'error');
      // router.push('/login'); // Uncomment if you want to redirect to login
      return;
    }

    const response = await axios.post(`/api/products/edit/${editedItem.value.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Crucial for sending files
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.data.success) {
      showSnackbar(t('common.snackbar.successUpdatingProduct'), 'success');
      await fetchProducts(); // Refresh the product list to show changes
      closeEditDialog(); // Close the dialog
    } else {
      showSnackbar(t('common.snackbar.errorUpdatingProduct'), 'error');
    }
  } catch (error: any) {
    console.error('Error updating product:', error);
    if (error.response && error.response.data) {
      if (error.response.data.errors) {
        // Handle validation errors from Laravel
        showSnackbar(t('common.snackbar.validationError'), 'error');
      } else if (error.response.data.message) {
        // Handle general error messages from Laravel
        showSnackbar(t('common.snackbar.generalErrorMessage'), 'error');
      } else {
        showSnackbar(t('common.snackbar.apiError'), 'error');
      }
    } else {
      showSnackbar(t('common.snackbar.networkError'), 'error');
    }
  } finally {
    loading.value = false; // Deactivate loading state
  }
}

/**
 * Opens the confirmation dialog for deleting a product.
 * @param item The product object to be deleted.
 */
function openConfirmDeleteDialog(item: Product) {
  itemToDelete.value = item;
  deleteConfirmDialog.value = true;
}

/**
 * Closes the confirmation dialog for deleting a product.
 */
function closeConfirmDeleteDialog() {
  deleteConfirmDialog.value = false;
  itemToDelete.value = null;
}

/**
 * Deletes the selected product from the backend API.
 */
async function deleteProduct() {
  if (!itemToDelete.value || !itemToDelete.value.id) return;

  loading.value = true; // Activate loading state for the delete button
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('common.snackbar.authRequired'), 'error');
      // router.push('/login'); // Uncomment if you want to redirect to login
      return;
    }
    const response = await axios.delete(`/api/products/delete/${itemToDelete.value.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) { // Assuming 200 OK for successful deletion
      showSnackbar(t('common.snackbar.successDeletingProduct'), 'success');
      await fetchProducts(); // Refresh the product list
      closeConfirmDeleteDialog(); // Close the dialog
    } else {
      showSnackbar(t('common.snackbar.errorDeletingProduct'), 'error');
    }
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.response && error.response.data) {
      if (error.response.status === 409) { // Example: Conflict if product is referenced elsewhere
        showSnackbar(t('common.snackbar.warningConflict'), 'warning');
      } else {
        showSnackbar(t('common.snackbar.generalErrorMessage'), 'error');
      }
    } else {
      showSnackbar(t('common.snackbar.networkError'), 'error');
    }
  } finally {
    loading.value = false; // Deactivate loading state
  }
}

/**
 * Downloads the selected products as an Excel (CSV) file.
 */

function downloadExcel() {
  if (selectedProduct.value.length === 0) {
    showSnackbar(t('products.export.noSelectionError'), 'error');
    return;
  }

  const headers = [
    t('snLabel'), // Using a generic SN label if available globally
    t('products.tableHeaders.name'),
    t('products.tableHeaders.category'),
    t('products.tableHeaders.description'),
    t('products.tableHeaders.dateAdded')
  ];

  const rows = selectedProduct.value.map((product, index) => [
    index + 1, // SN
    product.name,
    product.category,
    product.description,
    new Date(product.created_at).toLocaleDateString() // Format date for clarity
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => {
      // Escape double quotes by doubling them, then enclose the whole field in double quotes
      let value = String(field);
      if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  // Create a Blob and download it
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `product_list_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar(t('products.export.successMessage'), 'success');
  } else {
    showSnackbar(t('products.export.browserSupportError'), 'error');
  }
}
/**
 * Prints the selected products in a formatted report.
 */
function printProducts() {
  if (!selectedProduct.value.length) {
    showSnackbar(t('products.print.noSelectionError'), 'error');
    return;
  }

  // Use nextTick to ensure the DOM is updated before trying to print
  nextTick(() => {
    if (!printSection.value) {
      console.warn('Print section HTML element is not available.');
      showSnackbar(t('products.print.unavailableError'), 'error');
      return;
    }

    const printContent = printSection.value.innerHTML;
    const printWindow = window.open('', '_blank', 'width=900,height=700');

    const date = new Date().toLocaleDateString();
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${t('report.title').replace(/ /g, '_')}_${date.replace(/\//g, '-')}</title>
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
                position: fixed; /* Use fixed for print, will be converted to running element by @page */
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
              /* Image styles for print */
              .report-table img {
                height: 30px;
                width: 30px;
                object-fit: cover;
                border-radius: 3px;
                display: inline-block; /* Ensure images are in line with text */
                margin-right: 2px;
              }
              .d-flex { display: flex; align-items: center; } /* To align images side-by-side */

              
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
                z-index: -1; /* Ensures it's behind content */
                -webkit-print-color-adjust: exact !important; /* Ensure it prints as defined */
                print-color-adjust: exact !important;
                  
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
      showSnackbar(t('products.print.popupBlockerError'), 'error');
    }
  });
}

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchProducts(); // Fetch products when the component mounts
  fetchStore();    // Fetch store details
});
</script>

<style scoped>
/* Scoped styles for image previews and placeholders within the dialog */
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

/* General styles */
.custom-border-card {
  border-color: rgba(128, 128, 128, 0.3) !important;
  border-width: 1px !important;
  border-style: solid !important;
}

.centered-headers th {
  text-align: center !important;
}

/* Styles for the print-specific section */
.report-container {
  display: none; /* Hidden by default */
}

/* When printing, display only the report-container */
@media print {
  .report-container {
    display: block;
  }

  /* Hide everything else on the page when printing */
  body > *:not(.report-container) {
    display: none !important;
  }
}
</style>
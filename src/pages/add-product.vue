<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6 d-flex align-center">
                {{ t('addProductVue.title') }}
              </p>
            </v-col>
            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">{{ formattedDate }}</p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-container fluid class="pa-5 ">
            <v-card class="pa-4" variant="flat">
              <p class="text-medium-emphasis pb-4 text-subtitle-1">
                {{ t('addProductVue.descriptionIntro') }}
              </p>
              <v-divider class="mb-8"></v-divider>

              <v-form @submit.prevent="addProduct" ref="productForm">
                <v-row>
                  <v-col cols="12" sm="12" md="6">
                    <v-card flat border="thin" class="pa-4 custom-border-card" height="100%">
                      <v-card-title class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                        <v-icon left>mdi-image-plus</v-icon> {{ t('addProductVue.uploadPhotosTitle') }}
                      </v-card-title>
                      <v-card-text>
                        <v-row>
                          <v-col cols="12" md="6">
                            <v-file-input
                              :label="t('addProductVue.image1Label')"
                              accept="image/*"
                              @change="onFileSelected($event, 'image1')"
                              prepend-icon=""
                              append-inner-icon="mdi-camera"
                              variant="outlined"
                              v-model="imageFile1"
                              :rules="imageRules"
                              clearable
                              show-size
                              :hint="t('addProductVue.imageHint')"
                              persistent-hint
                              class="mb-4"
                            />
                            <div v-if="selectedImage1Preview" class="image-preview-container mt-4">
                              <v-img :src="selectedImage1Preview" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                            </div>
                            <div v-else class="no-image-placeholder mb-4">
                               <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                               <p class="text-caption text-grey-lighten-1 mt-2">{{ t('addProductVue.noImage1Selected') }}</p>
                            </div>
                          </v-col>

                          <v-col cols="12" md="6">
                            <v-file-input
                              :label="t('addProductVue.image2Label')"
                              accept="image/*"
                              @change="onFileSelected($event, 'image2')"
                              prepend-icon=""
                              append-inner-icon="mdi-camera"
                              variant="outlined"
                              v-model="imageFile2"
                              :rules="imageRules"
                              clearable
                              show-size
                              class="mb-4"
                              :hint="t('addProductVue.imageHint')"
                              persistent-hint
                            />
                            <div v-if="selectedImage2Preview" class="image-preview-container mt-4">
                              <v-img :src="selectedImage2Preview" class="rounded-lg elevation-2" aspect-ratio="16/9" cover />
                            </div>
                            <div v-else class="no-image-placeholder">
                               <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                               <p class="text-caption text-grey-lighten-1 mt-2">{{ t('addProductVue.noImage2Selected') }}</p>
                            </div>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" class="mt-5" sm="12" md="6">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="name"
                          :label="t('addProductVue.productNameLabel')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="[
                            v => !!v || t('addProductVue.validation.nameRequired'),
                            v => v.length >= 3 || t('addProductVue.validation.nameMinLength')
                          ]"
                          prepend-inner-icon="mdi-package-variant"
                          density="comfortable"
                          class="mb-0"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="selectedCategoryOption"
                          :label="t('addProductVue.categoryLabel')"
                          :items="categoryOptions"
                          item-title="label"
                          item-value="value"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => (v !== undefined && v !== null && v !== '') || t('addProductVue.validation.categoryRequired')]"
                          prepend-inner-icon="mdi-shape"
                          density="comfortable"
                          class="mb-0"
                          clearable
                        />
                        <v-expand-transition>
                          <div v-if="selectedCategoryOption === -1">
                            <v-divider class="my-4"></v-divider>
                            <p class="text-medium-emphasis mb-3">{{ t('addProductVue.newCategoryDetails') }}</p>
                            <v-text-field
                              v-model="newCategory"
                              :label="t('addProductVue.enterNewCategoryLabel')"
                              type="text"
                              variant="outlined"
                              persistent-hint
                              :rules="selectedCategoryOption === -1 ? [
                                v => !!v || t('addProductVue.validation.newCategoryRequired'),
                                v => v.length >= 3 || t('addProductVue.validation.newCategoryMinLength')
                              ] : []"
                              prepend-inner-icon="mdi-new-box"
                              density="comfortable"
                              class="mb-2"
                            />
                          </div>
                        </v-expand-transition>
                      </v-col>
                    </v-row>
                    
                    <v-textarea
                      v-model="description"
                      :label="t('addProductVue.descriptionLabel')"
                      variant="outlined"
                      persistent-hint
                      :rules="[
                        v => !!v || t('addProductVue.validation.descriptionRequired'),
                        v => v.length >= 10 || t('addProductVue.validation.descriptionMinLength')
                      ]"
                      prepend-inner-icon="mdi-text-box-multiple"
                      density="comfortable"
                      rows="3"
                      auto-grow
                    />
                  </v-col>
                </v-row>

                <v-row justify="center" class="mt-5">
                  <v-col cols="12" sm="6" md="2" class="text-center">
                    <v-btn type="submit" :loading="isSubmitting" color="primary" size="large" block>
                      {{ t('addProductVue.saveButton') }} <v-icon class="mx-2" right>{{ t('addProductVue.saveIcon') }}</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-container>

          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>
          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent scrim="#000000">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ t('commonAddproduct.loading') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

---

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios'; // Ensure this points to your configured axios instance
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';

// Initialize i18n
const { t, locale } = useI18n();

// --- Reactive State ---
const name = ref<string>('');
const description = ref<string>('');

// Interface for product data received from backend
interface Product {
  id: number;
  name: string;
  category: string; // The category attribute on the product
  description: string;
  // Add other product properties that your /api/products endpoint returns
  // For example: price, image_path_1, etc.
}
const products = ref<Product[]>([]); // Reactive array to store all fetched products

// Interface for category options in the v-select dropdown
interface CategoryOption {
  label: string;
  value: string | number; // value is category name (string) or -1 for 'Add New Category'
}

// FIX: Allow selectedCategoryOption to be string, number, or null
const selectedCategoryOption = ref<string | number | null>(null); // Binds to v-select
const newCategory = ref<string>(''); // Holds value for new category input

// Image files and their previews
const imageFile1 = ref<File[] | null>(null);
const selectedImage1Preview = ref<string | null>(null);
const imageFile2 = ref<File[] | null>(null);
const selectedImage2Preview = ref<string | null>(null);

const isSubmitting = ref(false);
const isDataLoaded = ref(false); // Controls the full page loading overlay

// Snackbar for user notifications
const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

const router = useRouter();
const productForm = ref<any>(null); // Ref for the v-form component instance

// --- Computed Properties ---
/**
 * Formats the current date based on the active locale for display.
 */
const formattedDate = computed<string>(() => {
  const date = new Date();
  const currentLocale = locale.value || 'en-US'; // Fallback to 'en-US' if locale is not set
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(currentLocale, options);
});

/**
 * Derives a unique, sorted list of category names from the fetched `products` array.
 * This is the "filtering" logic happening on the frontend.
 */
const uniqueCategories = computed<string[]>(() => {
  const categoriesSet = new Set<string>();
  products.value.forEach(product => {
    // Ensure category exists, is a string, and not empty before adding to set
    if (product.category && typeof product.category === 'string' && product.category.trim() !== '') {
      categoriesSet.add(product.category.trim());
    }
  });
  return Array.from(categoriesSet).sort((a, b) => a.localeCompare(b)); // Convert to array and sort alphabetically
});

/**
 * Generates the options array for the category v-select dropdown.
 * Includes unique categories from products and the "Add new category" option.
 */
const categoryOptions = computed<CategoryOption[]>(() => {
  const options: CategoryOption[] = uniqueCategories.value.map(cat => ({
    label: cat,
    value: cat
  }));
  // Always add the "Add new category" option as the last item
  options.push({ label: t('addProductVue.addNewCategoryOption'), value: -1 });
  return options;
});

/**
 * Validation rules for image file inputs.
 * Checks file size and type.
 */
const imageRules = computed(() => [
  (v: File[] | null) => {
    // If no file is selected or array is empty, it's valid (images are optional)
    if (!v || v.length === 0) return true;
    const file = v[0]; // Get the first file from the FileList array

    // Basic check if file object is valid
    if (!file) return true;

    // Max file size: 2 MB
    const maxSize = 2 * 1024 * 1024; // 2 MB in bytes
    if (file.size >= maxSize) {
      return t('addProductVue.validation.imageSize');
    }

    // Allowed image types
    const allowedTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return t('addProductVue.validation.imageType');
    }
    return true; // File is valid
  },
]);

// --- Methods ---
/**
 * Displays a snackbar notification with a translated message.
 * @param messageKey The i18n translation key for the message.
 * @param color The color of the snackbar (e.g., 'success', 'error', 'warning').
 * @param interpolation Optional object for message interpolation (e.g., { errors: '...' }).
 */
function showSnackbar(messageKey: string, color: string, interpolation?: Record<string, string>) {
  // FIX: Provide a default empty object for interpolation if it's undefined
  snackbarMessage.value = t(messageKey, interpolation || {});
  snackbarColor.value = color;
  snackbar.value = true;
}

/**
 * Handles file selection for image inputs. Reads the file for preview and applies validation.
 * @param event The DOM event from the file input.
 * @param imageKey Identifier for which image input is being handled ('image1' or 'image2').
 */
const onFileSelected = (event: Event, imageKey: 'image1' | 'image2') => {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  // Determine which reactive refs to update based on the imageKey
  let fileRef: typeof imageFile1;
  let previewRef: typeof selectedImage1Preview;

  switch (imageKey) {
    case 'image1':
      fileRef = imageFile1;
      previewRef = selectedImage1Preview;
      break;
    case 'image2':
      fileRef = imageFile2;
      previewRef = selectedImage2Preview;
      break;
    default:
      return; // Should not happen
  }

  if (files && files.length > 0) {
    const file = files[0];

    // Clear previous selection/preview before validation
    previewRef.value = null;
    fileRef.value = null;

    // Manually run validation rules for immediate feedback to the user
    let isValidFile = true;
    for (const rule of imageRules.value) {
      const result = rule([file]); // Pass file as an array to match rule signature
      if (typeof result === 'string') {
        showSnackbar(result, 'error'); // Show validation error message
        isValidFile = false;
        break;
      }
    }

    if (isValidFile) {
      fileRef.value = [file]; // Set the file to the v-model for the file input
      const reader = new FileReader();
      reader.onload = (e) => {
        previewRef.value = e.target?.result as string; // Set image preview URL
      };
      reader.readAsDataURL(file); // Read the file content as a Data URL
    } else {
      fileRef.value = null; // Clear the file input if validation fails
    }
  } else {
    // If no file is selected (e.g., user cleared the input), clear everything
    fileRef.value = null;
    previewRef.value = null;
  }
};

/**
 * Fetches all products from the backend. This data is then used by
 * `uniqueCategories` computed property to derive the category list.
 */
const fetchProductsForCategories = async () => {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('commonAddproduct.snackbar.authRequired'), 'error');
      router.push('/login');
      return;
    }

    // THIS IS THE ENDPOINT THAT RETURNS ALL PRODUCTS (with their categories)
    // Adjust '/api/products' if your actual endpoint is different (e.g., /api/my-products)
    const response = await axios.get('/api/products', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data && Array.isArray(response.data.products)) {
      products.value = response.data.products; // Store the fetched products
      // The `categoryOptions` computed property will automatically re-evaluate
      // and update the dropdown based on `products.value`.
    } else {
      showSnackbar(t('commonAddproduct.snackbar.failedToLoadCategories'), 'error');
      console.error('Failed to load products for categories: Invalid response format', response.data);
    }
  } catch (error: any) {
    console.error('Error fetching products for categories:', error);
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      showSnackbar(t('commonAddproduct.snackbar.authRequired'), 'error');
      router.push('/login');
    } else {
      showSnackbar(t('commonAddproduct.snackbar.failedToLoadCategories'), 'error');
    }
  }
};

/**
 * Handles the submission of the add product form.
 * Constructs FormData and sends it to the backend API.
 */
const addProduct = async () => {
  isSubmitting.value = true; // Activate loading state for the button

  if (!productForm.value) return; // Ensure form ref is available
  const { valid } = await productForm.value.validate(); // Trigger Vuetify validation

  if (!valid) {
    showSnackbar(t('addProductVue.validation.formErrors'), 'error');
    isSubmitting.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('description', description.value);

    // Determine the final category value to send to the backend
    let finalCategoryValue: string | null = null;
    // FIX: Direct comparison is now type-safe due to updated ref type
    if (selectedCategoryOption.value === -1) {
      // If "Add New Category" was selected, use the value from the `newCategory` text field
      finalCategoryValue = newCategory.value;
    } else if (typeof selectedCategoryOption.value === 'string') {
      // If an existing category was selected, use its string value
      finalCategoryValue = selectedCategoryOption.value;
    }

    if (finalCategoryValue) {
      formData.append('category', finalCategoryValue); // Append the chosen category string
    } else {
      // This case should ideally be caught by the v-select's rules, but as a safeguard
      showSnackbar(t('addProductVue.validation.categoryRequired'), 'error');
      isSubmitting.value = false;
      return;
    }

    // Append image files if they have been selected
    if (imageFile1.value && imageFile1.value.length > 0) {
      formData.append('image1', imageFile1.value[0]);
    }
    if (imageFile2.value && imageFile2.value.length > 0) {
      formData.append('image2', imageFile2.value[0]);
    }

    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('commonAddproduct.snackbar.authRequired'), 'error');
      router.push('/login');
      return;
    }

    // Send the product data (including category string and images) to the backend
    const response = await axios.post('/api/products/store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Essential for sending files with FormData
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.data.success) {
      showSnackbar(t('commonAddproduct.snackbar.productCreatedSuccess'), 'success');
      // Reset form fields and validation state after successful submission
      name.value = '';
      description.value = '';
      selectedCategoryOption.value = null; // Clear selected dropdown value
      newCategory.value = ''; // Clear new category input
      imageFile1.value = null;
      selectedImage1Preview.value = null;
      imageFile2.value = null;
      selectedImage2Preview.value = null;
      productForm.value.resetValidation(); // Reset Vuetify's validation errors
      
      // Re-fetch products to ensure the category dropdown is up-to-date,
      // especially if a new category was added.
      await fetchProductsForCategories();
    } else if (response.data.error) {
      showSnackbar(response.data.error, 'error');
    } else {
      console.error('Unknown response from server:', response.data);
      showSnackbar(t('commonAddproduct.snackbar.unknownError'), 'error');
    }
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (axios.isAxiosError(error) && error.response) {
      // Handle backend validation errors (e.g., Laravel's 422 Unprocessable Entity)
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(t('commonAddproduct.snackbar.validationError'), 'error', { errors: errorMessages });
      } else if (error.response.data.message) {
        // Handle general API error messages returned by the backend
        showSnackbar(t('commonAddproduct.snackbar.generalErrorMessage'), 'error', { message: error.response.data.message });
      } else {
        showSnackbar(t('commonAddproduct.snackbar.apiError'), 'error');
      }
    } else {
      // Handle network errors or other client-side issues
      showSnackbar(t('commonAddproduct.snackbar.networkError'), 'error');
    }
  } finally {
    isSubmitting.value = false; // Deactivate loading state
  }
};

// --- Lifecycle Hook ---
onMounted(async () => {
  // On component mount, fetch all products to populate the category dropdown
  await fetchProductsForCategories();
  
  // Simulate any other initial data loading or setup
  setTimeout(() => {
    isDataLoaded.value = true; // Hide loading overlay after data is ready
  }, 500); // 0.5 seconds delay for demonstration
});
</script>

---

<style scoped>
/* Scoped styles for the component */
.custom-border-card {
  border-color: rgba(128, 128, 128, 0.3) !important;
  border-width: 1px !important;
  border-style: solid !important;
}

.image-preview-container {
  max-height: 200px; /* Limit height of image preview */
  overflow: hidden; /* Hide overflow if image is too large */
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
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px dashed #ccc;
  color: #aaa;
  width: 100%; /* Ensure it fills the column width */
}

/* Consistent bottom margin for form fields */
.v-text-field, .v-select, .v-textarea {
  margin-bottom: 16px;
}
</style>
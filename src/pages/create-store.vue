<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />
        <v-main class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6 d-flex align-center">
                {{ t('createStorePage.title') }}
              </p>
            </v-col>
            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">{{ formattedDate }}</p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <form @submit.prevent="createStore">
            <v-container fluid class="pa-5">
              <p class="text-medium-emphasis py-2 text-subtitle-1">
                {{ t('createStorePage.formPrompt') }}
              </p>

              <v-card flat border="thin" class="pa-4 custom-border-card mb-4">
                <v-card-text>
                  <v-form ref="storeForm" @submit.prevent="createStore">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <p class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                          <v-icon left>mdi-image-plus</v-icon> {{ t('createStorePage.photo1Title') }}
                        </p>
                        <v-file-input
                          :label="t('createStorePage.uploadImage1Label')"
                          accept="image/*"
                          @change="onFileSelected1"
                          prepend-icon=""
                          append-inner-icon="mdi-camera"
                          variant="outlined"
                          v-model="imageFile1"
                          :rules="imageRules1"
                          clearable
                          show-size
                          :hint="t('createStorePage.imageHint')"
                          persistent-hint
                        />
                        <div v-if="selectedImagePreview1" class="image-preview-container mt-4">
                          <v-img :src="selectedImagePreview1" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                        </div>
                        <div v-else class="no-image-placeholder">
                          <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                          <p class="text-caption text-grey-lighten-1 mt-2">{{ t('createStorePage.noImage1Selected') }}</p>
                        </div>
                      </v-col>

                      <v-col cols="12" sm="6">
                        <p class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                          <v-icon left>mdi-image-plus</v-icon> {{ t('createStorePage.photo2Title') }}
                        </p>
                        <v-file-input
                          :label="t('createStorePage.uploadImage2Label')"
                          accept="image/*"
                          @change="onFileSelected2"
                          prepend-icon=""
                          append-inner-icon="mdi-camera"
                          variant="outlined"
                          v-model="imageFile2"
                          :rules="imageRules2"
                          clearable
                          show-size
                          :hint="t('createStorePage.imageHintOptional')"
                          persistent-hint
                        />
                        <div v-if="selectedImagePreview2" class="image-preview-container mt-4">
                          <v-img :src="selectedImagePreview2" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                        </div>
                        <div v-else class="no-image-placeholder">
                          <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                          <p class="text-caption text-grey-lighten-1 mt-2">{{ t('createStorePage.noImage2Selected') }}</p>
                        </div>
                      </v-col>

                      <v-col cols="12">
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="name"
                              :label="t('createStorePage.nameLabel')"
                              type="text"
                              variant="outlined"
                              :rules="[
                                v => !!v || t('createStorePage.nameRequired'),
                                v => v.length >= 3 || t('createStorePage.minChars', { count: 3 })
                              ]"
                              prepend-inner-icon="mdi-store"
                              class="mb-4"
                            />
                            <v-text-field
                              v-model="category"
                              :label="t('createStorePage.categoryLabel')"
                              type="text"
                              variant="outlined"
                              :rules="[
                                v => !!v || t('createStorePage.categoryRequired'),
                                v => v.length >= 3 || t('createStorePage.minChars', { count: 3 })
                              ]"
                              prepend-inner-icon="mdi-tag"
                              class="mb-4"
                            />
                            <v-text-field
                              v-model="location"
                              :label="t('createStorePage.locationLabel')"
                              type="text"
                              variant="outlined"
                              :rules="[
                                v => !!v || t('createStorePage.locationRequired'),
                                v => v.length >= 3 || t('createStorePage.minChars', { count: 3 })
                              ]"
                              prepend-inner-icon="mdi-map-marker"
                              class="mb-4"
                            />
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="contact"
                              :label="t('createStorePage.contactLabel')"
                              type="tel"
                              variant="outlined"
                              :rules="[
                                v => !!v || t('createStorePage.contactRequired'),
                                v => /^\d{9,}$/.test(v) || t('createStorePage.contactMinDigits', { count: 9 })
                              ]"
                              prepend-inner-icon="mdi-phone"
                              class="mb-4"
                            />
                            <v-textarea
                              v-model="description"
                              :label="t('createStorePage.descriptionLabel')"
                              variant="outlined"
                              :rules="[v => !!v || t('createStorePage.descriptionRequired')]"
                              prepend-inner-icon="mdi-text-box-outline"
                              rows="5"
                              auto-grow
                            />
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-card-text>
              </v-card>
              <v-responsive class="text-center py-5">
                <v-btn type="submit" :loading="isSubmitting" :disabled="!canUserCreateStore" color="primary" size="large">
                  {{ t('createStorePage.createStoreButton') }} &nbsp;&nbsp;<v-icon>mdi-content-save-outline</v-icon>
                </v-btn>
              </v-responsive>
            </v-container>
          </form>
          <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
            {{ snackbarMessage }}
          </v-snackbar>
          <AppFooter />
        </v-main>
      </v-layout>
    </v-card>

    <v-overlay :model-value="isGlobalLoading" class="align-center justify-center" persistent>
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="my-1 text-h6 text-white">{{ t('createStorePage.loading') }}</p>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useI18n } from 'vue-i18n';

// --- Component Imports ---
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';

// --- Composables and Utilities ---
const router = useRouter();
const { startLoading, stopLoading, isLoading: isGlobalLoading } = useLoader();
const { t, locale } = useI18n();

// --- Reactive State ---
const name = ref<string>('');
const category = ref<string>('');
const location = ref<string>('');
const contact = ref<string>('');
const description = ref<string>('');

const imageFile1 = ref<File[] | null>(null);
const selectedImagePreview1 = ref<string | null>(null);

const imageFile2 = ref<File[] | null>(null);
const selectedImagePreview2 = ref<string | null>(null);

const isSubmitting = ref<boolean>(false);

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

const storeCount = ref<number | null>(null);
const userStoreLimit = ref<number | null>(null);

const storeForm = ref<InstanceType<typeof import('vuetify/components')['VForm']> | null>(null);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString(locale.value, options);
});

// --- COMMON IMAGE VALIDATION LOGIC (Refined as a composable) ---
const useCommonImageValidation = () => {
  const { t } = useI18n(); // `t` must be called inside setup() or a composable.

  const validatorFn = (v: File[] | null, isRequired: boolean) => {
    // Corrected: Handles null/undefined v, empty array, and array with null/undefined first element.
    if (!v || v.length === 0 || !v[0]) {
      return isRequired ? t('createStorePage.imageRequired') : true;
    }

    const file: File = v[0]; // Now 'file' is guaranteed to be a File object
    const maxSize = 2 * 1024 * 1024; // 2 MB
    // Added 'image/gif' for broader compatibility if needed for previews
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return t('createStorePage.imageInvalidType');
    }
    if (file.size > maxSize) {
      return t('createStorePage.imageTooLarge');
    }
    return true;
  };

  return validatorFn;
};

// Call the composable to get the validator function in script setup
const commonImageValidator = useCommonImageValidation();

const imageRules1 = computed(() => {
  return [
    (v: File[] | null) => commonImageValidator(v, false) // Image 1 is required
  ];
});

const imageRules2 = computed(() => {
  return [
    (v: File[] | null) => commonImageValidator(v, false) // Image 2 is optional
  ];
});

// Computed property to determine if the user can create a store
const canUserCreateStore = computed<boolean>(() => {
  if (storeCount.value === null || userStoreLimit.value === null) {
    return false;
  }
  return storeCount.value < userStoreLimit.value;
});

// --- Methods ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

// Handler for the first image input
const onFileSelected1 = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  console.log('onFileSelected1 triggered. Files:', files); // Debug log

  if (files && files.length > 0) {
    const file = files[0];
    const validationResult = commonImageValidator([file], true); // Use the composable's validator
    if (typeof validationResult === 'string') {
      showSnackbar(validationResult, 'error');
      imageFile1.value = null; // Clear v-model if validation fails
      selectedImagePreview1.value = null; // Clear preview
      console.log('Image 1 validation failed:', validationResult); // Debug log
    } else {
      imageFile1.value = [file]; // Keep v-model updated for rules
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImagePreview1.value = e.target?.result as string;
        console.log('Image 1 preview generated:', selectedImagePreview1.value ? 'YES' : 'NO'); // Debug log
        console.log('Image 1 preview data:', selectedImagePreview1.value ? selectedImagePreview1.value.substring(0, 50) + '...' : 'null'); // Log first 50 chars
      };
      reader.readAsDataURL(file);
    }
  } else {
    imageFile1.value = null;
    selectedImagePreview1.value = null;
    console.log('No file selected for Image 1, clearing preview.'); // Debug log
  }
};

// Handler for the second image input
const onFileSelected2 = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  console.log('onFileSelected2 triggered. Files:', files); // Debug log

  if (files && files.length > 0) {
    const file = files[0];
    const validationResult = commonImageValidator([file], false); // Use the composable's validator
    if (typeof validationResult === 'string') {
      showSnackbar(validationResult, 'error');
      imageFile2.value = null; // Clear v-model if validation fails
      selectedImagePreview2.value = null; // Clear preview
      console.log('Image 2 validation failed:', validationResult); // Debug log
    } else {
      imageFile2.value = [file]; // Keep v-model updated for rules
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImagePreview2.value = e.target?.result as string;
        console.log('Image 2 preview generated:', selectedImagePreview2.value ? 'YES' : 'NO'); // Debug log
        console.log('Image 2 preview data:', selectedImagePreview2.value ? selectedImagePreview2.value.substring(0, 50) + '...' : 'null'); // Log first 50 chars
      };
      reader.readAsDataURL(file);
    }
  } else {
    imageFile2.value = null;
    selectedImagePreview2.value = null;
    console.log('No file selected for Image 2, clearing preview.'); // Debug log
  }
};

// Function to fetch the user's current store count
async function fetchStoreCount() {
  try {
    const response = await axios.get('/api/stores'); // Assumes this returns an array of stores for the authenticated user
    storeCount.value = response.data.stores.length;
    console.log('User currently owns', storeCount.value, 'store(s).');
  } catch (error: any) {
    console.error('Error fetching store count:', error);
    storeCount.value = 0; // Default to 0 on error, allowing creation if limit isn't set/fetched
    showSnackbar(t('createStorePage.fetchStoreCountError'), 'error');
  }
}

// Function to fetch user profile (including store_limit)
async function fetchUserProfile() {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found. User not authenticated.');
      router.push('/login'); // Redirect to login if no token
      return;
    }

    const response = await axios.get('/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // Assuming response.data.user contains store_limit
    if (response.data && response.data.user && typeof response.data.user.store_limit === 'number') {
      userStoreLimit.value = response.data.user.store_limit;
      console.log('User store limit fetched:', userStoreLimit.value);
    } else {
      console.warn('store_limit not found or invalid in user profile response. Defaulting to 1.');
      userStoreLimit.value = 1; // Default to 1 if not found
    }
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    userStoreLimit.value = 1; // Default to 1 on error
    showSnackbar(t('createStorePage.fetchProfileError'), 'error');
  }
}

const createStore = async () => {
  console.log('--- createStore initiated ---');
  isSubmitting.value = true;

  if (!storeForm.value) {
    console.error('ERROR: Form reference (storeForm) is null. Cannot validate form.');
    showSnackbar(t('createStorePage.formInitError'), 'error');
    isSubmitting.value = false;
    return;
  }

  const { valid } = await storeForm.value.validate();

  if (!valid) {
    console.log('FORM VALIDATION FAILED: Please correct the form errors.');
    showSnackbar(t('createStorePage.formValidationFailed'), 'error');
    isSubmitting.value = false;
    return;
  }
  console.log('FORM VALIDATION PASSED.');

  // IMPORTANT: The `imageRules1` and `imageRules2` handle the "required" validation
  // directly through the v-file-input rules. If they pass, then imageFile1.value
  // should ideally contain a file if required.
  // However, an explicit check here is still good for sanity before FormData.
  if (!imageFile1.value || imageFile1.value.length === 0 || !imageFile1.value[0]) {
    console.log('IMAGE 1 VALIDATION FAILED (manual check): No valid image file 1 selected.');
    showSnackbar(t('createStorePage.image1RequiredError'), 'error');
    isSubmitting.value = false;
    return;
  }
  console.log('IMAGE FILE VALIDATION PASSED.');

  // Check permission again just before submission
  if (!canUserCreateStore.value) {
    showSnackbar(t('createStorePage.storeLimitReached', { limit: userStoreLimit.value }), 'warning');
    isSubmitting.value = false;
    return;
  }
  console.log('User is allowed to create a store based on current limit checks.');

  startLoading();
  console.log('Global loading overlay activated.');

  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.warn('Authentication token missing. Redirecting to login.');
      showSnackbar(t('createStorePage.authRequired'), 'error');
      router.push('/login');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('category', category.value);
    formData.append('location', location.value);
    formData.append('contact', contact.value);
    formData.append('description', description.value);

    // Ensure we append the actual File object
    if (imageFile1.value && imageFile1.value[0]) {
      formData.append('image1', imageFile1.value[0]);
    }
    if (imageFile2.value && imageFile2.value[0]) {
      formData.append('image2', imageFile2.value[0]);
    }

    console.log('Sending API POST request to /api/stores/create-store...');
    const response = await axios.post('/api/stores/create-store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.status === 201) {
      console.log('API RESPONSE SUCCESS (201 CREATED):', response.data);
      showSnackbar(t('createStorePage.creationSuccess') || response.data.success , 'success');

      // Reset form fields
      name.value = '';
      category.value = '';
      location.value = '';
      contact.value = '';
      description.value = '';
      imageFile1.value = null;
      selectedImagePreview1.value = null;
      imageFile2.value = null;
      selectedImagePreview2.value = null;

      if (storeForm.value) {
        storeForm.value.resetValidation();
        // storeForm.value.reset(); // This might reset v-model for file inputs incorrectly
      }

      // Re-fetch store count to update the canUserCreateStore status
      await fetchStoreCount();
      console.log('Store created. Updated store count for permission check.');

      // Redirect after a slight delay for snackbar visibility
      setTimeout(() => {
        router.push('/store');
      }, 2000);
    } else {
      console.error(`API ERROR: Unexpected response status ${response.status}`, response.data);
      showSnackbar( t('createStorePage.creationUnexpectedError') || response.data.error, 'error');
    }
  } catch (apiError: any) {
    console.error('API CALL FAILED:', apiError);
    if (axios.isAxiosError(apiError) && apiError.response) {
      const errorData = apiError.response.data;
      if (apiError.response.status === 422 && errorData.errors) {
        let errorMessage = t('createStorePage.validationErrors');
        for (const key in errorData.errors) {
          if (errorData.errors.hasOwnProperty(key)) {
            errorMessage += `\n- ${errorData.errors[key].join(', ')}`;
          }
        }
        showSnackbar(errorMessage, 'error');
      } else if (apiError.response.status === 403) { // Specific check for forbidden (limit reached from backend)
        showSnackbar(t('createStorePage.storeLimitReachedFromBackend') || errorData.message, 'error');
      }
      else if (errorData.message) {
        showSnackbar(t('createStorePage.apiErrorWithMessage', { message: errorData.message }), 'error');
      } else if (errorData.error) {
        showSnackbar(t('createStorePage.apiErrorWithError', { error: errorData.error }), 'error');
      } else {
        showSnackbar(t('createStorePage.apiErrorStatus', { status: apiError.response.status, statusText: apiError.response.statusText || 'Unknown error' }), 'error');
      }
    } else if (apiError.request) {
      showSnackbar(t('createStorePage.networkError'), 'error');
    } else {
      showSnackbar(t('createStorePage.clientSideError'), 'error');
    }
  } finally {
    isSubmitting.value = false;
    stopLoading();
    console.log('--- createStore finished. Global loading deactivated. ---');
  }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  startLoading();
  console.log('ONMOUNTED: Initializing... Fetching stores count and user store limit.');
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.warn('ONMOUNTED: No authentication token found. Redirecting to login.');
      router.push('/login');
      stopLoading();
      return;
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch both simultaneously
    await Promise.all([
      fetchStoreCount(),
      fetchUserProfile()
    ]);

    // After both values are loaded, check if the user is over their limit
    if (storeCount.value !== null && userStoreLimit.value !== null) {
      if (storeCount.value >= userStoreLimit.value) {
        showSnackbar(t('createStorePage.storeLimitReachedOnLoad', { limit: userStoreLimit.value }), 'warning');
        console.log(`ONMOUNTED: User is at or over limit: ${storeCount.value}/${userStoreLimit.value}.`);
      } else {
        console.log(`ONMOUNTED: User can create stores: ${storeCount.value}/${userStoreLimit.value}.`);
      }
    }

  } catch (error: any) {
    console.error('ONMOUNTED ERROR: Failed during initial data fetch:', error);
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      showSnackbar(t('createStorePage.authFailedOnLoad'), 'error');
      router.push('/login');
    } else {
      showSnackbar(t('createStorePage.initialDataLoadFailed'), 'error');
    }
  } finally {
    stopLoading();
    console.log('ONMOUNTED: Initialization complete. Global loading deactivated.');
  }
});
</script>

<style scoped>
.custom-border-card {
  border-color: rgba(128, 128, 128, 0.3) !important;
  border-width: 1px !important;
  border-style: solid !important;
}

.image-preview-container {
  min-height: fit-content;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 5px;
  /* Added a specific height for the container, adjust as needed */
  height: 200px;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px; /* Adjusted height for better fit with two image cards */
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px dashed #ccc;
  color: #aaa;
}

/* Ensure text fields have consistent bottom margin */
.v-text-field {
  margin-bottom: 16px;
}
</style>
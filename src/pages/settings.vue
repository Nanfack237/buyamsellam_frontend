
<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-5 my-2">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6">
                {{ $t('managerSettings.storeSettings') }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-container fluid>
            <v-card flat border="thin" class="pa-4 custom-border-card mb-4" :loading="loading && storeId === null">
              <v-card-title>
                <span style="color: #496896;"><v-icon class="mr-2">mdi-store-cog</v-icon></span>
                {{ $t('managerSettings.updateStoreProfile') }}
              </v-card-title>
              <v-divider class="mb-4" />

              <v-card-text>
                <v-form ref="storeForm" @submit.prevent="updateStoreProfile">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <p class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                        <v-icon left>mdi-image-plus</v-icon> {{ $t('managerSettings.storePhoto1') }}
                      </p>
                      <v-file-input
                        :label="$t('managerSettings.uploadStoreImage1')"
                        accept="image/jpeg,image/png,image/bmp,image/jpg,image/gif"
                        @change="onFileSelected1"
                        prepend-icon=""
                        append-inner-icon="mdi-camera"
                        variant="outlined"
                        v-model="newImageFile1"
                        :rules="newImageFile1.length ? imageRules : []"
                        clearable
                        show-size
                        :hint="$t('managerSettings.image1Hint')"
                        persistent-hint
                      />
                      <div v-if="selectedImagePreview1" class="image-preview-container mt-4">
                        <v-img :src="selectedImagePreview1" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                      </div>
                      <div v-else-if="currentImage1" class="image-preview-container mt-4">
                        <v-img :src="getImageUrl(currentImage1)" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                      </div>
                      <div v-else class="no-image-placeholder text-center py-5">
                        <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                        <p class="text-caption text-grey-lighten-1 mt-2">{{ $t('managerSettings.noImage1Available') }}</p>
                      </div>
                    </v-col>

                    <v-col cols="12" sm="6">
                      <p class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                        <v-icon left>mdi-image-plus</v-icon> {{ $t('managerSettings.storePhoto2') }}
                      </p>
                      <v-file-input
                        :label="$t('managerSettings.uploadStoreImage2')"
                        accept="image/jpeg,image/png,image/bmp,image/jpg,image/gif"
                        @change="onFileSelected2"
                        prepend-icon=""
                        append-inner-icon="mdi-camera"
                        variant="outlined"
                        v-model="newImageFile2"
                        :rules="newImageFile2.length ? imageRules : []"
                        clearable
                        show-size
                        :hint="$t('managerSettings.image2Hint')"
                        persistent-hint
                      />
                      <div v-if="selectedImagePreview2" class="image-preview-container mt-4">
                        <v-img :src="selectedImagePreview2" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                      </div>
                      <div v-else-if="currentImage2" class="image-preview-container mt-4">
                        <v-img :src="getImageUrl(currentImage2)" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                      </div>
                      <div v-else class="no-image-placeholder text-center py-5">
                        <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                        <p class="text-caption text-grey-lighten-1 mt-2">{{ $t('managerSettings.noImage2Available') }}</p>
                      </div>
                    </v-col>

                    <v-col cols="12">
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="name"
                            :label="$t('managerSettings.storeName')"
                            type="text"
                            variant="outlined"
                            :rules="[
                              v => !!v || $t('managerSettings.storeNameRequired'),
                              v => v.length >= 3 || $t('managerSettings.storeNameMinLength')
                            ]"
                            prepend-inner-icon="mdi-store"
                            class="mb-4"
                            required
                          />
                          <v-text-field
                            v-model="category"
                            :label="$t('managerSettings.category')"
                            type="text"
                            variant="outlined"
                            :rules="[
                              v => !!v || $t('managerSettings.categoryRequired'),
                              v => v.length >= 3 || $t('managerSettings.categoryMinLength')
                            ]"
                            prepend-inner-icon="mdi-tag"
                            class="mb-4"
                            required
                          />
                          <v-text-field
                            v-model="location"
                            :label="$t('managerSettings.location')"
                            type="text"
                            variant="outlined"
                            :rules="[
                              v => !!v || $t('managerSettings.locationRequired'),
                              v => v.length >= 3 || $t('managerSettings.locationMinLength')
                            ]"
                            prepend-inner-icon="mdi-map-marker"
                            class="mb-4"
                            required
                          />
                           <v-text-field
                            v-model="closingTime"
                            :label="$t('managerSettings.storeClosingTime')"
                            type="time"
                            variant="outlined"
                            prepend-inner-icon="mdi-clock-outline"
                            class="mb-4"
                            :rules="[
                              v => !!v || $t('managerSettings.closingTimeRequired'),
                              v => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v) || $t('managerSettings.invalidTimeFormat')
                            ]"
                            required
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="contact"
                            :label="$t('managerSettings.contactPhoneNumber')"
                            type="tel"
                            variant="outlined"
                            :rules="[
                              v => !!v || $t('managerSettings.contactRequired'),
                              v => /^\d{9,}$/.test(v) || $t('managerSettings.contactMinDigits')
                            ]"
                            prepend-inner-icon="mdi-phone"
                            class="mb-4"
                            required
                          />
                          <v-textarea
                            v-model="description"
                            :label="$t('managerSettings.description')"
                            variant="outlined"
                            :rules="[
                              v => !!v || $t('managerSettings.descriptionRequired'),
                              v => v.length >= 10 || $t('managerSettings.descriptionMinLength')
                            ]"
                            prepend-inner-icon="mdi-text-box-outline"
                            rows="9"
                            auto-grow
                            required
                          />
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-card-actions class="justify-center mt-5">
                    <v-btn color="primary" variant="flat" type="submit" :loading="loading" size="large">
                      {{ $t('managerSettings.updateStore') }} <v-icon right class="mx-1">mdi-content-save-outline</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-form>
              </v-card-text>
            </v-card>


            <v-card flat border="thin" class="pa-4 custom-border-card mx-0 my-4">
              <v-card-title>
                <span style="color: #6a1b9a;"><v-icon class="mr-2">mdi-image-filter-hdr</v-icon></span>
                {{ $t('managerSettings.storeLogo') }}
              </v-card-title>
              <v-divider class="mb-4" color="grey-lighten-1"></v-divider>
              <v-form ref="logoForm" @submit.prevent="updateStoreLogo">
                <v-row class="d-flex px-5 pt-2 align-center">
                  <v-col cols="12" sm="8" md="6">
                    <p class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                      <v-icon left class="mx-1">mdi-image</v-icon> {{ $t('managerSettings.uploadStoreLogo') }}
                    </p>
                    <v-file-input
                      :label="$t('managerSettings.selectLogoImage')"
                      accept="image/jpeg,image/png,image/bmp,image/jpg,image/gif,image/svg+xml"
                      @change="onFileSelectedLogo"
                      prepend-icon=""
                      append-inner-icon="mdi-upload"
                      variant="outlined"
                      v-model="newLogoFile"
                      :rules="newLogoFile.length ? logoRules : []"
                      clearable
                      show-size
                      :hint="$t('managerSettings.logoHint')"
                      persistent-hint
                    />
                  </v-col>
                  <v-col cols="12" sm="6" md="6" class="text-right">
                    <div v-if="selectedLogoPreview" class="image-preview-container mt-4">
                      <v-img :src="selectedLogoPreview" class="rounded-lg elevation-2" aspect-ratio="1" cover max-width="200" max-height="200" />
                    </div>
                    <div v-else-if="currentLogo" class="image-preview-container mt-4">
                      <v-img :src="getImageUrl(currentLogo)" class="rounded-lg elevation-2" size="900" aspect-ratio="1" cover max-width="200" max-height="200" />
                    </div>
                    <div v-else class="no-image-placeholder text-center py-5" style="max-width: 150px; height: 150px;">
                      <v-icon size="60" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                      <p class="text-caption text-grey-lighten-1 mt-2">{{ $t('managerSettings.noLogoAvailable') }}</p>
                    </div>
                  </v-col>
                </v-row>
                <v-row class="justify-center py-5">
                  <v-btn color="primary" class="my-4" type="submit" :loading="loading" size="large">
                    {{ $t('managerSettings.saveLogo') }} <v-icon right class="mx-1">mdi-content-save</v-icon>
                  </v-btn>
                </v-row>
              </v-form>
            </v-card>

            <v-card flat border="thin" class="pa-4 custom-border-card mx-0 my-4">
              <v-card-title>
                <span style="color: #2196F3;"><v-icon class="mr-2">mdi-tune</v-icon></span>
                {{ $t('managerSettings.moreSettings') }}
              </v-card-title>
              <v-divider class="border-opacity-100 mb-4" color="grey-lighten-1"></v-divider>
              <v-form ref="generalSettingsForm" @submit.prevent="updateThresholdQuantity">
                <v-row class="d-flex px-5 pt-2 align-center">
                  <v-col cols="12" md="6">
                    <p class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                      <v-icon left>mdi-chart-box</v-icon> {{ $t('managerSettings.dailySummaryAlerts') }}
                    </p>
                    <v-switch
                      :model-value="dailySummaryEnabled"
                      @update:modelValue="promptToggleDailySummary"
                      :label="$t('managerSettings.enableDailySummaryNotification')"
                      color="success"
                      inset
                      class="mt-0"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <p class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                      <v-icon left color="warning">mdi-alert-octagon</v-icon> {{ $t('managerSettings.stockAlert') }}
                    </p>
                    <v-text-field
                      v-model.number="stockThreshold"
                      :label="$t('managerSettings.globalThresholdQuantity')"
                      type="number"
                      variant="outlined"
                      min="1"
                      :rules="[
                        v => !!v || $t('managerSettings.thresholdRequired'),
                        v => v >= 1 || $t('managerSettings.thresholdMin')
                      ]"
                      required
                      density="compact"
                    />
                  </v-col>
                  <v-col cols="12" class="text-center">
                    <v-btn color="primary" class="my-4" type="submit" :loading="loading" size="large">
                      {{ $t('managerSettings.save') }} <v-icon right class="mx-1">mdi-content-save</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card>
          </v-container>

          <AppFooter />
        </v-main>

        <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000" location="top right">
          {{ snackbarMessage }}
          <template v-slot:actions>
            <v-btn variant="text" @click="snackbar = false">
              <v-icon color="white">mdi-close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>

        <v-overlay :model-value="loading" class="align-center justify-center" scrim="#00000080" persistent>
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ $t('managerSettings.loading') }}</p>
        </v-overlay>

        <v-dialog v-model="dailySummaryDialog.visible" max-width="500">
          <v-card>
            <v-card-title class="headline">{{ $t('managerSettings.confirmDailySummaryToggle') }}</v-card-title>
            <v-card-text>
              {{
                dailySummaryDialog.nextStatus
                  ? $t('managerSettings.dailySummaryConfirmTextEnable')
                  : $t('managerSettings.dailySummaryConfirmTextDisable')
              }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey-darken-1" variant="text" @click="cancelDailySummaryToggle">{{ $t('managerSettings.cancel') }}</v-btn>
              <v-btn color="primary" variant="flat" @click="confirmDailySummaryToggle" :loading="loading">{{ $t('managerSettings.confirm') }}</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-layout>
    </v-card>
  </v-app>
</template>

<style scoped>
.custom-border-card {
  border-left: 5px solid #496896; /* Example color, adjust as needed */
  border-radius: 8px;
}

.image-preview-container {
  max-width: 100%;
  height: auto; /* Adjust height as needed */
  overflow: hidden; /* Ensures the image doesn't overflow */
  display: flex;
  justify-content: center;
  align-items: center;
}

.no-image-placeholder {
  background-color: #f5f5f5;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%; /* Ensure it takes full width of its container */
}

/* Specific styles for logo preview to ensure proper centering */
.v-col.text-right .image-preview-container {
  display: flex;
  justify-content: flex-end; /* Align to the right as per your template's col class */
  align-items: center;
}

.v-col.text-right .no-image-placeholder {
    margin-left: auto; /* Pushes the placeholder to the right */
    margin-right: 0;
}

/* Adjust image preview v-img sizing within its container */
.image-preview-container .v-img {
  width: 100%; /* Make v-img take full width of its container */
  height: auto;
}

/* Override default Vuetify file input prepend-icon spacing */
.v-file-input .v-input__prepend-outer {
  margin-inline-end: 0; /* Remove default margin */
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useI18n } from 'vue-i18n'; // Import useI18n

// Import your components. Adjust paths if necessary.
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';

// Initialize i18n
const { t } = useI18n();

// --- Type Definitions ---
interface Store {
  id: number;
  name: string;
  category: string;
  location: string;
  contact: string;
  description: string;
  closing_time: string;
  image1: string | null;
  image2: string | null;
  logo: string | null;
  daily_summary_enabled: boolean;
  stock_threshold: number;
  stock_alert_enabled: boolean;
}

// --- Form References ---
const storeForm = ref<HTMLFormElement | null>(null);
const logoForm = ref<HTMLFormElement | null>(null);
const generalSettingsForm = ref<HTMLFormElement | null>(null);

// --- Reactive State for Store Information ---
const storeId = ref<number | null>(null);
const name = ref('');
const category = ref('');
const location = ref('');
const contact = ref('');
const description = ref('');
const closingTime = ref('');

// Existing Image paths from the database
const currentImage1 = ref<string | null>(null);
const currentImage2 = ref<string | null>(null);
const currentLogo = ref<string | null>(null);

// New Image Files selected by the user (for upload)
const newImageFile1 = ref<File[]>([]);
const selectedImagePreview1 = ref<string | null>(null);

const newImageFile2 = ref<File[]>([]);
const selectedImagePreview2 = ref<string | null>(null);

const newLogoFile = ref<File[]>([]);
const selectedLogoPreview = ref<string | null>(null);

// --- Reactive State for Other Settings ---
const dailySummaryEnabled = ref(false);
const stockThreshold = ref();
const stockAlertEnabled = ref(false);

// --- UI Feedback States ---
const loading = ref(false);
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');

// --- Router Instance ---
const router = useRouter();

// --- Backend URL Configuration ---
const backendUrl = 'https://api.buyam-sellam.oc-classic.com'; // Make sure this matches your Laravel backend URL

// --- Helper for Image URL ---
const getImageUrl = (path: string | null) => {
    if (!path) {
        return 'https://via.placeholder.com/200x200?text=No+Image'; // Placeholder if no image
    }
    if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
        return path; // Already a full URL or data URI
    }
    return `${backendUrl}/storage/${path}`; // Construct full URL for stored images
};

// --- Validation Rules ---
const maxImageSizeKB = 2048; // 2MB
const imageRules = [
    (v: File[]) => !v || !v.length || v[0].size < maxImageSizeKB * 1024 || `Image size should be less than ${maxImageSizeKB / 1024}MB!`,
    (v: File[]) => !v || !v.length || ['image/jpeg', 'image/png', 'image/bmp', 'image/jpg', 'image/gif'].includes(v[0].type) || 'Image must be JPEG, PNG, BMP, JPG, or GIF.',
];

const maxLogoSizeKB = 1024; // 1MB
const logoRules = [
    (v: File[]) => !v || !v.length || v[0].size < maxLogoSizeKB * 1024 || `Logo size should be less than ${maxLogoSizeKB / 1024}MB!`,
    (v: File[]) => !v || !v.length || ['image/jpeg', 'image/png', 'image/bmp', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(v[0].type) || 'Logo must be JPEG, PNG, BMP, JPG, GIF, or SVG.',
];

// --- Daily Summary Toggle Dialog State ---
const dailySummaryDialog = ref<{
  visible: boolean;
  nextStatus: boolean; // true for enable, false for disable
}>({
  visible: false,
  nextStatus: false,
});


// --- Methods ---

/**
 * Displays a snackbar notification.
 * @param {string} message The message to display.
 * @param {string} color The color of the snackbar (e.g., 'success', 'error', 'warning').
 */
const showSnackbar = (message: string, color: string = 'info') => {
    snackbarMessage.value = message;
    snackbarColor.value = color;
    snackbar.value = true;
};

/**
 * Handles file selection for image 1.
 * @param {Event} event The change event from the file input.
 */
const onFileSelected1 = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        newImageFile1.value = [file];
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImagePreview1.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else {
        newImageFile1.value = [];
        selectedImagePreview1.value = null;
    }
};

/**
 * Handles file selection for image 2.
 * @param {Event} event The change event from the file input.
 */
const onFileSelected2 = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        newImageFile2.value = [file];
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedImagePreview2.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else {
        newImageFile2.value = [];
        selectedImagePreview2.value = null;
    }
};

/**
 * Handles file selection for the store logo.
 * @param {Event} event The change event from the file input.
 */
const onFileSelectedLogo = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        newLogoFile.value = [file];
        const reader = new FileReader();
        reader.onload = (e) => {
            selectedLogoPreview.value = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else {
        newLogoFile.value = [];
        selectedLogoPreview.value = null;
    }
};

/**
 * Fetches the current store's information from the backend and populates all form fields.
 */
const fetchStoreInformation = async () => {
    loading.value = true;
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('managerSettings.authRequired'), 'error');
        router.push('/login');
        loading.value = false;
        return;
    }

    try {
        const response = await axios.get('/api/stores/show', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const storeData = response.data.stores as Store;

        if (storeData) {
            storeId.value = storeData.id;
            name.value = storeData.name || '';
            category.value = storeData.category || '';
            location.value = storeData.location || '';
            contact.value = storeData.contact || '';
            description.value = storeData.description || '';
            closingTime.value = storeData.closing_time ? storeData.closing_time.substring(0, 5) : ''; // Format time

            currentImage1.value = storeData.image1 || null;
            currentImage2.value = storeData.image2 || null;
            currentLogo.value = storeData.logo || null;

            // Clear any newly selected files/previews after fetching fresh data
            newImageFile1.value = []; selectedImagePreview1.value = null;
            newImageFile2.value = []; selectedImagePreview2.value = null;
            newLogoFile.value = []; selectedLogoPreview.value = null;

            // Populate general settings
            dailySummaryEnabled.value = !!storeData.daily_summary_enabled; // Corrected property name
            
            stockAlertEnabled.value = !!storeData.stock_alert_enabled;

        } else {
            showSnackbar(t('managerSettings.storeInfoNotFound'), 'warning');
            storeId.value = null;
        }
    } catch (error) {
        console.error('Error fetching store information:', error);
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.status === 401) {
                showSnackbar(t('managerSettings.unauthorized'), 'error');
                 router.push('/login');
            } else if (error.response.status === 404) {
               showSnackbar(t('managerSettings.noStoreFound'), 'warning');
               storeId.value = null; // Indicate no store found for this user
            }
            else {
                showSnackbar(`${t('managerSettings.failedToLoadStoreData')}: ${error.response.data.message || error.message}`, 'error');
            }
        } else {
            showSnackbar(t('managerSettings.networkErrorProfile'), 'error');
        }
    } finally {
        loading.value = false;
    }
};

/**
 * Handles the submission for the main store profile form.
 */
const updateStoreProfile = async () => {
  if (!storeForm.value) return;
  const { valid } = await storeForm.value.validate();
  if (!valid) {
    showSnackbar(t('managerSettings.correctFormErrorsStoreProfile'), 'warning'); // Changed to specific key
    return;
  }

  if (storeId.value === null) {
      showSnackbar(t('managerSettings.storeIdMissing'), 'error');
      loading.value = false;
      return;
  }

  loading.value = true;
  const token = sessionStorage.getItem('access_token');
  if (!token) {
    showSnackbar(t('managerSettings.authRequired'), 'error');
     router.push('/login');
    loading.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append('_method', 'PUT'); // Laravel expects _method for PUT/PATCH via POST

    formData.append('name', name.value);
    formData.append('category', category.value);
    formData.append('location', location.value);
    formData.append('contact', contact.value);
    formData.append('description', description.value);
    formData.append('closing_time', closingTime.value);

    // Handle image1 update/removal
    if (newImageFile1.value.length > 0) {
      formData.append('image1', newImageFile1.value[0]);
    } else if (currentImage1.value && selectedImagePreview1.value === null) {
        // If currentImage1 exists but no new file is selected and preview is cleared (meaning user cleared it)
        formData.append('image1_cleared', 'true');
    }

    // Handle image2 update/removal
    if (newImageFile2.value.length > 0) {
      formData.append('image2', newImageFile2.value[0]);
    } else if (currentImage2.value && selectedImagePreview2.value === null) {
        formData.append('image2_cleared', 'true');
    }

    const currentStoreId = sessionStorage.getItem('storeId');
    const response = await axios.post(`/api/stores/edit/${currentStoreId}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data', // Essential for file uploads
      },
    });

    showSnackbar(t('managerSettings.storeProfileUpdatedSuccess') || response.data.message , 'success');
    await fetchStoreInformation(); // Re-fetch to update all local states and image previews

  } catch (error) {
    console.error('Error updating store profile:', error);
    if (axios.isAxiosError(error) && error.response) {
      let errorMessage = t('managerSettings.failedToUpdateStoreProfile');
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data.errors) {
        // Handle validation errors from Laravel
        const errors = error.response.data.errors;
        for (const key in errors) {
          errorMessage += `\n- ${errors[key].join(', ')}`;
        }
      }
      showSnackbar(errorMessage, 'error');
    } else {
      showSnackbar(t('managerSettings.networkErrorProfile'), 'error');
    }
  } finally {
    loading.value = false;
  }
};

/**
 * Handles the submission for the store logo form.
 */
const updateStoreLogo = async () => {
    if (!logoForm.value) return;
    const { valid } = await logoForm.value.validate();
    if (!valid) {
        showSnackbar(t('managerSettings.correctFormErrorsStoreLogo'), 'warning'); // Changed to specific key
        return;
    }

    if (storeId.value === null) {
        showSnackbar(t('managerSettings.storeIdMissing'), 'error');
        loading.value = false;
        return;
    }

    loading.value = true;
    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('managerSettings.authRequired'), 'error');
        router.push('/login');
        loading.value = false;
        return;
    }

    try {
        const formData = new FormData();
        formData.append('_method', 'PUT');

        // Handle logo update/removal
        if (newLogoFile.value.length > 0) {
            formData.append('logo', newLogoFile.value[0]);
        } else if (currentLogo.value && selectedLogoPreview.value === null) {
            formData.append('logo_cleared', 'true');
        }

        const currentStoreId = sessionStorage.getItem('storeId');
        const response = await axios.post(`/api/stores/edit/${currentStoreId}/logo`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        showSnackbar(t('managerSettings.storeLogoUpdatedSuccess') || response.data.success, 'success');
        await fetchStoreInformation();

    } catch (error) {
        console.error('Error updating store logo:', error);
        if (axios.isAxiosError(error) && error.response) {
            let errorMessage = t('managerSettings.failedToUpdateStoreLogo');
            if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.response.data.errors) {
                const errors = error.response.data.errors;
                for (const key in errors) {
                    errorMessage += `\n- ${errors[key].join(', ')}`;
                }
            }
            showSnackbar(errorMessage, 'error');
        } else {
            showSnackbar(t('managerSettings.networkErrorLogo'), 'error');
        }
    } finally {
        loading.value = false;
    }
};

/**
 * Prompts the user to confirm the daily summary toggle.
 * @param {boolean} newStatus The proposed new status for daily summary (true for enabled, false for disabled).
 */
const promptToggleDailySummary = (newStatus: boolean | null) => {
  // The VSwitch might emit `null`. For a toggle, `null` often implies
  // an 'off' or 'false' state, or it might just be a type quirk.
  // We'll safely convert it to a boolean.
  dailySummaryDialog.value.nextStatus = newStatus === true; // Ensures it's always boolean
  dailySummaryDialog.value.visible = true;
};

/**
 * Confirms and updates the daily summary setting.
 */
const confirmDailySummaryToggle = async () => {
    dailySummaryDialog.value.visible = false; // Close dialog immediately
    loading.value = true;

    if (storeId.value === null) {
        showSnackbar(t('managerSettings.storeIdMissing'), 'error');
        loading.value = false;
        return;
    }

    const token = sessionStorage.getItem('access_token');
    if (!token) {
        showSnackbar(t('managerSettings.authRequired'), 'error');
        router.push('/login');
        loading.value = false;
        return;
    }

    try {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        // Send '1' for enabled, '0' for disabled, as 'daily_summary_enabled' parameter (Updated property name)
        formData.append('daily_summary_enabled', dailySummaryDialog.value.nextStatus ? '1' : '0');

        const currentStoreId = sessionStorage.getItem('storeId');
        const response = await axios.post(`/api/stores/edit/${currentStoreId}/dailysummary`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });

        // Update the reactive state only after successful API call
        dailySummaryEnabled.value = dailySummaryDialog.value.nextStatus;
        showSnackbar( t('managerSettings.dailySummaryUpdatedSuccess') || response.data.success, 'success');

    } catch (error) {
        console.error('Error updating daily summary settings:', error);
        if (axios.isAxiosError(error) && error.response) {
            let errorMessage = t('managerSettings.failedToUpdateDailySummary');
            if (error.response.data.error) {
                errorMessage = error.response.data.error;
            } else if (error.response.data.errors) {
                const errors = error.response.data.errors;
                for (const key in errors) {
                    errorMessage += `\n- ${errors[key].join(', ')}`;
                }
            }
            showSnackbar(errorMessage, 'error');
        } else {
            showSnackbar(t('managerSettings.networkErrorDailySummary'), 'error');
        }
        // Revert the switch if there was an error by setting dailySummaryEnabled back to its original state
        dailySummaryEnabled.value = !dailySummaryDialog.value.nextStatus;
    } finally {
        loading.value = false;
    }
};

/**
 * Cancels the daily summary toggle confirmation dialog.
 */
const cancelDailySummaryToggle = () => {
  dailySummaryDialog.value.visible = false;
};


async function fetchStockThreshold() {
  loading.value = true;
  try {
    const token = sessionStorage.getItem('access_token');
    // Assuming a new API endpoint to get the global threshold
    const response = await axios.get('/api/stocks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    stockThreshold.value = response.data.stocks[0].threshold_quantity; // Default to 10 if not set

    console.log("test",stockThreshold);
  } catch (error) {
    console.error('Error fetching global stock threshold:', error);
    
  } finally {
    loading.value = false;
  }
}
/**
 * Handles the submission for updating the stock threshold and alert enabled status.
 */
const updateThresholdQuantity = async () => {
  if (!generalSettingsForm.value) return;
  const { valid } = await generalSettingsForm.value.validate();
  if (!valid) {
    showSnackbar(t('managerSettings.correctFormErrorsMoreSettings'), 'warning'); // Changed to specific key
    return;
  }

  if (storeId.value === null) {
    showSnackbar(t('managerSettings.storeIdMissing'), 'error');
    loading.value = false;
    return;
  }

  loading.value = true;
  const token = sessionStorage.getItem('access_token');
  if (!token) {
    showSnackbar(t('managerSettings.authRequired'), 'error');
      router.push('/login');
    loading.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('threshold_quantity', String(stockThreshold.value));
    
    const response = await axios.post('/api/stocks/updatestockthreshold', formData, { // Adjust API endpoint as needed
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    showSnackbar( t('managerSettings.settingsUpdatedSuccess') || response.data.success, 'success'); // Add a new translation key for this if desired
    await fetchStoreInformation();

  } catch (error) {
    console.error('Error updating general settings:', error);
    if (axios.isAxiosError(error) && error.response) {
      let errorMessage = t('managerSettings.failedToUpdateSettings'); // Add a new translation key for this if desired
      if (error.response.data.error) {
        errorMessage = error.response.data.error;
      } else if (error.response.data.errors) {
        const errors = error.response.data.errors;
        for (const key in errors) {
          errorMessage += `\n- ${errors[key].join(', ')}`;
        }
      }
      showSnackbar(errorMessage, 'error');
    } else {
      showSnackbar(t('managerSettings.networkErrorGeneralSettings'), 'error'); // Add a new translation key for this if desired
    }
  } finally {
    loading.value = false;
  }
};


// --- Lifecycle Hook ---
onMounted(() => {
  fetchStoreInformation();
  fetchStockThreshold()
});
</script>

<style scoped>
.custom-border-card {
  border-left: 5px solid #496896; /* Example color, adjust as needed */
  border-radius: 8px;
}

.image-preview-container {
  max-width: 100%;
  height: auto; /* Adjust height as needed */
  overflow: hidden; /* Ensures the image doesn't overflow */
}

.no-image-placeholder {
  background-color: #f5f5f5;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
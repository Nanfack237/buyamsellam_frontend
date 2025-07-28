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
                {{ $t('addEmployeeVue.add_an_employee') }}
              </p>
            </v-col>
            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">{{ formattedDate }}</p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-container fluid class="pa-5">
            <v-card class="pa-4" variant="flat">
              <p class="text-medium-emphasis pb-4 text-subtitle-1">
                {{ $t('addEmployeeVue.please_enter_details_to_create_employee') }}
              </p>
              <v-divider class="mb-8"></v-divider>

              <v-form @submit.prevent="addEmployee" ref="employeeForm">
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-card flat border="thin" class="pa-4 custom-border-card" height="100%">
                      <v-card-title class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                        <v-icon left>mdi-image-plus</v-icon> {{ $t('addEmployeeVue.upload_employee_photo') }}
                      </v-card-title>
                      <v-card-text>
                        <v-file-input
                          :label="$t('addEmployeeVue.select_employee_image')"
                          accept="image/*"
                          @change="onFileSelected"
                          prepend-icon=""
                          append-inner-icon="mdi-camera"
                          variant="outlined"
                          v-model="imageFile"
                          :rules="imageRules"
                          clearable
                          show-size
                          :hint="$t('addEmployeeVue.max_2mb_jpeg_png_bmp')"
                          persistent-hint
                        />
                        <div v-if="selectedImagePreview" class="image-preview-container mt-4">
                          <v-img :src="selectedImagePreview" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                        </div>
                        <div v-else class="no-image-placeholder">
                          <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                          <p class="text-caption text-grey-lighten-1 mt-2">{{ $t('addEmployeeVue.no_image_selected') }}</p>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" class="mt-5" sm="6" md="8">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="name"
                          :label="$t('addEmployeeVue.name')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addEmployeeVue.name_is_required'), v => v.length >= 3 || $t('addEmployeeVue.minimum_3_characters')]"
                          prepend-inner-icon="mdi-account-badge"
                          density="comfortable"
                          class="mb-4"
                        />
                        <v-text-field
                          v-model="email"
                          :label="$t('addEmployeeVue.email')"
                          type="email"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addEmployeeVue.email_is_required'), v => /.+@.+\..+/.test(v) || $t('addEmployeeVue.must_be_valid_email')]"
                          prepend-inner-icon="mdi-email"
                          density="comfortable"
                          class="mb-4"
                        />
                        <v-text-field
                          v-model="newPassword"
                          :label="$t('addEmployeeVue.new_password')"
                          type="password"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addEmployeeVue.password_is_required'), v => v.length >= 8 || $t('addEmployeeVue.minimum_8_characters')]"
                          prepend-inner-icon="mdi-lock"
                          density="comfortable"
                          class="mb-4"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="contact"
                          :label="$t('addEmployeeVue.contact')"
                          type="number"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addEmployeeVue.contact_is_required'), v => String(v).length >= 9 || $t('addEmployeeVue.minimum_9_digits')]"
                          prepend-inner-icon="mdi-phone"
                          density="comfortable"
                          class="mb-4"
                        />
                        <v-text-field
                          v-model="address"
                          :label="$t('addEmployeeVue.address')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addEmployeeVue.address_is_required'), v => v.length >= 3 || $t('addEmployeeVue.minimum_3_characters')]"
                          prepend-inner-icon="mdi-map-marker"
                          density="comfortable"
                          class="mb-4"
                        />
                        <v-text-field
                          v-model="confirmPassword"
                          :label="$t('addEmployeeVue.confirm_password')"
                          type="password"
                          variant="outlined"
                          persistent-hint
                          :rules="[
                            v => !!v || $t('addEmployeeVue.confirmation_is_required'),
                            v => v === newPassword || $t('addEmployeeVue.passwords_do_not_match')
                          ]"
                          prepend-inner-icon="mdi-lock-check"
                          density="comfortable"
                          class="mb-4"
                        />
                      </v-col>
                    </v-row>
                    <v-select
                      v-model="role"
                      :label="$t('addEmployeeVue.role')"
                      :items="[
                        { text: $t('addEmployeeVue.cashier'), value: $t('addEmployeeVue.cashier') },
                        { text: $t('addEmployeeVue.stock_controller'), value:t('addEmployeeVue.stock_controller'), },
                        { text: $t('addEmployeeVue.staff'), value:  $t('addEmployeeVue.staff'), }
                      ]"
                      item-title="text"
                      item-value="value"
                      variant="outlined"
                      persistent-hint
                      :rules="[v => !!v || $t('addEmployeeVue.role_is_required')]"
                      prepend-inner-icon="mdi-briefcase"
                      density="comfortable"
                      class="mt-0 mb-4"
                    />
                  </v-col>
                </v-row>

                <v-row justify="center" class="mt-5">
                  <v-col cols="12" sm="6" md="2" class="text-center">
                    <v-btn type="submit" :loading="isSubmitting" color="primary" size="large" block>
                      {{ $t('addEmployeeVue.save') }} <v-icon class="mx-2" right>mdi-content-save</v-icon>
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
          <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios'; // Assuming your axios instance is correctly configured
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n'; // Import useI18n

const { t,locale } = useI18n(); // Destructure the t (translate) function

// --- Reactive State ---
const name = ref<string>('');
const email = ref<string>('');
const address = ref<string>('');
const contact = ref<string>('');
const newPassword = ref<string>('');
const confirmPassword = ref<string>('');
const role = ref<string>('');
const imageFile = ref<File[] | null>(null);
const selectedImagePreview = ref<string | null>(null);

const isSubmitting = ref(false);
const isDataLoaded = ref(false); // Controls the initial page load overlay

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

const router = useRouter();
const employeeForm = ref<any>(null); // Ref for the v-form component

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Use the current locale for date formatting
  return date.toLocaleDateString(locale.value, options);
});

const imageRules = computed(() => [
  (v: File[] | null) => {
    // If v is null, empty array, or its first element is null/undefined, it's optional.
    if (!v || v.length === 0 || !v[0]) {
      return true;
    }
    const file = v[0]; // At this point, 'file' is guaranteed to be a File object (or at least not null/undefined)
    const maxSize = 2 * 1024 * 1024; // 2 MB
    return file.size < maxSize || t('addEmployeeVue.image_size_less_than_2mb');
  },
  (v: File[] | null) => {
    // If v is null, empty array, or its first element is null/undefined, it's optional.
    if (!v || v.length === 0 || !v[0]) {
      return true;
    }
    const file = v[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type) || t('addEmployeeVue.only_allowed_image_types');
  },
]);

// --- Methods ---
/**
 * Displays a snackbar notification.
 * @param message The message to display.
 * @param color The color of the snackbar (e.g., 'success', 'error').
 */
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

/**
 * Handles the file selection for the employee image, including preview and basic validation.
 * @param event The change event from the file input.
 */
const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (files && files.length > 0) {
    const file = files[0];

    // Reset preview initially
    selectedImagePreview.value = null;

    // Manually run validation rules for immediate feedback
    let isValidFile = true;
    for (const rule of imageRules.value) {
      const result = rule([file]);
      if (typeof result === 'string') {
        showSnackbar(result, 'error');
        imageFile.value = null; // Clear the input if invalid
        isValidFile = false;
        break;
      }
    }

    if (isValidFile) {
      imageFile.value = [file];
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedImagePreview.value = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      imageFile.value = null;
    }
  } else {
    // If no file is selected, clear the image and preview
    imageFile.value = null;
    selectedImagePreview.value = null;
  }
};

/**
 * Handles the submission of the employee form.
 * Validates inputs, sends data including the image to the backend.
 */
const addEmployee = async () => {
  isSubmitting.value = true; // Activate loading state for the submit button

  // Validate the form using the ref
  if (!employeeForm.value) return;
  const { valid } = await employeeForm.value.validate();

  if (!valid) {
    showSnackbar(t('addEmployeeVue.please_correct_form_errors'), 'error');
    isSubmitting.value = false;
    return;
  }

  // Specific password match validation
  if (newPassword.value !== confirmPassword.value) {
    showSnackbar(t('addEmployeeVue.the_two_passwords_do_not_match'), 'error');
    isSubmitting.value = false;
    return;
  }

  try {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('email', email.value);
    formData.append('address', address.value);
    formData.append('contact', contact.value);
    formData.append('password', newPassword.value);
    formData.append('role', role.value);
    if (imageFile.value && imageFile.value.length > 0) {
      formData.append('image', imageFile.value[0]);
    }

    const token = sessionStorage.getItem('access_token');
    if (!token) {
      showSnackbar(t('addEmployeeVue.authentication_required_please_login'), 'error');
      router.push('/login');
      return;
    }

    const response = await axios.post('/api/employees/store', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for sending files
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.data.error) {
      showSnackbar(response.data.error, 'error');
    } else if (response.data.success) {
      showSnackbar(t('addEmployeeVue.employee_added_successfully'), 'success'); // Using generic success message or specific if available
      // Reset form fields and validation state upon success
      name.value = '';
      email.value = '';
      address.value = '';
      contact.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      role.value = '';
      imageFile.value = null;
      selectedImagePreview.value = null;
      employeeForm.value.resetValidation(); // Reset Vuetify's validation state

      setTimeout(() => router.push('/employee'), 2000); // Redirect after a short delay
    } else {
      console.error('Unknown response from server:', response.data);
      showSnackbar(response.data.message || t('addEmployeeVue.unknown_error_occurred'), 'error');
    }
  } catch (error: any) {
    console.error('Error creating employee:', error);
    if (error.response && error.response.data) {
      if (error.response.data.errors) {
        // Handle validation errors from the backend
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(`${t('addEmployeeVue.validation_error')} ${errorMessages}`, 'error');
      } else if (error.response.data.message) {
        // Handle other API error messages
        showSnackbar(`${t('addEmployeeVue.error')}: ${error.response.data.message}`, 'error');
      } else {
        showSnackbar(t('addEmployeeVue.addEmployeeVue.an_api_error_occurred'), 'error');
      }
    } else {
      // Handle network errors or other unexpected issues
      showSnackbar(t('addEmployeeVue.unexpected_error_occurred_check_network'), 'error');
    }
  } finally {
    isSubmitting.value = false; // Always deactivate submit button loading
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // Simulate data loading completion
  setTimeout(() => {
    isDataLoaded.value = true;
  }, 500); // Simulate 0.5 seconds loading time
});
</script>

<style scoped>
.custom-border-card {
  border-color: rgba(128, 128, 128, 0.3) !important;
  border-width: 1px !important;
  border-style: solid !important;
}

.image-preview-container {
  max-height: 200px;
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
  height: 200px;
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px dashed #ccc;
  color: #aaa;
}

/* Ensure text fields have consistent bottom margin */
.v-text-field, .v-select, .v-textarea {
  margin-bottom: 16px; /* Adjust as needed */
}
</style>
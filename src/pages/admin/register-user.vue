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
                {{ $t('addUserVue.add_a_user') }}
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
                {{ $t('addUserVue.please_enter_details_to_create_user') }}
              </p>
              <v-divider class="mb-8"></v-divider>

              <v-form @submit.prevent="addUser" ref="userForm">
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-card flat border="thin" class="pa-4 custom-border-card" height="100%">
                      <v-card-title class="text-medium-emphasis text-body-1 font-weight-bold mb-3">
                        <v-icon left>mdi-image-plus</v-icon> {{ $t('addUserVue.upload_user_photo') }}
                      </v-card-title>
                      <v-card-text>
                        <v-file-input
                          :label="$t('addUserVue.select_user_image')"
                          accept="image/*"
                          @change="onFileSelected"
                          prepend-icon=""
                          append-inner-icon="mdi-camera"
                          variant="outlined"
                          v-model="imageFile"
                          :rules="imageRules"
                          clearable
                          show-size
                          :hint="$t('addUserVue.max_2mb_jpeg_png_bmp')"
                          persistent-hint
                        />
                        <div v-if="selectedImagePreview" class="image-preview-container mt-4">
                          <v-img :src="selectedImagePreview" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                        </div>
                        <div v-else class="no-image-placeholder">
                          <v-icon size="80" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                          <p class="text-caption text-grey-lighten-1 mt-2">{{ $t('addUserVue.no_image_selected') }}</p>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>

                  <v-col cols="12" class="mt-5" sm="6" md="8">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="name"
                          :label="$t('addUserVue.name')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addUserVue.name_is_required'), v => v.length >= 3 || $t('addUserVue.minimum_3_characters')]"
                          prepend-inner-icon="mdi-account-badge"
                          density="comfortable"
                          class="my-1"
                        />

                        <v-text-field
                          v-model="email"
                          :label="$t('addUserVue.email')"
                          type="email"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addUserVue.email_is_required'), v => /.+@.+\..+/.test(v) || $t('addUserVue.must_be_valid_email')]"
                          prepend-inner-icon="mdi-email"
                          density="comfortable"
                          class="my-1"
                        />

                        <v-text-field
                          v-model="newPassword"
                          :label="$t('addUserVue.new_password')"
                          type="password"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addUserVue.password_is_required'), v => v.length >= 8 || $t('addUserVue.minimum_8_characters')]"
                          prepend-inner-icon="mdi-lock"
                          density="comfortable"
                          class="my-1"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="address"
                          :label="$t('addUserVue.address')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addUserVue.address_is_required')]"
                          prepend-inner-icon="mdi-map-marker"
                          density="comfortable"
                          class="my-1"
                        />

                        <v-text-field
                          v-model="contact"
                          :label="$t('addUserVue.contact')"
                          type="text"
                          variant="outlined"
                          persistent-hint
                          :rules="[v => !!v || $t('addUserVue.contact_is_required'), v => /^\+?\d{6,15}$/.test(v) || $t('addUserVue.contact_must_be_valid')]"
                          prepend-inner-icon="mdi-phone"
                          density="comfortable"
                          class="my-1"
                        />

                        <v-text-field
                          v-model="confirmPassword"
                          :label="$t('addUserVue.confirm_password')"
                          type="password"
                          variant="outlined"
                          persistent-hint
                          :rules="[
                            v => !!v || $t('addUserVue.confirmation_is_required'),
                            v => v === newPassword || $t('addUserVue.passwords_do_not_match')
                          ]"
                          prepend-inner-icon="mdi-lock-check"
                          density="comfortable"
                          class="my-1"
                        />
                      </v-col>
                      </v-row>
                  </v-col>
                </v-row>

                <v-row justify="center" class="mt-5">
                  <v-col cols="12" sm="6" md="2" class="text-center">
                    <v-btn type="submit" :loading="isSubmitting" color="primary" size="large" block>
                      {{ $t('addUserVue.save') }}
                      <v-icon class="mx-2" right>mdi-content-save</v-icon>
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
import axios from '@/axios';
import SideBarComponent from '@/components/admin/AdminSideBarComponent.vue';
import HeaderComponent from '@/components/admin/AdminHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';

const { t, locale } = useI18n();

// --- Reactive State ---
const name = ref<string>('');
const email = ref<string>('');
const address = ref<string>('');
const contact = ref<string>('');
const newPassword = ref<string>('');
const confirmPassword = ref<string>('');
// const role = ref<string>(''); // Removed role field

const imageFile = ref<File[] | null>(null);
const selectedImagePreview = ref<string | null>(null);

const isSubmitting = ref(false);
const isDataLoaded = ref(false);

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

const router = useRouter();
const userForm = ref<any>(null);

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
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
    return file.size < maxSize || t('addUserVue.image_size_less_than_2mb');
  },
  (v: File[] | null) => {
    // If v is null, empty array, or its first element is null/undefined, it's optional.
    if (!v || v.length === 0 || !v[0]) {
      return true;
    }
    const file = v[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/bmp', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type) || t('addUserVue.only_allowed_image_types');
  },
]);

// --- Methods ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  selectedImagePreview.value = null;

  if (files && files.length > 0) {
    const file = files[0];

    let isValidFile = true;
    for (const rule of imageRules.value) {
      const result = rule([file]);
      if (typeof result === 'string') {
        showSnackbar(result, 'error');
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
    imageFile.value = null;
    selectedImagePreview.value = null;
  }
};

const addUser = async () => {
  isSubmitting.value = true;

  if (!userForm.value) {
    showSnackbar(t('addUserVue.form_not_ready'), 'error');
    isSubmitting.value = false;
    return;
  }

  const { valid } = await userForm.value.validate();

  if (!valid) {
    showSnackbar(t('addUserVue.please_correct_form_errors'), 'error');
    isSubmitting.value = false;
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    showSnackbar(t('addUserVue.the_two_passwords_do_not_match'), 'error');
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
    // Removed formData.append('role', role.value);

    if (imageFile.value && imageFile.value.length > 0) {
      formData.append('image', imageFile.value[0]);
    }

    const token = sessionStorage.getItem('access_token');

    if (!token) {
      showSnackbar(t('addUserVue.authentication_required_please_login'), 'error');
      router.push('/login');
      return;
    }

    const response = await axios.post('/api/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
    });

    if (response.data.error) {
      showSnackbar(response.data.error, 'error');
    } else if (response.data.success) {
      showSnackbar(t('addUserVue.user_added_successfully'), 'success');
      // Reset form fields and validation state upon success
      name.value = '';
      email.value = '';
      address.value = '';
      contact.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      // role.value = ''; // Removed role reset
      imageFile.value = null;
      selectedImagePreview.value = null;
      userForm.value.resetValidation();

      setTimeout(() => router.push('/admin/users'), 2000);
    } else {
      console.error('Unknown response from server:', response.data);
      showSnackbar(t('addUserVue.unknown_error_occurred') || response.data.message, 'error');
    }
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.data.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('; ');
        showSnackbar(`${t('addUserVue.validation_error')} ${errorMessages}`, 'error');
      } else if (error.response.data.message) {
        showSnackbar(`${t('addUserVue.error')}: ${error.response.data.message}`, 'error');
      } else {
        showSnackbar(t('addUserVue.an_api_error_occurred'), 'error');
      }
    } else {
      showSnackbar(t('addUserVue.unexpected_error_occurred_check_network'), 'error');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  setTimeout(() => {
    isDataLoaded.value = true;
  }, 500);
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
.v-text-field,
.v-select,
.v-textarea {
  margin-bottom: 16px;
  /* Adjust as needed */
}
</style>
<template>
  <v-app>
    <div class="background"></div>

    <v-main class="d-flex justify-center align-center">
      <v-row>
        

        <v-col md="8" lg="4" sm="7" class="mx-auto my-auto">
          <v-card class="mx-6 my-4 pa-4" elevation="12">
            <div class="text-center">
              <v-avatar size="80" color="blue-darken-4">
                <v-icon size="40" color="white">mdi-account-plus</v-icon>
              </v-avatar>
              <h2 class="p--text pa-4">Register New Account</h2>
            </div>
            <v-form ref="formRef" @submit.prevent="submitRegister">
              <v-card-text>
                <v-text-field
                  v-model="name"
                  :rules="nameRules"
                  label="Name"
                  type="text"
                  placeholder="Your Name"
                  prepend-inner-icon="mdi-account"
                  required
                  class="mb-2"
                />

                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  label="Email"
                  type="email"
                  placeholder="Email"
                  prepend-inner-icon="mdi-email"
                  required
                  class="mb-2"
                />

                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  :type="passwordShow ? 'text' : 'password'"
                  label="Password"
                  placeholder="Password"
                  prepend-inner-icon="mdi-key"
                  :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="passwordShow = !passwordShow"
                  required
                  class="mb-2"
                />

                <v-text-field
                  v-model="confirmPassword"
                  :rules="confirmPasswordRules"
                  :type="confirmPasswordShow ? 'text' : 'password'"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  prepend-inner-icon="mdi-key"
                  :append-icon="confirmPasswordShow ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="confirmPasswordShow = !confirmPasswordShow"
                  required
                  class="mb-2"
                />

                <v-file-input
                  label="Upload Profile Photo (Optional)"
                  accept="image/*"
                  @change="onFileSelected"
                  prepend-icon=""
                  append-inner-icon="mdi-camera"
                  variant="outlined"
                  v-model="imageFile"
                  :rules="imageRules"
                  clearable
                  show-size
                  hint="Max 2MB, JPEG, PNG, BMP"
                  persistent-hint
                  class="mb-4"
                />
                <div v-if="selectedImagePreview" class="image-preview-container mt-4 mb-4">
                  <v-img :src="selectedImagePreview" class="rounded-lg elevation-2" aspect-ratio="1.7" cover />
                </div>
                <div v-else class="no-image-placeholder mb-4">
                    <v-icon size="60" color="grey-lighten-2">mdi-image-off-outline</v-icon>
                    <p class="text-caption text-grey-lighten-1 mt-2">No image selected</p>
                </div>

                <v-card-actions class="justify-center">
                  <v-btn :loading="loading" type="submit" variant="flat" color="blue-darken-4">
                    <span class="px-8">Register <v-icon>mdi-account-plus</v-icon></span>
                  </v-btn>
                </v-card-actions>
                <div class="text-center mt-4">
                  <router-link to="/login" class="text-decoration-none text-blue-darken-4">Already have an account? Login</router-link>
                </div>
              </v-card-text>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-main>

    <div class="md-3 text-center ma-2">
      <v-snackbar
        v-model="snackbar"
        color="red"
        elevation="4"
        location="top right"
        :timeout="snackbarTimeout"
      >
        {{ error }}
        <template v-slot:actions>
          <v-btn variant="text" @click="snackbar = false">
            <v-icon color="black-lighten-2">mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </div>

    <v-overlay :model-value="isGlobalLoading" class="align-center justify-center" persistent>
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="my-1 text-h6 text-white">Registering...</p>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios'; // Ensure your axios instance is correctly configured
import { useLoader } from '@/useLoader'; // Assuming useLoader correctly manages a global loading state

// --- Composables and Utilities ---
const router = useRouter();
const { startLoading, stopLoading, isLoading: isGlobalLoading } = useLoader();

// --- Reactive State ---
const loading = ref<boolean>(false); // Controls the register button's loading state
const snackbar = ref<boolean>(false); // Controls the visibility of the error snackbar
const error = ref<string>(''); // Error message for snackbar
const snackbarTimeout = 3000; // Duration for snackbar display

// Form fields
const name = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const confirmPassword = ref<string>('');
const imageFile = ref<File[] | null>(null);
const selectedImagePreview = ref<string | null>(null);

// Password visibility toggles
const passwordShow = ref<boolean>(false);
const confirmPasswordShow = ref<boolean>(false);

// For the typewriter effect
const text = ref<string>('');
const index = ref<number>(0);
const message = ref<string>("Join us! Start optimizing your inventory and boost your business today.");

// --- Form Validation Rules ---
const nameRules = [(v: string) => !!v || 'Name is required', (v: string) => v.length >= 3 || 'Name must be at least 3 characters'];
const emailRules = [(v: string) => !!v || 'E-mail is required', (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'];
const passwordRules = [(v: string) => !!v || 'Password is required', (v: string) => (v && v.length >= 8) || 'Password must be 8 characters or more!'];
const confirmPasswordRules = [
  (v: string) => !!v || 'Password confirmation is required',
  (v: string) => v === password.value || 'Passwords do not match',
];

const imageRules = computed(() => [
  (v: File[] | null) => {
    if (!v || v.length === 0) return true; // Image is optional
    const file = v[0];
    const maxSize = 2 * 1024 * 1024; // 2 MB
    return file.size < maxSize || 'Image size should be less than 2 MB!';
  },
  (v: File[] | null) => {
    if (!v || v.length === 0) return true; // Image is optional
    const file = v[0];
    const allowedTypes = ['image/png', 'image/jpeg', 'image/bmp'];
    return allowedTypes.includes(file.type) || 'Only JPEG, PNG, and BMP images are allowed.';
  },
]);

// Reference to the Vuetify form component for programmatic validation
const formRef = ref<HTMLFormElement | null>(null);

// --- Methods ---
/**
 * Implements the typing animation for the welcome message.
 */
function typewriter() {
  const interval = setInterval(() => {
    text.value = message.value.slice(0, ++index.value);

    if (index.value === message.value.length) {
      clearInterval(interval);
      setTimeout(erase, 1000); // Wait 1 second before erasing
    }
  }, 100); // Adjust the interval (in milliseconds) for typing speed
}

/**
 * Implements the erasing animation for the welcome message.
 */
function erase() {
  const interval = setInterval(() => {
    text.value = text.value.slice(0, --index.value);

    if (index.value === 0) {
      clearInterval(interval);
      setTimeout(typewriter, 500); // Wait 0.5 seconds before typing again
    }
  }, 50); // Adjust the interval for erasing speed
}

/**
 * Handles the file selection for the profile image, including preview and basic validation.
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
 * Handles the registration form submission.
 * Validates inputs, sends credentials and image to the backend, and handles responses.
 */
const submitRegister = async () => {
  // Validate the form using Vuetify's form ref
  const { valid } = await (formRef.value as any).validate();

  if (!valid) {
    console.log('Form validation failed.');
    showSnackbar('Please correct the form errors before submitting.', 'red');
    return;
  }

  // Ensure passwords match
  if (password.value !== confirmPassword.value) {
    showSnackbar('Passwords do not match.', 'red');
    return;
  }

  // Start global loading overlay and button loader
  startLoading();
  loading.value = true;

  try {
    const formData = new FormData();
    formData.append('name', name.value);
    formData.append('email', email.value);
    formData.append('password', password.value);
    formData.append('password_confirmation', confirmPassword.value); // Laravel often expects this for registration

    if (imageFile.value && imageFile.value.length > 0) {
      formData.append('image', imageFile.value[0]);
    }

    // Assuming your registration API endpoint is /api/register or similar
    const response = await axios.post('/api/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Important for sending files
      },
    });

    if (response.data.error) {
      console.error('Registration failed:', response.data.error);
      showSnackbar(response.data.error, 'red');
    } else if (response.data.message) {
      // Assuming a success message from the backend
      console.log('Registration successful:', response.data.message);
      showSnackbar('Registration successful! Please login.', 'success'); // Green snackbar for success

      // Optionally, automatically log in or redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 2000); // Redirect after 2 seconds
    } else {
      console.error('Unknown response from server:', response.data);
      showSnackbar(response.data.message || 'An unknown error occurred during registration.', 'red');
    }
  } catch (apiError: any) {
    console.error('API call error:', apiError);

    if (apiError.response && apiError.response.data) {
      if (apiError.response.data.errors) {
        // Handle validation errors from Laravel backend (e.g., email already taken)
        const errorMessages = Object.values(apiError.response.data.errors)
                                  .flat()
                                  .join('; ');
        showSnackbar(`Validation Error: ${errorMessages}`, 'red');
      } else if (apiError.response.data.message) {
        // Handle other API error messages
        showSnackbar(`Error: ${apiError.response.data.message}`, 'red');
      } else {
        showSnackbar('An API error occurred during registration.', 'red');
      }
    } else {
      // Handle network errors or other unexpected issues
      showSnackbar('An unexpected error occurred. Check your network connection.', 'red');
    }
  } finally {
    loading.value = false; // Always deactivate button loading state
    stopLoading(); // Always stop global loader
  }
};

/**
 * Displays a snackbar notification.
 * @param message The message to display.
 * @param color The color of the snackbar (e.g., 'success', 'red').
 */
function showSnackbar(message: string, color: string) {
  error.value = message;
  snackbar.value = true;
  // You might want to dynamically set snackbarColor if needed
  // snackbarColor.value = color;
}

// --- Lifecycle Hooks ---
onMounted(() => {
  typewriter(); // Start the typewriter effect when the component is mounted
});
</script>

<style scoped>
/* Scoped styles for this component */
.background {
  background-image: url(@/assets/login5.jpg) !important;
  height: 100%;
  width: 100%;
  display: block;
  position: absolute;
  top: 0;
  background-size: cover;
  filter: blur(3px); /* Apply blur effect to the background */
}

.image-preview-container {
  max-height: 150px; /* Adjust height as needed for smaller preview in form */
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
  height: 150px; /* Adjust height to match preview container */
  background-color: #f5f5f5;
  border-radius: 8px;
  border: 1px dashed #ccc;
  color: #aaa;
}

/* Add some margin to the bottom of text fields for better spacing */
.v-text-field, .v-file-input {
  margin-bottom: 12px;
}
</style>
<template>
  <v-app>
    <div class="backgruond"></div>
    <v-img src="@/assets/logo1.svg" height="0" width="120" style="padding: 0px; margin: 0PX;" :alt="t('loginPage.logoAlt')" class="mx-4 py-0"></v-img>
    <v-main class="d-flex justify-center align-center">
      <v-row>

        <v-col cols="12" class="py-2" md="7">
          <v-card class="px-5 mt-0" variant="text" height="370">
            <h1 class="text-h2" style="color: white;">
               {{ text }} |
              <v-icon color="green-lighten-3">mdi-emoticon-outline</v-icon>
            </h1>
          </v-card>
        </v-col>

        <v-col md="5" lg="4" sm="7" class="mx-auto my-auto">
          <v-card class="mx-6 my-1 pa-4" elevation="12">
            <div class="text-center">
              <v-avatar size="80" color="blue-darken-4">
                <v-icon size="40" color="green-lighten-4">mdi-account</v-icon>
              </v-avatar>
              <span class="p--text pa-4">
                <h2 class="mt-0 pt-4">{{ t('loginPage.loginTitle') }}</h2>
              </span>
            </div>
            <v-form ref="formRef" @submit.prevent="SubmitLogin">
              <v-card-text>
                <v-text-field
                  v-model="email"
                  :rules="emailRules"
                  type="email"
                  :label="t('loginPage.emailLabel')"
                  :placeholder="t('loginPage.emailPlaceholder')"
                  prepend-inner-icon="mdi-account"
                  required
                />
                <v-text-field
                  v-model="password"
                  :rules="passwordRules"
                  :type="passwordShow ? 'text' : 'password'"
                  :label="t('loginPage.passwordLabel')"
                  :placeholder="t('loginPage.passwordPlaceholder')"
                  prepend-inner-icon="mdi-key"
                  :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="passwordShow = !passwordShow"
                  required
                />
                <!-- <v-switch :label="t('loginPage.rememberMe')" color="blue-darken-4" hide-details></v-switch> -->
                <v-card-actions class="justify-center ">
                  <v-btn :loading="loading" type="submit" class="my-3" variant="flat" color="blue-darken-4">
                    <span class="px-8">{{ t('loginPage.loginButton') }}<v-icon>mdi-login</v-icon></span>
                  </v-btn>
                </v-card-actions>
              </v-card-text>
            </v-form>
          </v-card>
        </v-col>
      </v-row>
    </v-main>

    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
      {{ snackbarMessage }}
    </v-snackbar>

    <v-overlay :model-value="isGlobalLoading" class="align-center justify-center" persistent>
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="my-1 text-h6 text-white">{{ t('loginPage.loading') }}</p>
    </v-overlay>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useI18n } from 'vue-i18n'; // Import useI18n

// --- Composables and Utilities ---
const router = useRouter();
const { startLoading, stopLoading, isLoading: isGlobalLoading } = useLoader();
const { t } = useI18n(); // Initialize useI18n

// --- Reactive State ---
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;
const loading = ref<boolean>(false);

const passwordShow = ref<boolean>(false);
const email = ref<string>('');
const password = ref<string>('');

// For the typewriter effect
const text = ref<string>('');
const index = ref<number>(0);
// Use a computed property for the message to translate it
const typewriterMessage = ref<string>(t('loginPage.welcomeMessage'));

// --- Form Validation Rules ---
const emailRules = [
  (v: string) => !!v || t('loginPage.emailRequired'),
  (v: string) => /.+@.+\..+/.test(v) || t('loginPage.emailValid'),
];

const passwordRules = [
  (v: string) => !!v || t('loginPage.passwordRequired'),
  (v: string) => (v && v.length >= 8) || t('loginPage.passwordMinLength', { count: 8 }),
];

const formRef = ref<InstanceType<typeof import('vuetify/components')['VForm']> | null>(null);

// --- Methods ---
function typewriter() {
  const messageToType = typewriterMessage.value; // Use the translated message
  const interval = setInterval(() => {
    text.value = messageToType.slice(0, ++index.value);
    if (index.value === messageToType.length) {
      clearInterval(interval);
      setTimeout(erase, 1500); // Wait a bit before erasing
    }
  }, 100);
}

function erase() {
  const interval = setInterval(() => {
    text.value = text.value.slice(0, --index.value);
    if (index.value === 0) {
      clearInterval(interval);
      // Re-fetch the translated message in case locale changed
      typewriterMessage.value = t('loginPage.welcomeMessage');
      setTimeout(typewriter, 1000); // Wait a bit before re-typing
    }
  }, 50);
}

function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}
/**
 * Handles the login form submission.
 * Validates inputs, sends credentials to the backend, and handles responses,
 * including fetching and storing the employee's store_id.
 */
const SubmitLogin = async () => {
  if (!formRef.value) {
    console.error('Form reference is null.');
    showSnackbar(t('loginPage.formError'), 'error');
    return;
  }

  const { valid } = await formRef.value.validate();

  if (!valid) {
    loading.value = false;
    return;
  }

  startLoading();
  loading.value = true;

  try {
    const response = await axios.post('/api/auth/login', {
      email: email.value,
      password: password.value,
    });

    if (response.data.error) {
      console.error('Login failed:', response.data.error);
      showSnackbar(response.data.error, 'error'); // Use the error message from the backend if available
    } else {
      const token = response.data.token;
      const user = response.data.user;

      // Store token and basic user info
      sessionStorage.setItem('access_token', token);
      if (user && user.role) {
        sessionStorage.setItem('userRole', user.role);
      }
      if (user && user.id) {
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('userEmail', user.email);
      }

      // Set Authorization header for subsequent requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      console.log('Login successful for user ID:', user.id, 'Role:', user.role);
      showSnackbar(t('loginPage.loginSuccess'), 'success');


      // --- Fetch and Store store_id based on user_id ---
      if (user && user.id) {
        try {
          const employeeResponse = await axios.get('/api/employees/showstore', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (employeeResponse.data.employee && employeeResponse.data.employee.length > 0 && employeeResponse.data.employee[0].store_id) {
            const storeId = employeeResponse.data.employee[0].store_id; // Access the first element
            sessionStorage.setItem('storeId', storeId.toString()); // Store as string, session storage only stores strings
            console.log(`Store ID ${storeId} fetched and stored for user ${user.id}.`);
          } else {
            console.warn(`No store_id found for user ${user.id} in employee data or employee array is empty.`);
            // showSnackbar(t('loginPage.noStoreIdFound'), 'warning');
          }
        } catch (employeeError: any) {
          console.error('Error fetching user details for user:', user.id, employeeError);
          showSnackbar(t('loginPage.fetchDataError'), 'error');
        }
      }

      // --- Role-based Redirection ---
      if (user && user.role) {
        switch (user.role) {
          case 'Cashier':
          case 'Caissier':
            router.push('/cashier/product');
            break;
          case 'Stock Controller':
          case 'Contrôleur de stock':
            router.push('/stockcontroller/stock');
            break;
          case 'staff':
          case 'Personnel':
            router.push('/dashboard');
            break;
          case 'manager':
            router.push('/store');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          default:
            console.warn('Unknown role. Redirecting to default /store.');
            router.push('/store');
            break;
        }
      } else {
        console.warn('User role not found in login response. Redirecting to default /store.');
        router.push('/store');
      }
    }
  } catch (apiError: any) {
    console.error('API call error during login:', apiError);

    if (axios.isAxiosError(apiError) && apiError.response) {
      if (apiError.response.status === 401) {
        showSnackbar(t('loginPage.invalidCredentials'), 'error');
      } else if (apiError.response.status === 403) {
        // This case might be less common for login directly, but kept for robustness
        showSnackbar(t('loginPage.forbiddenAccess') || apiError.response.data.error, 'error');
      } else if (apiError.response.data && apiError.response.data.message) {
        // Generic message from backend
        showSnackbar(apiError.response.data.message, 'error');
      } else {
        showSnackbar(t('loginPage.unexpectedError'), 'error');
      }
    } else if (apiError.request) {
      // The request was made but no response was received
      showSnackbar(t('loginPage.networkError'), 'error');
    } else {
      // Something else happened in setting up the request
      showSnackbar(t('loginPage.clientError'), 'error');
    }
  } finally {
    loading.value = false;
    stopLoading();
  }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  // Initialize the message with the translated value
  typewriterMessage.value = t('loginPage.welcomeMessage');
  typewriter();

  // Check if already logged in and redirect
  const accessToken = sessionStorage.getItem('access_token');
  if (accessToken) {
    const userRoleFromSession = sessionStorage.getItem('userRole');
    if (userRoleFromSession) {
      // Redirect based on stored role
      switch (userRoleFromSession) {
         case 'Cashier':
          case 'Caissier':
            router.push('/cashier/product');
            break;
          case 'Stock Controller':
          case 'Contrôleur de stock':
            router.push('/stockcontroller/stock');
            break;
          case 'staff':
          case 'Personnel':
            router.push('/dashboard');
            break;
          case 'manager':
            router.push('/store');
            break;
          case 'admin':
            router.push('/admin/dashboard');
            break;
          default:
            console.warn('Unknown role. Redirecting to default /store.');
            router.push('/store');
            break;
      }
    } else {
      // If token exists but role doesn't, maybe redirect to a default or re-fetch user info
      router.push('/store');
    }
  }
});
</script>

<style scoped>
/* Scoped styles for this component */
.backgruond {
  background-image: url(@/assets/login5.jpg) !important;
  height: 100%;
  width: 100%;
  display: block;
  position: absolute;
  top: 0;
  background-size: cover;
  filter: blur(3px); /* Apply blur effect to the background */
}

/* Any additional specific styles */
</style>
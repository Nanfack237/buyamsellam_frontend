<template>
  <v-app>
    <div class="backgruond">
      <div class="logo-and-text-container">
        <v-img src="@/assets/logo1.svg" height="170" width="120" :alt="t('loginPage.logoAlt')" class="logo-img"></v-img>
        <div class="brand-name"><span style="color: rgb(13, 71, 161, 5);">Buyam</span><span style="color: rgba(100, 200, 150, 0.6);">Sellam</span></div>
      </div>
    </div>

    <v-main class="d-flex justify-center align-center">
      <v-row>
        <v-col cols="10" lg="4" md="6" sm="6" class="mx-auto">
          <v-card class="mx-6 pa-4 my-5" elevation="5">
            <div class="text-center">
              <v-avatar size="80" color="blue-lighten-4">
                <v-img src="@/assets/logo1.svg" height="50" width="50" :alt="t('loginPage.logoAlt')" class="mr-1 mb-1 "></v-img>
              </v-avatar>
              <span class="p--text ">
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
import { useI18n } from 'vue-i18n';

// ... (other imports and reactive states remain the same)

// --- Composables and Utilities ---
const router = useRouter();
const { startLoading, stopLoading, isLoading: isGlobalLoading } = useLoader();
const { t } = useI18n();

// --- Reactive State ---
const snackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('');
const snackbarTimeout = 3000;
const loading = ref<boolean>(false);

const passwordShow = ref<boolean>(false);
const email = ref<string>('');
const password = ref<string>('');

const storeStatus = ref<number | null>(null); // storeStatus will hold the status fetched

const text = ref<string>('');
const index = ref<number>(0);
const typewriterMessage = ref<string>(t('loginPage.welcomeMessage'));

// --- Form Validation Rules ---
const emailRules = [  (v: string) => !!v || t('loginPage.emailRequired'),  (v: string) => /.+@.+\..+/.test(v) || t('loginPage.emailValid'),];

const passwordRules = [  (v: string) => !!v || t('loginPage.passwordRequired'),  (v: string) => (v && v.length >= 8) || t('loginPage.passwordMinLength', { count: 8 }),];

const formRef = ref<InstanceType<typeof import('vuetify/components')['VForm']> | null>(null);

// --- Methods ---
function typewriter() {
  const messageToType = typewriterMessage.value;
  const interval = setInterval(() => {
    text.value = messageToType.slice(0, ++index.value);
    if (index.value === messageToType.length) {
      clearInterval(interval);
      setTimeout(erase, 1500);
    }
  }, 100);
}

function erase() {
  const interval = setInterval(() => {
    text.value = text.value.slice(0, --index.value);
    if (index.value === 0) {
      clearInterval(interval);
      typewriterMessage.value = t('loginPage.welcomeMessage');
      setTimeout(typewriter, 1000);
    }
  }, 50);
}

function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

/**
 * Handles clearing session data.
 */
function clearSessionData() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('userRole');
  sessionStorage.removeItem('userId');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('storeId');
  delete axios.defaults.headers.common['Authorization'];
  console.log('Session data cleared due to access restriction.');
}

/**
 * Checks store status for specific roles and redirects, or denies access.
 * Returns true if the user's access is validated and they should proceed (or are redirected),
 * returns false if access is denied and they should remain on the login page.
 */
const checkStoreAccessAndRedirect = async (
  userRole: string,
  userId: string,
  token: string,
  storeId: string | null, // storeId can be null if not fetched
  isInitialLogin: boolean // To differentiate initial login vs. onMounted check
): Promise<boolean> => {
  const restrictedRoles = ['Cashier', 'Caissier', 'Stock Controller', 'Contrôleur de stock', 'staff', 'Personnel'];
  const userRoleLower = userRole.toLowerCase(); // Standardize for checks

  // Fetch store details only if a storeId exists and the role is one that requires checking,
  // or if it's a manager role (as they also manage stores)
  if (storeId && (restrictedRoles.includes(userRole) || userRoleLower === 'manager')) {
    try {
      const response = await axios.get(`/api/stores/showstore/${storeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      storeStatus.value = response.data.store?.status ?? null;

      if (storeStatus.value === 0) {
        showSnackbar(t('loginPage.storeAccess'), 'error'); // This message will show
        clearSessionData();
        if (!isInitialLogin) { // If it's onMounted redirect, we force to login page
          router.push('/login');
        }
        return false; // Access denied
      } else if (storeStatus.value === null) {
        console.warn(`Store status not found for store ID: ${storeId}`);
        showSnackbar(t('loginPage.couldNotVerifyStore'), 'warning');
        clearSessionData();
        if (!isInitialLogin) {
          router.push('/login');
        }
        return false; // Access denied if status is ambiguous
      }
      // If storeStatus.value is 1, it means access is granted, proceed to redirection below
    } catch (error) {
      console.error('Error fetching store details for store ID:', storeId, error);
      showSnackbar(t('loginPage.fetchDataError'), 'error');
      clearSessionData();
      if (!isInitialLogin) {
        router.push('/login');
      }
      return false; // Error occurred, deny access
    }
  }
  // If no storeId, but user is in restrictedRoles, they can't proceed.
  // This case might be hit if employee showstore didn't return a storeId.
  else if (!storeId && restrictedRoles.includes(userRole)) {
      showSnackbar(t('loginPage.noStoreAssociated'), 'error'); // A new translation key
      clearSessionData();
      if (!isInitialLogin) {
          router.push('/login');
      }
      return false; // Deny if storeId is mandatory for their role but missing
  }


  // If we reach here, either the role doesn't require a store check,
  // or the store status check passed (status === 1)
  switch (userRoleLower) {
    case 'cashier':
    case 'caissier':
      router.push('/cashier/product');
      break;
    case 'stock controller':
    case 'contrôleur de stock':
      router.push('/stockcontroller/stock');
      break;
    case 'staff':
    case 'personnel':
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
  return true; // Redirection will happen
};


/**
 * Handles the login form submission.
 */
const SubmitLogin = async () => {
  if (!formRef.value) {
    console.error('Form reference is null.');
    showSnackbar(t('loginPage.formError'), 'error');
    return;
  }

  const { valid } = await formRef.value.validate();

  if (!valid) {
    return;
  }

  startLoading();
  

  try {
    const response = await axios.post('/api/auth/login', {
      email: email.value,
      password: password.value,
    });

    if (response.data.error) {
      console.error('Login failed:', response.data.error);
      showSnackbar(response.data.error, 'error');
    } else {
      const token = response.data.token;
      const user = response.data.user;

      sessionStorage.setItem('access_token', token);
      sessionStorage.setItem('userRole', user.role);
      sessionStorage.setItem('userId', user.id);
      sessionStorage.setItem('userEmail', user.email);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      let currentStoreId = null;
      if (user && user.id) {
        try {
          const employeeResponse = await axios.get('/api/employees/showstore', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (employeeResponse.data.employee && employeeResponse.data.employee.length > 0 && employeeResponse.data.employee[0].store_id) {
            currentStoreId = employeeResponse.data.employee[0].store_id.toString();
            sessionStorage.setItem('storeId', currentStoreId);
            console.log(`Store ID ${currentStoreId} fetched and stored for user ${user.id}.`);
          } else {
            console.warn(`No store_id found for user ${user.id} in employee data.`);
            // If storeId is critical for their role, checkStoreAccessAndRedirect will handle denial.
          }
        } catch (employeeError: any) {
          console.error('Error fetching user details for user:', user.id, employeeError);
          showSnackbar(t('loginPage.fetchDataError'), 'error');
          clearSessionData();
          return;
        }
      }

      // Perform the store access check and redirection.
      // Show "Login successful" ONLY if this call allows access/redirects.
      const canProceed = await checkStoreAccessAndRedirect(
        user.role, user.id.toString(), token, currentStoreId, true
      );

      if (canProceed) {
        showSnackbar(t('loginPage.loginSuccess'), 'success'); // Show success message now
      }
      // If canProceed is false, checkStoreAccessAndRedirect already showed the 'storeAccess' snackbar
    }
  } catch (apiError: any) {
    console.error('API call error during login:', apiError);

    if (axios.isAxiosError(apiError) && apiError.response) {
      if (apiError.response.status === 401) {
        showSnackbar(t('loginPage.invalidCredentials'), 'error');
      } else if (apiError.response.status === 403) {
        showSnackbar(t('loginPage.forbiddenAccess') || apiError.response.data.error, 'error');
      } else if (apiError.response.data && apiError.response.data.message) {
        showSnackbar(apiError.response.data.message, 'error');
      } else {
        showSnackbar(t('loginPage.unexpectedError'), 'error');
      }
    } else if (apiError.request) {
      showSnackbar(t('loginPage.networkError'), 'error');
    } else {
      showSnackbar(t('loginPage.clientError'), 'error');
    }
  } finally {
    stopLoading();
    
  }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  typewriterMessage.value = t('loginPage.welcomeMessage');
  typewriter();

  const accessToken = sessionStorage.getItem('access_token');

  if (accessToken) {
    const userRoleFromSession = sessionStorage.getItem('userRole');
    const userIdFromSession = sessionStorage.getItem('userId');
    const storeIdFromSession = sessionStorage.getItem('storeId');

    if (userRoleFromSession && userIdFromSession && storeIdFromSession) {
      // Use the common function for onMounted check
      await checkStoreAccessAndRedirect(
        userRoleFromSession,
        userIdFromSession,
        accessToken,
        storeIdFromSession,
        false
      );
    } else {
      // If token exists but crucial info like role/ID/storeId is missing in session,
      // it's an incomplete state. Clear session and force re-login.
      console.warn('Incomplete session data. Clearing and redirecting to login.');
      clearSessionData();
      router.push('/login');
    }
  }
});
</script>

<style scoped>
.backgruond {
  background-image: url(@/assets/loginBanner.jpg) !important;
  height: 50%;
  width: 100%;
  position: absolute;
  top: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-and-text-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 15%;
}

.logo-img {
  height: 170px;
  width: 120px;
  margin-right: 20px;
}

.brand-name {
  color: white;
  font-size: 50px;
  font-weight: bold;
  white-space: nowrap;
}

/* Specific rule for small screens in landscape mode */
@media (max-height: 430px) and (orientation: landscape) {
  .logo-and-text-container {
    display: none; /* Hide the entire container including logo and brand name */
  }
  /* Optional: You might want to adjust the v-main or v-card's top margin
     or padding in this scenario if the login card needs to shift up.
     For example: */
  /*
  .v-main {
    padding-top: 0 !important;
    align-items: flex-start !important; // Align content to top
  }
  .v-card {
    margin-top: 20px !important; // Adjust card position
  }
  */
}


/* Extra Small screens (e.g., most mobile phones in portrait) */
@media (min-width: 100px) and (max-width: 480px) {
  .logo-and-text-container {
    gap: 0;
    margin-bottom: 50%;
  }

  .logo-img {
    display: none;
  }

  .brand-name {
    font-size: 42px;
  }
}

/* Smaller tablets / larger phones in portrait or landscape */
@media (min-width: 481px) and (max-width: 724px) {
  .logo-and-text-container {
    gap: 10px;
    margin-bottom: 35%;
  }

  .logo-img {
    height: 120px;
    width: 90px;
    margin-right: 15px;
  }
  .brand-name {
    font-size: 40px; /* Added brand-name font size for this range */
  }
}

/* Medium tablets in portrait or landscape */
@media (min-width: 725px) and (max-width: 1000px) {
  .logo-and-text-container {
    gap: 10px;
    margin-bottom: 28%;
  }

  .logo-img {
    height: 120px;
    width: 90px;
    margin-right: 15px;
  }
  .brand-name {
    font-size: 45px; /* Added brand-name font size for this range */
  }
}

/* Larger tablets / small laptops */
@media (min-width: 1001px) and (max-width: 1333px) {
  .logo-and-text-container {
    gap: 10px;
    margin-bottom: 20%;
  }

  .logo-img {
    height: 120px;
    width: 90px;
    margin-right: 15px;
  }
  .brand-name {
    font-size: 50px; /* Keeping default for this range */
  }
}

/* Medium desktops */
@media (min-width: 1334px) and (max-width: 1669px) {
  .logo-and-text-container {
    gap: 10px;
    margin-bottom: 18%;
  }

  .logo-img {
    height: 120px;
    width: 90px;
    margin-right: 15px;
  }
  .brand-name {
    font-size: 50px; /* Keeping default for this range */
  }
}

/* Large desktops (just below full HD) */
@media (min-width: 1670px) and (max-width: 1919px) {
  .logo-and-text-container {
    gap: 10px;
    margin-bottom: 15%;
  }

  .logo-img {
    height: 120px;
    width: 90px;
    margin-right: 15px;
  }
  .brand-name {
    font-size: 50px; /* Keeping default for this range */
  }
}


/* Extra Large screens (from 1920px up to 2560px) */
@media (min-width: 1920px) and (max-width: 2560px) {
  .logo-and-text-container {
    margin-bottom: 15%;
  }
  .logo-img {
    height: 200px;
    width: 150px;
    margin-right: 25px;
  }
  .brand-name {
    font-size: 60px; /* Set brand-name font size for this range */
  }
}

/* Ultra Large screens (larger than 2560px) */
@media (min-width: 2561px) {
  .logo-and-text-container {
    margin-bottom: 10%;
  }
  .logo-img {
    height: 250px;
    width: 180px;
    margin-right: 30px;
  }
  .brand-name {
    font-size: 75px;
  }
}
</style>
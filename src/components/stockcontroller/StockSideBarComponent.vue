<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click="() => { if (rail) rail = false }"
    color="blue-darken-4"
    style="max-width: 100%;"
  >
    <v-list-item
      class="py-3"
      style="padding-bottom: 0px;"
      :prepend-avatar="userProfileImage || defaultAvatar" 
      :title="userEmail || userName"
      height="60"
      nav
    >
      <template v-slot:append>
        <!-- This button correctly toggles the rail mode (collapse/expand) -->
        <v-btn icon="mdi-chevron-left mdi-icon" variant="text" @click.stop="toggleRail" />
      </template>
      <template v-slot:subtitle>
        <p v-if="hasStoreId" class="text-medium-emphasis text-truncate" >
          <v-icon size="40" color='success' class="p">mdi-circle-small</v-icon>
          <span style="color: #90CAF9;">{{ storeName }}</span>
        </p>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list nav>
      <!-- Stock Controller Specific Navigation -->
      <v-list-item link to="/stockcontroller/stock" prepend-icon="mdi-shopping mdi-icon" :title="$t('stock')"></v-list-item>
      <v-list-item link to="/stockcontroller/purchase" prepend-icon="mdi-cart-check mdi-icon" :title="$t('purchaseTransactions')"></v-list-item>     
      <v-list-item link to="/stockcontroller/supplier" prepend-icon="mdi-truck mdi-icon" :title="$t('supplier')"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader();
const router = useRouter();
const { t } = useI18n(); // Initialize t for translations

// --- Reactive State ---
const drawer = ref(true);
const rail = ref(false);
const userEmail = ref('');
const userName = ref('');
const userProfileImagePath = ref(null);
const storeName = ref('');
const hasStoreId = ref(false);
const userRole = ref(''); // Reactive ref for user role

const backendUrl = 'http://localhost:8000'; // MAKE SURE THIS MATCHES YOUR LARAVEL APP_URL OR ASSET_URL

// --- Computed Properties ---
const userProfileImage = computed(() => {
  if (userProfileImagePath.value) {
    if (userProfileImagePath.value.startsWith('http://') || userProfileImagePath.value.startsWith('https://') || userProfileImagePath.value.startsWith('//')) {
      return userProfileImagePath.value;
    }
    return `${backendUrl}/storage/${userProfileImagePath.value}`;
  }
  return null;
});

const defaultAvatar = 'https://via.placeholder.com/150/0D47A1/FFFFFF?text=USER';

// Computed property to check if the user is a staff member (though not used in this specific template, good to keep)
const isStaff = computed(() => userRole.value === 'staff' || userRole.value === 'Personnel');

const shortageProducts = ref([]); // Initialize as an empty array

// --- Methods ---
const toggleRail = () => {
  rail.value = !rail.value;
};

const fetchShortages = async () => {
  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found for fetching shortages.');
      return;
    }
    const res = await axios.get('/api/stocks/shortage', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    shortageProducts.value = res.data.shortage;
  } catch (e) {
    console.error('Failed to fetch shortages:', e);
  }
};

// --- Lifecycle Hooks ---
onMounted(async () => {
  startLoading();

  try {
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      console.warn('No access token found. User not logged in.');
      router.push('/login');
      return;
    }

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Fetch User Data including profile image path and role
    const userResponse = await axios.get('/api/me');
    if (userResponse.data && userResponse.data.user) {
      userEmail.value = userResponse.data.user.email || '';
      userName.value = userResponse.data.user.name || '';
      userProfileImagePath.value = userResponse.data.user.image || null;
      userRole.value = userResponse.data.user.role || ''; // Assigned user role
      console.log('User data fetched. User role:', userRole.value);
    } else {
      console.warn('User data not found in /api/me response.');
    }

    const storeId = sessionStorage.getItem('storeId');

    if (storeId) {
      hasStoreId.value = true;
      console.log(`Attempting to fetch store details for store ID: ${storeId}`);
      try {
        const storeResponse = await axios.get(`/api/stores/showstore/${storeId}`);

        if (storeResponse.data && storeResponse.data.store && storeResponse.data.store.name) {
          storeName.value = storeResponse.data.store.name;
          console.log(`Store name fetched: ${storeName.value}`);
        } else {
          console.warn('Store name not found in /api/stores/showstore response:', storeResponse.data);
        }
      } catch (storeError) {
        console.error('Error fetching store details:', storeError);
        storeName.value = 'Error Loading Store';
      }
    } else {
      console.warn('storeId not found in sessionStorage. Cannot display store name.');
      storeName.value = 'No Store Assigned';
      hasStoreId.value = false;
    }

  } catch (error) {
    console.error('General error in SideBarComponent onMounted:', error);
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      console.warn('Authentication failed during /api/me. Redirecting to login.');
      router.push('/login');
    }
  } finally {
    stopLoading();
  }

  // Call fetchShortages onMounted as well (ensure it runs after auth token is set)
  fetchShortages();
});
</script>

<style scoped>
.mdi-icon {
  color: white;
}

.truncate-text {
  max-width: 150px;
  display: inline-block;
  vertical-align: middle;
}
</style>

<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click.stop="toggleRail"
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
        <v-btn icon="mdi-chevron-left mdi-icon" variant="text" @click.stop="toggleRail" />
      </template>
      <template v-slot:subtitle>
        <p v-if="hasStoreId" class="text-medium-emphasis text-truncate" >
          <v-icon size="40" color='success' class="p">mdi-circle-small</v-icon>
          <span  style="color: #90CAF9;">{{ storeName }}</span>
        </p>
      </template>
    </v-list-item>

    <v-divider></v-divider>

    <v-list nav>
      <v-list-item link to="/cashier/product" prepend-icon="mdi-shopping mdi-icon" :title="$t('product')"></v-list-item>
      <v-list-item link to="/cashier/sale" prepend-icon="mdi-cart mdi-icon" :title="$t('saleTransactions')"></v-list-item>
      <v-list-item link to="/cashier/check-receipt" prepend-icon="mdi-receipt-text-outline mdi-icon" :title="$t('checkReceipt')"></v-list-item>
      <v-list-item link to="/cashier/customer" prepend-icon="mdi-account-box" :title="$t('customer')"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; // Add 'computed'
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useRouter } from 'vue-router'; // Correct import for useRouter
import { useI18n } from 'vue-i18n'; // Import useI18n for translations

const { startLoading, stopLoading} = useLoader();
const { t } = useI18n(); // Destructure t for use in script if needed, or rely on $t in template


const drawer = ref(true);
const rail = ref(false);
const userEmail = ref('');
const userName = ref('');
const userProfileImagePath = ref(null); // New reactive ref for the image path
const storeName = ref('');
const hasStoreId = ref(false);

// Backend base URL (adjust if different from your store image backendUrl)
const backendUrl = 'http://localhost:8000'; // **MAKE SURE THIS MATCHES YOUR LARAVEL APP_URL OR ASSET_URL**

// Computed property to construct the full image URL
const userProfileImage = computed(() => {
  if (userProfileImagePath.value) {
    // Check if the path is already a full URL (e.g., from an external source or already processed)
    if (userProfileImagePath.value.startsWith('http://') || userProfileImagePath.value.startsWith('https://') || userProfileImagePath.value.startsWith('//')) {
      return userProfileImagePath.value;
    }
    // Assume it's a relative path to your Laravel storage
    return `${backendUrl}/storage/${userProfileImagePath.value}`;
  }
  return null; // Return null if no path is set
});

// Fallback avatar if no user image is available
const defaultAvatar = 'https://via.placeholder.com/150/0D47A1/FFFFFF?text=USER'; // A generic placeholder avatar

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

    // Fetch User Data including profile image path
    const userResponse = await axios.get('/api/me');
    if (userResponse.data && userResponse.data.user) {
      userEmail.value = userResponse.data.user.email || '';
      userName.value = userResponse.data.user.name || '';
      // Assign the profile image path
      userProfileImagePath.value = userResponse.data.user.image || null; // Assuming 'profile_image' field
      console.log('User data fetched. Profile image path:', userProfileImagePath.value);
    } else {
      console.warn('User data not found in /api/me response.');
    }

    // Get storeId from sessionStorage
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
          storeName.value = 'Store Not Found';
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
    if (error.response && error.response.status === 401) {
      console.warn('Authentication failed during /api/me. Redirecting to login.');
      router.push('/login');
    }
  } finally {
    stopLoading();
  }
});

const toggleRail = () => {
  rail.value = !rail.value;
};
</script>

<style scoped>
.mdi-icon {
  color: white;
}
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  display: inline-block;
  vertical-align: middle;
}
</style>
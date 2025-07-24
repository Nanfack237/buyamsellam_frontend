<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { startLoading, stopLoading } = useLoader();
const { t } = useI18n();

const drawer = ref(true);
const rail = ref(false);
const userEmail = ref('');
const userName = ref('');
const userProfileImagePath = ref(null);
const storeName = ref('');
const hasStoreId = ref(false);
const userRole = ref(''); // New reactive ref for user role

const backendUrl = 'http://localhost:8000'; // MAKE SURE THIS MATCHES YOUR LARAVEL APP_URL OR ASSET_URL

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

// Computed property to check if the user is a staff member
const isStaff = computed(() => userRole.value === 'staff' || userRole.value === 'Personnel');

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
      userRole.value = userResponse.data.user.role || ''; // **Assigned user role**
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
});


const toggleRail = () => {
  rail.value = !rail.value;
};

const shortageProducts = ref([])
const fetchShortages = async () => {
  try {
    const token = sessionStorage.getItem('access_token'); // Ensure token is present for this call too
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
}

// Call fetchShortages onMounted as well
onMounted(() => {
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

<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    permanent
    @click.stop="toggleRail"
    color="blue-darken-4"
    style="max-width: 100%; "
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
      <template v-if="hasStoreId">
        <v-list-item link to="/dashboard" prepend-icon="mdi-view-dashboard mdi-icon" :title="$t('dashboard')" value="home"></v-list-item>
        <v-list-item link to="/stock" prepend-icon="mdi-archive" :title="$t('stock')" value="stock">
          <template v-slot:append>
            <v-badge
              v-if="shortageProducts.length > 0"
              color="red"
              :content="shortageProducts.length"
              inline
            />
          </template>
        </v-list-item>

        <v-list-group prepend-icon="mdi-shopping">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :title="$t('product')" value="product"></v-list-item>
          </template>
          <v-list-item link to="/product" prepend-icon="mdi-view-list mdi-icon" :title="$t('listOfProducts')"></v-list-item>
          <v-list-item link to="/add-product" prepend-icon="mdi-plus-circle mdi-icon" :title="$t('addProduct')"></v-list-item>
        </v-list-group>

        <v-list-group prepend-icon="mdi-cart-check">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :title="$t('purchase')" value="purchase"></v-list-item>
          </template>
          <v-list-item link to="/purchase" prepend-icon="mdi-view-list mdi-icon" :title="$t('purchaseTransactions')"></v-list-item>
          <v-list-item link to="/add-purchase" prepend-icon="mdi-plus-circle mdi-icon" :title="$t('doAPurchase')"></v-list-item>
        </v-list-group>

        <v-list-group prepend-icon="mdi-cart" value="sale">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" :title="$t('sale')"></v-list-item>
          </template>
          <v-list-item link to="/sale" prepend-icon="mdi-view-list mdi-icon" :title="$t('saleTransactions')"></v-list-item>
          <v-list-item link to="/add-sale" prepend-icon="mdi-plus-circle mdi-icon" :title="$t('doASale')"></v-list-item>
          <v-list-item link to="/check-receipt" prepend-icon="mdi-receipt-text-outline mdi-icon" :title="$t('checkReceipt')"></v-list-item>
        </v-list-group>

        <template v-if="!isStaff">
          <v-list-group prepend-icon="mdi-account-tie mdi-icon">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" :title="$t('employee')" value="employee"></v-list-item>
            </template>
            <v-list-item link to="/employee" prepend-icon="mdi-view-list mdi-icon" :title="$t('listOfEmployees')"></v-list-item>
            <v-list-item link to="/add-employee" prepend-icon="mdi-plus-circle mdi-icon" :title="$t('addEmployee')"></v-list-item>
          </v-list-group>
        </template>

        <v-list-item link to="/supplier" prepend-icon="mdi-truck mdi-icon" :title="$t('supplier')"></v-list-item>
        <v-list-item link to="/customer" prepend-icon="mdi-account-box" :title="$t('customer')"></v-list-item>
        <v-list-item link to="/statistics" prepend-icon="mdi-chart-box mdi-icon" :title="$t('statistics')"></v-list-item>
       
        <template v-if="!isStaff">
          <v-list-item link to="/settings" prepend-icon="mdi-cog mdi-icon" :title="$t('sidebarStoreSettings')"></v-list-item>
        </template>

      </template>

      <template v-else>
        <v-list-group prepend-icon="mdi-store mdi-icon">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" link to="/store" :title="$t('store')" value="store"></v-list-item>
          </template>
          <v-list-item link to="/create-store" prepend-icon="mdi-plus-circle mdi-icon" :title="$t('createAStore')"></v-list-item>
        </v-list-group>
        <v-list-item link to="/GeneralSettings" prepend-icon="mdi-cog mdi-icon" :title="$t('generalSettings')" value="General Settings"></v-list-item>
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
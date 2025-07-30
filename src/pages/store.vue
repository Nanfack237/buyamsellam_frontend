<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />
        <v-main class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-5 pb-2">
            <v-col cols="auto" class="">
              <p class="text-high-emphasis text-h6">
                {{ t('storesPage.title') }}
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-overlay :model-value="loading" class="align-center justify-center" persistent>
            <v-progress-circular color="primary" indeterminate size="65"></v-progress-circular>
            <p class="my-1 text-h6 text-white">{{ t('storesPage.loading') }}</p>
          </v-overlay>

          <div v-if="!loading">
            <template v-if="stores.length === 0">
              <v-row class="justify-center align-center px-4 py-5" style="margin-top: 13%;margin-bottom: 13%;">
                <v-col cols="12" class="">
                  <p class="text-medium-emphasis text-center">
                    {{ t('storesPage.noStoresMessage') }}
                  </p>
                </v-col>

                <v-col cols="12" class="text-center pt-4">
                  <v-btn color="blue-darken-4" to="/create-store">{{ t('storesPage.createStoreButton') }}&nbsp;&nbsp;<v-icon>mdi-store-plus</v-icon></v-btn>
                </v-col>
              </v-row>
            </template>

            <template v-else>
              <v-row class="d-flex px-5 pt-2">
                <v-col cols="12" sm="8" md="9">
                  <p class="text-medium-emphasis">
                    {{ t('storesPage.selectStorePrompt') }}
                  </p>
                </v-col>
                <v-col cols="12" md="3" sm="4">
                  <v-text-field
                    v-model="search"
                    density="compact"
                    :label="t('storesPage.searchLabel')"
                    prepend-inner-icon="mdi-store-search"
                    variant="solo-filled"
                    clearable
                    flat
                    hide-details
                    single-line
                  />
                </v-col>
              </v-row>

              <template v-if="filteredStores.length === 0 && search">
                <v-row class="justify-center align-center px-4 py-5" style="margin-top: 13%;margin-bottom: 13%;">
                  <v-col cols="12" class="text-center">
                    <v-icon size="64" color="grey-lighten-1">mdi-store-off</v-icon>
                    <p class="text-medium-emphasis text-h6 mt-2">
                      {{ t('storesPage.noSearchResult', { search: search }) }}
                    </p>
                    <p class="text-medium-emphasis mt-1">
                      {{ t('storesPage.adjustSearchHint') }}
                    </p>
                  </v-col>
                </v-row>
              </template>

              <v-row v-else class="justify-center align-center px-4 py-1">
                <v-col class="py-2 mx-2 my-2" cols="12" sm="6" md="4" lg="4" v-for="(store, index) in filteredStores" :key="index">
                  <v-card
                    elevation="5"
                    class="mx-auto"
                    hover
                    @click="handleStoreSelection(store)"
                    min-width="100"
                    :class="{'opacity-50': store.status === 0}"
                  >
                    <v-carousel
                      v-if="store.image1 || store.image2"
                      hide-delimiters
                      height="350"
                      show-arrows="hover"
                      :cycle="true"
                      :interval="5000"
                      class="rounded-t-lg"
                    >
                      <v-carousel-item v-if="store.image1">
                        <v-img height="350" :src="getImageUrl(store.image1)" cover>
                          <v-card-title class="text-white align-end text-shadow"><span style="color: #0D47A1">{{ store.name }}</span></v-card-title>
                        </v-img>
                      </v-carousel-item>

                      <v-carousel-item v-if="store.image2">
                        <v-img height="350" :src="getImageUrl(store.image2)" cover>
                          <v-card-title class="text-white align-end text-shadow"><span style="color: #0D47A1">{{ store.name }}</span></v-card-title>
                        </v-img>
                      </v-carousel-item>
                      <v-carousel-item v-else>
                        <v-img height="350" src="https://via.placeholder.com/150?text=No+Image" cover>
                          <v-card-title class="text-white align-end text-shadow"><span style="color: #0D47A1">{{ store.name }}</span></v-card-title>
                        </v-img>
                      </v-carousel-item>
                    </v-carousel>

                    <v-img
                      v-else
                      class="align-end"
                      height="150"
                      src="https://via.placeholder.com/150?text=No+Image"
                      cover
                    >
                      <v-card-title class="text-white align-end text-shadow"><span style="color: #0D47A1">{{ store.name }}</span></v-card-title>
                    </v-img>

                    <div class="store-details-section">
                      <v-card-text>
                          <b style="color: #0D47A1;">{{ t('storesPage.categoryLabel') }}:</b> {{ store.category }}
                        <div><b style="color: #0D47A1;">{{ t('storesPage.contactLabel') }}:</b>&nbsp;&nbsp;{{ store.contact }}</div>
                        <div><b style="color: #0D47A1;">{{ t('storesPage.locationLabel') }}:</b>&nbsp;&nbsp;{{ store.location }}</div>
                        <div>{{ store.description }}</div>
                      </v-card-text>

                      <v-card-actions class="justify-end">
                        <v-chip v-if="store.status === 0" color="red" class="ma-2" label>
                          {{ t('storesPage.inactiveStatus') }}
                        </v-chip>
                        <v-chip v-else color="success" class="ma-2" label>
                          {{ t('storesPage.activeStatus') }}
                        </v-chip>
                      </v-card-actions>
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </template>
          </div>
          <AppFooter />
        </v-main>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import { useI18n } from 'vue-i18n';

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader(); // Assuming useLoader provides these
const router = useRouter();
const { t, locale } = useI18n(); // Destructure t and locale from useI18n

// --- Reactive State ---
const stores = ref<any[]>([]);
const search = ref<string>('');
const selectedStore = ref<any | null>(null);
const loading = ref<boolean>(true); // Local loading state for the entire page

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  // Use the current locale for date formatting
  return date.toLocaleDateString(locale.value, options);
});

const filteredStores = computed<any[]>(() => {
  const searchTerm = search.value?.toLowerCase().trim() || ''; // Trim whitespace
  if (!searchTerm) {
    return stores.value; // If search term is empty, return all stores
  }
  return stores.value.filter(store => {
    return store.name && store.name.toLowerCase().includes(searchTerm);
  });
});

// --- Lifecycle Hook ---
onMounted(async () => {
  loading.value = true;
  startLoading(); // Activate global loader if needed, though this component has its own overlay
  try {
    const response = await axios.get('/api/stores');
    stores.value = response.data.stores;

    const storedId = sessionStorage.getItem('storeId');
    if (storedId) {
      selectedStore.value = stores.value.find(store => store.id == storedId);
    }
  } catch (error) {
    console.error('Error fetching stores:', error);
    // You might want to display a user-friendly error here using a snackbar
  } finally {
    loading.value = false;
    stopLoading(); // Deactivate global loader
  }
});

// --- Methods ---
const backendUrl = 'https://api.buyam-sellam.oc-classic.com'; // Ensure this is correct for your backend

const getImageUrl = (path: string): string => {
  if (!path) return 'https://via.placeholder.com/150?text=No+Image'; // Fallback if path is null/empty
  // Check if the path is already a full URL (e.g., from an external source or already processed)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  return `${backendUrl}/storage/${path}`;
};

const handleStoreSelection = async (store: any) => {
  startLoading(); // Activate global loader
  try {
    if (store.status === 0) {
      // If store is inactive, prevent selection and show a message
      // You might want to show a snackbar here instead of just navigating
      // showSnackbar(t('storesPage.inactiveStoreMessage'), 'warning');
      router.push('/store'); // Or stay on the same page, or redirect to a specific inactive store page
    } else {
      sessionStorage.setItem('storeId', store.id);
      axios.defaults.headers.common['X-Store-ID'] = store.id; // Set header for subsequent requests
      router.push('/dashboard'); // Navigate to the dashboard for the selected store
    }
  } catch (error) {
    console.error('Error handling store selection:', error);
    // showSnackbar(t('storesPage.selectionErrorMessage'), 'error');
  } finally {
    stopLoading(); // Deactivate global loader
  }
};
</script>

<style scoped>
.opacity-50 {
  opacity: 0.5;
  cursor: not-allowed;
}

.text-shadow {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.store-details-section {
  background-color: #f9f9f9;
  padding-bottom: 8px;
  border-bottom-left-radius: inherit;
  border-bottom-right-radius: inherit;
}

.store-details-section .v-card-subtitle {
  padding-top: 16px;
}
</style>
<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center py-5 px-5 pb-2">
            <v-col cols="auto" class="">
              <p class="text-high-emphasis text-h6 " style="color: #0D47A1;">
                {{ $t('adminDashboard.dashboardTitle') }} </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-row class="d-flex justify-center align-center px-4 py-3" style="height: max-content;">
            <v-col cols="12" md="3">
              <v-card elevation="3" hover @click="goToUsers">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="blue-darken-4" size="40" icon="mdi-account-group"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8">
                      <v-card-sub-title class="text-disabled">{{ $t('adminDashboard.cards.numberOfUsers') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalUsers || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('adminDashboard.moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover @click="goToUsers">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="rgba(100, 200, 150, 0.6)" size="40" icon="mdi-account-badge"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8" style="color:">
                      <v-card-sub-title class="text-disabled">{{ $t('adminDashboard.cards.numberOfActiveUsers') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalActiveUsers || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('adminDashboard.moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover @click="goToStores">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="orange" size="40" icon="mdi-home-group"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8">
                      <v-card-sub-title class="text-disabled">{{ $t('adminDashboard.cards.numberOfStores') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalStores || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('adminDashboard.moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover @click="goToStores">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="green-darken-2" size="40" icon="mdi-store-check-outline"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8" style="color:">
                      <v-card-sub-title class="text-disabled">{{ $t('adminDashboard.cards.numberOfActiveStores') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalActiveStores || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('adminDashboard.moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>

          <v-row cols="12" class="px-7 py-2">
            <v-card elevation="4" width="3000">
              <v-card-item>
                <p class="font-weight-medium py-2">
                  {{ $t('adminDashboard.sections.analysisOfTheWeek') }}
                </p>
                <v-divider class="border-opacity-100 pb-2" color="grey-lighten-1"></v-divider>
                <v-row>
                  <v-col cols="12" md="6">
                    <center>
                      <ChartByUsersPerWeek />
                    </center>
                  </v-col>
                  <v-col cols="12" md="6">
                    <center>
                      <ChartByStoresPerWeek />
                    </center>
                  </v-col>
                </v-row>
              </v-card-item>
            </v-card>
          </v-row>

          <v-row cols="12" class="px-4 py-2 my-4" align="stretch" style="height: max-content;"> 
            <v-col cols="12" md="6" sm="12" class="py-3 mb-0 d-flex" > 
              <v-card elevation="4" class="flex-grow-1 " > 
                <v-card-item >
                  <p class="font-weight-medium py-2 my-0">
                    {{ $t('adminDashboard.sections.weeklyActiveUsers') }}
                  </p>
                  <v-divider class="border-opacity-100 pb-3" color="grey-lighten-1"></v-divider>
                  <center>
                    <ChartByActiveUsersPerWeek />
                  </center>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" sm="6" class="d-flex"> 
              <v-card elevation="4" class="flex-grow-1"> 
                <v-card-item >
                  <p class="font-weight-medium py-2">
                    {{ $t('adminDashboard.sections.topUsers') }}
                  </p>
                  <v-divider class="border-opacity-100 pb-2" color="grey-lighten-1"></v-divider>
                  <v-data-table :items="topUsers" :headers="topUsersHeaders" class="centered-headers py-3"
                    hide-default-footer>
                  </v-data-table>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" sm="6" class="d-flex"> 
              <v-card elevation="4" class="flex-grow-1" > 
                <v-card-item >
                  <p class="font-weight-medium py-2">
                    {{ $t('adminDashboard.sections.topStores') }}
                  </p>
                  <v-divider class="border-opacity-100 pb-2" color="grey-lighten-1"></v-divider>
                  <v-data-table :items="topStoresTableData" :headers="topStoresHeader" class="centered-headers py-3"
                    hide-default-footer>
                  </v-data-table>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>

          <AppFooter />
        </v-main>

        <v-overlay :model-value="!isDataLoaded" class="align-center justify-center" persistent>
          <v-progress-circular color="primary" size="65" indeterminate></v-progress-circular>
          <p class="my-1 text-h6 text-white">{{ $t('adminDashboard.loading') }}</p> </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useI18n } from 'vue-i18n';
import SideBarComponent from '@/components/admin/AdminSideBarComponent.vue';
import HeaderComponent from '@/components/admin/AdminHeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';

// Import chart components
import ChartByStoresPerWeek from '@/components/admin/ChartByStoresPerWeek.vue';
import ChartByUsersPerWeek from '@/components/admin/ChartByUsersPerWeek.vue';
import ChartByActiveUsersPerWeek from '@/components/admin/ChartByActiveUsersPerWeek.vue';

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader();
const { t, locale } = useI18n();

const router = useRouter();

// --- Reactive State ---
const totalUsers = ref<number | null>(null);
const totalStores = ref<number | null>(null);
const totalActiveUsers = ref<number | null>(null);
const totalActiveStores = ref<number | null>(null);
const topUsers = ref<any[]>([]);
const topStores = ref<any[]>([]);
const isDataLoaded = ref(false);

const snackbar = ref<boolean>(false);
const snackbarMessage = ref<string>('');
const snackbarColor = ref<string>('');
const snackbarTimeout = 3000;

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date();

  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);

  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const isoWeekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

  const startOfWeek = new Date(date.valueOf());
  startOfWeek.setDate(date.getDate() - dayNr);

  const endOfWeek = new Date(startOfWeek.valueOf());
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const currentLocale = locale.value;
  const formattedStartDate = startOfWeek.toLocaleDateString(currentLocale, options);
  const formattedEndDate = endOfWeek.toLocaleDateString(currentLocale, options);
  const currentYear = date.getFullYear();

  return t('adminDashboard.weekSummary', {
    week: isoWeekNumber,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    year: currentYear
  });
});

// Headers for top users table
const topUsersHeaders = computed(() => ([
  { title: t('adminDashboard.tableHeaders.email'), value: 'email', align: 'center' },
  { title: t('adminDashboard.tableHeaders.storeLimit'), value: 'store_limit', align: 'center' },
]));

// Headers for top stores table
const topStoresHeader = computed(() => ([
  { title: t('adminDashboard.tableHeaders.name'), value: 'name', align: 'center' },
  { title: t('adminDashboard.tableHeaders.totalSales'), value: 'total_sales', align: 'center' },
]));

// Data for top stores table (ensure it's an array for v-data-table)
const topStoresTableData = computed(() => {
  return topStores.value;
});

// --- Utility Functions ---
function showSnackbar(message: string, color: string) {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  snackbar.value = true;
}

// --- Navigation Methods ---
function goToUsers() {
  router.push('/admin/users');
}

function goToStores() {
  router.push('/admin/stores');
}

function goToSalePage() {
  router.push('/admin/sale');
}
// --- Methods ---

async function fetchUsers() {
    try {
        const token = sessionStorage.getItem('access_token');
        if (!token) {
            showSnackbar(t('userVue.authentication_missing'), 'error');
            router.push('/login');
            return;
        }
        const response = await axios.get('/api/admin/userlist', {
            headers: {
            'Authorization': `Bearer ${token}`,
            }
        });
        totalUsers.value = response.data.users.length;
    } catch (error: any) {
        console.error('Error fetching users:', error);
        showSnackbar(t('userVue.failed_to_load_users'), 'error');
    }

}

async function fetchStores() {
    try {
    const res = await axios.get('/api/admin/storelist');
    totalStores.value = res.data.stores.length;

    } catch (error) {
    console.error('Error fetching stores:', error);
    }

}

async function fetchActiveUsers() {
    try {
    const res = await axios.get('/api/admin/activeusers');
    totalActiveUsers.value = res.data.users.length;
    } catch (error) {
    console.error('Error fetching active users:', error);
    }

}

async function fetchActiveStores() {
 try {
    const res = await axios.get('/api/admin/activestores');
    totalActiveStores.value = res.data.stores.length;
    } catch (error) {
     console.error('Error fetching active stores:', error);
    }
}

async function fetchTopUsers() {
    try {
        const res = await axios.get('/api/admin/topusers');
        topUsers.value = res.data.topUsers;
    } catch (error) {
        console.error('Error fetching top user:', error);
    }

}

async function fetchTopStores() {
    try {
        const res = await axios.get('/api/admin/topstores');
        topStores.value = res.data.topstores;
    } catch (error) {
        console.error('Error fetching top customers:', error);
    }
}

// --- Lifecycle Hook ---

onMounted(async () => {
    startLoading(); // Activate global loader if applicable
    try {
        await Promise.all([
            fetchUsers(),
            fetchStores(),
            fetchActiveUsers(),
            fetchActiveStores(),
            fetchTopUsers(),
            fetchTopStores(),
        ]);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Handle overall dashboard data loading error here
    } finally {
        isDataLoaded.value = true; // Set data loaded flag regardless of success/failure
        stopLoading(); // Deactivate global loader
    }

});

</script>

<style scoped>
/* Any specific styles for this component can go here */
.v-data-table {
  flex-grow: 1;
}

.centered-headers .v-data-table__th {
  text-align: center !important;
}
</style>
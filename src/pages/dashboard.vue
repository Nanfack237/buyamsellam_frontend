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
                {{ $t('dashboardTitle') }} </p>
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
              <v-card elevation="3" hover @click="goToStockPage">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="blue-darken-4" size="40" icon="mdi-warehouse"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8">
                      <v-card-sub-title class="text-disabled">{{ $t('inventoryLevel') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalStockQtty || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover @click="goToPurchasePage">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="orange" size="40" icon="mdi-cart-check"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8">
                      <v-card-sub-title class="text-disabled">{{ $t('totalPurchase') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalPurchasePerDa || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover @click="goToSalePage">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="rgba(100, 200, 150, 0.6)" size="40" icon="mdi-cart-outline"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8" style="color:">
                      <v-card-sub-title class="text-disabled">{{ $t('totalSale') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalSalePerDa || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover @click="goToStatisticsPage">
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="success" size="40" icon="mdi-currency-usd"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8" style="color: #43A047;">
                      <v-card-sub-title class="text-disabled">{{ $t('totalProfit') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h3>{{ formatNumberWithThousandsSeparator(totalprofit || 0 )}}</h3>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('moreInfo') }} <v-icon size="15">mdi-arrow-right</v-icon>
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
                  {{ $t('transactionSummary') }}
                </p>
                <v-divider class="border-opacity-100 pb-2" color="grey-lighten-1"></v-divider>
                <v-row>
                  <v-col cols="12" md="6">
                    <center>
                      <ChartByExpenses />
                    </center>
                  </v-col>
                  <v-col cols="12" md="6">
                    <center>
                      <ChartBySales />
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
                    {{ $t('profitPerDay') }}
                  </p>
                  <v-divider class="border-opacity-100 pb-3" color="grey-lighten-1"></v-divider>
                  <center>
                    <ChartByProfit />
                  </center>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" sm="6" class="d-flex"> 
              <v-card elevation="4" class="flex-grow-1"> 
                <v-card-item >
                  <p class="font-weight-medium py-2">
                    {{ $t('topProduct') }}
                  </p>
                  <v-divider class="border-opacity-100 pb-2" color="grey-lighten-1"></v-divider>
                  <v-data-table :items="topProducts" :headers="topProductHeaders" class="centered-headers py-3"
                    hide-default-footer>
                  </v-data-table>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" sm="6" class="d-flex"> 
              <v-card elevation="4" class="flex-grow-1" > 
                <v-card-item >
                  <p class="font-weight-medium py-2">
                    {{ $t('topCustomer') }}
                  </p>
                  <v-divider class="border-opacity-100 pb-2" color="grey-lighten-1"></v-divider>
                  <v-data-table :items="topCustomers" :headers="topCustomerHeaders" class="centered-headers py-3"
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
          <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p> </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios'; // Assuming you have an axios instance configured
import { useLoader } from '@/useLoader';
import { useI18n } from 'vue-i18n'; // Import useI18n for translations

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader(); // Assuming this manages a global loading state or similar
const { t, locale } = useI18n(); // Destructure t and locale from useI18n

const router = useRouter();
// --- Reactive State ---
const totalStockQtty = ref<number | null>(null);
const totalPurchasePerDa = ref<number | null>(null);
const totalSalePerDa = ref<number | null>(null);
const totalprofit = ref<number | null>(null);
const topProducts = ref<any[]>([]);
const topCustomers = ref<any[]>([]);
const isDataLoaded = ref(false); // Flag to control rendering and overlay visibility

// --- Computed Properties ---
const formattedDate = computed(() => {
  const date = new Date(); // Get the current date

  // Calculate the day of the year (not directly used in the final string, but kept if needed elsewhere)
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = (date.getTime() - startOfYear.getTime());
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.ceil(diff / oneDay);

  // Calculate the week number (ISO standard)
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7; // Get 0 for Monday, 6 for Sunday
  target.setDate(target.getDate() - dayNr + 3); // Set to nearest Thursday

  const firstThursday = target.valueOf();
  target.setMonth(0, 1); // January 1st
  if (target.getDay() !== 4) { // If Jan 1st is not a Thursday
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7); // Set to first Thursday of the year
  }
  const isoWeekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000); // 604800000 = 7 * 24 * 60 * 60 * 1000

  // Calculate the start and end dates of the current ISO week
  const startOfWeek = new Date(date.valueOf());
  startOfWeek.setDate(date.getDate() - dayNr); // Go back to Monday (dayNr is 0 for Monday)

  const endOfWeek = new Date(startOfWeek.valueOf());
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Add 6 days to get to Sunday

  // Format the dates using the current i18n locale
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const currentLocale = locale.value; // Get the current locale from vue-i18n
  const formattedStartDate = startOfWeek.toLocaleDateString(currentLocale, options);
  const formattedEndDate = endOfWeek.toLocaleDateString(currentLocale, options);
  const currentYear = date.getFullYear();

  // Return translated string using the 't' function
  return t('weekSummary', {
    week: isoWeekNumber,
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    year: currentYear
  });
});

function goToStockPage(){
   router.push('/stock');
}

function goToPurchasePage(){
   router.push('/purchase');
}

function goToSalePage(){
   router.push('/sale');
}

function goToStatisticsPage(){
   router.push('/statistics');
}


const topProductHeaders = computed(() => ([ // Make headers computed to react to locale changes
  { title: t('name'), value: 'name', align: 'center' },
  { title: t('totalSold'), value: 'total_sold', align: 'center' },
]));

const topCustomerHeaders = computed(() => ([ // Make headers computed to react to locale changes
  { title: t('name'), value: 'name', align: 'center' },
  { title: t('totalBought'), value: 'total_bought', align: 'center' },
]));


// --- Methods ---
async function fetchTotalStock() {
  try {
    const res = await axios.get('/api/stocks/totalStock');
    totalStockQtty.value = res.data.totalStock || 0;
  } catch (error) {
    console.error('Error fetching total stock:', error);
    // Optionally, you can add a snackbar or alert here
  }
}

function formatNumberWithThousandsSeparator(value: number | string): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US'); // Consider making this locale-aware if needed
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value).toLocaleString('en-US'); // Consider making this locale-aware if needed
  }
  return String(value); // Return as string if not a valid number
}

async function fetchTotalPurchasePerDay() {
  try {
    const res = await axios.get('/api/purchases/totalpurchaseperday');
    totalPurchasePerDa.value = res.data.totalPurchasePerDay || 0;
  } catch (error) {
    console.error('Error fetching total purchases per day:', error);
  }
}

async function fetchTotalSalePerDay() {
  try {
    const res = await axios.get('/api/sales/totalsaleperday');
    totalSalePerDa.value = res.data.totalSalePerDay || 0;
  } catch (error) {
    console.error('Error fetching total sales per day:', error);
  }
}

async function fetchTotalProfitPerDay() {
  try {
    const res = await axios.get('/api/sales/totalprofitperday');
    const profitData = res.data.totalprofitperday;
    totalprofit.value = profitData[0]?.total_profit || 0; // Use optional chaining for safety
  } catch (error) {
    console.error('Error fetching total profit per day:', error);
  }
}

async function fetchMostSoldProduct() {
  try {
    const res = await axios.get('/api/sales/mostsoldproductofweek');
    topProducts.value = res.data.mostSold;
  } catch (error) {
    console.error('Error fetching most sold product:', error);
  }
}

async function fetchTopCustomer() {
  try {
    const res = await axios.get('/api/sales/topcustomerofweek');
    topCustomers.value = res.data.topcustomers;
  } catch (error) {
    console.error('Error fetching top customers:', error);
  }
}

// --- Lifecycle Hook ---
onMounted(async () => {
  startLoading(); // Activate global loader if applicable
  try {
    await Promise.all([
      fetchTotalStock(),
      fetchTotalPurchasePerDay(),
      fetchTotalSalePerDay(),
      fetchTotalProfitPerDay(),
      fetchMostSoldProduct(),
      fetchTopCustomer(),
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
  /* This often helps when v-data-table is inside a flex container stretching height */
  flex-grow: 1;
}

/* If your headers are not centered by default, you can add this global style or a class */
.centered-headers .v-data-table__th {
  text-align: center !important;
}
</style>
<template>
  <v-app>
    <v-card>
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />

        <v-main v-if="isDataLoaded" class="h-screen" style="min-height: max-content;">
          <v-row justify="space-between" class="d-flex justify-center px-5 py-6 py-2 align-center">
            <v-col cols="auto">
              <p class="text-high-emphasis text-h6" style="color: #0D47A1;">
                {{ $t('statisticsVue.statistics') }}
              </p>
            </v-col>

            <v-col cols="auto" class="d-flex align-center">
              <v-select
                v-model="selectedYear"
                :items="fetchedAvailableYears"
                :label="$t('statisticsVue.year')"
                density="compact"
                variant="outlined"
                hide-details
                single-line
                class="ml-4"
                style="max-width: 140px;"
                clearable
              ></v-select>

              <v-select
                v-model="selectedMonth"
                :items="availableMonths"
                :label="$t('statisticsVue.month')"
                density="compact"
                hide-details
                variant="outlined"
                single-line
                class="ml-4"
                style="max-width: 150px;"
                clearable
                :disabled="selectedYear === null"
              ></v-select>

              <v-select
                v-model="selectedWeek"
                :items="availableWeeks"
                :label="$t('statisticsVue.week')"
                variant="outlined"
                density="compact"
                hide-details
                single-line
                class="ml-4"
                style="max-width: 300px;"
                clearable
                :disabled="selectedMonth === null && selectedYear === null"
              ></v-select>

              <v-btn icon density="compact" variant="text" class="ml-2" @click="applyFilters">
                <v-icon>mdi-filter-variant</v-icon>
                <v-tooltip activator="parent" location="bottom">{{ $t('statisticsVue.apply_filters') }}</v-tooltip>
              </v-btn>

              <p class="text-right text-medium-emphasis ml-4">
                {{ displayPeriod }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100" color="grey-lighten-1"></v-divider>
          </v-row>

          <v-row class="d-flex justify-center align-center px-4 py-3" style="height: max-content;">
            <v-col cols="12" md="3">
              <v-card elevation="3" hover >
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="blue-darken-4" size="40" icon="mdi-warehouse"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8">
                      <v-card-sub-title class="text-disabled">{{ $t('statisticsVue.inventory_level') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalStockQtty || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('statisticsVue.more_info') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover >
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="orange" size="40" icon="mdi-cart-check"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8">
                      <v-card-sub-title class="text-disabled">{{ $t('statisticsVue.total_purchases') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalPurchaseCount || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('statisticsVue.more_info') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover >
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="rgba(100, 200, 150, 0.6)" size="40" icon="mdi-cart-outline"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8" style="color:">
                      <v-card-sub-title class="text-disabled">{{ $t('statisticsVue.total_sales') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h2>{{ totalSaleCount || 0 }}</h2>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('statisticsVue.more_info') }} <v-icon size="15">mdi-arrow-right</v-icon>
                      </p>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3">
              <v-card elevation="3" hover >
                <v-card-item>
                  <v-row>
                    <v-col md="4" class="d-flex justify-center">
                      <v-icon class="py-12" color="success" size="40" icon="mdi-currency-usd"></v-icon>
                    </v-col>
                    <v-divider vertical></v-divider>
                    <v-col md="8" style="color: #43A047;">
                      <v-card-sub-title class="text-disabled">{{ $t('statisticsVue.total_profit_fcfa') }}</v-card-sub-title>
                      <v-card-text class="pt-2">
                        <h3>{{ formatNumberWithThousandsSeparator(totalprofit || 0) }}</h3>
                      </v-card-text>
                      <p class="text-caption text-lowercase text-medium-emphasis">
                        {{ $t('statisticsVue.more_info') }} <v-icon size="15">mdi-arrow-right</v-icon>
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
                  {{ $t('statisticsVue.transaction_summary') }}
                </p>
                <v-divider class="border-opacity-100 pb-2" color="grey-lighten-1"></v-divider>
                <v-row>
                  <v-col cols="12" md="6">
                    <center>
                      <ChartByPurchasePerPeriod :filter-params="currentFilterParams" />
                    </center>
                  </v-col>
                  <v-col cols="12" md="6">
                    <center>
                      <ChartBySalePerPeriod :filter-params="currentFilterParams" />
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
                    {{ $t('statisticsVue.profit_per_period') }}
                  </p>
                  <v-divider class="border-opacity-100 pb-3" color="grey-lighten-1"></v-divider>
                  <center>
                    <ChartByProfitPerPeriod :filter-params="currentFilterParams" />
                  </center>
                </v-card-item>
              </v-card>
            </v-col>

            <v-col cols="12" md="3" sm="6" class="d-flex">
              <v-card elevation="4" class="flex-grow-1">
                <v-card-item >
                  <p class="font-weight-medium py-2">
                    {{ $t('statisticsVue.top_product') }}
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
                    {{ $t('statisticsVue.top_customer') }}
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
          <p class="my-1 text-h6 text-white">{{ $t('loading') }}</p>
        </v-overlay>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from '@/axios';
import { useLoader } from '@/useLoader';
import { useI18n } from 'vue-i18n'; // Import useI18n

// Import your chart components and sidebar/header/footer
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import ChartByPurchasePerPeriod from '@/components/ChartByPurchasePerPeriod.vue';
import ChartByProfitPerPeriod from '@/components/ChartByProfitPerPeriod.vue';
import ChartBySalePerPeriod from '@/components/ChartBySalePerPeriod.vue';

const { t, locale } = useI18n(); // Destructure the t (translate) function and locale

// --- Composables and Utilities ---
const { startLoading, stopLoading } = useLoader();

// --- Reactive State ---
const totalStockQtty = ref<number | null>(null);
const totalPurchaseCount = ref<number | null>(null);
const totalSaleCount = ref<number | null>(null);
const totalprofit = ref<number | null>(null);
const topProducts = ref<any[]>([]);
const topCustomers = ref<any[]>([]);
const isDataLoaded = ref(false);
const fetchedAvailableYears = ref<number[]>([]);

// Filter
const totalProfitAll = ref();
const totalPurchaseCountAll = ref();
const totalSaleCountAll = ref();
const totalStockQttyNoFilter = ref()

// Filter selections
const selectedYear = ref<number | null>(null); // Start with no year selected
const selectedMonth = ref<number | null>(null);
const selectedWeek = ref<number | null>(null);

// The filter parameters object that will be passed to child chart components
const currentFilterParams = ref<any>({});


function formatNumberWithThousandsSeparator(value: number | string): string {
  if (typeof value === 'number') {
    return value.toLocaleString('en-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value).toLocaleString('en-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return String(value); // Return as string if not a valid number
}

// --- Computed Properties ---

async function fetchAvailableYearsFromApi() {
  try {
    const store = sessionStorage.getItem('storeId');
    const selectedStore = store ? JSON.parse(store) : null;

    const storePayload = selectedStore ? { id: selectedStore.id, name: selectedStore.name } : {};
    const response = await axios.get('/api/sales/getavailableyears', {
      params: {
        store: JSON.stringify(storePayload) // Pass selected store if applicable
      }
    });
    fetchedAvailableYears.value = response.data.years;
    // Set selectedYear to the latest available year if current selectedYear is not in list
    // or if no years are fetched, default to current year
    if (fetchedAvailableYears.value.length > 0) {
      if (!fetchedAvailableYears.value.includes(selectedYear.value || 0)) {
        selectedYear.value = Math.max(...fetchedAvailableYears.value);
      }
    } else {
      selectedYear.value = new Date().getFullYear(); // Fallback if no years found
    }
  } catch (error) {
    console.error('Error fetching available years:', error);
    fetchedAvailableYears.value = [new Date().getFullYear()]; // Fallback to current year on error
  }
}

const availableMonths = computed(() => [
  { title: t('statisticsVue.months.january'), value: 1 },
  { title: t('statisticsVue.months.february'), value: 2 },
  { title: t('statisticsVue.months.march'), value: 3 },
  { title: t('statisticsVue.months.april'), value: 4 },
  { title: t('statisticsVue.months.may'), value: 5 },
  { title: t('statisticsVue.months.june'), value: 6 },
  { title: t('statisticsVue.months.july'), value: 7 },
  { title: t('statisticsVue.months.august'), value: 8 },
  { title: t('statisticsVue.months.september'), value: 9 },
  { title: t('statisticsVue.months.october'), value: 10 },
  { title: t('statisticsVue.months.november'), value: 11 },
  { title: t('statisticsVue.months.december'), value: 12 },
]);

/**
 * Helper function to get ISO week number for a given date.
 * Week 1 is the first week with at least 4 days in the new year.
 * @param d A Date object.
 * @returns The ISO week number (1-53).
 */
function getISOWeekNumber(d: Date): number {
  // Copy date so don't modify original
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
  return weekNo;
}

/**
 * Calculates the Monday of a given ISO week number for a specific year.
 * @param year The year for the ISO week.
 * @param weekNumber The ISO week number (1-53).
 * @returns A Date object representing the Monday of that ISO week.
 */
function getMondayOfISOWeek(year: number, weekNumber: number): Date {
    // January 4th is always in ISO Week 1
    const jan4th = new Date(year, 0, 4);
    const jan4thDay = jan4th.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    // Calculate the Monday of ISO Week 1 for this year
    const mondayOfFirstISOWeek = new Date(jan4th);
    mondayOfFirstISOWeek.setDate(jan4th.getDate() - (jan4thDay === 0 ? 6 : jan4thDay - 1));

    // Calculate the Monday of the desired week
    const targetMonday = new Date(mondayOfFirstISOWeek);
    targetMonday.setDate(mondayOfFirstISOWeek.getDate() + (weekNumber - 1) * 7);

    return targetMonday;
}

// Adjusted availableWeeks computed property
const availableWeeks = computed(() => {
  if (selectedYear.value === null) {
    return []; // If no year is selected, no weeks are available
  }

  const year = selectedYear.value;
  const month = selectedMonth.value; // Month is 1-indexed (1-12)

  const weeks = [];
  let currentDayPointer: Date;
  let endBoundary: Date;

  if (month !== null) {
    // If month is selected, start from the first day of that month
    currentDayPointer = new Date(year, month - 1, 1);
    // End at the last day of that month
    endBoundary = new Date(year, month, 0);
  } else {
    // If no month is selected, calculate weeks within the entire year
    currentDayPointer = new Date(year, 0, 1);
    endBoundary = new Date(year, 11, 31);
  }

  // Find the Monday of the week containing the `currentDayPointer`
  // This ensures we always start from a Monday for ISO week calculation
  let initialMonday = getMondayOfISOWeek(currentDayPointer.getFullYear(), getISOWeekNumber(currentDayPointer));

  // Adjust initialMonday if it's before the actual start of the month/year boundary
  // This handles cases where the first day of the month/year is not a Monday.
  if (initialMonday > currentDayPointer) {
    initialMonday = new Date(currentDayPointer.getFullYear(), currentDayPointer.getMonth(), currentDayPointer.getDate());
    initialMonday.setDate(initialMonday.getDate() - (initialMonday.getDay() === 0 ? 6 : initialMonday.getDay() - 1));
  }


  let processedPeriodKeys: { [key: number]: boolean } = {}; // To prevent adding the same week multiple times

  // Loop as long as the Monday of the current week is within or before the end boundary
  // We advance by 7 days in each iteration
  while (initialMonday <= endBoundary) {
    const weekNum = getISOWeekNumber(initialMonday);
    const isoYear = initialMonday.getFullYear(); // Use the year of the current Monday for ISO year

    const periodKey = (isoYear * 100) + weekNum; // Combine year and week to create a unique key (e.g., 202527)

    // Only process this week if it hasn't been processed yet
    if (!processedPeriodKeys[periodKey]) {
        processedPeriodKeys[periodKey] = true; // Mark as processed

        const weekStartDate = getMondayOfISOWeek(isoYear, weekNum); // Re-calculate to ensure it's the exact Monday
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekStartDate.getDate() + 6); // Sunday of the same week

        // Determine the actual display range for the week.
        // This clips the week's dates to the selected month/year boundaries.
        const displayStart = new Date(Math.max(weekStartDate.getTime(), currentDayPointer.getTime()));
        const displayEnd = new Date(Math.min(weekEndDate.getTime(), endBoundary.getTime()));

        // Only add the week if its effective display range is valid (start is not after end)
        if (displayStart <= displayEnd) {
            const displayWeekStart = displayStart.toLocaleString(locale.value, { month: 'short', day: 'numeric' });
            const displayWeekEnd = displayEnd.toLocaleString(locale.value, { month: 'short', day: 'numeric' });
            const displayTitle = `${t('statisticsVue.week')} ${weekNum} (${displayWeekStart} - ${displayWeekEnd})`;
            weeks.push({ title: displayTitle, value: weekNum });
        }
    }
    initialMonday.setDate(initialMonday.getDate() + 7); // Move to the next Monday
  }

  return weeks.sort((a, b) => a.value - b.value);
});


const displayPeriod = computed(() => {
  const year = selectedYear.value;
  const month = selectedMonth.value;
  const week = selectedWeek.value;

  const monthName = month ? availableMonths.value.find(m => m.value === month)?.title : null;

  if (year === null) {
    return t('statisticsVue.all_time'); // Display 'All Time' if no year is selected
  }

  if (week !== null) {
    // Calculate the start and end dates for the specific week using the helper
    const weekStartDate = getMondayOfISOWeek(year, week);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6); // Sunday of the same week

    const weekStartFormat = weekStartDate.toLocaleString(locale.value, { month: 'short', day: 'numeric' });
    const weekEndFormat = weekEndDate.toLocaleString(locale.value, { month: 'short', day: 'numeric' });

    // Display the year that the *start* of the week falls into, for clarity.
    const displayYearForWeek = weekStartDate.getFullYear();

    return `${t('statisticsVue.week')} ${week} (${weekStartFormat} - ${weekEndFormat}) ${displayYearForWeek}`;

  } else if (month !== null) {
    return `${monthName} ${year}`;
  } else {
    return `${t('statisticsVue.year')} ${year}`;
  }
});


const topProductHeaders = computed(() => [
  { title: t('statisticsVue.product_name'), value: 'name', align: 'center' },
  { title: t('statisticsVue.quantity'), value: 'total_sold', align: 'center' },
]);

const topCustomerHeaders = computed(() => [
  { title: t('statisticsVue.customer_name'), value: 'name', align: 'center' },
  { title: t('statisticsVue.quantity'), value: 'total_bought', align: 'center' },
]);

// --- Methods ---

// Helper to get store ID from localStorage
function getStoreId(): number | null {
  const store = sessionStorage.getItem('storeId');
  if (store) {
    try {
      const parsedStore = JSON.parse(store);
      return parsedStore.id;
    } catch (e) {
      console.error('Error parsing storeId from sessionStorage:', e);
      return null;
    }
  }
  console.warn('Store ID not found in sessionStorage.');
  return null;
}

// Re-fetch all dashboard data based on current filters
async function applyFilters() {
  const store_id = getStoreId();
  if (store_id === null) {
    console.error('Store ID is null. Cannot fetch data.');
    isDataLoaded.value = true;
    stopLoading();
    return;
  }

  isDataLoaded.value = false; // Set to false to show the loading overlay
  startLoading();

  let startDate: string | null = null;
  let endDate: string | null = null;

  const currentSelectionYear = selectedYear.value;
  const currentSelectionMonth = selectedMonth.value;
  const currentSelectionWeek = selectedWeek.value;

  const filters: any = {
    store: JSON.stringify({ id: store_id }),
  };

  // Only add date filters if a year is selected
  if (currentSelectionYear !== null) {
    if (currentSelectionWeek !== null) {
      // If week is selected, determine dates based on that specific week
      const weekStartDate = getMondayOfISOWeek(currentSelectionYear, currentSelectionWeek);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6); // Sunday of the same week

      startDate = weekStartDate.toISOString().split('T')[0];
      endDate = weekEndDate.toISOString().split('T')[0];
    } else if (currentSelectionMonth !== null) {
      // If only a month is selected, filter by month
      const monthStart = new Date(currentSelectionYear, currentSelectionMonth - 1, 1);
      const monthEnd = new Date(currentSelectionYear, currentSelectionMonth, 0); // Last day of the month

      startDate = monthStart.toISOString().split('T')[0];
      endDate = monthEnd.toISOString().split('T')[0];
    } else {
      // If only a year is selected (month and week are null), filter by the entire year
      const yearStart = new Date(currentSelectionYear, 0, 1);
      const yearEnd = new Date(currentSelectionYear, 11, 31);

      startDate = yearStart.toISOString().split('T')[0];
      endDate = yearEnd.toISOString().split('T')[0];
    }

    filters.year = currentSelectionYear;
    filters.start_date = startDate;
    filters.end_date = endDate;

    if (currentSelectionMonth !== null) {
      filters.month = currentSelectionMonth;
    }
    if (currentSelectionWeek !== null) {
      filters.week = currentSelectionWeek;
    }
  }
  // If currentSelectionYear is null, no date filters will be added to `filters` object,
  // making the backend functions return overall data for the store.

  // Update currentFilterParams to pass to child chart components
  currentFilterParams.value = filters;
  console.log('Applying filters:', filters); // Debugging

  try {
    // Use Promise.all to fetch all data concurrently for better performance
    await Promise.all([
      fetchAggregatedTotals(filters), // Fetches and sums data for summary cards
      fetchMostSoldProduct(filters),
      fetchTopCustomer(filters),
      // Chart components will automatically re-fetch their data because `currentFilterParams` is reactive
      // and passed as a prop, triggering their watchers.
    ]);
  } catch (error) {
    console.error('Error applying filters or fetching dashboard data:', error);
    // Set dashboard values to 0 or empty arrays on error to prevent undefined display
    totalPurchaseCount.value = 0;
    totalSaleCount.value = 0;
    totalprofit.value = 0;
    totalStockQtty.value = 0;
    topProducts.value = [];
    topCustomers.value = [];
  } finally {
    isDataLoaded.value = true; // Data fetching complete, hide loader
    stopLoading();
  }
}

// Fetches data for the summary cards and aggregates it
async function fetchAggregatedTotals(params: any) {
  try {
    // Fetch Total Stock (sums data array from period endpoint)
    const stockRes = await axios.post('/api/stocks/totalstockperperiod', params);
    totalStockQtty.value = stockRes.data.totalStock;

    // Fetch Total Purchase Count (calls count endpoint directly)
    const purchaseCountRes = await axios.post('/api/purchases/totalpurchasecountperperiod', params);
    totalPurchaseCount.value = purchaseCountRes.data.totalPurchaseCount || 0;

    // Fetch Total Sale Count (calls count endpoint directly)
    const saleCountRes = await axios.post('/api/sales/totalsalecountperperiod', params);
    totalSaleCount.value = saleCountRes.data.totalSaleCount || 0;

    // Fetch Total Profit (sums data array from period endpoint)
    const profitRes = await axios.post('/api/sales/profitsummaryperperiod', params);
    totalprofit.value = profitRes.data.data ? profitRes.data.data.reduce((sum: number, val: number) => sum + val, 0) : 0;

  } catch (error) {
    console.error('Error fetching aggregated totals:', error);
    // If filtered fetch fails, try to fetch all-time data
    try {
      const resStock = await axios.get('/api/stocks/totalStock', {
        params: { store: JSON.stringify({ id: getStoreId() }) }
      });
      totalStockQtty.value = resStock.data.totalStock || 0;

      const resPurchaseCount = await axios.get('/api/purchases/totalpurchasecountall', {
        params: { store: JSON.stringify({ id: getStoreId() }) }
      });
      totalPurchaseCount.value = resPurchaseCount.data.totalPurchaseCountAll || 0;

      const resSaleCount = await axios.get('/api/sales/totalsalecountall', {
        params: { store: JSON.stringify({ id: getStoreId() }) }
      });
      totalSaleCount.value = resSaleCount.data.totalSaleCountAll || 0;

      const res = await axios.get('/api/sales/totalprofitall', {
        params: { store: JSON.stringify({ id: getStoreId() }) }
      });
      totalprofit.value = res.data.totalProfitAll || 0;
    } catch (allTimeError) {
      console.error('Error fetching all-time aggregated totals as fallback:', allTimeError);
      totalPurchaseCount.value = 0;
      totalSaleCount.value = 0;
      totalprofit.value = 0;
      totalStockQtty.value = 0;
    }
  }
}


// Fetches the top-selling products for the selected period.
async function fetchMostSoldProduct(params: any) {
  try {
    const res = await axios.post('/api/sales/mostsoldproductperperiod', params);
    topProducts.value = res.data.mostSold || [];
  } catch (error) {
    console.error('Error fetching most sold product:', error);
    topProducts.value = [];
  }
}

// Fetches the top customers by quantity bought for the selected period.
async function fetchTopCustomer(params: any) {
  try {
    const res = await axios.post('/api/sales/topcustomerperperiod', params);
    topCustomers.value = res.data.topCustomers || [];
  } catch (error) {
    console.error('Error fetching top customers:', error);
    topCustomers.value = [];
  }
}


// --- Watchers ---
// Watch for changes in selectedYear and reset other filters to default to entire year view
watch(selectedYear, (newYear, oldYear) => {
  if (newYear !== oldYear) {
    selectedMonth.value = null; // Reset month selection
    selectedWeek.value = null;  // Reset week selection
    // Always apply filters when year changes (including null to non-null and vice-versa)
    applyFilters();
  }
});

// Watch for changes in selectedMonth and reset selectedWeek
watch(selectedMonth, (newMonth, oldMonth) => {
  if (newMonth !== oldMonth) {
    selectedWeek.value = null; // Reset week selection when month changes
    // Only apply filters if a year is selected (or was selected to clear month)
    // or if the month is being cleared (newMonth === null)
    if (selectedYear.value !== null || (newMonth === null && oldMonth !== null)) {
      applyFilters();
    }
  }
});

// Watch for changes in selectedWeek
watch(selectedWeek, (newWeek, oldWeek) => {
  if (newWeek !== oldWeek) {
    // Only apply filters if a year is selected (or was selected to clear week)
    // or if the week is being cleared (newWeek === null)
    if (selectedYear.value !== null || (newWeek === null && oldWeek !== null)) {
      applyFilters();
    }
  }
}, { immediate: false }); // Do not run on initial component mount, only on actual changes


// --- Lifecycle Hook ---
onMounted(async () => {
  // Set isDataLoaded to false and start loading immediately on mount
  isDataLoaded.value = false;
  startLoading();

  try {
    // Fetch available years first
    await fetchAvailableYearsFromApi();

    // Then, apply filters based on initial selections (which might be null for year)
    // This will trigger fetchAggregatedTotals, fetchMostSoldProduct, fetchTopCustomer
    // and update currentFilterParams for child components.
    await applyFilters();

  } catch (error) {
    console.error('Initial dashboard data load failed:', error);
    // Ensure UI reflects error or empty state
  } finally {
    // Ensure loading state is stopped regardless of success or failure
    isDataLoaded.value = true;
    stopLoading();
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

/* Flexbox utilities for consistent height */
.flex-grow-1 {
  flex-grow: 1;
}

.d-flex.flex-column > *:not(.v-card-title):not(.v-divider) {
  min-height: 0; /* Allows flex items to shrink if needed */
}

/* Ensure data table inside flex container behaves correctly */
.v-data-table {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.v-data-table .v-data-table__wrapper {
  flex-grow: 1;
  overflow-y: auto;
}
</style>
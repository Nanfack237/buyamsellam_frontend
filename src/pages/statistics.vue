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
import { useI18n } from 'vue-i18n';

import type { VDataTable } from 'vuetify/components';

// Import your chart components and sidebar/header/footer
import SideBarComponent from '@/components/SideBarComponent.vue';
import HeaderComponent from '@/components/HeaderComponent.vue';
import AppFooter from '@/components/AppFooter.vue';
import ChartByPurchasePerPeriod from '@/components/ChartByPurchasePerPeriod.vue';
import ChartByProfitPerPeriod from '@/components/ChartByProfitPerPeriod.vue';
import ChartBySalePerPeriod from '@/components/ChartBySalePerPeriod.vue';

const { t, locale } = useI18n();

// --- Composables and Utilities ---

type VDataTableInternalHeaders = NonNullable<VDataTable['$props']['headers']>;

// 2. Then, get the type of a single item from that NonNullable array
type DataTableHeader<T> = VDataTableInternalHeaders[number] & {
  value?: keyof T | 'data-table-expand' | 'data-table-select' | (string & {});
};

const { startLoading, stopLoading } = useLoader();

// --- Reactive State ---
const totalStockQtty = ref<number | null>(null);
const totalPurchaseCount = ref<number | null>(null);
const totalSaleCount = ref<number | null>(null);
const totalprofit = ref<number | null>(null);
const topProducts = ref<any[]>([]); // Consider refining this type if possible
const topCustomers = ref<any[]>([]); // Consider refining this type if possible
const isDataLoaded = ref(false);
const fetchedAvailableYears = ref<number[]>([]);

// Filter selections
const selectedYear = ref<number | null>(null);
const selectedMonth = ref<number | null>(null);
const selectedWeek = ref<number | null>(null); // selectedWeek value will be the ISO week number (e.g., 1-53)

// The filter parameters object that will be passed to child chart components
const currentFilterParams = ref<any>({});


function formatNumberWithThousandsSeparator(value: number | string | null): string {
  if (value === null || value === undefined) return '0';
  if (typeof value === 'number') {
    return value.toLocaleString('en-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  if (typeof value === 'string' && !isNaN(Number(value))) {
    return Number(value).toLocaleString('en-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return String(value);
}

// --- Computed Properties ---

async function fetchAvailableYearsFromApi() {
  try {
    const store = sessionStorage.getItem('storeId');
    const selectedStore = store ? JSON.parse(store) : null;

    const storePayload = selectedStore ? { id: selectedStore.id, name: selectedStore.name } : {};
    const response = await axios.get('/api/sales/getavailableyears', {
      params: {
        store: JSON.stringify(storePayload)
      }
    });
    fetchedAvailableYears.value = response.data.years;
    if (fetchedAvailableYears.value.length > 0) {
      if (selectedYear.value === null || !fetchedAvailableYears.value.includes(selectedYear.value)) {
        selectedYear.value = Math.max(...fetchedAvailableYears.value);
      }
    } else {
      selectedYear.value = new Date().getFullYear();
    }
  } catch (error) {
    console.error('Error fetching available years:', error);
    fetchedAvailableYears.value = [new Date().getFullYear()];
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
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getFullYear(), 0, 1));
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
  const jan4th = new Date(year, 0, 4);
  const jan4thDay = jan4th.getDay();

  const mondayOfFirstISOWeek = new Date(jan4th);
  mondayOfFirstISOWeek.setDate(jan4th.getDate() - (jan4thDay === 0 ? 6 : jan4thDay - 1));

  const targetMonday = new Date(mondayOfFirstISOWeek);
  targetMonday.setDate(mondayOfFirstISOWeek.getDate() + (weekNumber - 1) * 7);

  return targetMonday;
}

const availableWeeks = computed(() => {
  if (selectedYear.value === null) {
    return [];
  }

  const year = selectedYear.value;
  const month = selectedMonth.value;

  const weeks: { title: string; value: number }[] = [];
  const processedWeekKeys = new Set<string>();

  let startDate: Date;
  let endDate: Date;

  if (month !== null) {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0);
  } else {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31);
  }

  const addWeek = (currentDate: Date) => {
    const weekNum = getISOWeekNumber(currentDate);
    const isoYear = currentDate.getFullYear();
    const weekKey = `${isoYear}-${weekNum.toString().padStart(2, '0')}`;

    if (!processedWeekKeys.has(weekKey)) {
      processedWeekKeys.add(weekKey);

      const mondayOfWeek = getMondayOfISOWeek(isoYear, weekNum);
      const sundayOfWeek = new Date(mondayOfWeek);
      sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);

      const displayStart = new Date(Math.max(mondayOfWeek.getTime(), startDate.getTime()));
      const displayEnd = new Date(Math.min(sundayOfWeek.getTime(), endDate.getTime()));

      if (displayStart <= displayEnd) {
        const displayWeekStart = displayStart.toLocaleString(locale.value, { month: 'short', day: 'numeric' });
        const displayWeekEnd = displayEnd.toLocaleString(locale.value, { month: 'short', day: 'numeric' });
        const displayTitle = `${t('statisticsVue.week')} ${weekNum} (${displayWeekStart} - ${displayWeekEnd})`;
        weeks.push({ title: displayTitle, value: weekNum });
      }
    }
  };

  let currentDay = new Date(startDate);
  while (currentDay <= endDate) {
    addWeek(currentDay);
    currentDay.setDate(currentDay.getDate() + 1);
  }

  addWeek(startDate);
  addWeek(endDate);


  return weeks.sort((a, b) => a.value - b.value);
});


const displayPeriod = computed(() => {
  const year = selectedYear.value;
  const month = selectedMonth.value;
  const week = selectedWeek.value;

  const monthName = month ? availableMonths.value.find(m => m.value === month)?.title : null;

  if (year === null) {
    return t('statisticsVue.all_time');
  }

  if (week !== null) {
    const weekStartDate = getMondayOfISOWeek(year, week);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);

    const weekStartFormat = weekStartDate.toLocaleString(locale.value, { month: 'short', day: 'numeric' });
    const weekEndFormat = weekEndDate.toLocaleString(locale.value, { month: 'short', day: 'numeric' });

    const displayYearForWeek = weekStartDate.getFullYear();

    return `${t('statisticsVue.week')} ${week} (${weekStartFormat} - ${weekEndFormat}) ${displayYearForWeek}`;

  } else if (month !== null) {
    return `${monthName} ${year}`;
  } else {
    return `${t('statisticsVue.year')} ${year}`;
  }
});


const topProductHeaders = computed<DataTableHeader<any>[]>(() => [
  { title: t('statisticsVue.product_name'), value: 'name', align: 'center' as const },
  { title: t('statisticsVue.quantity'), value: 'total_sold', align: 'center' as const },
]);

const topCustomerHeaders = computed<DataTableHeader<any>[]>(() => [
  { title: t('statisticsVue.customer_name'), value: 'name', align: 'center' as const },
  { title: t('statisticsVue.quantity'), value: 'total_bought', align: 'center' as const },
]);

// --- Methods ---

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

async function applyFilters() {
  const store_id = getStoreId();
  if (store_id === null) {
    console.error('Store ID is null. Cannot fetch data.');
    isDataLoaded.value = true;
    stopLoading();
    return;
  }

  isDataLoaded.value = false;
  startLoading();

  let startDate: string | null = null;
  let endDate: string | null = null;

  const currentSelectionYear = selectedYear.value;
  const currentSelectionMonth = selectedMonth.value;
  const currentSelectionWeek = selectedWeek.value;

  const filters: any = {
    store: JSON.stringify({ id: store_id }),
  };

  if (currentSelectionYear !== null) {
    if (currentSelectionWeek !== null) {
      const weekStartDate = getMondayOfISOWeek(currentSelectionYear, currentSelectionWeek);
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekStartDate.getDate() + 6);

      startDate = weekStartDate.toISOString().split('T')[0];
      endDate = weekEndDate.toISOString().split('T')[0];
    } else if (currentSelectionMonth !== null) {
      const monthStart = new Date(currentSelectionYear, currentSelectionMonth - 1, 1);
      const monthEnd = new Date(currentSelectionYear, currentSelectionMonth, 0);

      startDate = monthStart.toISOString().split('T')[0];
      endDate = monthEnd.toISOString().split('T')[0];
    } else {
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

  currentFilterParams.value = filters;
  console.log('Applying filters:', filters);

  try {
    await Promise.all([
      fetchAggregatedTotals(filters),
      fetchMostSoldProduct(filters),
      fetchTopCustomer(filters),
    ]);
  } catch (error) {
    console.error('Error applying filters or fetching dashboard data:', error);
    totalPurchaseCount.value = 0;
    totalSaleCount.value = 0;
    totalprofit.value = 0;
    totalStockQtty.value = 0;
    topProducts.value = [];
    topCustomers.value = [];
  } finally {
    isDataLoaded.value = true;
    stopLoading();
  }
}

async function fetchAggregatedTotals(params: any) {
  try {
    const stockRes = await axios.post('/api/stocks/totalstockperperiod', params);
    totalStockQtty.value = stockRes.data.totalStock;

    const purchaseCountRes = await axios.post('/api/purchases/totalpurchasecountperperiod', params);
    totalPurchaseCount.value = purchaseCountRes.data.totalPurchaseCount || 0;

    const saleCountRes = await axios.post('/api/sales/totalsalecountperperiod', params);
    totalSaleCount.value = saleCountRes.data.totalSaleCount || 0;

    const profitRes = await axios.post('/api/sales/profitsummaryperperiod', params);
    totalprofit.value = profitRes.data.data ? profitRes.data.data.reduce((sum: number, val: number) => sum + val, 0) : 0;

  } catch (error) {
    console.error('Error fetching aggregated totals:', error);
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

async function fetchMostSoldProduct(params: any) {
  try {
    const res = await axios.post('/api/sales/mostsoldproductperperiod', params);
    topProducts.value = res.data.mostSold || [];
  } catch (error) {
    console.error('Error fetching most sold product:', error);
    topProducts.value = [];
  }
}

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
watch(selectedYear, (newYear, oldYear) => {
  if (newYear !== oldYear) {
    selectedMonth.value = null;
    selectedWeek.value = null;
    applyFilters();
  }
});

watch(selectedMonth, (newMonth, oldMonth) => {
  if (newMonth !== oldMonth) {
    selectedWeek.value = null;
    applyFilters();
  }
});

watch(selectedWeek, (newWeek, oldWeek) => {
  if (newWeek !== oldWeek) {
    applyFilters();
  }
}, { immediate: false });

// --- Lifecycle Hook ---
onMounted(async () => {
  isDataLoaded.value = false;
  startLoading();

  try {
    await fetchAvailableYearsFromApi();
    await applyFilters();
  } catch (error) {
    console.error('Initial dashboard data load failed:', error);
  } finally {
    isDataLoaded.value = true;
    stopLoading();
  }
});
</script>

<style scoped>
.v-data-table {
  flex-grow: 1;
}

.centered-headers .v-data-table__th {
  text-align: center !important;
}

.flex-grow-1 {
  flex-grow: 1;
}

.d-flex.flex-column > *:not(.v-card-title):not(.v-divider) {
  min-height: 0;
}

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
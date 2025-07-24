<template>
  <v-card height="400px" variant="text" class="d-flex flex-column"> <v-card-title class="d-flex justify-space-between align-center">
      <span>Monthly Profit</span>
      <v-select
        v-model="selectedYear"
        :items="availableYears"
        label="Select Year"
        density="compact"
        hide-details
        single-line
        class="ml-4"
        style="max-width: 150px;"
      ></v-select>
    </v-card-title>

    <div style="flex-grow: 1; position: relative;">
      <canvas ref="profitChart" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
    </div>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';

Chart.register(...registerables);

const profitChart = ref(null);
let chartInstance = null;

// Reactive variables for filtering
const allData = ref([]); // Stores the raw, unfiltered data from the API
const availableYears = ref([]); // Stores unique years available in the data
const selectedYear = ref(new Date().getFullYear()); // Default to current year

const labels = ref([]);
const data = ref([]);

/**
 * Asynchronously fetches profit data.
 * The backend should ideally return data for all years at once,
 * or have an endpoint that accepts a year parameter.
 * For this example, we'll assume it returns all historical data,
 * and we'll filter it client-side.
 *
 * Backend expected format (example):
 * {
 * "data": [
 * { "year": 2023, "month": "January", "profit": 150000 },
 * { "year": 2023, "month": "February", "profit": 170000 },
 * // ...
 * { "year": 2024, "month": "January", "profit": 200000 },
 * // ...
 * ]
 * }
 */
async function fetchProfit() {
  try {
    // Modify this GET request if your API can filter by year directly:
    // e.g., const response = await axios.get(`/api/sales/totalprofitpermonth?year=${selectedYear.value}`);
    // If your API provides all historical data at once:
    const response = await axios.get('/api/sales/totalprofitpermonth');

    // Assuming response.data is an array of objects like { year, month, profit }
    allData.value = response.data;

    // Extract unique years from the fetched data
    const years = [...new Set(allData.value.map(item => item.year))].sort();
    availableYears.value = years;

    // Set the default selected year to the latest available year if data exists
    if (availableYears.value.length > 0 && !years.includes(selectedYear.value)) {
      selectedYear.value = availableYears.value[availableYears.value.length - 1];
    } else if (availableYears.value.length === 0) {
      selectedYear.value = new Date().getFullYear(); // Fallback if no data
    }


    // After fetching and processing all data, apply the filter
    filterDataByYear();
  } catch (error) {
    console.error('Error fetching monthly profit data:', error);
  }
}

/**
 * Filters the `allData` based on the `selectedYear` and updates `labels` and `data`.
 * Then calls `renderChart` to update the graph.
 */
function filterDataByYear() {
  const filtered = allData.value.filter(item => item.year === selectedYear.value);

  // Chart.js requires labels for all 12 months, even if data is missing for some.
  // We'll create a full set of month labels and map profit data to them.
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyProfits = new Array(12).fill(0); // Initialize with 0 for all months

  filtered.forEach(item => {
    const monthIndex = monthNames.indexOf(item.month);
    if (monthIndex !== -1) {
      monthlyProfits[monthIndex] = item.profit;
    }
  });

  labels.value = monthNames;
  data.value = monthlyProfits;

  renderChart();
}

function renderChart() {
  if (!profitChart.value) {
    console.warn('Canvas element not found for chart rendering.');
    return;
  }

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(profitChart.value, {
    type: 'bar',
    data: {
      labels: labels.value,
      datasets: [{
        label: `Profit for ${selectedYear.value} (FCFA)`, // Dynamic label
        data: data.value,
        backgroundColor: 'rgba(0, 128, 0, 0.6)',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  });
}

// Watch for changes in the selectedYear and re-filter/render the chart
watch(selectedYear, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    filterDataByYear();
  }
});

onMounted(() => {
  fetchProfit();
});
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
/* Style for the select component within the card title for better alignment */
.v-card-title .v-select {
  align-self: flex-end; /* Align to the bottom of the title if needed */
}
</style>
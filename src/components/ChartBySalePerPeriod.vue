<template>
  <v-card style="height: 100%;" variant="text">
    <canvas ref="saleChart" height="370"></canvas>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import axios from '@/axios'; // Assuming your axios instance is correctly set up
import { Chart, registerables } from 'chart.js/auto'; // chart.js/auto registers all necessary components
import { useI18n } from 'vue-i18n'; // Import useI18n

// Register all necessary components for Chart.js
Chart.register(...registerables);

// Destructure the t (translate) function and locale from vue-i18n
const { t, locale } = useI18n();

// Define props accepted by this component
const props = defineProps({
  filterParams: {
    type: Object,
    default: () => ({}), // Provide a default empty object for robustness
  },
});

// Template ref for the canvas element where the chart will be rendered
const saleChart = ref(null);

// Chart.js instance variable, initialized to null
let chartInstance = null;

// Reactive variables to hold chart data (labels for X-axis, data for Y-axis)
const labels = ref([]);
const data = ref([]);

/**
 * Fetches sales summary data from the backend API.
 * It includes the current locale in the request to get translated labels from the server.
 * @param {object} params - Filter criteria (e.g., year, month, week, start_date, end_date, store).
 */
async function fetchSale(params) {
  try {
    // Get the user's preferred locale from localStorage, default to 'en'
    const currentLocale = localStorage.getItem('user_locale') || 'en';

    console.log(t('chartSalePeriod.fetching_sale_data_with_params'), params);

    // Make a POST request to the API, sending filter parameters in the body
    // and the locale as a query parameter for backend localization
    const response = await axios.post(`/api/sales/salesummaryperperiod?locale=${currentLocale}`, params);

    // Update reactive data with fetched labels and data
    labels.value = response.data.labels || [];
    data.value = response.data.data || [];

    // Render/update the chart with the new data
    renderChart();
  } catch (error) {
    console.error(t('chartSalePeriod.error_fetching_sale_data'), error);
    // On error, reset data to display an empty chart or its previous state
    labels.value = [];
    data.value = [];
    renderChart(); // Render empty chart on error
  }
}

/**
 * Renders or updates the Chart.js chart dynamically (line or bar).
 * Destroys any existing chart instance before creating a new one to prevent memory leaks.
 */
function renderChart() {
  if (!saleChart.value) {
    console.warn(t('chartSalePeriod.canvas_not_found_sale'));
    return;
  }

  // Destroy existing chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Determine chart type based on the number of data points
  // If there's only one data point, it's better represented as a bar; otherwise, a line.
  const chartType = data.value.length === 1 ? 'bar' : 'line';

  // Create a new Chart.js instance
  chartInstance = new Chart(saleChart.value, {
    type: chartType, // Dynamically set chart type
    data: {
      labels: labels.value, // X-axis labels (e.g., months, weeks, days)
      datasets: [{
        label: t('chartSalePeriod.total_sale_fcfa'), // Translated label for the dataset
        data: data.value, // Y-axis data (sale amounts)
        // Conditional styling based on chart type
        backgroundColor: chartType === 'bar' ? 'rgba(100, 200, 150, 0.8)' : 'rgba(100, 200, 150, 0.6)', // Greenish color
        borderColor: 'rgba(100, 200, 150, 1)',
        borderWidth: 2,
        tension: chartType === 'line' ? 0.3 : 0, // Smooth line for 'line' chart, sharp for 'bar'
        fill: chartType === 'line', // Fill area under the line only for 'line' chart
        borderRadius: chartType === 'bar' ? 8 : 0, // Rounded corners for bars
      }]
    },
    options: {
      responsive: true, // Chart will resize with its container
      maintainAspectRatio: false, // Allows height to be set freely (e.g., via `height` prop on canvas)
      scales: {
        y: {
          beginAtZero: true, // Y-axis starts at zero
          title: {
            display: true,
            text: t('chartSalePeriod.sales_amount_fcfa') // Translated Y-axis title
          },
          // Custom callback to format Y-axis tick labels as currency
          callback: function(value, index, ticks) {
            return value.toLocaleString(locale.value, { style: 'currency', currency: 'XAF' }); // Formats currency based on current locale
          }
        },
        x: {
          title: {
            display: true,
            text: t('chartSalePeriod.period') // Translated X-axis title
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top', // Legend position
        },
        tooltip: {
          mode: 'index', // Show tooltip for all datasets at the same index
          intersect: false, // Tooltip shows even if not directly over a bar
          callbacks: {
            // Custom callback to format tooltip labels as currency
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                // Use the current locale from vue-i18n for currency formatting
                label += context.parsed.y.toLocaleString(locale.value, { style: 'currency', currency: 'XAF' });
              }
              return label;
            }
          }
        }
      }
    }
  });
}

// Watch the `filterParams` prop for changes
// `immediate: true` triggers `fetchSale` on initial component mount
// `deep: true` detects changes to nested properties within the filterParams object
watch(() => props.filterParams, (newParams) => {
  if (newParams) {
    console.log(t('chartSalePeriod.filter_params_changed_sale'), newParams);
    fetchSale(newParams);
  } else {
    // If filterParams becomes null or undefined, clear the chart data
    labels.value = [];
    data.value = [];
    renderChart();
  }
}, { immediate: true, deep: true });

// Watch the `locale` from vue-i18n for changes
// When the locale changes, re-render the chart to apply new translations to static texts
watch(locale, () => {
    console.log('Locale changed, re-rendering purchase chart...');
    // When locale changes, we need to re-fetch data to get translated labels from backend
    // and then re-render. If filterParams exist, re-fetch with them.
    if (props.filterParams) {
      fetchSale(props.filterParams);
    } else {
      // If no filterParams are set yet (e.g., on initial load before filters are applied),
      // just re-render with current data (which might be empty) to update axis/legend.
      renderChart();
    }
});

// Lifecycle hook: Clean up the chart instance when the component is unmounted
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null; // Clear the reference to prevent memory leaks
  }
});
</script>

<style scoped>
/* Ensure the v-card takes full height from its parent */
.v-card {
  height: 100%;
}
</style>
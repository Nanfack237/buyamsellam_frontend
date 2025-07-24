<template>
  <v-card variant="text">
    <canvas ref="profitChart" height="370"></canvas>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import axios from '@/axios'; // Assuming your axios instance is correctly set up
import { Chart, registerables } from 'chart.js/auto';
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
const profitChart = ref(null);

// Chart.js instance variable, initialized to null
let chartInstance = null;

// Reactive variables to hold chart data (labels for X-axis, data for Y-axis)
const labels = ref([]);
const data = ref([]);

/**
 * Fetches profit data from the backend API.
 * It includes the current locale in the request to get translated labels from the server.
 * @param {Object} params - Filter criteria (e.g., year, month, week, store).
 */
async function fetchProfit(params) {
  try {
    // Get the user's preferred locale from localStorage, default to 'en'
    const currentLocale = localStorage.getItem('user_locale') || 'en';

    console.log(t('chartProfitPeriod.fetching_profit_data_with_params'), params);

    // Make a POST request to the API, sending filter parameters in the body
    // and the locale as a query parameter for backend localization
    const response = await axios.post(`/api/sales/profitsummaryperperiod?locale=${currentLocale}`, params);

    // Update reactive data with fetched labels and data
    labels.value = response.data.labels || [];
    data.value = response.data.data || [];

    // Render/update the chart with the new data
    renderChart();
  } catch (error) {
    console.error(t('chartProfitPeriod.error_fetching_profit_data'), error);
    // On error, reset data to display an empty chart or its previous state
    labels.value = [];
    data.value = [];
    renderChart(); // Render empty chart on error
  }
}

/**
 * Renders or updates the Chart.js bar chart.
 * Destroys any existing chart instance before creating a new one to prevent memory leaks.
 */
function renderChart() {
  if (!profitChart.value) {
    console.warn(t('chartProfitPeriod.canvas_not_found_profit'));
    return;
  }

  // Destroy existing chart instance if it exists
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create a new Chart.js instance
  chartInstance = new Chart(profitChart.value, {
    type: 'bar', // Specifies a bar chart
    data: {
      labels: labels.value, // X-axis labels (e.g., months, weeks, days)
      datasets: [{
        label: t('chartProfitPeriod.total_profit_fcfa'), // Translated label for the dataset
        data: data.value, // Y-axis data (profit amounts)
        backgroundColor: 'rgba(0, 128, 0, 0.6)', // Green color with transparency
        borderColor: 'rgba(0, 128, 0, 1)', // Solid green border
        borderWidth: 2,
        tension: 0.3, // Curve tension for line charts (ignored for bars)
        fill: true, // Fill area under the line (ignored for bars)
        borderRadius: 8, // Rounded corners for the bars
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
            text: t('chartProfitPeriod.profit_amount_fcfa') // Translated Y-axis title
          },
          // Custom callback to format Y-axis tick labels as currency
          callback: function(value, index, ticks) {
            return value.toLocaleString(locale.value, { style: 'currency', currency: 'XAF' }); // Formats currency based on current locale
          }
        },
        x: {
          title: {
            display: true,
            text: t('chartProfitPeriod.period') // Translated X-axis title
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
                label += new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'XAF' }).format(context.parsed.y);
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
// `immediate: true` triggers `fetchProfit` on initial component mount
// `deep: true` detects changes to nested properties within the filterParams object
watch(() => props.filterParams, (newParams) => {
  if (newParams) {
    fetchProfit(newParams);
  } else {
    // If filterParams becomes null or undefined, clear the chart data
    labels.value = [];
    data.value = [];
    renderChart();
  }
}, { immediate: true, deep: true });

// Watch the `locale` from vue-i18n for changes
// Watch the locale for changes and re-render the chart
watch(locale, () => {
    console.log('Locale changed, re-rendering purchase chart...');
    // When locale changes, we need to re-fetch data to get translated labels from backend
    // and then re-render. If filterParams exist, re-fetch with them.
    if (props.filterParams) {
      fetchProfit(props.filterParams);
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
/* Optional: Basic styling for the v-card and canvas to ensure proper sizing */
.v-card {
  /* No explicit height needed here if `canvas height="370"` is sufficient,
     or if its parent container manages its height. */
}

canvas {
  /* These are largely handled by Chart.js's responsive:true and maintainAspectRatio:false,
     but can serve as useful fallbacks or explicit overrides. */
  max-width: 100%;
  max-height: 100%;
}
</style>
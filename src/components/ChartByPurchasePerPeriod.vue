<template>
  <v-card style="height: 100%;" variant="text">
    <!-- This div will now take all remaining space within the v-card -->
    <canvas ref="purchaseChart" height="370"></canvas>
  </v-card>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import axios from '@/axios'; // Assuming your axios instance
import { Chart, registerables } from 'chart.js/auto';
import { useI18n } from 'vue-i18n'; // Import useI18n

Chart.register(...registerables);

const { t, locale } = useI18n(); // Destructure the t (translate) function and locale

// Define props accepted by this component
const props = defineProps({
  filterParams: Object, // Expecting an object with year, month, week, start_date, end_date, store
});

const purchaseChart = ref(null);
let chartInstance = null;

const labels = ref([]);
const data = ref([]);

/**
 * Fetches purchase summary data based on the provided filter parameters.
 * @param {object} params - Object containing filter criteria (year, month, week, start_date, end_date, store).
 */
async function fetchPurchase(params) {
  try {
    // Backend endpoint should be able to handle these filter parameters
    // We are using POST to send the filter parameters in the request body
    const responses = await axios.post('/api/purchases/purchasesummaryperperiod', params);

    // Assuming backend returns { labels: [], data: [] } for the chart
    labels.value = responses.data.labels || [];
    data.value = responses.data.data || [];

    renderChart();
  } catch (error) {
    console.error(t('chartPurchasePeriod.error_fetching_purchase_data'), error);
    // Reset data on error to display an empty chart
    labels.value = [];
    data.value = [];
    renderChart(); // Render empty chart
  }
}

/**
 * Renders or updates the Chart.js bar chart.
 */
function renderChart() {
  if (!purchaseChart.value) {
    console.warn(t('chartPurchasePeriod.canvas_not_found_purchase'));
    return;
  }

  // Destroy existing chart instance to prevent duplicates and memory leaks
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(purchaseChart.value, {
    type: 'bar',
    data: {
      labels: labels.value,
      datasets: [{
        label: t('chartPurchasePeriod.total_purchase_fcfa'),
        data: data.value,
        backgroundColor: 'rgba(247, 148, 29, 0.6)', // Orange color
        borderColor: 'rgba(247, 148, 29, 1)',
        borderWidth: 2,
        tension: 0.3, // Smooth the line for line chart, sharp for bar
        fill: true, // Fill area under the line only for line chart
        borderRadius: 8, // Rounded corners for bars
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Crucial for allowing chart to fill container height
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: t('chartPurchasePeriod.purchase_amount_fcfa') // Y-axis title
          },
          callbacks: {
            label: function(context) {
                // Use the current locale from vue-i18n for currency formatting
                return context.parsed.y.toLocaleString(locale.value, { style: 'currency', currency: 'XAF' });
            }
          }
        },
        x: {
          title: {
            display: true,
            text: t('chartPurchasePeriod.period') // X-axis title (e.g., Day, Month, Week)
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
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

// Watch the filterParams prop for changes and re-fetch data
watch(() => props.filterParams, (newParams) => {
  if (newParams) {
    console.log(t('chartPurchasePeriod.filter_params_changed_purchase'), newParams);
    fetchPurchase(newParams);
  }
}, { immediate: true, deep: true }); // immediate: true to fetch on initial mount, deep: true for object changes

// Watch the locale for changes and re-render the chart
watch(locale, () => {
    console.log('Locale changed, re-rendering purchase chart...');
    renderChart();
});

// Destroy chart instance when component is unmounted
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>

<style scoped>
/* No specific styles for this component provided in the original, so keeping it empty */
</style>
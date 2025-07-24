<template>
  <v-card style="height: 100%;" variant="text">
    <canvas ref="salesChart" style="min-height: max-content; min-width: max-content;"></canvas>
  </v-card>
</template>
 
<script setup>
import { ref, onMounted } from 'vue'; // Core Vue Composition API functions
import axios from 'axios'; // HTTP client for API requests
import { Chart, registerables } from 'chart.js/auto'; // Chart.js library and all its necessary components

// Register all Chart.js components (scales, elements, etc.) automatically.
// This is crucial for the chart to function correctly.
Chart.register(...registerables);

// Reactive reference to the HTML <canvas> element.
// `salesChart.value` will hold the actual DOM element once it's mounted.
const salesChart = ref(null);

// Variable to store the Chart.js instance.
// This allows us to control the chart lifecycle (e.g., destroy and re-create for updates).
let chartInstance = null;

// Reactive arrays to hold the data that will be displayed on the chart.
// `labels` will typically store the names of the months (e.g., 'January', 'February').
const labels = ref([]);
// `data` will store the corresponding total sales values for each month.
const data = ref([]);

/**
 * Asynchronously fetches monthly sales data from the backend API.
 * This function expects your backend's `/api/sales/totalMonth` endpoint
 * to return a JSON object with `labels` (an array of strings for month names)
 * and `data` (an array of numbers for total sales values).
 */
async function fetchSales() {
  try {
    // Make an HTTP GET request to your designated API endpoint for monthly sales.
    // Ensure your `axios` instance is correctly configured with your backend's base URL.
    const response = await axios.get('/api/sales/totalsalepermonth');
    
    // Update the reactive `labels` and `data` with the values received from the API response.
    labels.value = response.data.labels;
    data.value = response.data.data;
    
    // After successfully fetching new data, call `renderChart` to draw or update the chart.
    renderChart();
  } catch (error) {
    // Log any errors that occur during the API request (e.g., network issues, server errors).
    console.error('Error fetching monthly sales data:', error);
    // In a production application, you might want to display a user-friendly error message,
    // or set a state to indicate that data loading failed.
  }
}

/**
 * Renders or re-renders the Chart.js bar chart on the canvas element.
 * This function ensures that if a chart already exists, it is properly destroyed
 * before a new one is created, preventing rendering issues and memory leaks.
 */
function renderChart() {
  // Check if the canvas element is available in the DOM.
  // If `salesChart.value` is null, it means the component hasn't fully mounted yet or the ref isn't correctly assigned.
  if (!salesChart.value) {
    console.warn('Canvas element not found for sales chart rendering.');
    return; // Exit the function if the canvas is not ready.
  }

  // If a Chart.js instance already exists (meaning a chart was previously drawn), destroy it.
  // This cleans up the previous chart and prepares the canvas for the new one.
  if (chartInstance) {
    chartInstance.destroy();
  }

  // Create a new Chart.js instance.
  // The first argument is the actual DOM canvas element.
  // The second argument is the configuration object for the chart's type, data, and options.
  chartInstance = new Chart(salesChart.value, {
    type: 'bar', // Specifies that this will be a bar chart.
    data: {
      labels: labels.value, // X-axis labels (month names, fetched from backend).
      datasets: [{
        label: 'Monthly Sales (FCFA)', // Label for this dataset, displayed in the chart legend.
        data: data.value, // Y-axis values (total sales amounts, fetched from backend).
        backgroundColor: 'rgba(54, 162, 235, 0.6)', // Color of the bars (a shade of blue with 60% opacity).
        borderColor: 'rgba(54, 162, 235, 1)', // Border color for the bars.
        borderWidth: 1 // Thickness of the bar borders.
      }]
    },
    options: {
      responsive: true, // Makes the chart responsive, resizing automatically with its container.
      maintainAspectRatio: false, // Allows the chart to fill the entire height and width of its parent container
                                  // without maintaining a strict aspect ratio.
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    }
  });
}
 
// Vue Lifecycle Hook: `onMounted` is called once the component has been mounted to the DOM.
// We trigger the `fetchSales` function here to load initial data and render the chart
// as soon as the component is ready.
onMounted(fetchSales);
</script>

<style scoped>
/* Scoped styles ensure that these CSS rules only apply to the elements within this specific component. */
canvas {
  /* Crucial for making the chart responsive and fill its parent container.
     `!important` is used to ensure these styles override any conflicting default or inherited styles. */
  width: 100% !important; 
  height: 100% !important;
}
</style>
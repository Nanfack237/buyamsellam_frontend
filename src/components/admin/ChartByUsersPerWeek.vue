<template>
    <v-card style="height: 390px;" variant="text">
        <canvas ref="usersCreatedChart"></canvas>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto'; // Using 'chart.js/auto' for automatic registration
import { useI18n } from 'vue-i18n';

Chart.register(...registerables); // Register all necessary components from chart.js/auto

const { t, locale } = useI18n();

const usersCreatedChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const labels = ref<string[]>([]);
const data = ref<number[]>([]);

/**
 * Fetches the users created summary data from the backend.
 * Sends the current locale to the backend.
 */
async function fetchUsersCreated() {
    try {
        const currentLocale = localStorage.getItem('user_locale') || 'en';
        
        // Use the new endpoint for users
        const response = await axios.get(`/api/admin/userchartperweek?locale=${currentLocale}`);
        
        labels.value = response.data.labels;
        data.value = response.data.data;
        
        renderChart();
    } catch (error) {
        console.error('Error fetching users created summary:', error);
    }
}

/**
 * Renders or updates the Chart.js instance for user creation data.
 */
function renderChart() {
    if (!usersCreatedChart.value) return;

    if (chartInstance) {
        chartInstance.destroy(); // Destroy existing chart instance before creating a new one
    }

    chartInstance = new Chart(usersCreatedChart.value, {
        type: 'bar', // This is a bar chart
        data: {
            labels: labels.value,
            datasets: [{
                label: t('adminDashboard.usersChart.totalUsersCreatedChartLabel'), 
                data: data.value,
                backgroundColor: 'rgb(13, 71, 161, 0.6)', // A different color for users
                borderColor: 'rgb(13, 71, 161, 1)',
                borderWidth: 2,
                // Removed: tension: 0.3, // 'tension' is not applicable to 'bar' charts
                 // 'fill' is also typically for line charts, but harmless here
                borderRadius: 8, // Rounded corners for bars
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allows the chart to fill its container
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: t('adminDashboard.usersChart.usersCountAxis') 
                    },
                    ticks: {
                        stepSize: 1, // Ensure integer ticks for user count
                        precision: 0 // No decimal places
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: t('adminDashboard.usersChart.dayOfWeekAxis') 
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
                }
            }
        }
    });
}

// Lifecycle hook: Fetch data and render chart when component is mounted
onMounted(fetchUsersCreated);

// Watcher: Re-fetch data and re-render chart when the locale changes
watch(locale, () => {
    fetchUsersCreated(); // Re-fetch data to get labels in the new locale
}, { immediate: false }); // Do not run immediately on component creation; runs only on locale change
</script>

<style scoped>
/* Add any specific styles for your chart container if needed */
/* Example to make the canvas fill its parent card */
canvas {
  width: 100%;
  height: 100%;
}
</style>
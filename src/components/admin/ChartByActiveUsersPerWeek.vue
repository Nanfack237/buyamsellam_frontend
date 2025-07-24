<template>
    <v-card style="height: 390px;" variant="text">
        <canvas ref="activeUsersChart"></canvas>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';
import { useI18n } from 'vue-i18n';

Chart.register(...registerables);

const { t, locale } = useI18n();

// Change ref name to match active users chart
const activeUsersChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const labels = ref<string[]>([]);
const data = ref<number[]>([]);

/**
 * Fetches the weekly unique active users data from the backend.
 * Sends the current locale to the backend.
 */
async function fetchWeeklyActiveUsers() {
    try {
        // Get locale from local storage, default to 'en' if not found
        // Using 'user_locale' as per your provided code
        const currentLocale = localStorage.getItem('user_locale') || 'en';
        
        // **Change API endpoint to the active users endpoint**
        const response = await axios.get(`/api/admin/activeuserchartperweek?locale=${currentLocale}`);
        
        labels.value = response.data.labels; // Labels are already translated by backend
        data.value = response.data.data;
        
        renderChart(); // Render chart after fetching data
    } catch (error) {
        console.error('Error fetching weekly active users summary:', error);
    }
}

/**
 * Renders or updates the Chart.js instance.
 */
function renderChart() {
    if (!activeUsersChart.value) return;

    if (chartInstance) {
        chartInstance.destroy(); // Destroy existing chart instance before creating a new one
    }

    chartInstance = new Chart(activeUsersChart.value, {
        type: 'line', // Already set to line, which is good for trends
        data: {
            labels: labels.value, // Labels are already translated by backend
            datasets: [{
                // --- TRANSLATION CHANGE HERE ---
                label: t('adminDashboard.activeUsersChart.totalActiveUsersChartLabel'), 
                data: data.value,
                // **Change colors for active users**
                backgroundColor: 'rgba(100, 200, 150, 0.6)', // Blueish color
                borderColor: 'rgba(100, 200, 150, 1)',
                borderWidth: 2,
                tension: 0.3, // Smooth the line
                fill: true, 
                pointBackgroundColor: 'rgba(100, 200, 150, 1)', // Points on the line
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(100, 200, 150, 1)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow chart to fill container
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        // --- TRANSLATION CHANGE HERE ---
                        text: t('adminDashboard.activeUsersChart.usersCountAxis') 
                    },
                    ticks: {
                        stepSize: 1, // Ensure integer ticks for user count
                        precision: 0 // No decimal places
                    }
                },
                x: {
                    title: {
                        display: true,
                        // --- TRANSLATION CHANGE HERE ---
                        text: t('adminDashboard.activeUsersChart.dayOfWeekAxis') 
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

// Fetch data on component mount
onMounted(fetchWeeklyActiveUsers);

// Watch for changes in the locale and re-fetch data
watch(locale, () => {
    fetchWeeklyActiveUsers(); // Re-fetch data to get labels in the new locale
}, { immediate: false }); 
</script>

<style scoped>
/* Add any specific styles for your chart container if needed */
</style>
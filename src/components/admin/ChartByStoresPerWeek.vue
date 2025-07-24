<template>
    <v-card style="height: 390px;" variant="text">
        <canvas ref="storesCreatedChart"></canvas>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';
import { useI18n } from 'vue-i18n';

Chart.register(...registerables);

const { t, locale } = useI18n();

const storesCreatedChart = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const labels = ref<string[]>([]);
const data = ref<number[]>([]);

/**
 * Fetches the stores created summary data from the backend.
 * Sends the current locale to the backend.
 */
async function fetchStoresCreated() {
    try {
        // Get locale from local storage, default to 'en' if not found
        const currentLocale = localStorage.getItem('user_locale') || 'en';
        
        // Include the locale as a query parameter
        const response = await axios.get(`/api/admin/storechartperweek?locale=${currentLocale}`);
        
        // Backend now sends translated labels, so no need to map with t() here
        labels.value = response.data.labels;
        data.value = response.data.data;
        
        renderChart(); // Render chart after fetching data
    } catch (error) {
        console.error('Error fetching stores created summary:', error);
    }
}

/**
 * Renders or updates the Chart.js instance.
 */
function renderChart() {
    if (!storesCreatedChart.value) return;

    if (chartInstance) {
        chartInstance.destroy(); // Destroy existing chart instance before creating a new one
    }

    chartInstance = new Chart(storesCreatedChart.value, {
        type: 'line', // Bar chart type
        data: {
            labels: labels.value, // Labels are already translated by backend
            datasets: [{
                // --- TRANSLATION CHANGE HERE ---
                label: t('adminDashboard.storesChart.totalStoresCreatedChartLabel'), 
                data: data.value,
                backgroundColor: 'rgba(247, 148, 29, 0.6)', // A different color for stores
                borderColor: 'rgba(247, 148, 29, 1)',
                borderWidth: 2,
                tension: 0.3, // Smooth the line
                fill: true, 
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
                        text: t('adminDashboard.storesChart.storesCountAxis') 
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
                        text: t('adminDashboard.storesChart.dayOfWeekAxis') 
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
onMounted(fetchStoresCreated);

// Watch for changes in the locale and re-fetch data
// This is essential because the labels and axis titles need to update
// even if the data doesn't change when the language is switched.
watch(locale, () => {
    fetchStoresCreated(); // Re-fetch data to get labels in the new locale
}, { immediate: false }); // immediate: false means it won't run on initial mount, only on changes
</script>

<style scoped>
/* Add any specific styles for your chart container if needed */
</style>
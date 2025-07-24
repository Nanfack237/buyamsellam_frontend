<template>
    <v-card style="height: 390px;" variant="text">
        <canvas ref="usersCreatedChart"></canvas>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';
import { useI18n } from 'vue-i18n';

Chart.register(...registerables);

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
        chartInstance.destroy();
    }

    chartInstance = new Chart(usersCreatedChart.value, {
        type: 'bar',
        data: {
            labels: labels.value,
            datasets: [{
                // --- TRANSLATION CHANGE HERE ---
                label: t('adminDashboard.usersChart.totalUsersCreatedChartLabel'), 
                data: data.value,
                backgroundColor: 'rgb(13, 71, 161, 0.6)', // A different color for users
                borderColor: 'rgb(13, 71, 161, 1)',
                borderWidth: 2,
                tension: 0.3, 
                fill: true, 
                borderRadius: 8,  
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        // --- TRANSLATION CHANGE HERE ---
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
                        // --- TRANSLATION CHANGE HERE ---
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

onMounted(fetchUsersCreated);

watch(locale, () => {
    fetchUsersCreated(); // Re-fetch data to get labels in the new locale
}, { immediate: false });
</script>

<style scoped>
/* Add any specific styles for your chart container if needed */
</style>
<template>
    <v-card style="height: 390px;" variant="text">
        <canvas ref="purchaseChart"></canvas>
    </v-card>
</template>
 
<script setup>
import { ref, onMounted, watch } from 'vue'; // Import 'watch'
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';
import { useI18n } from 'vue-i18n'; // Import useI18n

Chart.register(...registerables);

const { t, locale } = useI18n(); // Destructure t and locale

const purchaseChart = ref(null);
let chartInstance = null;

const labels = ref([]);
const data = ref([]);

async function fetchPurchase(){
    try {
        const response = await axios.get('/api/purchases/purchasesummary');
        
        // Translate the labels coming from the backend
        labels.value = response.data.labels.map(label => t(label)); 
        
        data.value = response.data.data;
        renderChart(); // Render chart after fetching data
    } catch (error) {
        console.error('Error fetching purchase summary:', error);
    }
}

function renderChart(){
    if(!purchaseChart.value) return;

    if (chartInstance){
        chartInstance.destroy(); // Destroy existing chart instance before creating a new one
    }

    chartInstance = new Chart(purchaseChart.value, {
        type: 'bar',
        data: {
            // Labels are now already translated from fetchPurchase
            labels: labels.value, 
            datasets: [{
                label: t('totalPurchaseChartLabel'), // Translated label
                data: data.value,
                backgroundColor: 'rgba(247, 148, 29, 0.6)',
                borderColor: 'rgba(247, 148, 29, 1)',
                borderWidth: 2,
                tension: 0.3, 
                fill: true, 
                borderRadius: 8, 
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
                        text: t('purchaseAmountAxis') // Translated Y-axis title
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: t('periodAxis') // Translated X-axis title
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
 
watch(locale, () => {
  
    console.log(t('chartPurchasePeriod.filter_params_changed_purchase'));
    fetchPurchase();

}, { immediate: true, deep: true }); // immediate: true to fetch on initial mount, deep: true for object changes

// Watch the locale for changes and re-render the chart


// Destroy chart instance when component is unmounted
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
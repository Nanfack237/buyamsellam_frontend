<template>
    <v-card style="height: 390px;" variant="text">
        <canvas ref="saleChart"></canvas>
    </v-card>
</template>
 
<script setup>
import { ref, onMounted, watch } from 'vue'; // Import 'watch'
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';
import { useI18n } from 'vue-i18n'; // Import useI18n

Chart.register(...registerables);

const { t, locale } = useI18n(); // Destructure t and locale

const saleChart = ref(null);
let chartInstance = null;

const labels = ref([]);
const data = ref([]);

async function fetchSale(){
    try {
        const response = await axios.get('/api/sales/salesummary');
        
        // Translate the labels coming from the backend
        labels.value = response.data.labels.map(label => t(label)); 
        
        data.value = response.data.data;
        renderChart(); // Render chart after fetching data
    } catch (error) {
        console.error('Error fetching sale summary:', error);
    }
}

function renderChart(){
    if(!saleChart.value) return;

    if (chartInstance){
        chartInstance.destroy(); // Destroy existing chart instance before creating a new one
    }

    chartInstance = new Chart(saleChart.value, {
        type: 'line',
        data: {
            // Labels are now already translated from fetchSale
            labels: labels.value, 
            datasets: [{
                label: t('totalSaleChartLabel'), // Translated label
                data: data.value,
                backgroundColor: 'rgba(100, 200, 150, 0.6)', // Greenish color
                borderColor: 'rgba(100, 200, 150, 1)',
                borderWidth: 2,
                tension: 0.3, // Smooth the line
                fill: true, // Fill area under the line
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
                        text: t('salesAmountAxis') // Translated Y-axis title
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: t('periodAxis') // Translated X-axis title (reusing existing key)
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
  
    console.log(t('chartSalePeriod.filter_params_changed_sale'));
    fetchSale();

}, { immediate: true, deep: true }); // immediate: true to fetch on initial mount, deep: true for object changes

// Watch the locale for changes and re-render the chart


// Destroy chart instance when component is unmounted
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});

</script>
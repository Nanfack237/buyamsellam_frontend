<template>
    <v-card style="height: 390px;" variant="text">
      <canvas ref="profitChart" style="min-height: max-content; min-width: max-content;"></canvas>
    </v-card>
</template>
 
<script setup>
import { ref, onMounted, watch } from 'vue'; // Import 'watch'
import axios from 'axios';
import { Chart, registerables } from 'chart.js/auto';
import { useI18n } from 'vue-i18n'; // Import useI18n

Chart.register(...registerables);

const { t, locale } = useI18n(); // Destructure t and locale

const profitChart = ref(null);
let chartInstance = null;

const labels = ref([]);
const data = ref([]);

async function fetchProfit(){
    try {
        const response = await axios.get('/api/sales/totalprofitweek');
        
        // Translate the labels coming from the backend
        labels.value = response.data.labels.map(label => t(label)); 
        
        data.value = response.data.data;
        renderChart(); // Render chart after fetching data
    } catch (error) {
        console.error('Error fetching profit summary:', error);
    }
}

function renderChart(){
    if(!profitChart.value) return;

    if (chartInstance){
        chartInstance.destroy(); // Destroy existing chart instance before creating a new one
    }

    chartInstance = new Chart(profitChart.value, {
        type: 'bar',
        data: {
            // Labels are now already translated from fetchProfit
            labels: labels.value, 
            datasets: [{
                label: t('totalProfitChartLabel'), // Translated label
                data: data.value,
                backgroundColor: 'rgba(0, 128, 0, 0.6)',
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
                        text: t('profitAmountAxis') // Translated Y-axis title
                    },
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
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Format the tooltip value as currency based on current locale
                                label += new Intl.NumberFormat(locale.value === 'fr' ? 'fr-CM' : 'en-CM', { style: 'currency', currency: 'XAF' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}
 
watch(locale, () => {
  
    console.log(t('chartProfitPeriod.fetching_profit_data_with_params'));
    fetchProfit();

}, { immediate: true, deep: true }); // immediate: true to fetch on initial mount, deep: true for object changes

// Watch the locale for changes and re-render the chart


// Destroy chart instance when component is unmounted
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
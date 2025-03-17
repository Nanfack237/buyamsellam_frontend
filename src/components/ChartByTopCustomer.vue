<template>
    <v-card style="height: 100%;"  variant="text">
        <canvas id="topCustomerChart"></canvas>
    </v-card>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Chart from 'chart.js/auto';
  
  const chartData = ref({
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Samedi', 'Sunday'],
    datasets: [{
      label: 'Sales',
      data: [10000, 25000, 40000, 31000, 2000, 50000, 22000],
      backgroundColor: 'rgba(255, 255, 0, 0.2)',
      borderColor: 'rgba(255, 255, 0, 1)',
      borderWidth: 1
    }
    ]
  });
  
  onMounted(() => {
    const ctx = document.getElementById('topCustomerChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: chartData.value,
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
  </script>
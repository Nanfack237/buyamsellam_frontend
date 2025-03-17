<template>
    <v-card style="height: 100%;" class="py-3" variant="text">
        <canvas id="mostChart"></canvas>
    </v-card>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import Chart from 'chart.js/auto';
  
  const chartData = ref({
    labels: ['Airforce', 'Air Jordan', 'Stansmith', 'Jordan 1', 'Macqueen'],
    datasets: [{
      label: 'Most Sold Product',
      data: [20 , 16, 13, 9, 3],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }
    ]
  });
  
  onMounted(() => {
    const ctx = document.getElementById('mostChart').getContext('2d');
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
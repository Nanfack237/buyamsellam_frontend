<template>
  <v-app>
    <v-card style="height: 100%;">
      <v-layout>
        <SideBarComponent />
        <HeaderComponent />
        <v-main style="height: 100%">
          <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2" style="">
            <v-col cols="auto" class="">
              <p class="font-weight-bold text-h6" style="color: #0D47A1;">
                Stores
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100 " color="blue-darken-4"></v-divider>
          </v-row>

          <template v-if="filteredStores.length === 0">
            <v-row class="justify-center align-center px-4 py-5" style="margin-top: 13%;margin-bottom: 13%;">
              <v-col cols="12" class="">
                <p class="text-medium-emphasis text-center">
                  Please create a store and manage your inventory to boost your Business
                </p>
              </v-col>

              <v-col cols="12" class="text-center pt-4">
                <v-btn color="blue-darken-4" to="/create-store">Create a Store&nbsp;&nbsp;<v-icon>mdi-store-plus</v-icon></v-btn>
              </v-col>
            </v-row>
          </template>

          <template v-else>
            <v-row class="d-flex px-5 pt-2">
              <v-col cols="12" sm="8" md="9">
                <p class="text-medium-emphasis">
                  Please select a store to manage and access its specific settings and data
                </p>
              </v-col>
              <v-col cols="12" md="3" sm="4">
                <v-text-field
                  v-model="search"
                  density="compact"
                  label="Search By Name"
                  prepend-inner-icon="mdi-store-search"
                  variant="solo-filled"
                  flat
                  hide-details
                  single-line
                />
              </v-col>
            </v-row>

            <v-row class="justify-center align-center px-4 py-1" >
              <v-col cols="auto" class="py-2" sm="6" md="4" v-for="(store, index) in filteredStores" :key="index">
                <v-card class="mx-auto"  hover @click="handleStoreSelection(store)" link to="/dashboard" min-width ="150">
                  <v-img
                    class="align-end text-white "
                    height="150"
                    src="@/assets/login3.jpg"
                    cover
                  >
                    <v-card-title>{{ store.name }}</v-card-title>
                  </v-img>

                  <v-card-subtitle class="pt-4">
                    <b style="color: #0D47A1;">Category:</b> {{ store.category }}
                  </v-card-subtitle>

                  <v-card-text>
                    <div><b style="color: #0D47A1;">Contact:</b>&nbsp;&nbsp;{{ store.contact }}</div>
                    <div><b style="color: #0D47A1;">Location:</b>&nbsp;&nbsp;{{ store.location }}</div>
                    <div >{{ store.description }}</div>
                  </v-card-text>

                  <v-card-actions class="justify-end">
                    <v-btn color="warning">edit &nbsp;<v-icon class="">mdi-store-edit</v-icon></v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </template>
          <FooterComponent />
        </v-main>
      </v-layout>
    </v-card>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios'; // Assuming you have an axios instance configured
import { computed } from 'vue';

const formattedDate = computed(() => {
  const date = new Date();
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const day = daysOfWeek[date.getDay()];
  const formattedDateString = date.toLocaleDateString();

  return `${day}, ${formattedDateString}`;
});

const stores = ref([]);
const search = ref('');
const filteredStores = computed(() => {
  return stores.value.filter(store => {
    return store.name.toLowerCase().includes(search.value.toLowerCase());
  });
});

const selectedStore = ref(null);

onMounted(async () => {
  try {
    const response = await axios.get('/api/stores'); // Replace with your actual endpoint
    stores.value = response.data.stores; // Assuming the API returns data in a 'stores' property

    // Check if a store ID is stored in local storage
    const storedId = localStorage.getItem('storeId');
    if (storedId) {
      // Find the selected store based on the ID
      selectedStore.value = stores.value.find(store => store.id === storedId);
    }
  } catch (error) {
    console.error('Error fetching stores:', error);
  }
});

const handleStoreSelection = (selectedStore) => {
  // Store the selected store ID in local storage
  localStorage.setItem('storeId', selectedStore.id);

  // Navigate to the dashboard page with the selected store ID as a query parameter
  router.push('/add-store');
};
</script>
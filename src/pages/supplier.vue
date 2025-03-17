<template>
    <v-app>
      <v-card style="height: 100%;">
        <v-layout>
          <SideBarComponent />
          <HeaderComponent />
          <v-main style="height: 599px">
            <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2" style="">
            <v-col cols="auto" class="">
              <p class="font-weight-bold text-h6" style="color: #0D47A1;">
                Supplier
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
            <v-divider class="border-opacity-100 " color="blue-darken-4"></v-divider>
            </v-row>
              
            <v-row class="d-flex px-5 pt-2">
              <v-col cols="12" sm="8" md="9">
                <p class="text-medium-emphasis">
                  
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
            <v-row class="px-7" >
                <v-card elevation="2" width="3000"  class="my-2 py-2 px-5">
                    <p class="font-weight-medium py-2">
                        All Products <v-icon class="pl-3">mdi-package</v-icon>
                    </p>
                    <v-divider class="border-opacity-100" color="blue-darken-4"></v-divider>
                    
                    <v-data-table :items="suppliers" id="printable-content" :headers="headers" :key="index" class="centered-headers" hide-default-footer :sort-by="[{ key: 'Name', order: 'asc' }]">
                      <template v-slot:item.actions="{ item }">
                        <v-btn icon size="small" class="mx-2" color="primary" @click="editSupplier(item)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon size="small" onclick="confirm('do you really want to delete');" color="error" @click="deleteSupplier(item)">
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </template>
                    </v-data-table>
                </v-card>
             </v-row>
            
            <AppFooter />
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
  
  const suppliers = ref([]);
  const search = ref('');
  const filteredProduct = computed(() => {
    return products.value.filter(product => {
      return product.name.toLowerCase().includes(search.value.toLowerCase());
    });
  });
  
  onMounted(() => {
    fetchSuppliers();
  });
 
  const headers = ref([
      { title: 'Name', value: 'name' ,  align: 'center'},
      { title: 'Address', value: 'address',  align: 'center' },
      { title: 'Contact', value: 'contact',  align: 'center' },
      { title: 'Actions', value: 'actions',  align: 'center', sortable: false },
  ]);
  async function fetchSuppliers() {
    try {
      const response = await axios.get('/api/suppliers'); // Replace with your actual endpoint
      suppliers.value = response.data.suppliers; // Assuming the API returns data in a 'products' property
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  }
  async function deleteProduct(item) {
  try {
    const response = await axios.delete(`/api/suppliers/delete/${item.id}`); // Replace with your actual endpoint
    if (response.status === 200) {
      // Remove the deleted study from the studies array
      const index = products.value.indexOf(item);
      if (index !== -1) {
        products.value.splice(index, 1);
      }
    } else {
      console.error('Error deleting a supplier:', response.data.error);
    }
  } catch (error) {
    console.error('Error deleting deleting:', error);
  }
}
//   onMounted(async () => {
//     try {
//       const response = await axios.get('/api/stores'); // Replace with your actual endpoint
//       stores.value = response.data.stores; // Assuming the API returns data in a 'stores' property
  
//       // Check if a store ID is stored in local storage
//       const storedId = localStorage.getItem('storeId');
//       if (storedId) {
//         // Find the selected store based on the ID
//         selectedStore.value = stores.value.find(store => store.id === storedId);
//       }
//     } catch (error) {
//       console.error('Error fetching stores:', error);
//     }
//   });
  
//   const handleStoreSelection = (selectedStore) => {
//     // Store the selected store ID in local storage
//     localStorage.setItem('storeId', selectedStore.id);
  
//     // Navigate to the dashboard page with the selected store ID as a query parameter
//     router.push('/create-store');
//   };
  </script>
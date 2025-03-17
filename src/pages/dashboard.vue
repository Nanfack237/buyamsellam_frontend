<template>
    <v-app>
      <v-card style="height: 100%;">
        <v-layout>
          <SideBarComponent />
          <HeaderComponent />
          <v-main >
            <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2" style="">
            <v-col cols="auto" class="">
              <p class="font-weight-bold text-h6" style="color: #0D47A1;">
                Dashboard
              </p>
            </v-col>

            <v-col cols="auto">
              <p class="text-right text-medium-emphasis">
                {{ formattedDate }}
              </p>
            </v-col>
                <v-divider class="border-opacity-100 " color="blue-darken-4"></v-divider>
            </v-row>
              
            <v-row class="d-flex justify-center align-center px-4 py-3" style="height: max-content;">

              <v-col cols="12" md="3">
                <v-card elevation="3" hover @click="">
                  <v-card-item>
                    <v-row>
                      <v-col md="4" class="d-flex justify-center">
                        <v-icon class="py-12" color="blue-lighten-2" size="40" icon="mdi-package"></v-icon>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col md="8">
                        <v-card-sub-title class="text-disabled">Inventory Level</v-card-sub-title>
                        <v-card-text class="pt-2">
                          <h2>500</h2>
                        </v-card-text>
                        <p class="text-caption text-lowercase text-medium-emphasis">
                          more info <v-icon size="15">mdi-arrow-right</v-icon>
                        </p>
                      </v-col>
                      
                    </v-row>
                  </v-card-item>
                </v-card>

              </v-col>
              <v-col cols="12" md="3" >
                <v-card elevation="3" hover @click="">
                  <v-card-item>
                    <v-row>
                      <v-col md="4" class="d-flex justify-center">
                        <v-icon class="py-12" color="orange-darken-4" size="40" icon="mdi-package-down"></v-icon>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col md="8">
                        <v-card-sub-title class="text-disabled">Total Purchased</v-card-sub-title>
                        <v-card-text class="pt-2">
                          <h2>50</h2>
                        </v-card-text>
                        <p class="text-caption text-lowercase text-medium-emphasis">
                          more info <v-icon size="15">mdi-arrow-right</v-icon>
                        </p>
                      </v-col>
                    </v-row>
                  </v-card-item>
                </v-card>

              </v-col>

              <v-col cols="12" md="3">
                <v-card elevation="3" hover @click="">
                  <v-card-item>
                    <v-row>
                      <v-col md="4" class="d-flex justify-center">
                        <v-icon class="py-12" color="yellow-lighten-1" size="40" icon="mdi-cart-outline"></v-icon>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col md="8" style="color:">
                        <v-card-sub-title class="text-disabled">Total Ordered</v-card-sub-title>
                        <v-card-text class="pt-2">
                          <h2>100</h2>
                        </v-card-text>
                        <p class="text-caption text-lowercase text-medium-emphasis">
                          more info <v-icon size="15">mdi-arrow-right</v-icon>
                        </p>
                      </v-col>
                    </v-row>
                  </v-card-item>
                </v-card>

              </v-col>

              <v-col cols="12" md="3">
                <v-card elevation="3" hover @click="">
                  <v-card-item>
                    <v-row>
                      <v-col  md="4"  class="d-flex justify-center">
                        <v-icon class="py-12" color="success" size="40" icon="mdi-cash-multiple"></v-icon>
                      </v-col>
                      <v-divider vertical></v-divider>
                      <v-col  md="8" style="color: #43A047;">
                        <v-card-sub-title class="text-disabled">Total Profit</v-card-sub-title>
                        <v-card-text class="pt-2">
                          <h3>50000 XAF</h3>
                        </v-card-text>
                        <p class="text-caption text-lowercase text-medium-emphasis">
                          more info <v-icon size="15">mdi-arrow-right</v-icon>
                        </p>
                      </v-col>
                      
                    </v-row>
                  </v-card-item>
                </v-card>

              </v-col>

            </v-row>    

            <v-row cols="12" class="px-7 py-2" >
              <v-card elevation="4" width="3000">
                <v-card-item>
                    <p class="font-weight-medium py-2">
                      Transaction Collection
                    </p>
                  <v-divider class="border-opacity-100 pb-2" color="blue-darken-4"></v-divider>
                  <v-row>
                    <v-col cols="12" md="6">
                      <center>
                        <ChartByExpenses />
                      </center>
                    </v-col>
                    <v-col cols="12" md="6">
                      <center>
                        <ChartByTopCustomer />
                      </center>
                    </v-col>
                  </v-row>
                </v-card-item>
              </v-card>
            </v-row>

            <v-row cols="12" class="px-4 py-1" >
                <v-col cols="12" md="6" sm="12">
                    <v-card elevation="4">
                        <v-card-item >
                          <p class="font-weight-medium py-2">
                            Most Sold Product
                          </p>
                          <v-divider class="border-opacity-100 pb-2" color="blue-darken-4"></v-divider>
                            <center>
                              <ChartByMostSale />
                            </center>
                       
                        </v-card-item>
                    </v-card>
                </v-col>
                <v-col  cols="12" md="3" sm="6">
                    <v-card elevation="4">
                        <v-card-item>
                          <p class="font-weight-medium py-2">
                            Top Customer
                          </p>
                          <v-divider class="border-opacity-100 pb-2" color="blue-darken-4"></v-divider>
                        
                          <v-data-table :items="topCustomer" id="printable-content" :headers="headers_customer" class="centered-headers" hide-default-footer :sort-by="[{ key: 'TopCustomer', order: 'asc' }]">
                          
                          </v-data-table>
                       
                        </v-card-item>
                    </v-card>
                </v-col>
                <v-col cols="12" md="3" sm="6">
                    <v-card elevation="4">
                        <v-card-item>
                          <p class="font-weight-medium py-2">
                            Top Product
                          </p>
                          <v-divider class="border-opacity-100 pb-2" color="blue-darken-4"></v-divider>
                          <v-data-table :items="topProduct" id="printable-content" :headers="headers_product" class="centered-headers" hide-default-footer :sort-by="[{ key: 'TopCustomer', order: 'asc' }]">
                          
                          </v-data-table>
                       
                        </v-card-item>
                    </v-card>
                </v-col>
            </v-row>
          
           
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
  
  const topCustomer = ref([
  {
    sn: 1,
    name: 'Apple',
   
  },
  {
    sn: 2,
    name: 'Kelian',
  },
  {
    sn: 3,
    name: 'Donald',
   
  },
  {
    sn: 4,
    name: 'Alexa',
   
  },

  ]);
    const headers_product = ref([
        { title: 'SN', value: 'sn' ,  align: 'center'},
        { title: 'Name', value: 'name',  align: 'center' },
    ]);
  
    const topProduct = ref([
  {
    sn: 1,
    name: 'AirForce',
   
  },
  {
    sn: 2,
    name: 'Stan Smith',
  },
  {
    sn: 3,
    name: 'Air Jordan',
   
  },
  {
    sn: 4,
    name: 'Samba',
   
  },
  ]);
    const headers_customer = ref([
        { title: 'SN', value: 'sn' ,  align: 'center'},
        { title: 'Name', value: 'name',  align: 'center' },
    ]);
  const selectedStore = ref(null);
  
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
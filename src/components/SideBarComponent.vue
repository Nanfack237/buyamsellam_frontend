
<script setup>
import { ref, onMounted } from 'vue';
import axios from '@/axios';

const drawer = ref(true);
const rail = ref(false);
const userEmail = ref('');
const storeName = ref('');
const hasStoreId = ref(false);

onMounted(async () => {
  try {
    const response = await axios.get('/api/me'); // Replace with your endpoint URL
    userEmail.value = response.data.user.email; // Assuming the endpoint response contains an 'email' property

    // const storeResponse = await axios.get('/api/stores/show'); // Replace with your endpoint to get the current user's store
    // storeName.value = storeResponse.data.store.name;
    const storeresponse = await axios.get('/api/stores/show'); // Replace with your actual endpoint
    storeName.value = storeresponse.data.stores.name; // Assuming the API returns data in a 'stores' property

    // Check if a store ID is stored in local storage
    const storeId = localStorage.getItem('storeId');
    if (storeId) {
      // Find the selected store based on the ID
      selectedStore.value = stores.value.find(store => store.id === storedId);
    }
  } catch (error) {
    console.error('Error fetching user email:', error);
  }


  const storedId = localStorage.getItem('storeId');
  hasStoreId.value = storedId !== null; // Check if storeId exists in local storage

});

const toggleRail = () => {
  rail.value = !rail.value;
};
</script>

<style scoped>
.mdi-icon {
  color: white;
}
</style>
<template>
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click.stop="toggleRail"
      color="blue-darken-4"
      style="max-width: 110%;"
      >
      <v-list-item
        class="py-3"
        style="padding-bottom: 0px;"
        prepend-avatar="@/assets/login5.jpg"
        :title="userEmail"
        height="60"
        nav
      >
        <template v-slot:append>
          <v-btn icon="mdi-chevron-left mdi-icon" variant="text" @click.stop="toggleRail" />
        </template>
        <template v-if="hasStoreId">
          <p class="text-medium-emphasis" >
            <v-icon size="40" color="success" class="p">mdi-circle-small</v-icon><span style="color: #90CAF9; font-size: smaller;">{{ storeName }}</span>
          </p>
        </template>
        
      </v-list-item>
      <!-- <v-list-item v-if="hasStoreId" :title="storeName" color="blue-lighten-5"  nav class="text-caption text-center" style="color: #90CAF9; padding-top: 0px; padding-bottom: 0px;"><v-icon size="40" color="success" class="pr-5">mdi-circle-small</v-icon>Hans Shop</v-list-item> -->

      <v-divider></v-divider>
  
      <v-list nav>
        <!-- <v-list-item link to="/dashboard" prepend-icon="mdi-view-dashboard mdi-icon" title="Dashboard" value="dashboard"></v-list-item> -->
        <template v-if="hasStoreId">
          <v-list-item link to="/dashboard" prepend-icon="mdi-view-dashboard mdi-icon" title="Dashboard" value="home"></v-list-item>
          <v-list-item link to="/stock" prepend-icon="mdi-package-variant-closed mdi-icon" title="Stock" value="stock"></v-list-item>

          <v-list-group prepend-icon="mdi-package mdi-icon" >
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props"  title="Product" value="product"></v-list-item>
            </template>

            <v-list-item link to="/product" prepend-icon="mdi-view-list mdi-icon" title="List of Products"></v-list-item>
            <v-list-item link to="/add-product" prepend-icon="mdi-plus-circle mdi-icon" title="Add Product"></v-list-item>
          </v-list-group>

          <v-list-group prepend-icon="mdi-package-variant-plus mdi-icon" >
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" title="Purchase" value="purchase"></v-list-item>
            </template>

            <v-list-item link to="/purchase" prepend-icon="mdi-view-list mdi-icon" title="Purchase Transactions"></v-list-item>
            <v-list-item link to="/add-purchase" prepend-icon="mdi-plus-circle mdi-icon" title="Do a Purchase"></v-list-item>
          </v-list-group>
          <v-list-group prepend-icon="mdi-package-variant-closed-minus mdi-icon" value="sale">
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props"  title="Sale" ></v-list-item>
            </template>

            <v-list-item link to="/sale" prepend-icon="mdi-view-list mdi-icon" title="Sale transactions"></v-list-item>
            <v-list-item link to="/add-sale" prepend-icon="mdi-plus-circle mdi-icon" title="Do a sale"></v-list-item>
          </v-list-group>
          <v-list-group prepend-icon="mdi-truck mdi-icon" >
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props"  title="Supplier" value="supplier"></v-list-item>
            </template>

            <v-list-item link to="/supplier" prepend-icon="mdi-view-list mdi-icon" title="List of suppliers"></v-list-item>
            <v-list-item link to="/add-supplier" prepend-icon="mdi-plus-circle mdi-icon" title="add supplier"></v-list-item>
          </v-list-group>
          <v-list-item link to="/customer" prepend-icon="mdi-account-details mdi-icon" title="Customer"></v-list-item>
        </template>

        <template v-else>
          <v-list-group prepend-icon="mdi-store mdi-icon" >
            <template v-slot:activator="{ props }">
              <v-list-item v-bind="props" link to="/store" title="Store" value="store"></v-list-item>
            </template>

            <v-list-item link to="/create-store" prepend-icon="mdi-plus-circle mdi-icon" title="Create a Store"></v-list-item>
            
          </v-list-group>
        </template>

        <!-- <v-list-group prepend-icon="mdi-account-group mdi-icon">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" link to="/employee"  title="Employee" value="employee"></v-list-item>
          </template>

          <v-list-item link to="/add-employee" prepend-icon="mdi-plus-circle mdi-icon" title="Add an Employee"></v-list-item>
        </v-list-group> -->
        <v-list-item prepend-icon="mdi-cog mdi-icon" title="Settings" value="setting"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
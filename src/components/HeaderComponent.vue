<template>
    <v-app-bar class="text-high-emphasis" title="Inventory management System"
      height="60"
      
    >
   
      <template v-slot:title >
        <span
          class=" text-truncate font-weight-bold text-h6"
          style="max-width: 100%; color: #0D47A1;"
        >
        Inventory Management System
        </span>
      </template> 
      
      <div class="px-2">
        <span class="pr-2" style="color: #0D47A1;"><v-icon>mdi-bell</v-icon></span>
        <v-btn @click="toggleLanguage" variant="text"><v-icon>mdi-google-translate</v-icon></v-btn>
        <v-btn onclick="confirm('Are you sure you want to log out ?');"  @click="handleLogout"   variant="text"><v-icon>mdi-logout</v-icon></v-btn>
        </div>
    </v-app-bar>
  </template>
<script setup>
import { ref } from 'vue';
import axios from '@/axios';
import { useRouter } from 'vue-router';
import { useLocale } from 'vuetify'

 const router = useRouter();
 
 const drawer = ref(true);
 const rail = ref(true);
 
 const { current } = useLocale() // Set the initial locale

const toggleLanguage = () => {
  currentLocale.value = currentLocale.value === 'en' ? 'fr' : 'en';
  // Update the i18n instance with the new locale
  i18n.locale = currentLocale.value;
};

 const handleLogout = async () => {
   try {
    const token = localStorage.getItem('access_token')
    const response = await axios.post('/api/logout',
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
    });
 
     if (response.data.success) {
       // Successful logout
       console.log('Logout successful');
       
       localStorage.removeItem('access_token');
       localStorage.removeItem('storeId');
       
       setTimeout(() => router.push('/login'), 2000);
       // Redirect after delay
     } else {
       console.error('Logout failed:', response.data.error);
       // Handle unsuccessful logout (e.g., display error message)
     }
   } catch (error) {
     console.error('Logout error:', error);
     // Handle logout error (e.g., display error message)
   }
 };
 </script>
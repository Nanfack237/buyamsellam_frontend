<template>
    <v-app>
      <v-card :loading="loading">
        <v-layout>
          <SideBarComponent />
          <HeaderComponent />
          <v-main  class="h-screen" style="min-height: max-content;">
            <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2">
              <v-col cols="auto" class="">
                <p class="text-high-emphasis text-h6" >
                  Supplier 
                </p>
              </v-col>
              <v-col cols="auto">
                <p class="text-right text-medium-emphasis">{{ formattedDate }}</p>
              </v-col>
              <v-divider class="border-opacity-100 " color="grey-lighten-1"></v-divider>

            </v-row>
            
            <form @submit.prevent="CreateSupplier">
              <v-container>
                <p class="text-medium-emphasis py-2 pb-5">
                  Please enter the details to add a supplier
                </p>
                <v-row>
                    <v-col cols="12" sm="6" md="6" class="" style="padding-bottom: 0px;">
                        <v-text-field
                            label="Enter the Name"
                            v-model="name"
                            variant="outlined"
                            :rules="[
                            (v) => !!v || 'Name is required'
                            ]"
                        ></v-text-field>
                    </v-col>
  
                    <v-col cols="12" sm="6" md="6" class="" style="padding-bottom: 0px;">
                        <v-text-field
                            label="Enter the Address"
                            v-model="address"
                            variant="outlined"
                            :rules="[
                            (v) => !!v || 'Address is required'
                            ]"
                        ></v-text-field>
                
                    </v-col>
                    <v-col cols="12" sm="6" md="12" class="" style="padding-bottom: 0px;">
                        <v-text-field
                            label="Enter the Contact"
                            v-model="contact"
                            variant="outlined"
                            :rules="[v => !!v || 'Contact is required', v => v.length >= 9 || 'Minimum 9 characters']" 
                        ></v-text-field>
                    </v-col>
                </v-row>
              </v-container>
              <v-responsive style="text-align: center" class="pb-13">
                <v-btn type="submit" :loading="loading" color="primary">
                    Save&nbsp;&nbsp;<v-icon>mdi-content-save</v-icon>
                </v-btn>
              </v-responsive>
            </form>
            <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="top right">
                {{ snackbarMessage }}
            </v-snackbar>
            <AppFooter />
          </v-main>
        </v-layout>
      </v-card>
    </v-app>
   
  </template>
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';
import { computed } from 'vue'
import { useLoader } from '@/useLoader';

const { startLoading, stopLoading} = useLoader();
    
  
    const formattedDate = computed(() => {
      
   
      const date = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = daysOfWeek[date.getDay()];   
    
      const formattedDateString = date.toLocaleDateString();
    
      return `${day}, ${formattedDateString}`;

     
    });
    
    
    const router = useRouter();
    const selectedImage = ref(null);
    const loading = ref(false);
    const snackbar = ref(false);
    const snackbarMessage = ref('');
    const snackbarColor = ref('');
    const name = ref('');
    const address = ref('');
    const contact = ref('');
  
    const CreateSupplier = async () => {
      loading.value = true;
      startLoading()
      try {
        const formData = new FormData();
        formData.append('name', name.value);
        formData.append('address', address.value);
        formData.append('contact', contact.value);
  
        const token =sessionStorage.getItem('access_token')
        const response = await axios.post('/api/suppliers/store', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
    
        if (response.status === 201) {
          
          snackbar.value = true;
          snackbarMessage.value = response.data.success || 'Supplier created successfully!';
          snackbarColor.value = 'success';
          setTimeout(() => router.push('/supplier'), 2000);

        } else {
          console.error('Error saving supplier:', response.data);
          snackbar.value = true;
          snackbarMessage.value = response.data.error || 'An error occurred while saving the supplier.';
          snackbarColor.value = 'error';
        }
      } catch (error) {
        console.error('Error saving store:', error);
        snackbar.value = true;
        snackbarMessage.value = 'An unexpected error occurred.';
        snackbarColor.value = 'error';
      } finally {
        loading.value = false;
        stopLoading()
      }
    };
    
  </script>
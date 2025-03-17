<template>
    <v-app>
      <v-card style="height: 100%;" :loading="loading">
        <v-layout>
          <SideBarComponent />
          <HeaderComponent />
          <v-main style="">
            <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2">
              <v-col cols="auto" class="">
                <p class="font-weight-bold text-h6 " style="color:#0D47A1;">
                  Sale Transaction <v-icon>mdi-package-variant-minus</v-icon>
                </p>
              </v-col>
              <v-col cols="auto">
                <p class="text-right text-medium-emphasis">{{ formattedDate }}</p>
              </v-col>
              <v-divider class="border-opacity-100 " color="blue-darken-4"></v-divider>
  
            </v-row>
  
            <form @submit.prevent="CreateStore">
              <v-container>
                <p class="text-medium-emphasis py-2 pb-5">
                  Please enter the details to do a Sale transaction
                </p>
                <v-row>
                  <v-col cols="12" sm="6" md="6" class="" style="padding-bottom: 0px;">
                    <v-select label="Choose a product" v-model="selectedProduct" :items="productLists" item-text="name"
                      item-value="id" variant="outlined" :rules="[
                        (v) => !!v || 'Product is required'
                      ]"></v-select>

                    
                  </v-col>
                  <v-col cols="12" sm="6" md="6" class="" style="padding-bottom: 0px;">
                    

                    <v-text-field v-model="quantity" label="Quantity" type="number" variant="outlined" persistent-hint
                      :rules="[v => !!v || 'This Quantity is required', v => v.length >= 1 || 'Minimum 3 characters']" />
                  
                  </v-col>
  
                  <v-col cols="12" sm="6" md="6" class="" style="padding-bottom: 0px;">
                    <v-select label="Choose stock" v-model="selecteSupplier" :items="suppliLists" item-text="name"
                      item-value="id" variant="outlined" :rules="[
                        (v) => !!v || 'Stock is required'
                      ]"></v-select>

                   </v-col>
                   <v-col cols="12" sm="6" md="6" class="" style="padding-bottom: 0px;">

                    <v-text-field v-model="unit_price" label="Unit Price" type="number" variant="outlined" persistent-hint
                      :rules="[v => !!v || 'This Unit Price is required', v => v.length >= 1 || 'Minimum 3 characters']" />
                  
                   </v-col>
                  
                </v-row>
              </v-container>
              <v-responsive style="text-align: center" class="pb-13 pt-5">
                <v-btn type="submit" :loading="loading" color="primary">
                  Save&nbsp;&nbsp;<v-icon>mdi-content-save</v-icon>
                </v-btn>
              </v-responsive>
            </form>
            <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="bottom right">
              {{ snackbarMessage }}
            </v-snackbar>
            <FooterComponent />
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
  
  onMounted(() => {
    fetchProducts();
    fetchSuppliers();
    //   fetchSpecialities();
  });
  
  const formattedDate = computed(() => {
    const date = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = daysOfWeek[date.getDay()];
  
    const formattedDateString = date.toLocaleDateString();
  
    return `${day}, ${formattedDateString}`;
  });
  
  const selectedImage = ref(null);
  const loading = ref(false);
  const snackbar = ref(false);
  const snackbarMessage = ref('');
  const snackbarColor = ref('');
  const name = ref('');
  const category = ref('');
  const description = ref('');
  const image = ref("images");
  
  
  const selectedProduct = ref('');
  
  const products = ref([]);
  const productLists= [];
  async function fetchProducts() {
    try {
      const response = await axios.get('/api/products'); // Replace with your actual endpoint
      const productNames = response.data.products.map((product) => productLists.push({
        id: product.id,
        name: product.name
      })); // Extract titles
      products.value = productNames;
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };
  
  const suppliers = ref([]);
  let supplierLists = [];
  async function fetchSuppliers() {
    try {
      const response = await axios.get('/api/suppliers'); // Replace with your actual endpoint
      const supplierNames = response.data.suppliers.map((supplier) => supplierLists.push({
        id: supplier.id,
        name: supplier.name
      })); // Extract titles
      suppliers.value = supplierNames;
    } catch (error) {
      console.error('Error fetching studies:', error);
    }
  }
  
  const stocks = ref([]);
  let stockLists = [];
  async function fetchStocks() {
    try {
      const response = await axios.get('/api/suppliers'); // Replace with your actual endpoint
      const supplierNames = response.data.suppliers.map((supplier) => supplierLists.push({
        id: supplier.id,
        name: supplier.name
      })); // Extract titles
      suppliers.value = supplierNames;
    } catch (error) {
      console.error('Error fetching studies:', error);
    }
  }
  const onFileSelected = (event) => {
    const file = event.target.files[0];
  
    if (file) {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        selectedImage.value = event.target.result;
      };
  
      reader.readAsDataURL(file);
    }
  };
  
  const CreateStore = async () => {
    loading.value = true;
    console.log(selectedImage)
    try {
      const formData = new FormData();
      formData.append('name', name.value);
      formData.append('category', category.value);
      formData.append('description', description.value);
      formData.append('image', image.value);
  
      const token = localStorage.getItem('access_token')
      const response = await axios.post('/api/purchase/store', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (response.status === 201) {
        // Store created successfully
        snackbar.value = true;
        snackbarMessage.value = response.data.success || 'Product saved successfully!';
        snackbarColor.value = 'success';
        setTimeout(() => router.push('/add-product'), 2000);
        // Optionally, redirect to a success page or display a success message
  
        // Create the store folder
        // const storeFolderName = name.value.replace(/\s+/g, '_').toLowerCase(); // Replace spaces with underscores
        // const storeFolderPath = `assets/store/${storeFolderName}/images/`; // Replace with your desired path
  
        // try {
        //   await fs.promises.mkdir(storeFolderPath, { recursive: true }); // Create the folder recursively
        //   console.log('Store folder created successfully:', storeFolderPath);
  
        //   // Save the image to the folder
        //   const imageFileName = Date.now() + '_' + file.name; // Generate a unique filename
        //   const imageFilePath = `${storeFolderPath}/images/${imageFileName}`;
  
        //   await fs.promises.writeFile(imageFilePath, selectedImage.value.replace(/^data:image\/png;base64,/, ''));
        //   console.log('Image saved successfully:', imageFilePath);
        // } catch (folderError) {
        //   console.error('Error creating store folder:', folderError);
        //   // Handle folder creation error
        // }
      } else {
        console.error('Error saving product:', response.data);
        snackbar.value = true;
        snackbarMessage.value = response.data.error || 'An error occurred while saving the product.';
        snackbarColor.value = 'error';
      }
    } catch (error) {
      console.error('Error saving store:', error);
      snackbar.value = true;
      snackbarMessage.value = 'An unexpected error occurred.';
      snackbarColor.value = 'error';
    } finally {
      loading.value = false;
    }
  };
  </script>
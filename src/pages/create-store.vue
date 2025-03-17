<template>
    <v-app>
      <v-card style="height: 100%;" :loading="loading">
        <v-layout>
          <SideBarComponent />
          <HeaderComponent />
          <v-main style="height: 100%">
            <v-row justify="space-between" class="d-flex justify-center px-5 pt-4 pb-2">
              <v-col cols="auto" class="">
                <p class="font-weight-bold text-h6" style="color: #0D47A1;">
                  Create a Store <v-icon>mdi-store</v-icon>
                </p>
              </v-col>
              <v-col cols="auto">
                <p class="text-right text-medium-emphasis">{{ formattedDate }}</p>
              </v-col>
              <v-divider class="border-opacity-100 " color="blue-darken-4"></v-divider>

            </v-row>
            
            <form @submit.prevent="CreateStore">
              <v-container>
                <p class="text-medium-emphasis py-2">
                  Please enter the details to create your store
                </p>
                <v-row>
                  <v-col cols="12" sm="6" md="4" class="">
                    <v-card flat border="grey-lighten-4 thin opacity-60" class="border-thin" height="290">
                      <v-card-title class="text-medium-emphasis">Add Photo</v-card-title>
                      <v-card-text>
                        <v-file-input
                          accept="image/*"
                          @change="onFileSelected"
                          prepend-icon="mdi-camera"
                          variant="plain"
                          v-model="image"
                        />
                        <v-img v-if="selectedImage" :src="selectedImage" class="mt-5" />
                      </v-card-text>
                    </v-card>
                  </v-col>
  
                  <v-col cols="12" sm="6" md="8" class="">
                    <v-text-field
                      v-model="name"
                      label="Name"
                      type="text"
                      variant="outlined"
                      persistent-hint
                      :rules="[v => !!v || 'This field is required', v => v.length >= 3 || 'Minimum 3 characters']"
                    />
                    <v-text-field
                      v-model="category"
                      label="Category"
                      type="text"
                      variant="outlined"
                      persistent-hint
                      :rules="[v => !!v || 'This field is required', v => v.length >= 3 || 'Minimum 3 characters']"
                    />
                    <v-text-field
                      v-model="location"
                      label="Location"
                      type="text"
                      variant="outlined"
                      persistent-hint
                      :rules="[v => !!v || 'This field is required', v => v.length >= 3 || 'Minimum 3 characters']"
                    />
                    <v-text-field
                      v-model="contact"
                      label="Contact"
                      type="text"
                      variant="outlined"
                      persistent-hint
                      :rules="[v => !!v || 'This field is required', v => v.length >= 3 || 'Minimum 3 characters']"
                    />
                    </v-col>
                    <v-col cols="12"  class="mb-2" style="padding-top: 0px;">
                      <v-textarea
                        v-model="description"
                        label="Description"
                        variant="outlined"
                        :rules="[v => !!v || 'This field is required']"
                        persistent-hint
                        
                      />
                    </v-col>
                </v-row>
              </v-container>
              <v-responsive style="text-align: center" class="">
                <v-btn type="submit" :loading="loading" color="primary">
                    Create &nbsp;&nbsp;<v-icon>mdi-store-plus</v-icon>
                </v-btn>
              </v-responsive>
            </form>
            <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="snackbarTimeout" location="bottom right">
                {{ snackbarMessage }}
            </v-snackbar>
            <FooterComponent/>
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
  
  const selectedImage = ref(null);
  const loading = ref(false);
  const snackbar = ref(false);
  const snackbarMessage = ref('');
  const snackbarColor = ref('');
  const name = ref('');
  const category = ref('');
  const location = ref('');
  const contact = ref('');
  const description = ref('');
  const image = ref("images");
  
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
      formData.append('location', location.value);
      formData.append('contact', contact.value);
      formData.append('description', description.value);
      formData.append('image', image.value);

      const token =localStorage.getItem('access_token')
      const response = await axios.post('/api/stores/create-store', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
  
      if (response.status === 201) {
        // Store created successfully
        console.log('Store created successfully:', response.data.stores);
        snackbar.value = true;
        snackbarMessage.value = response.data.success || 'Store created successfully!';
        snackbarColor.value = 'success';
        setTimeout(() => router.push('/create-store'), 2000);
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
        console.error('Error creating store:', response.data);
        snackbar.value = true;
        snackbarMessage.value = response.data.error || 'An error occurred while creating the store.';
        snackbarColor.value = 'error';
      }
    } catch (error) {
      console.error('Error creating store:', error);
      snackbar.value = true;
      snackbarMessage.value = 'An unexpected error occurred.';
      snackbarColor.value = 'error';
    } finally {
      loading.value = false;
    }
  };
  </script>
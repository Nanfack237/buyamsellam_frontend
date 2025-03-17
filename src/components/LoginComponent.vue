<template>
  <v-app>
    <div class="backgruond"></div>
    <v-main class="d-flex justify-center align-center">
      
      <v-row>
        <v-col cols="12" class="py-2" md="7">
          <v-card class="pa-12 mt-10" variant="text" height="370">
            <h1 class="text-h2" style="color: white;">
              | {{ text }} |
              <v-icon color="blue-darken-4">mdi-emoticon-outline </v-icon> 
            </h1>
          </v-card>
        </v-col>
     
      <v-col md="5" lg="4" sm="7" class="mx-auto my-auto">
        
        <v-card class="mx-6 my-4 pa-4" height="" elevation="12" >
          <div class="text-center">
            <v-avatar size="80" color="blue-darken-4">
              <v-icon size="40" color="white">mdi-account</v-icon>
            </v-avatar>
            <h2 class="p--text pa-4">IMS Login</h2>
          </div>
          <v-form  ref="form" @submit.prevent="SubmitLogin">
            <v-card-text>
              <v-text-field
                v-model="email"
                :rules="emailRules"
                type="email"
                label="Email"
                placeholder="Email"
                prepend-inner-icon="mdi-account"
                required
              />
              <v-text-field
                      v-model="password"
                      :rules="passwordRules"
                      :type="passwordShow?'text':'password'"
                      label="Password"
                      placeholder="Password"
                      prepend-inner-icon="mdi-key"
                      :append-icon="passwordShow ? 'mdi-eye':'mdi-eye-off'"
                      @click:append="passwordShow = !passwordShow"
                      required
              />
              <v-switch label="Remember me" color="blue-darken-4"></v-switch>
              <v-card-actions class="justify-center">
                <v-btn :loading="loading" type="submit" color="blue-darken-4">
                  <span color="blue-darken-4" class="bleu px-8">Login<v-icon class="pb-1">mdi-login</v-icon></span>
                </v-btn>
              </v-card-actions>
            </v-card-text>
            
          </v-form>
        </v-card>
      </v-col>
    </v-row>
    </v-main>
    <div class="md-3 text-center ma-2">
    <v-snackbar
      v-model="snackbar"
      color="red"
      elevation="4"
      location="bottom left"

    >
      {{ error }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar = false"
        >
        <v-icon color="black-lighten-2">mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>   

  </div>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/axios';

onMounted(() => {
  typewriter();
});

const loading = ref(false);
const snackbar = ref(false);
const error = ref(`Invalid email or password`);
const passwordShow = ref(false);
const email = ref('');
const password = ref('');

const emailRules = [
  (v) => !!v || 'E-mail is required',
  (v) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
];

const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => (v && v.length >= 8) || 'Password must be 8 characters or more!',
];

const formRef = ref(null);
const router = useRouter();


const text = ref('');
const index = ref(0);
const message = ref("Glad you're here! Let's optimize your inventory and boost your business, Get started! ");


function typewriter() {
  const interval = setInterval(() => {
    text.value = message.value.slice(0, ++index.value);

    if (index.value === message.value.length) {
      clearInterval(interval);
      erase();
    }
  }, 100); // Adjust the interval (in milliseconds) for typing speed
}

function erase() {
  const interval = setInterval(() => {
    text.value = text.value.slice(0, --index.value);

    if (index.value === 0) {
      clearInterval(interval);
      typewriter();
    }
  }, 50); // Adjust the interval for erasing speed
}
const alert = ref(false);

const SubmitLogin = async () =>  {

    loading.value = true;
    try 
    {
      const response = await axios.post('/api/auth/login', {
        email: email.value,
        password: password.value,
      });

      if (response.data.error) {
        console.error('Login failed:', response.data.error);
        snackbar.value = true;
       
      } else {

        const token = response.data.token; // Assuming token is received in response

        localStorage.setItem('access_token', token);

        console.log('Login successful');
        router.push('/store'); // Assuming you're using Vue Router
  
      }
    } catch (error) {
      console.error('API call error:', error);

      snackbar.value = true;
      // Handle API errors (e.g., network issues)
    } finally {
      loading.value = false;
    }
  }

</script>
<style>
  .backgruond{
    background-image: url(@/assets/login5.jpg) !important;
    height: 100%;
    width: 100%;
    display: block;
    position: absolute;
    top: 0;
    background-size: cover;
    filter: blur(3px)

  }

</style>

/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue';
import router from './router';
import axios from './axios';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { en, fr } from 'vuetify/locale'; // Import Vuetify's built-in locales

// Import Vue I18n
import { createI18n } from 'vue-i18n';

// Import your custom language message files
import enMessages from './locales/en.json';
import frMessages from './locales/fr.json';

// --- Vue I18n Setup ---
const i18nMessages = {
  en: enMessages,
  fr: frMessages,
};

const storedLocale = localStorage.getItem('user_locale') || 'en';

const i18n = createI18n({
  legacy: false,          // Use the Composition API style
  locale: storedLocale,           // Default locale for your custom text
  fallbackLocale: 'en',   // Fallback locale for custom text
  messages: i18nMessages, // Your application's custom messages
});

// --- Vuetify Setup ---
const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'en', // Default locale for Vuetify's internal components
    fallback: 'en',
    messages: { en, fr }, // Include Vuetify's own locale messages
  },
  // Other Vuetify configurations like themes, icons etc.
});

const app = createApp(App);

// Remove the access_token and store_id if the browser is closed without login

// const lastUnload = parseInt(localStorage.getItem('lastUnload') || '0', 10);
// const now = Date.now();
// if(now - lastUnload > 1000) {
//   localStorage.removeItem('access_token');
//   localStorage.removeItem('storeId');
// }

// window.addEventListener('beforeunload', () =>{
//       localStorage.setItem('lastUnload', Date.now().toString());
      
// })

app.use(axios);
app.use(vuetify);
app.use(i18n); 

registerPlugins(app)

app.mount('#app')




// main.ts
//
// Bootstraps Vuetify and other plugins then mounts the App`
//

// Plugins
import { registerPlugins } from '@/plugins'; // Assuming this correctly imports and registers your plugins

// Components
import App from './App.vue';

// Composables / Vue & Library Imports
import { createApp } from 'vue';
import axios from './axios'; // Assuming './axios' is a valid path to your axios instance
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles'; // <--- THIS IS THE CRUCIAL LINE ADDED FOR VUETIFY STYLES AND TYPE RECOGNITION
import '@mdi/font/css/materialdesignicons.css'; // <--- ADDED/CONFIRMED FOR MATERIAL DESIGN ICONS
import { en, fr } from 'vuetify/locale'; // Import Vuetify's built-in locales

// Import Vue I18n
import { createI18n } from 'vue-i18n';

// Import your custom language message files
// main.ts
import enMessages from './locales/en.json'; // MUST match file system casing
import frMessages from './locales/fr.json'; // MUST match file system casing

console.log('English Messages:', enMessages); // Add this line
console.log('French Messages:', frMessages); // Add this line

// --- Vue I18n Setup ---
const i18nMessages = {
  en: enMessages,
  fr: frMessages,
};

const storedLocale = localStorage.getItem('user_locale') || 'en';

const i18n = createI18n({
  legacy: false,          // Use the Composition API style
  locale: storedLocale,   // Default locale for your custom text
  fallbackLocale: 'en',   // Fallback locale for custom text
  messages: i18nMessages, // Your application's custom messages
});

// --- Vuetify Setup ---
// Removed the duplicate import for vuetify from './plugins/vuetify'
// as createVuetify is used directly here.
const vuetifyInstance = createVuetify({ // Renamed to vuetifyInstance to avoid conflict
  components,
  directives,
  locale: {
    locale: 'en', // Default locale for Vuetify's internal components
    fallback: 'en',
    messages: { en, fr }, // Include Vuetify's own locale messages
  },
  // Other Vuetify configurations like themes, icons etc.
  // For example, if you want to explicitly define the icon font:
  // icons: {
  //   defaultSet: 'mdi',
  //   sets: {
  //     mdi,
  //   },
  // },
});

const app = createApp(App);

// Your commented-out code for session management (leaving as is):
// const lastUnload = parseInt(localStorage.getItem('lastUnload') || '0', 10);
// const now = Date.now();
// if(now - lastUnload > 1000) {
//   localStorage.removeItem('access_token');
//   localStorage.removeItem('storeId');
// }

// window.addEventListener('beforeunload', () =>{
//     localStorage.setItem('lastUnload', Date.now().toString());
// })

// --- Register Plugins / Use Services ---
// Correct way to make Axios available globally: add to globalProperties
app.config.globalProperties.$axios = axios; // Now accessible as this.$axios or inject('$axios')

app.use(vuetifyInstance); // Use the correctly named Vuetify instance
app.use(i18n);

registerPlugins(app); // Assuming this is defined in '@/plugins/index.ts' and exports registerPlugins

app.mount('#app');

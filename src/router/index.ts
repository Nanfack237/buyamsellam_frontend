/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue` with login page handling
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto';
import { routes } from 'vue-router/auto-routes';
 // Assuming your login page is in src/pages/login.vue

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Automatic routes from vue-router/auto-routes
    ...routes,
    {
      path: '/login',
      name: 'Login',

      // Use a functional component for simpler rendering of login page (optional)
      component: () => import(/* webpackChunkName: "login" */ '@/pages/login.vue'),

      // Alternatively, directly render the login page if it's static HTML
      // component: login, // Comment out if using functional component import
    },
  ],
});

// Add access token guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token');
  if (!token && to.path !== '/login') {
    next({ name: 'Login' }); // Redirect to login view
    return;
  }
  next();
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;
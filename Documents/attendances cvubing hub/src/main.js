import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { testConnection } from './supabase' // Import the test function
import syncManager from './utils/syncManager.js' // Import sync manager
import 'vue-multiselect/dist/vue-multiselect.css'

// Test Supabase connection on app initialization
testConnection().then(isConnected => {
  if (!isConnected) {
    console.error("Initial Supabase connection test failed. Check credentials, RLS policies, and network.");
    // Optionally, show a user-facing error message here
  }
});

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

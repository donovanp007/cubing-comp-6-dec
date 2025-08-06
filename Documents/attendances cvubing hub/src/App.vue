<template>
  <div class="app">
    <!-- Loading State -->
    <div v-if="loading" class="loading-screen">
      <div class="loading-content">
        <div class="spinner"></div>
        <h2>Loading Attendance App</h2>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="connectionError" class="error-screen">
      <div class="error-content">
        <i class="fas fa-exclamation-triangle"></i>
        <h2>Connection Error</h2>
        <p>Unable to connect to database. Please check your internet connection.</p>
        <button @click="retryConnection">Retry</button>
      </div>
    </div>

    <!-- Main App Content -->
    <div v-else>
      <OfflineStatusIndicator />
      <nav class="navbar">
        <div class="nav-brand">
          <button class="mobile-menu-btn" @click="toggleMobileMenu" v-show="isMobile">
            <i class="fas fa-bars" v-if="!showMobileMenu"></i>
            <i class="fas fa-times" v-else></i>
          </button>
          <img src="./assets/logo.svg" alt="Attendance App" class="logo">
          <span class="brand-name">Attendance App</span>
        </div>
        
        <!-- Desktop Navigation -->
        <div class="nav-links desktop-nav" v-show="!isMobile">
          <router-link to="/" class="nav-link" active-class="active">
            <i class="fas fa-chart-bar"></i>
            <span>Overview</span>
          </router-link>
          <router-link to="/coach-dashboard" class="nav-link" active-class="active">
            <i class="fas fa-home"></i>
            <span>Coach Dashboard</span>
          </router-link>
          <router-link to="/schools" class="nav-link" active-class="active">
            <i class="fas fa-school"></i>
            <span>Schools</span>
          </router-link>
          <router-link to="/students" class="nav-link" active-class="active">
            <i class="fas fa-user-graduate"></i>
            <span>Students</span>
          </router-link>
          <router-link to="/gamification" class="nav-link" active-class="active">
            <i class="fas fa-trophy"></i>
            <span>Gamification</span>
          </router-link>
          <router-link to="/workbook" class="nav-link" active-class="active">
            <i class="fas fa-book"></i>
            <span>Workbook</span>
          </router-link>
          <router-link to="/term-manager" class="nav-link" active-class="active">
            <i class="fas fa-calendar-alt"></i>
            <span>Terms</span>
          </router-link>
          <router-link to="/quick-registration" class="nav-link quick-reg" active-class="active">
            <i class="fas fa-user-plus"></i>
            <span>Quick Reg</span>
          </router-link>
        </div>
        
        <div class="nav-user">
          <button class="theme-toggle">
            <i class="fas fa-moon"></i>
          </button>
        </div>
      </nav>

      <!-- Mobile Navigation Drawer -->
      <div class="mobile-drawer-overlay" v-show="showMobileMenu && isMobile" @click="closeMobileMenu"></div>
      <nav class="mobile-drawer" :class="{ 'open': showMobileMenu }" v-show="isMobile">
        <div class="drawer-header">
          <div class="drawer-brand">
            <img src="./assets/logo.svg" alt="Attendance App" class="drawer-logo">
            <span class="drawer-brand-name">Attendance App</span>
          </div>
        </div>
        
        <div class="drawer-links">
          <router-link to="/" class="drawer-link" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-chart-bar"></i>
            <span>Overview</span>
          </router-link>
          <router-link to="/coach-dashboard" class="drawer-link" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-home"></i>
            <span>Coach Dashboard</span>
          </router-link>
          <router-link to="/schools" class="drawer-link" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-school"></i>
            <span>Schools</span>
          </router-link>
          <router-link to="/students" class="drawer-link" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-user-graduate"></i>
            <span>Students</span>
          </router-link>
          <router-link to="/gamification" class="drawer-link" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-trophy"></i>
            <span>Gamification</span>
          </router-link>
          <router-link to="/workbook" class="drawer-link" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-book"></i>
            <span>Workbook</span>
          </router-link>
          <router-link to="/term-manager" class="drawer-link" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-calendar-alt"></i>
            <span>Terms</span>
          </router-link>
          <router-link to="/quick-registration" class="drawer-link quick-reg" active-class="active" @click="closeMobileMenu">
            <i class="fas fa-user-plus"></i>
            <span>Quick Registration</span>
          </router-link>
        </div>
      </nav>
      
      <div class="content">
        <Suspense>
          <router-view></router-view>
          <template #fallback>
            <div class="loading">
              <div class="spinner"></div>
              Loading...
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script>
import OfflineStatusIndicator from './components/OfflineStatusIndicator.vue'
import { testConnection } from './supabase'

export default {
  name: 'App',
  components: {
    OfflineStatusIndicator
  },
  data() {
    return {
      loading: true,
      connectionError: false,
      showMobileMenu: false,
      isMobile: false
    }
  },
  async created() {
    await this.checkConnection()
    this.checkScreenSize()
    window.addEventListener('resize', this.checkScreenSize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkScreenSize)
  },
  methods: {
    async checkConnection() {
      this.loading = true
      this.connectionError = false
      
      try {
        const isConnected = await testConnection()
        if (!isConnected) {
          throw new Error('Connection failed')
        }
      } catch (error) {
        this.connectionError = true
        console.error('Connection error:', error)
      } finally {
        this.loading = false
      }
    },
    retryConnection() {
      this.checkConnection()
    },
    checkScreenSize() {
      this.isMobile = window.innerWidth <= 768
      if (!this.isMobile) {
        this.showMobileMenu = false
      }
    },
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    closeMobileMenu() {
      this.showMobileMenu = false
    }
  }
}
</script>

<style>
:root {
  --primary-color: #007AFF;
  --primary-dark: #0056CC;
  --success-color: #34C759;
  --danger-color: #FF3B30;
  --warning-color: #FF9500;
  --text-color: #1C1C1E;
  --text-secondary: #3A3A3C;
  --text-light: #8E8E93;
  --background-light: #F2F2F7;
  --background-secondary: #FFFFFF;
  --border-color: #C6C6C8;
  --nav-height: 60px;
  --content-max-width: 1200px;
  --border-radius: 12px;
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  
  /* iOS-style variables for consistency */
  --ios-primary: #007AFF;
  --ios-primary-rgb: 0, 122, 255;
  --ios-primary-dark: #0056CC;
  --ios-secondary: #5856D6;
  --ios-success: #34C759;
  --ios-warning: #FF9500;
  --ios-warning-dark: #FF8C00;
  --ios-destructive: #FF3B30;
  --ios-background-primary: #F2F2F7;
  --ios-background-secondary: #FFFFFF;
  --ios-background-elevated: #FFFFFF;
  --ios-text-primary: #1C1C1E;
  --ios-text-secondary: #3A3A3C;
  --ios-text-tertiary: #8E8E93;
  --ios-border-light: #E5E5E7;
  --ios-border-medium: #C6C6C8;
  --ios-font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  --ios-font-display: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', sans-serif;
  background: #F2F2F7;
  color: #1C1C1E;
  line-height: 1.47;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* iOS-inspired Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--text-color);
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

h2 {
  font-size: 2rem;
  font-weight: 600;
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
}

button, input, select, textarea {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

button {
  font-weight: 500;
  letter-spacing: -0.01em;
}

.text-large {
  font-size: 1.125rem;
  line-height: 1.4;
}

.text-secondary {
  color: var(--text-secondary);
}

.text-light {
  color: var(--text-light);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  height: var(--nav-height);
  background: var(--background-secondary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 1px 0 var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 32px;
  width: auto;
}

.brand-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: var(--text-light);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link i {
  font-size: 1.1rem;
}

.nav-link:hover {
  color: var(--primary-color);
  background: var(--background-light);
}

.nav-link.active {
  color: var(--primary-color);
  background: var(--background-light);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.theme-toggle:hover {
  background: var(--background-light);
  color: var(--primary-color);
}

.content {
  margin-top: var(--nav-height);
  flex: 1;
  padding: 2rem;
  max-width: var(--content-max-width);
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
  gap: 1rem;
  color: var(--text-light);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--background-light);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-screen,
.error-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-light);
  z-index: 10000;
}

.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  max-width: 300px;
}

.error-content i {
  font-size: 3rem;
  color: var(--danger-color);
}

.error-content button {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: background 0.2s;
}

.error-content button:hover {
  background: var(--primary-dark);
}

/* Responsive Design */
@media (max-width: 768px) {
  .navbar {
    padding: 0 0.75rem;
    height: 56px;
  }

  .nav-links {
    gap: 0.5rem;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .nav-links::-webkit-scrollbar {
    display: none;
  }

  .nav-link {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 0.8rem;
  }

  .nav-link i {
    font-size: 0.9rem;
  }

  .logo {
    height: 26px;
  }

  .brand-name {
    font-size: 0.9rem;
  }

  .content {
    padding: 0.75rem;
    margin-top: 56px;
  }

  .nav-user {
    gap: 0.5rem;
  }

  .theme-toggle {
    padding: 0.3rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0 0.5rem;
    height: 50px;
  }

  .nav-links {
    gap: 0.25rem;
  }

  .nav-link {
    padding: 0.3rem 0.4rem;
    font-size: 0.75rem;
  }

  .nav-link span {
    display: none;
  }

  .nav-link i {
    font-size: 1rem;
  }

  .logo {
    height: 22px;
  }

  .brand-name {
    display: none;
  }

  .content {
    padding: 0.5rem;
    margin-top: 50px;
  }

  .theme-toggle {
    padding: 0.2rem;
  }
}

/* Mobile Menu Button */
.mobile-menu-btn {
  background: none;
  border: none;
  color: var(--text-color);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-btn:hover {
  background: var(--background-light);
  color: var(--primary-color);
}

.mobile-menu-btn i {
  font-size: 1.2rem;
}

/* Mobile Drawer */
.mobile-drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1998;
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.mobile-drawer {
  position: fixed;
  top: 0;
  left: -280px;
  width: 280px;
  height: 100vh;
  background: var(--background-secondary);
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 1999;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
}

.mobile-drawer.open {
  left: 0;
}

.drawer-header {
  padding: 1.5rem 1.25rem 1rem;
  border-bottom: 1px solid var(--border-color);
  background: var(--background-light);
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.drawer-logo {
  height: 32px;
  width: auto;
}

.drawer-brand-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.drawer-links {
  padding: 1rem 0;
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  text-decoration: none;
  color: var(--text-color);
  font-weight: 500;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.drawer-link:hover {
  background: var(--background-light);
  color: var(--primary-color);
}

.drawer-link.active {
  background: rgba(0, 122, 255, 0.1);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
}

.drawer-link i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.drawer-link span {
  font-size: 0.95rem;
}

.drawer-link.quick-reg {
  margin-top: 0.5rem;
  border-top: 1px solid var(--border-color);
  padding-top: 1.25rem;
}

/* Desktop Navigation - Hide on Mobile */
@media (max-width: 768px) {
  .desktop-nav {
    display: none !important;
  }
}

/* Mobile-specific styles */
@media (max-width: 768px) {
  .nav-brand {
    flex: 1;
  }
  
  .brand-name {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .mobile-drawer {
    width: 260px;
    left: -260px;
  }
  
  .drawer-header {
    padding: 1.25rem 1rem 0.875rem;
  }
  
  .drawer-logo {
    height: 28px;
  }
  
  .drawer-brand-name {
    font-size: 1rem;
  }
  
  .drawer-link {
    padding: 0.75rem 1rem;
  }
  
  .drawer-link span {
    font-size: 0.9rem;
  }
}
</style>

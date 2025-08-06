<template>
  <Transition name="slide-down">
    <div v-if="showIndicator" :class="['offline-indicator', statusClass]">
      <div class="indicator-content">
        <div class="status-info">
          <span class="status-icon">{{ statusIcon }}</span>
          <div class="status-text">
            <span class="primary-text">{{ primaryText }}</span>
            <span v-if="secondaryText" class="secondary-text">{{ secondaryText }}</span>
          </div>
        </div>
        
        <div class="indicator-actions">
          <button 
            v-if="canSync" 
            @click="forceSync" 
            :disabled="syncInProgress"
            class="sync-btn"
          >
            <span v-if="syncInProgress">🔄</span>
            <span v-else>⚡</span>
            {{ syncInProgress ? 'Syncing...' : 'Sync' }}
          </button>
          
          <button 
            v-if="canDismiss" 
            @click="dismiss" 
            class="dismiss-btn"
          >
            ✕
          </button>
        </div>
      </div>
      
      <!-- Progress bar for sync -->
      <div v-if="showProgress" class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${syncProgress}%` }"
        ></div>
      </div>
    </div>
  </Transition>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import syncManager from '../utils/syncManager.js'
import offlineStorage from '../utils/offlineStorage.js'

export default {
  name: 'OfflineStatusIndicator',
  setup() {
    const isOnline = ref(navigator.onLine)
    const syncInProgress = ref(false)
    const pendingItems = ref(0)
    const syncProgress = ref(0)
    const dismissed = ref(false)
    const lastSyncTime = ref(null)
    
    // Computed properties
    const showIndicator = computed(() => {
      return !dismissed.value && (!isOnline.value || pendingItems.value > 0 || syncInProgress.value)
    })
    
    const statusClass = computed(() => {
      if (!isOnline.value) return 'offline'
      if (syncInProgress.value) return 'syncing'
      if (pendingItems.value > 0) return 'pending'
      return 'online'
    })
    
    const statusIcon = computed(() => {
      if (!isOnline.value) return '📴'
      if (syncInProgress.value) return '⏳'
      if (pendingItems.value > 0) return '🔄'
      return '✅'
    })
    
    const primaryText = computed(() => {
      if (!isOnline.value) return 'Working Offline'
      if (syncInProgress.value) return 'Syncing Data...'
      if (pendingItems.value > 0) return `${pendingItems.value} items pending sync`
      return 'All data synced'
    })
    
    const secondaryText = computed(() => {
      if (!isOnline.value) return 'Changes will sync when connection is restored'
      if (syncInProgress.value) return `${syncProgress.value}% complete`
      if (pendingItems.value > 0 && lastSyncTime.value) {
        const timeAgo = getTimeAgo(lastSyncTime.value)
        return `Last sync: ${timeAgo}`
      }
      return null
    })
    
    const canSync = computed(() => {
      return isOnline.value && pendingItems.value > 0 && !syncInProgress.value
    })
    
    const canDismiss = computed(() => {
      return isOnline.value && pendingItems.value === 0 && !syncInProgress.value
    })
    
    const showProgress = computed(() => {
      return syncInProgress.value && syncProgress.value > 0
    })
    
    // Methods
    const updateStatus = async () => {
      try {
        const stats = await offlineStorage.getStorageStats()
        pendingItems.value = (stats.students?.unsynced || 0) + 
                            (stats.attendance?.unsynced || 0) + 
                            (stats.merit_points?.unsynced || 0) + 
                            (stats.notes?.unsynced || 0)
        
        isOnline.value = syncManager.isOnline
        syncInProgress.value = syncManager.syncInProgress
      } catch (error) {
        console.error('Failed to update offline status:', error)
      }
    }
    
    const forceSync = async () => {
      try {
        await syncManager.forcSync()
        lastSyncTime.value = new Date()
      } catch (error) {
        console.error('Force sync failed:', error)
      }
    }
    
    const dismiss = () => {
      dismissed.value = true
      // Auto-show again after 5 minutes if there are still pending items
      setTimeout(() => {
        if (pendingItems.value > 0) {
          dismissed.value = false
        }
      }, 5 * 60 * 1000)
    }
    
    const getTimeAgo = (date) => {
      const now = new Date()
      const diff = now - date
      const minutes = Math.floor(diff / 60000)
      
      if (minutes < 1) return 'just now'
      if (minutes < 60) return `${minutes}m ago`
      
      const hours = Math.floor(minutes / 60)
      if (hours < 24) return `${hours}h ago`
      
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    }
    
    // Sync event handlers
    const handleSyncEvent = (event) => {
      switch (event.type) {
        case 'online':
          isOnline.value = true
          dismissed.value = false
          updateStatus()
          break
          
        case 'offline':
          isOnline.value = false
          dismissed.value = false
          updateStatus()
          break
          
        case 'sync_start':
          syncInProgress.value = true
          syncProgress.value = 0
          break
          
        case 'sync_progress':
          syncProgress.value = event.progress || 0
          break
          
        case 'sync_complete':
          syncInProgress.value = false
          syncProgress.value = 100
          lastSyncTime.value = new Date()
          updateStatus()
          
          // Auto-dismiss success state after 3 seconds
          if (pendingItems.value === 0) {
            setTimeout(() => {
              dismissed.value = true
            }, 3000)
          }
          break
          
        case 'sync_error':
          syncInProgress.value = false
          syncProgress.value = 0
          console.error('Sync error:', event.error)
          break
      }
    }
    
    // Lifecycle
    onMounted(() => {
      updateStatus()
      
      // Set up sync manager listeners
      syncManager.addSyncListener(handleSyncEvent)
      
      // Update status periodically
      const statusInterval = setInterval(updateStatus, 30000) // Every 30 seconds
      
      // Clean up interval on unmount
      onUnmounted(() => {
        clearInterval(statusInterval)
        syncManager.removeSyncListener(handleSyncEvent)
      })
    })
    
    return {
      showIndicator,
      statusClass,
      statusIcon,
      primaryText,
      secondaryText,
      canSync,
      canDismiss,
      showProgress,
      syncProgress,
      syncInProgress,
      forceSync,
      dismiss
    }
  }
}
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.offline-indicator.offline {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.offline-indicator.syncing {
  background: linear-gradient(135deg, #3742fa, #2f3542);
  color: white;
}

.offline-indicator.pending {
  background: linear-gradient(135deg, #ffc107, #f39c12);
  color: #333;
}

.offline-indicator.online {
  background: linear-gradient(135deg, #00d2d3, #54a0ff);
  color: white;
}

.indicator-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  min-height: 50px;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-icon {
  font-size: 1.2rem;
  animation: pulse 2s infinite;
}

.status-text {
  display: flex;
  flex-direction: column;
}

.primary-text {
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
}

.secondary-text {
  font-size: 0.75rem;
  opacity: 0.8;
  line-height: 1.2;
}

.indicator-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sync-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sync-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.sync-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.dismiss-btn {
  background: none;
  border: none;
  color: inherit;
  padding: 0.25rem;
  cursor: pointer;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.3s ease;
}

.dismiss-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  transition: width 0.3s ease;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .indicator-content {
    padding: 0.5rem;
    min-height: 44px;
  }
  
  .status-info {
    gap: 0.5rem;
  }
  
  .primary-text {
    font-size: 0.8rem;
  }
  
  .secondary-text {
    font-size: 0.7rem;
  }
  
  .sync-btn {
    font-size: 0.7rem;
    padding: 0.25rem 0.5rem;
  }
  
  .dismiss-btn {
    width: 20px;
    height: 20px;
    font-size: 0.6rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .status-icon {
    animation: none;
  }
  
  .progress-fill {
    animation: none;
  }
  
  .slide-down-enter-active,
  .slide-down-leave-active {
    transition: none;
  }
}
</style>
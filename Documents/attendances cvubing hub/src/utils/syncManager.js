// Sync Manager for handling online/offline state transitions
import offlineStorage from './offlineStorage.js'
import webhookManager from './webhookManager.js'
import { 
  createStudent,
  recordAttendance,
  addMeritPoints,
  addNote,
  getStudents,
  getClasses,
  getSchools
} from '../supabase.js'

class SyncManager {
  constructor() {
    this.isOnline = navigator.onLine
    this.syncInProgress = false
    this.syncListeners = new Set()
    this.webhookListeners = new Set()
    this.retryAttempts = 3
    this.retryDelay = 5000 // 5 seconds
    
    this.init()
  }

  async init() {
    // Initialize offline storage
    await offlineStorage.init()
    
    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
    
    // Set up periodic sync when online
    if (this.isOnline) {
      this.startPeriodicSync()
    }
    
    console.log('🔄 SyncManager initialized', { isOnline: this.isOnline })
  }

  // Event listeners management
  addSyncListener(callback) {
    this.syncListeners.add(callback)
  }

  removeSyncListener(callback) {
    this.syncListeners.delete(callback)
  }

  notifySyncListeners(event) {
    this.syncListeners.forEach(callback => callback(event))
  }

  addWebhookListener(callback) {
    this.webhookListeners.add(callback)
  }

  removeWebhookListener(callback) {
    this.webhookListeners.delete(callback)
  }

  notifyWebhookListeners(event) {
    this.webhookListeners.forEach(callback => callback(event))
  }

  // Online/offline state management
  async handleOnline() {
    console.log('📡 Back online - starting sync')
    this.isOnline = true
    this.notifySyncListeners({ type: 'online', timestamp: new Date() })
    
    // Start syncing pending items
    await this.syncPendingData()
    this.startPeriodicSync()
  }

  handleOffline() {
    console.log('📴 Gone offline - entering offline mode')
    this.isOnline = false
    this.stopPeriodicSync()
    this.notifySyncListeners({ type: 'offline', timestamp: new Date() })
  }

  // Periodic sync management
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingData()
      }
    }, 5 * 60 * 1000)
  }

  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Main sync operations
  async syncPendingData() {
    if (this.syncInProgress || !this.isOnline) {
      return
    }

    this.syncInProgress = true
    this.notifySyncListeners({ type: 'sync_start', timestamp: new Date() })

    try {
      console.log('🔄 Starting sync of pending data')
      
      // Get all pending sync items
      const pendingItems = await offlineStorage.getPendingSyncItems()
      console.log(`📝 Found ${pendingItems.length} pending sync items`)

      let successCount = 0
      let failureCount = 0

      for (const item of pendingItems) {
        try {
          await this.syncItem(item)
          await offlineStorage.markSyncItemCompleted(item.id)
          successCount++
        } catch (error) {
          console.error('❌ Failed to sync item:', item.id, error)
          await offlineStorage.markSyncItemFailed(item.id, error)
          failureCount++
        }
      }

      // Also sync any directly stored unsynced records
      await this.syncUnsyncedRecords()

      console.log(`✅ Sync completed: ${successCount} success, ${failureCount} failures`)
      
      this.notifySyncListeners({ 
        type: 'sync_complete', 
        timestamp: new Date(),
        successCount,
        failureCount
      })
      
    } catch (error) {
      console.error('❌ Sync process failed:', error)
      this.notifySyncListeners({ 
        type: 'sync_error', 
        timestamp: new Date(),
        error: error.message 
      })
    } finally {
      this.syncInProgress = false
    }
  }

  async syncItem(item) {
    const { operation_type, table_name, data } = item

    switch (table_name) {
      case 'students':
        if (operation_type === 'INSERT') {
          const result = await createStudent(data)
          
          // Update the offline record with the server ID
          if (result && result[0]) {
            const serverRecord = result[0]
            await offlineStorage.put('students', {
              ...serverRecord,
              is_synced: true,
              offline_id: data.offline_id
            })
            
            // Trigger webhook
            await webhookManager.triggerWebhook('student_created', serverRecord)
          }
        }
        break
        
      case 'attendance':
        if (operation_type === 'INSERT') {
          const result = await recordAttendance(data)
          if (result && result[0]) {
            const serverRecord = result[0]
            await offlineStorage.put('attendance', {
              ...serverRecord,
              is_synced: true,
              offline_id: data.offline_id
            })
            
            // Trigger webhook
            await webhookManager.triggerWebhook('attendance_recorded', serverRecord)
          }
        }
        break
        
      case 'merit_points':
        if (operation_type === 'INSERT') {
          const result = await addMeritPoints(data)
          if (result && result[0]) {
            const serverRecord = result[0]
            await offlineStorage.put('merit_points', {
              ...serverRecord,
              is_synced: true,
              offline_id: data.offline_id
            })
            
            // Trigger webhook
            await webhookManager.triggerWebhook('merit_awarded', serverRecord)
          }
        }
        break
        
      case 'notes':
        if (operation_type === 'INSERT') {
          const result = await addNote(data)
          if (result && result[0]) {
            const serverRecord = result[0]
            await offlineStorage.put('notes', {
              ...serverRecord,
              is_synced: true,
              offline_id: data.offline_id
            })
          }
        }
        break
        
      default:
        console.warn('Unknown table for sync:', table_name)
    }
  }

  async syncUnsyncedRecords() {
    // Sync unsynced students
    const unsyncedStudents = await offlineStorage.getUnsyncedStudents()
    for (const student of unsyncedStudents) {
      if (!student.id || student.id.startsWith('offline_')) {
        // This is a new record that needs to be created
        await offlineStorage.addToSyncQueue({
          operation_type: 'INSERT',
          table_name: 'students',
          record_id: student.offline_id,
          data: student
        })
      }
    }

    // Sync unsynced attendance
    const unsyncedAttendance = await offlineStorage.getUnsyncedAttendance()
    for (const attendance of unsyncedAttendance) {
      if (!attendance.id || attendance.id.startsWith('offline_')) {
        await offlineStorage.addToSyncQueue({
          operation_type: 'INSERT',
          table_name: 'attendance',
          record_id: attendance.offline_id,
          data: attendance
        })
      }
    }

    // Sync unsynced merit points
    const unsyncedMerits = await offlineStorage.getUnsyncedMerits()
    for (const merit of unsyncedMerits) {
      if (!merit.id || merit.id.startsWith('offline_')) {
        await offlineStorage.addToSyncQueue({
          operation_type: 'INSERT',
          table_name: 'merit_points',
          record_id: merit.offline_id,
          data: merit
        })
      }
    }
  }

  // Data operations that work offline/online
  async saveStudent(studentData) {
    try {
      if (this.isOnline) {
        // Try to save directly to server
        const result = await createStudent(studentData)
        if (result && result[0]) {
          // Also save to offline storage for caching
          await offlineStorage.saveStudent({
            ...result[0],
            is_synced: true
          })
          
          // Trigger webhook
          await webhookManager.triggerWebhook('student_created', result[0])
          
          return result[0]
        }
      }
    } catch (error) {
      console.warn('🔄 Failed to save online, saving offline:', error.message)
    }

    // Save offline (either because offline or server failed)
    const offlineStudent = {
      ...studentData,
      id: offlineStorage.generateOfflineId(),
      offline_id: offlineStorage.generateOfflineId(),
      is_synced: false,
      created_at: new Date().toISOString()
    }

    await offlineStorage.saveStudent(offlineStudent)
    
    // Add to sync queue
    await offlineStorage.addToSyncQueue({
      operation_type: 'INSERT',
      table_name: 'students',
      record_id: offlineStudent.offline_id,
      data: offlineStudent
    })

    return offlineStudent
  }

  async saveAttendance(attendanceData) {
    try {
      if (this.isOnline) {
        const result = await recordAttendance(attendanceData)
        if (result && result[0]) {
          await offlineStorage.saveAttendance({
            ...result[0],
            is_synced: true
          })
          
          await webhookManager.triggerWebhook('attendance_recorded', result[0])
          return result[0]
        }
      }
    } catch (error) {
      console.warn('🔄 Failed to save attendance online, saving offline:', error.message)
    }

    const offlineAttendance = {
      ...attendanceData,
      id: offlineStorage.generateOfflineId(),
      offline_id: offlineStorage.generateOfflineId(),
      is_synced: false,
      created_at: new Date().toISOString()
    }

    await offlineStorage.saveAttendance(offlineAttendance)
    
    await offlineStorage.addToSyncQueue({
      operation_type: 'INSERT',
      table_name: 'attendance',
      record_id: offlineAttendance.offline_id,
      data: offlineAttendance
    })

    return offlineAttendance
  }

  async saveMeritPoints(meritData) {
    try {
      if (this.isOnline) {
        const result = await addMeritPoints(meritData)
        if (result && result[0]) {
          await offlineStorage.saveMeritPoints({
            ...result[0],
            is_synced: true
          })
          
          await webhookManager.triggerWebhook('merit_awarded', result[0])
          return result[0]
        }
      }
    } catch (error) {
      console.warn('🔄 Failed to save merit points online, saving offline:', error.message)
    }

    const offlineMerit = {
      ...meritData,
      id: offlineStorage.generateOfflineId(),
      offline_id: offlineStorage.generateOfflineId(),
      is_synced: false,
      created_at: new Date().toISOString()
    }

    await offlineStorage.saveMeritPoints(offlineMerit)
    
    await offlineStorage.addToSyncQueue({
      operation_type: 'INSERT',
      table_name: 'merit_points',
      record_id: offlineMerit.offline_id,
      data: offlineMerit
    })

    return offlineMerit
  }


  // Cache management
  async refreshCache() {
    if (!this.isOnline) {
      return
    }

    try {
      console.log('🔄 Refreshing cache with latest data')
      
      // Cache reference data
      const [classes, schools] = await Promise.all([
        getClasses(),
        getSchools()
      ])

      if (classes) await offlineStorage.cacheClasses(classes)
      if (schools) await offlineStorage.cacheSchools(schools)
      
      console.log('✅ Cache refreshed successfully')
      
    } catch (error) {
      console.error('❌ Cache refresh failed:', error)
    }
  }

  // Status and diagnostics
  async getStatus() {
    const stats = await offlineStorage.getStorageStats()
    const pendingItems = await offlineStorage.getPendingSyncItems()
    
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      storageStats: stats,
      pendingSyncItems: pendingItems.length,
      lastSyncAttempt: this.lastSyncAttempt
    }
  }

  async forcSync() {
    if (this.isOnline) {
      console.log('🔄 Force sync requested')
      await this.syncPendingData()
    } else {
      console.warn('⚠️ Cannot force sync while offline')
    }
  }
}

// Create singleton instance
const syncManager = new SyncManager()

export default syncManager
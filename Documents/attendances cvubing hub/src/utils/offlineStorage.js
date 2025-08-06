// IndexedDB wrapper for offline data storage
class OfflineStorage {
  constructor() {
    this.dbName = 'SchoolManagementDB'
    this.version = 1
    this.db = null
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result
        
        // Students store
        if (!db.objectStoreNames.contains('students')) {
          const studentsStore = db.createObjectStore('students', { keyPath: 'id' })
          studentsStore.createIndex('offline_id', 'offline_id', { unique: false })
          studentsStore.createIndex('class_id', 'class_id', { unique: false })
          studentsStore.createIndex('is_synced', 'is_synced', { unique: false })
        }
        
        // Attendance store
        if (!db.objectStoreNames.contains('attendance')) {
          const attendanceStore = db.createObjectStore('attendance', { keyPath: 'id' })
          attendanceStore.createIndex('student_id', 'student_id', { unique: false })
          attendanceStore.createIndex('date', 'date', { unique: false })
          attendanceStore.createIndex('is_synced', 'is_synced', { unique: false })
        }
        
        // Merit points store
        if (!db.objectStoreNames.contains('merit_points')) {
          const meritsStore = db.createObjectStore('merit_points', { keyPath: 'id' })
          meritsStore.createIndex('student_id', 'student_id', { unique: false })
          meritsStore.createIndex('is_synced', 'is_synced', { unique: false })
        }
        
        // Notes store
        if (!db.objectStoreNames.contains('notes')) {
          const notesStore = db.createObjectStore('notes', { keyPath: 'id' })
          notesStore.createIndex('student_id', 'student_id', { unique: false })
          notesStore.createIndex('is_synced', 'is_synced', { unique: false })
        }
        
        // Offline sync queue
        if (!db.objectStoreNames.contains('sync_queue')) {
          const queueStore = db.createObjectStore('sync_queue', { keyPath: 'id' })
          queueStore.createIndex('status', 'status', { unique: false })
          queueStore.createIndex('table_name', 'table_name', { unique: false })
          queueStore.createIndex('created_at', 'created_at', { unique: false })
        }
        
        // Classes cache
        if (!db.objectStoreNames.contains('classes')) {
          const classesStore = db.createObjectStore('classes', { keyPath: 'id' })
          classesStore.createIndex('school_id', 'school_id', { unique: false })
        }
        
        // Schools cache
        if (!db.objectStoreNames.contains('schools')) {
          db.createObjectStore('schools', { keyPath: 'id' })
        }
      }
    })
  }

  // Generic CRUD operations
  async add(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return store.add(data)
  }

  async put(storeName, data) {
    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return store.put(data)
  }

  async get(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAll(storeName) {
    const transaction = this.db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllByIndex(storeName, indexName, value) {
    const transaction = this.db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    return new Promise((resolve, reject) => {
      const request = index.getAll(value)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async delete(storeName, key) {
    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return store.delete(key)
  }

  async clear(storeName) {
    const transaction = this.db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    return store.clear()
  }

  // Specific methods for students
  async saveStudent(student) {
    // Add metadata for offline handling
    const studentWithMeta = {
      ...student,
      is_synced: navigator.onLine ? true : false,
      offline_created_at: new Date().toISOString(),
      offline_id: student.offline_id || this.generateOfflineId()
    }
    return this.put('students', studentWithMeta)
  }

  async getUnsyncedStudents() {
    return this.getAllByIndex('students', 'is_synced', false)
  }

  // Specific methods for attendance
  async saveAttendance(attendance) {
    const attendanceWithMeta = {
      ...attendance,
      is_synced: navigator.onLine ? true : false,
      offline_created_at: new Date().toISOString(),
      offline_id: attendance.offline_id || this.generateOfflineId()
    }
    return this.put('attendance', attendanceWithMeta)
  }

  async getUnsyncedAttendance() {
    return this.getAllByIndex('attendance', 'is_synced', false)
  }

  // Specific methods for merit points
  async saveMeritPoints(merit) {
    const meritWithMeta = {
      ...merit,
      is_synced: navigator.onLine ? true : false,
      offline_created_at: new Date().toISOString(),
      offline_id: merit.offline_id || this.generateOfflineId()
    }
    return this.put('merit_points', meritWithMeta)
  }

  async getUnsyncedMerits() {
    return this.getAllByIndex('merit_points', 'is_synced', false)
  }

  // Sync queue operations
  async addToSyncQueue(operation) {
    const queueItem = {
      id: this.generateOfflineId(),
      ...operation,
      created_at: new Date().toISOString(),
      status: 'pending',
      retry_count: 0
    }
    return this.add('sync_queue', queueItem)
  }

  async getPendingSyncItems() {
    return this.getAllByIndex('sync_queue', 'status', 'pending')
  }

  async markSyncItemCompleted(id) {
    const item = await this.get('sync_queue', id)
    if (item) {
      item.status = 'completed'
      return this.put('sync_queue', item)
    }
  }

  async markSyncItemFailed(id, error) {
    const item = await this.get('sync_queue', id)
    if (item) {
      item.status = 'failed'
      item.retry_count = (item.retry_count || 0) + 1
      item.last_retry_at = new Date().toISOString()
      item.error_message = error.message || error.toString()
      return this.put('sync_queue', item)
    }
  }

  // Cache operations for reference data
  async cacheClasses(classes) {
    const transaction = this.db.transaction(['classes'], 'readwrite')
    const store = transaction.objectStore('classes')
    await store.clear()
    for (const class_ of classes) {
      await store.add(class_)
    }
  }

  async cacheSchools(schools) {
    const transaction = this.db.transaction(['schools'], 'readwrite')
    const store = transaction.objectStore('schools')
    await store.clear()
    for (const school of schools) {
      await store.add(school)
    }
  }

  // Utility methods
  generateOfflineId() {
    return 'offline_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  async getStorageStats() {
    const stats = {}
    const storeNames = ['students', 'attendance', 'merit_points', 'notes', 'sync_queue']
    
    for (const storeName of storeNames) {
      const items = await this.getAll(storeName)
      stats[storeName] = {
        total: items.length,
        unsynced: items.filter(item => item.is_synced === false).length
      }
    }
    
    return stats
  }

  async clearAllData() {
    const storeNames = ['students', 'attendance', 'merit_points', 'notes', 'sync_queue', 'classes', 'schools']
    for (const storeName of storeNames) {
      await this.clear(storeName)
    }
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage()

export default offlineStorage
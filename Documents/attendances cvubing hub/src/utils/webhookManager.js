// Webhook Manager for n8n integration
class WebhookManager {
  constructor() {
    this.webhooks = new Map()
    this.eventQueue = []
    this.retryAttempts = 3
    this.retryDelay = 5000
    this.isProcessing = false
    
    // Load webhook configurations from localStorage for now
    // In production, these would come from database
    this.loadWebhookConfigs()
  }

  // Load webhook configurations
  loadWebhookConfigs() {
    try {
      const saved = localStorage.getItem('webhook_configs')
      if (saved) {
        const configs = JSON.parse(saved)
        configs.forEach(config => {
          if (config.is_active) {
            this.webhooks.set(config.id, config)
          }
        })
      }
    } catch (error) {
      console.error('Failed to load webhook configs:', error)
    }
  }

  // Save webhook configurations
  saveWebhookConfigs() {
    try {
      const configs = Array.from(this.webhooks.values())
      localStorage.setItem('webhook_configs', JSON.stringify(configs))
    } catch (error) {
      console.error('Failed to save webhook configs:', error)
    }
  }

  // Add or update webhook configuration
  addWebhook(config) {
    const webhookConfig = {
      id: config.id || this.generateId(),
      name: config.name,
      url: config.url,
      secret_key: config.secret_key || '',
      events: config.events || [],
      is_active: config.is_active !== false,
      created_at: config.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    this.webhooks.set(webhookConfig.id, webhookConfig)
    this.saveWebhookConfigs()
    
    console.log('📎 Webhook added:', webhookConfig.name)
    return webhookConfig
  }

  // Remove webhook
  removeWebhook(id) {
    if (this.webhooks.delete(id)) {
      this.saveWebhookConfigs()
      console.log('🗑️ Webhook removed:', id)
      return true
    }
    return false
  }

  // Get all webhooks
  getWebhooks() {
    return Array.from(this.webhooks.values())
  }

  // Get active webhooks for specific event
  getWebhooksForEvent(eventType) {
    return Array.from(this.webhooks.values()).filter(webhook => 
      webhook.is_active && webhook.events.includes(eventType)
    )
  }

  // Trigger webhook for specific event
  async triggerWebhook(eventType, data, metadata = {}) {
    if (!navigator.onLine) {
      console.log('📴 Offline - queueing webhook event:', eventType)
      this.queueEvent(eventType, data, metadata)
      return
    }

    const webhooks = this.getWebhooksForEvent(eventType)
    
    if (webhooks.length === 0) {
      console.log('📎 No webhooks configured for event:', eventType)
      return
    }

    console.log(`📎 Triggering ${webhooks.length} webhooks for event:`, eventType)

    const promises = webhooks.map(webhook => 
      this.sendWebhook(webhook, eventType, data, metadata)
    )

    try {
      const results = await Promise.allSettled(promises)
      
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      console.log(`📎 Webhook results: ${successful} successful, ${failed} failed`)
      
      return { successful, failed, results }
    } catch (error) {
      console.error('📎 Webhook trigger error:', error)
      throw error
    }
  }

  // Send individual webhook
  async sendWebhook(webhook, eventType, data, metadata, attempt = 1) {
    const payload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      data: data,
      metadata: {
        ...metadata,
        source: 'school-management-app',
        webhook_id: webhook.id,
        attempt: attempt
      }
    }

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'School-Management-Webhook/1.0'
    }

    // Add secret key as header if configured
    if (webhook.secret_key) {
      headers['X-Secret-Key'] = webhook.secret_key
    }

    try {
      console.log(`📎 Sending webhook to ${webhook.name}:`, webhook.url)
      
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload),
        timeout: 30000 // 30 second timeout
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const responseText = await response.text()
      
      console.log(`✅ Webhook successful to ${webhook.name}`)
      
      // Log successful webhook event
      this.logWebhookEvent(webhook.id, eventType, payload, 'sent', response.status, responseText)
      
      return {
        webhook_id: webhook.id,
        webhook_name: webhook.name,
        status: 'success',
        response_code: response.status,
        response_body: responseText
      }

    } catch (error) {
      console.error(`❌ Webhook failed to ${webhook.name}:`, error.message)
      
      // Retry logic
      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying webhook to ${webhook.name} (attempt ${attempt + 1})`)
        
        await this.delay(this.retryDelay * attempt) // Exponential backoff
        return this.sendWebhook(webhook, eventType, data, metadata, attempt + 1)
      }
      
      // Log failed webhook event
      this.logWebhookEvent(webhook.id, eventType, payload, 'failed', null, error.message)
      
      throw new Error(`Webhook failed after ${this.retryAttempts} attempts: ${error.message}`)
    }
  }

  // Queue event for later processing when back online
  queueEvent(eventType, data, metadata) {
    this.eventQueue.push({
      id: this.generateId(),
      event_type: eventType,
      data: data,
      metadata: metadata,
      created_at: new Date().toISOString(),
      status: 'queued'
    })

    // Save to localStorage for persistence
    try {
      localStorage.setItem('webhook_event_queue', JSON.stringify(this.eventQueue))
    } catch (error) {
      console.error('Failed to save webhook queue:', error)
    }
  }

  // Process queued events when back online
  async processQueuedEvents() {
    if (this.isProcessing || !navigator.onLine || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true
    console.log(`📎 Processing ${this.eventQueue.length} queued webhook events`)

    const events = [...this.eventQueue]
    this.eventQueue = []

    for (const event of events) {
      try {
        await this.triggerWebhook(event.event_type, event.data, event.metadata)
      } catch (error) {
        console.error('Failed to process queued webhook event:', error)
        // Re-queue failed events
        this.eventQueue.push({
          ...event,
          retry_count: (event.retry_count || 0) + 1,
          last_retry: new Date().toISOString()
        })
      }
    }

    // Update localStorage
    try {
      localStorage.setItem('webhook_event_queue', JSON.stringify(this.eventQueue))
    } catch (error) {
      console.error('Failed to update webhook queue:', error)
    }

    this.isProcessing = false
    console.log('📎 Finished processing queued webhook events')
  }

  // Load queued events from localStorage
  loadQueuedEvents() {
    try {
      const saved = localStorage.getItem('webhook_event_queue')
      if (saved) {
        this.eventQueue = JSON.parse(saved)
        console.log(`📎 Loaded ${this.eventQueue.length} queued webhook events`)
      }
    } catch (error) {
      console.error('Failed to load webhook queue:', error)
    }
  }

  // Log webhook events (in production, this would go to database)
  logWebhookEvent(webhookId, eventType, payload, status, responseCode, responseBody) {
    const logEntry = {
      id: this.generateId(),
      webhook_id: webhookId,
      event_type: eventType,
      payload: payload,
      status: status,
      response_code: responseCode,
      response_body: responseBody,
      created_at: new Date().toISOString()
    }

    // For now, just log to console and localStorage
    console.log('📊 Webhook event logged:', logEntry)

    try {
      const logs = JSON.parse(localStorage.getItem('webhook_logs') || '[]')
      logs.unshift(logEntry)
      
      // Keep only last 100 log entries
      if (logs.length > 100) {
        logs.splice(100)
      }
      
      localStorage.setItem('webhook_logs', JSON.stringify(logs))
    } catch (error) {
      console.error('Failed to save webhook log:', error)
    }
  }

  // Get webhook logs
  getWebhookLogs(limit = 50) {
    try {
      const logs = JSON.parse(localStorage.getItem('webhook_logs') || '[]')
      return logs.slice(0, limit)
    } catch (error) {
      console.error('Failed to get webhook logs:', error)
      return []
    }
  }

  // Utility methods
  generateId() {
    return 'webhook_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Initialize with default n8n webhook if none exist
  initializeDefaultWebhooks() {
    if (this.webhooks.size === 0) {
      console.log('📎 No webhooks configured, adding example n8n webhook')
      
      this.addWebhook({
        name: 'n8n Student Events',
        url: 'https://your-n8n-instance.com/webhook/school-events',
        events: ['student_created', 'attendance_recorded', 'merit_awarded'],
        is_active: false, // Disabled by default
        secret_key: ''
      })
    }
  }

  // Test webhook connection
  async testWebhook(webhookId) {
    const webhook = this.webhooks.get(webhookId)
    if (!webhook) {
      throw new Error('Webhook not found')
    }

    const testData = {
      test: true,
      message: 'This is a test webhook from School Management App',
      timestamp: new Date().toISOString()
    }

    try {
      const result = await this.sendWebhook(webhook, 'test', testData, { test: true })
      return { success: true, result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}

// Create singleton instance
const webhookManager = new WebhookManager()

// Load queued events on initialization
webhookManager.loadQueuedEvents()

// Initialize default webhooks
webhookManager.initializeDefaultWebhooks()

// Set up online event listener to process queued events
window.addEventListener('online', () => {
  setTimeout(() => {
    webhookManager.processQueuedEvents()
  }, 1000) // Wait 1 second after coming online
})

export default webhookManager
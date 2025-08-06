<template>
  <div class="webhook-settings">
    <div class="header-section">
      <div class="gradient-header">
        <div class="header-content">
          <h1 class="page-title">🔗 Webhook Settings</h1>
          <p class="page-subtitle">Configure n8n and other webhook integrations</p>
        </div>
      </div>
    </div>

    <div class="settings-container">
      <!-- Webhook List -->
      <div class="webhooks-section">
        <div class="section-header">
          <h2>Active Webhooks</h2>
          <button @click="showAddForm = true" class="add-btn">
            ➕ Add Webhook
          </button>
        </div>

        <div v-if="webhooks.length === 0" class="empty-state">
          <div class="empty-icon">📎</div>
          <h3>No Webhooks Configured</h3>
          <p>Add a webhook to start receiving automated notifications</p>
          <button @click="showAddForm = true" class="primary-btn">
            Add Your First Webhook
          </button>
        </div>

        <div v-else class="webhooks-list">
          <div 
            v-for="webhook in webhooks" 
            :key="webhook.id" 
            :class="['webhook-card', { inactive: !webhook.is_active }]"
          >
            <div class="webhook-info">
              <div class="webhook-name">
                <h3>{{ webhook.name }}</h3>
                <span :class="['status-badge', webhook.is_active ? 'active' : 'inactive']">
                  {{ webhook.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <div class="webhook-url">{{ webhook.url }}</div>
              <div class="webhook-events">
                <span class="events-label">Events:</span>
                <span 
                  v-for="event in webhook.events" 
                  :key="event" 
                  class="event-tag"
                >
                  {{ formatEventName(event) }}
                </span>
              </div>
            </div>
            
            <div class="webhook-actions">
              <button @click="testWebhook(webhook.id)" :disabled="testing" class="test-btn">
                {{ testing ? '⏳' : '🧪' }} Test
              </button>
              <button @click="editWebhook(webhook)" class="edit-btn">
                ✏️ Edit
              </button>
              <button @click="deleteWebhook(webhook.id)" class="delete-btn">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Webhook Logs -->
      <div class="logs-section">
        <div class="section-header">
          <h2>Recent Webhook Events</h2>
          <button @click="refreshLogs" class="refresh-btn">
            🔄 Refresh
          </button>
        </div>

        <div class="logs-list">
          <div 
            v-for="log in logs" 
            :key="log.id" 
            :class="['log-item', log.status]"
          >
            <div class="log-info">
              <div class="log-event">
                <strong>{{ formatEventName(log.event_type) }}</strong>
                <span class="log-time">{{ formatTime(log.created_at) }}</span>
              </div>
              <div class="log-webhook">{{ getWebhookName(log.webhook_id) }}</div>
            </div>
            <div class="log-status">
              <span :class="['status-indicator', log.status]">
                {{ log.status === 'sent' ? '✅' : log.status === 'failed' ? '❌' : '⏳' }}
              </span>
              <span v-if="log.response_code" class="response-code">
                {{ log.response_code }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Webhook Modal -->
    <div v-if="showAddForm || editingWebhook" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingWebhook ? 'Edit Webhook' : 'Add New Webhook' }}</h2>
          <button @click="closeModal" class="close-btn">✕</button>
        </div>
        
        <form @submit.prevent="saveWebhook" class="webhook-form">
          <div class="form-group">
            <label>Webhook Name</label>
            <input 
              v-model="webhookForm.name" 
              type="text" 
              placeholder="e.g., n8n Student Events"
              required
            >
          </div>
          
          <div class="form-group">
            <label>Webhook URL</label>
            <input 
              v-model="webhookForm.url" 
              type="url" 
              placeholder="https://your-n8n-instance.com/webhook/..."
              required
            >
          </div>
          
          <div class="form-group">
            <label>Secret Key (optional)</label>
            <input 
              v-model="webhookForm.secret_key" 
              type="password" 
              placeholder="For webhook authentication"
            >
          </div>
          
          <div class="form-group">
            <label>Events to Listen For</label>
            <div class="events-checkboxes">
              <label v-for="event in availableEvents" :key="event.value" class="checkbox-label">
                <input 
                  type="checkbox" 
                  :value="event.value" 
                  v-model="webhookForm.events"
                >
                <span>{{ event.label }}</span>
                <small>{{ event.description }}</small>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="webhookForm.is_active"
              >
              <span>Active</span>
            </label>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeModal" class="cancel-btn">
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="saving">
              {{ saving ? 'Saving...' : (editingWebhook ? 'Update' : 'Add') }} Webhook
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Test Result Modal -->
    <div v-if="testResult" class="modal-overlay" @click="testResult = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Webhook Test Result</h2>
          <button @click="testResult = null" class="close-btn">✕</button>
        </div>
        
        <div class="test-result">
          <div :class="['result-status', testResult.success ? 'success' : 'error']">
            <span class="result-icon">
              {{ testResult.success ? '✅' : '❌' }}
            </span>
            <span class="result-text">
              {{ testResult.success ? 'Webhook test successful!' : 'Webhook test failed' }}
            </span>
          </div>
          
          <div v-if="testResult.error" class="error-details">
            <strong>Error:</strong> {{ testResult.error }}
          </div>
          
          <div v-if="testResult.result" class="success-details">
            <strong>Response Code:</strong> {{ testResult.result.response_code }}<br>
            <strong>Status:</strong> {{ testResult.result.status }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import webhookManager from '../utils/webhookManager.js'

export default {
  name: 'WebhookSettings',
  setup() {
    const webhooks = ref([])
    const logs = ref([])
    const showAddForm = ref(false)
    const editingWebhook = ref(null)
    const testing = ref(false)
    const saving = ref(false)
    const testResult = ref(null)
    
    const webhookForm = reactive({
      name: '',
      url: '',
      secret_key: '',
      events: [],
      is_active: true
    })
    
    const availableEvents = [
      {
        value: 'student_created',
        label: 'Student Created',
        description: 'When a new student is registered'
      },
      {
        value: 'attendance_recorded',
        label: 'Attendance Recorded',
        description: 'When attendance is marked for a student'
      },
      {
        value: 'merit_awarded',
        label: 'Merit Points Awarded',
        description: 'When merit points are given to a student'
      },
      {
        value: 'test',
        label: 'Test Events',
        description: 'For testing webhook connections'
      }
    ]
    
    // Methods
    const loadWebhooks = () => {
      webhooks.value = webhookManager.getWebhooks()
    }
    
    const loadLogs = () => {
      logs.value = webhookManager.getWebhookLogs(20)
    }
    
    const refreshLogs = () => {
      loadLogs()
    }
    
    const formatEventName = (event) => {
      const eventMap = {
        'student_created': 'Student Created',
        'attendance_recorded': 'Attendance Recorded',
        'merit_awarded': 'Merit Awarded',
        'test': 'Test Event'
      }
      return eventMap[event] || event
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }
    
    const getWebhookName = (webhookId) => {
      const webhook = webhooks.value.find(w => w.id === webhookId)
      return webhook ? webhook.name : 'Unknown Webhook'
    }
    
    const resetForm = () => {
      webhookForm.name = ''
      webhookForm.url = ''
      webhookForm.secret_key = ''
      webhookForm.events = []
      webhookForm.is_active = true
    }
    
    const editWebhook = (webhook) => {
      editingWebhook.value = webhook
      webhookForm.name = webhook.name
      webhookForm.url = webhook.url
      webhookForm.secret_key = webhook.secret_key || ''
      webhookForm.events = [...webhook.events]
      webhookForm.is_active = webhook.is_active
    }
    
    const closeModal = () => {
      showAddForm.value = false
      editingWebhook.value = null
      resetForm()
    }
    
    const saveWebhook = async () => {
      if (webhookForm.events.length === 0) {
        alert('Please select at least one event to listen for.')
        return
      }
      
      saving.value = true
      try {
        const webhookData = {
          name: webhookForm.name,
          url: webhookForm.url,
          secret_key: webhookForm.secret_key,
          events: webhookForm.events,
          is_active: webhookForm.is_active
        }
        
        if (editingWebhook.value) {
          webhookData.id = editingWebhook.value.id
        }
        
        webhookManager.addWebhook(webhookData)
        loadWebhooks()
        closeModal()
        
      } catch (error) {
        alert('Failed to save webhook: ' + error.message)
      } finally {
        saving.value = false
      }
    }
    
    const deleteWebhook = (webhookId) => {
      if (confirm('Are you sure you want to delete this webhook?')) {
        webhookManager.removeWebhook(webhookId)
        loadWebhooks()
      }
    }
    
    const testWebhook = async (webhookId) => {
      testing.value = true
      try {
        const result = await webhookManager.testWebhook(webhookId)
        testResult.value = result
        loadLogs() // Refresh logs to show test result
      } catch (error) {
        testResult.value = {
          success: false,
          error: error.message
        }
      } finally {
        testing.value = false
      }
    }
    
    // Lifecycle
    onMounted(() => {
      loadWebhooks()
      loadLogs()
    })
    
    return {
      webhooks,
      logs,
      showAddForm,
      editingWebhook,
      testing,
      saving,
      testResult,
      webhookForm,
      availableEvents,
      loadWebhooks,
      loadLogs,
      refreshLogs,
      formatEventName,
      formatTime,
      getWebhookName,
      editWebhook,
      closeModal,
      saveWebhook,
      deleteWebhook,
      testWebhook
    }
  }
}
</script>

<style scoped>
.webhook-settings {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.header-section {
  padding: 2rem 1rem;
}

.gradient-header {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: white;
  margin: 0;
}

.webhooks-section,
.logs-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 2rem;
}

.add-btn,
.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover,
.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  opacity: 0.8;
}

.primary-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.webhooks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.webhook-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.webhook-card.inactive {
  opacity: 0.6;
}

.webhook-info {
  flex: 1;
}

.webhook-name {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.webhook-name h3 {
  margin: 0;
  color: white;
  font-size: 1.2rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: #28a745;
  color: white;
}

.status-badge.inactive {
  background: #6c757d;
  color: white;
}

.webhook-url {
  color: rgba(255, 255, 255, 0.8);
  font-family: monospace;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.webhook-events {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.events-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.event-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 10px;
  font-size: 0.8rem;
  color: white;
}

.webhook-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.test-btn,
.edit-btn,
.delete-btn {
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.test-btn {
  background: #17a2b8;
  color: white;
}

.edit-btn {
  background: #ffc107;
  color: #333;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.test-btn:hover,
.edit-btn:hover,
.delete-btn:hover {
  transform: translateY(-2px);
}

.logs-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border-left: 4px solid transparent;
}

.log-item.sent {
  border-left-color: #28a745;
}

.log-item.failed {
  border-left-color: #dc3545;
}

.log-item.pending {
  border-left-color: #ffc107;
}

.log-info {
  flex: 1;
}

.log-event {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.log-event strong {
  color: white;
}

.log-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.log-webhook {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.log-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.response-code {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-family: monospace;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.webhook-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="url"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.events-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin-top: 0.25rem;
}

.checkbox-label small {
  color: #666;
  font-size: 0.8rem;
  display: block;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.save-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-result {
  padding: 1.5rem;
}

.result-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.result-status.success {
  background: #d4edda;
  color: #155724;
}

.result-status.error {
  background: #f8d7da;
  color: #721c24;
}

.result-icon {
  font-size: 1.5rem;
}

.error-details,
.success-details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 10px;
  font-family: monospace;
  font-size: 0.9rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .settings-container {
    grid-template-columns: 1fr;
  }
  
  .webhook-card {
    flex-direction: column;
    gap: 1rem;
  }
  
  .webhook-actions {
    align-self: stretch;
    justify-content: space-between;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-width: none;
  }
}
</style>
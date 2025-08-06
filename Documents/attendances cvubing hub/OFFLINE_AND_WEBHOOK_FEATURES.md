# Offline Functionality & n8n Integration Guide

This document explains the new offline functionality and webhook integration features added to the school management application.

## 🚀 Features Overview

### 1. Offline Functionality
- **Full offline operation** - Add students, record attendance, award merit points without internet
- **Automatic sync** - Data syncs when internet connection is restored
- **Persistent storage** - Uses IndexedDB for reliable offline data storage
- **Conflict resolution** - Smart handling of offline vs online data conflicts

### 2. Quick Student Registration
- **Fast registration form** - Optimized for open day events
- **Batch mode** - Register multiple students quickly
- **Enhanced fields** - Name, surname, grade, school, parent contact information
- **Mobile optimized** - Works great on tablets and phones

### 3. n8n Webhook Integration
- **Event-driven webhooks** - Trigger automation on student events
- **Configurable endpoints** - Add multiple webhook URLs
- **Event filtering** - Choose which events trigger each webhook
- **Retry logic** - Automatic retries for failed webhook calls

## 📋 Database Schema Updates

Run the following SQL to add new fields and tables:

```sql
-- Apply the enhanced schema
\i enhanced_student_schema.sql
```

This adds:
- New student fields (surname, grade, school_name, parent_contact_name, etc.)
- Offline sync queue table
- Webhook configuration tables
- Proper indexing for performance

## 🔧 Installation & Setup

### 1. Install Dependencies
No additional dependencies needed - everything uses built-in browser APIs.

### 2. Apply Database Schema
```sql
psql -d your_database -f enhanced_student_schema.sql
```

### 3. Configure Environment
The application will work out of the box with your existing Supabase setup.

## 📱 Using Quick Student Registration

### Access the Form
Navigate to `/quick-registration` or click "Quick Reg" in the navigation.

### Single Student Mode
1. Fill in required fields: Name, Surname
2. Add optional information: Grade, School, Parent details
3. Click "Save Student" or "Save & Add Another"
4. Form automatically clears for next student

### Batch Registration Mode
1. Click "Batch" toggle to switch modes
2. Select a default class for all students
3. Fill in student rows (Name and Surname required)
4. Click "Save All" to register multiple students
5. Great for open day events!

### Key Features
- **Keyboard navigation** - Tab through fields quickly
- **Auto-focus** - Automatically moves to next field
- **Offline support** - Works without internet connection
- **Real-time stats** - See today's registrations and pending sync

## 🔄 Offline Functionality

### How It Works
1. **Online First** - App tries to save to server when online
2. **Offline Fallback** - Saves locally if server fails or offline
3. **Auto Sync** - Syncs pending data when connection returns
4. **Status Indicators** - Shows online/offline status and sync progress

### Supported Operations
- ✅ Add new students
- ✅ Record attendance
- ✅ Award merit points
- ✅ Add notes
- ✅ View cached data

### Storage Details
- **IndexedDB** - Persistent local storage
- **Automatic cleanup** - Old synced data is managed automatically
- **Conflict resolution** - Server data takes precedence on conflicts

### Monitoring Offline Data
- Check the offline status indicator at the top
- View pending sync items count
- Force sync manually when needed

## 🔗 n8n Webhook Integration

### Setting Up Webhooks

#### 1. Configure in App
1. Navigate to `/webhook-settings` (add link to nav if needed)
2. Click "Add Webhook"
3. Fill in details:
   - **Name**: Descriptive name (e.g., "n8n Student Events")
   - **URL**: Your n8n webhook endpoint
   - **Secret Key**: Optional authentication
   - **Events**: Choose which events to listen for

#### 2. n8n Workflow Setup
Create a new workflow in n8n:

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "school-events",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Process Student Event",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Process the webhook data\nconst eventType = items[0].json.event_type;\nconst studentData = items[0].json.data;\n\nswitch(eventType) {\n  case 'student_created':\n    // Send welcome email, add to CRM, etc.\n    break;\n  case 'attendance_recorded':\n    // Update attendance tracking, notify parents\n    break;\n  case 'merit_awarded':\n    // Send congratulations, update rewards system\n    break;\n}\n\nreturn items;"
      }
    }
  ]
}
```

### Available Events

#### student_created
Triggered when a new student is registered.
```json
{
  "event_type": "student_created",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "name": "John",
    "surname": "Doe",
    "grade": "Grade 5",
    "school_name": "ABC Primary",
    "parent_contact_name": "Jane Doe",
    "parent_phone": "+1234567890",
    "registration_source": "open_day"
  }
}
```

#### attendance_recorded
Triggered when attendance is marked.
```json
{
  "event_type": "attendance_recorded",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "date": "2024-01-15",
    "status": "PRESENT"
  }
}
```

#### merit_awarded
Triggered when merit points are awarded.
```json
{
  "event_type": "merit_awarded",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "id": "uuid",
    "student_id": "uuid",
    "points": 5,
    "category": "Academic Excellence",
    "description": "Great problem solving"
  }
}
```

### Webhook Security
- **Secret Keys** - Use secret keys for authentication
- **HTTPS Only** - Only use secure webhook URLs
- **Rate Limiting** - Webhooks have built-in retry logic

### Testing Webhooks
1. Go to webhook settings
2. Click "Test" button on any webhook
3. Check n8n logs for received test event
4. Verify webhook is working correctly

## 🛠️ Common Use Cases

### Use Case 1: Open Day Registration
1. Set up tablet/laptop at registration desk
2. Navigate to `/quick-registration`
3. Switch to batch mode
4. Register students quickly as they arrive
5. Data syncs automatically when online

### Use Case 2: Offline Attendance
1. Teacher takes device to classroom (may have no WiFi)
2. Mark attendance as normal
3. Data saves locally
4. Syncs when back in WiFi range

### Use Case 3: Parent Notifications via n8n
1. Configure webhook for student events
2. Set up n8n workflow to send emails
3. When merit points awarded, parent gets automatic email
4. When attendance marked, update parent portal

### Use Case 4: CRM Integration
1. Webhook triggers on new student registration
2. n8n workflow adds student to CRM system
3. Creates follow-up tasks for staff
4. Updates marketing lists

## 🔍 Troubleshooting

### Offline Issues
- **Data not syncing**: Check offline status indicator, try manual sync
- **Storage full**: App automatically manages storage, but check browser storage settings
- **Conflicts**: Server data takes precedence, check sync logs

### Webhook Issues
- **Not receiving events**: Check webhook URL, test connectivity
- **Authentication errors**: Verify secret key configuration
- **Timeout errors**: Check n8n workflow response time (must be < 30s)

### Performance
- **Slow sync**: Large amounts of offline data may take time to sync
- **Storage limits**: Browser IndexedDB has limits (~50MB), app manages this automatically

## 📊 Monitoring & Analytics

### Offline Storage Stats
Check the offline status indicator for:
- Total pending sync items
- Storage usage
- Last sync time

### Webhook Logs
In webhook settings, view:
- Recent webhook events
- Success/failure rates
- Response codes and errors

## 🔮 Future Enhancements

Planned features:
- **Conflict resolution UI** - Manual resolution of data conflicts
- **Advanced sync settings** - Configure sync frequency and behavior  
- **Webhook templates** - Pre-built workflows for common use cases
- **Bulk operations** - Offline bulk data operations
- **Advanced caching** - Smarter data caching strategies

## 🆘 Support

For issues or questions:
1. Check browser console for error messages
2. Test webhook connections using the built-in test feature
3. Verify database schema is properly applied
4. Check network connectivity for sync issues

---

**Ready to use!** The application now supports full offline functionality and n8n integration. Students can be registered offline during open days, and all activities can trigger automated workflows through webhooks.
# Storage & Realtime Implementation Guide

## Overview
This document covers the complete implementation of file storage with signed URLs and real-time database subscriptions for the clinic management system.

## 1. Storage Implementation

### Buckets Created
- **lab-results** - Lab test results and reports
- **payment-proofs** - Payment receipts and proof documents
- **prescriptions** - Prescription documents
- **medical-records** - Medical records and documents
- **attachments** - General attachments
- **clinic-documents** - Clinic administrative documents

All buckets are private and protected with RLS policies.

### Key Files
- `/src/lib/storage.ts` - Core storage utilities
- `/src/lib/api/implementations/supabase/storage.ts` - Storage repository
- `/src/app/api/storage/route.ts` - API routes for file operations
- `/src/hooks/use-file-upload.ts` - React hook for uploads

### Usage Examples

#### Upload a File with Signed URL
```typescript
import { useFileUpload } from '@/hooks/use-file-upload'

function UploadComponent() {
  const { upload, isUploading } = useFileUpload({
    maxSize: 50, // 50MB
    allowedTypes: ['application/pdf', 'image/*'],
  })

  const handleUpload = async (file: File) => {
    const result = await upload(file, 'payment-proofs', 'invoices')
    if (result.success) {
      console.log('Uploaded to:', result.path)
      console.log('Signed URL:', result.signedUrl)
    }
  }

  return (
    <input 
      type="file" 
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      disabled={isUploading}
    />
  )
}
```

#### Generate Signed URL for Existing File
```typescript
const { getSignedUrl } = useFileUpload()

const { url } = await getSignedUrl('lab-results', 'path/to/file.pdf', 3600)
// URL expires in 1 hour
```

---

## 2. Realtime Implementation

### Core Utilities
- `/src/lib/realtime.ts` - Realtime subscription utilities
- `/src/hooks/use-realtime-queue.ts` - Queue and check-in hooks
- `/src/hooks/use-today-appointments.ts` - Today's appointments
- `/src/hooks/use-task-assignments.ts` - Task assignments
- `/src/hooks/use-payment-monitoring.ts` - Payment status monitoring

### Realtime Hooks

#### 1. Today's Appointments
```typescript
import { useTodayAppointments } from '@/hooks/use-today-appointments'

function TodayAppointmentsList() {
  const {
    appointments,
    isLoading,
    isConnected,
    updateAppointmentStatus,
    checkedInCount,
    inProgressCount,
  } = useTodayAppointments({
    clinicId: 'clinic-id',
    date: '2024-02-12', // Optional, defaults to today
    onError: (error) => console.error('Error:', error),
  })

  return (
    <div>
      <p>Checked in: {checkedInCount}</p>
      <p>In progress: {inProgressCount}</p>
      {appointments.map((apt) => (
        <div key={apt.id}>
          <h3>{apt.patientName}</h3>
          <p>{apt.appointmentTime}</p>
          <button onClick={() => updateAppointmentStatus(apt.id, 'checked-in')}>
            Check In
          </button>
        </div>
      ))}
    </div>
  )
}
```

#### 2. Queue & Check-in Status
```typescript
import { useRealtimeCheckIn } from '@/hooks/use-realtime-queue'

function QueueMonitor() {
  const { checkInEvents, isConnected, clearEvents } = useRealtimeCheckIn('clinic-id')

  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {checkInEvents.map((event, i) => (
        <div key={i} className="notification">
          {event.entry.patientName} checked in
        </div>
      ))}
    </div>
  )
}
```

#### 3. Task Assignments
```typescript
import { useTaskAssignments } from '@/hooks/use-task-assignments'

function TaskBoard() {
  const {
    tasks,
    isConnected,
    unreadCount,
    updateTaskStatus,
    pendingCount,
    highPriorityCount,
  } = useTaskAssignments({
    clinicId: 'clinic-id',
    userId: 'current-user-id',
    status: 'all',
    onTaskAssigned: (task) => {
      // Show notification for new task
      console.log('New task:', task.title)
    },
    onTaskCompleted: (task) => {
      // Celebration animation
      console.log('Task completed:', task.title)
    },
  })

  return (
    <div>
      <h2>My Tasks ({unreadCount} unread)</h2>
      <p>High Priority: {highPriorityCount}</p>
      {tasks.map((task) => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>Due: {task.dueDate}</p>
          <select 
            value={task.status}
            onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
          >
            <option>pending</option>
            <option>in-progress</option>
            <option>completed</option>
          </select>
        </div>
      ))}
    </div>
  )
}
```

#### 4. Payment Status Monitoring
```typescript
import { usePaymentMonitoring } from '@/hooks/use-payment-monitoring'

function PaymentDashboard() {
  const {
    payments,
    isConnected,
    totalReceived,
    totalPending,
    completedCount,
    updatePaymentStatus,
    onPaymentReceived: 'Payment received!', // Notification
  } = usePaymentMonitoring({
    clinicId: 'clinic-id',
    status: 'all',
    onPaymentReceived: (payment) => {
      console.log('Payment received:', payment.amount)
    },
    onPaymentFailed: (payment) => {
      console.log('Payment failed:', payment.transactionId)
    },
    onPaymentStatusChanged: (change) => {
      console.log(`Payment ${change.paymentId}: ${change.previousStatus} → ${change.newStatus}`)
    },
  })

  return (
    <div>
      <p>Total Received: ${totalReceived}</p>
      <p>Total Pending: ${totalPending}</p>
      <p>Completed Payments: {completedCount}</p>
      {payments.map((payment) => (
        <div key={payment.id}>
          <p>{payment.patientName} - ${payment.amount}</p>
          <p>Status: {payment.status}</p>
          {payment.status === 'pending' && (
            <button onClick={() => updatePaymentStatus(payment.id, 'completed')}>
              Mark as Received
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

---

## 3. Advanced Features

### Secure File Access
All file uploads generate signed URLs that:
- Expire after configurable time (default 1 hour)
- Are restricted to authenticated users in the clinic
- Respect bucket-level RLS policies

### Real-time Notifications
Subscribe to multiple events:
```typescript
const { checkInEvents } = useRealtimeCheckIn(clinicId)
const { tasks } = useTaskAssignments({ clinicId, userId })
const { payments } = usePaymentMonitoring({ clinicId })

// All update automatically via realtime subscriptions
```

### Offline Support
The hooks gracefully handle connection issues:
- `isConnected` flag shows realtime status
- Initial data fetched from database
- Updates queue when offline (in client-side state)
- Automatically syncs when reconnected

---

## 4. File Uploads - Detailed Flow

### Step 1: Client-side Upload
```
File selected → Validation → FormData → API POST
```

### Step 2: Server-side Processing
```
Receive FormData → Save to Supabase Storage → Generate Signed URL → Return to client
```

### Step 3: Database Record
Create entry in `attachments`, `medical_records`, etc. with file path reference.

### Step 4: Access File
```
Request file → Database lookup → Generate fresh signed URL → Download
```

---

## 5. Performance Tips

### Storage
- Organize files in folders by date: `lab-results/2024-02-12/file.pdf`
- Use unique filenames with timestamps: `1707686400000-abc123-filename.pdf`
- Limit file size (default 50MB per upload)

### Realtime
- Subscribe only to tables you need
- Unsubscribe when component unmounts
- Use filters to reduce payload: `clinic_id=eq.{clinicId}`
- Batch multiple updates efficiently

### Network
- Generate signed URLs server-side
- Cache URLs when possible (within expiration window)
- Use proper CORS headers for file access

---

## 6. Troubleshooting

### Upload Fails
- Check file size and type validation
- Verify bucket RLS policies
- Ensure signed URL is still valid

### Realtime Not Updating
- Check browser console for connection errors
- Verify RLS policies allow user to see data
- Confirm Realtime is enabled in Supabase settings
- Check network tab for subscription messages

### File Access Denied
- Verify signed URL hasn't expired
- Check bucket RLS policies
- Ensure user is clinic member with correct role

---

## 7. API Reference

### POST /api/storage
Upload file and optionally generate signed URL
```
Request:
- file: File (FormData)
- bucket: StorageBucket
- folder: string
- generateUrl: 'true' | 'false'

Response:
{
  "success": true,
  "path": "folder/filename.ext",
  "signedUrl": "https://..."
}
```

### GET /api/storage?bucket=&filePath=
Generate signed URL for existing file
```
Response:
{
  "success": true,
  "signedUrl": "https://..."
}
```

### DELETE /api/storage?bucket=&filePath=
Delete file from storage
```
Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

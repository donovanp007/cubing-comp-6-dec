import { createClient } from '@supabase/supabase-js'

// Test Supabase connection
const supabaseUrl = 'https://gdiilyynpyscctdozlit.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaWlseXlucHlzY2N0ZG96bGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTkwMTYsImV4cCI6MjA2ODIzNTAxNn0.yoXR6zGoQ8f53u0qxZ73ld6T-5z_u-NhrKxDXKySt9c'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test basic connection
    const { data, error } = await supabase.from('schools').select('count')
    
    if (error) {
      console.error('❌ Connection error:', error.message)
      if (error.message.includes('relation "schools" does not exist')) {
        console.log('💡 This means you need to run the database setup script first!')
      }
    } else {
      console.log('✅ Connection successful!')
      console.log('📊 Schools table accessible:', data)
    }
  } catch (err) {
    console.error('❌ Test failed:', err.message)
  }
}

testConnection()
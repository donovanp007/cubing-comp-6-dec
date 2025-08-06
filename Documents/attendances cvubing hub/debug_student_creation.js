// Debug script to test student creation
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gdiilyynpyscctdozlit.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkaWlseXlucHlzY2N0ZG96bGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NTkwMTYsImV4cCI6MjA2ODIzNTAxNn0.yoXR6zGoQ8f53u0qxZ73ld6T-5z_u-NhrKxDXKySt9c'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugStudentCreation() {
    console.log('🔍 Starting debug...')
    
    try {
        // 1. Test basic connection
        console.log('1️⃣ Testing connection...')
        const { data: testData, error: testError } = await supabase
            .from('schools')
            .select('count')
            .limit(1)
        
        if (testError) {
            console.error('❌ Connection failed:', testError)
            return
        }
        console.log('✅ Connection successful')
        
        // 2. Check if students table exists
        console.log('2️⃣ Checking students table...')
        const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .limit(1)
        
        if (studentsError) {
            console.error('❌ Students table error:', studentsError)
            return
        }
        console.log('✅ Students table accessible')
        
        // 3. Check classes table and get a valid class_id
        console.log('3️⃣ Getting a valid class ID...')
        const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('id, name')
            .limit(1)
        
        if (classesError) {
            console.error('❌ Classes table error:', classesError)
            return
        }
        
        if (!classesData || classesData.length === 0) {
            console.log('⚠️ No classes found. You need to create a school and class first!')
            return
        }
        
        const testClassId = classesData[0].id
        console.log('✅ Found class:', testClassId, classesData[0].name)
        
        // 4. Try to create a test student
        console.log('4️⃣ Attempting to create test student...')
        const testStudentData = {
            name: 'Test Student Debug',
            class_id: testClassId
        }
        
        console.log('Student data:', testStudentData)
        
        const { data: result, error } = await supabase
            .from('students')
            .insert([testStudentData])
            .select()
        
        if (error) {
            console.error('❌ Student creation failed:', error)
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            })
            return
        }
        
        console.log('✅ Student created successfully:', result)
        
        // 5. Clean up - delete the test student
        if (result && result[0] && result[0].id) {
            console.log('5️⃣ Cleaning up test student...')
            await supabase
                .from('students')
                .delete()
                .eq('id', result[0].id)
            console.log('✅ Test student cleaned up')
        }
        
    } catch (error) {
        console.error('❌ Unexpected error:', error)
    }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
    window.debugStudentCreation = debugStudentCreation
}

debugStudentCreation()
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { localDB } from '@/lib/storage'
import { StudentInsert } from '@/types'

interface MigrationStatus {
  localStudents: number
  supabaseStudents: number
  migrated: number
  errors: string[]
  isRunning: boolean
  completed: boolean
}

export default function DataMigration() {
  const [status, setStatus] = useState<MigrationStatus>({
    localStudents: 0,
    supabaseStudents: 0,
    migrated: 0,
    errors: [],
    isRunning: false,
    completed: false
  })
  const [localData, setLocalData] = useState<any[]>([])
  const [showMigration, setShowMigration] = useState(false)

  useEffect(() => {
    checkData()
  }, [])

  async function checkData() {
    try {
      // Check localStorage
      const localStudents = await localDB.getStudents()
      console.log('📁 Local students found:', localStudents.length)
      console.log('Local data:', localStudents)
      
      // Check Supabase
      const { data: supabaseStudents, error } = await supabase
        .from('students')
        .select('*')
      
      console.log('☁️ Supabase students found:', supabaseStudents?.length || 0)
      console.log('Supabase data:', supabaseStudents)

      setLocalData(localStudents)
      setStatus(prev => ({
        ...prev,
        localStudents: localStudents.length,
        supabaseStudents: supabaseStudents?.length || 0
      }))

      // Auto-show migration if there's local data but little/no supabase data
      if (localStudents.length > 0 && (supabaseStudents?.length || 0) <= 1) {
        setShowMigration(true)
      }

    } catch (error: any) {
      console.error('Error checking data:', error)
      setStatus(prev => ({
        ...prev,
        errors: [...prev.errors, `Check error: ${error.message}`]
      }))
    }
  }

  async function backupData() {
    try {
      const localStudents = await localDB.getStudents()
      const backup = {
        timestamp: new Date().toISOString(),
        students: localStudents,
        count: localStudents.length
      }
      
      // Create downloadable backup
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `students-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('✅ Backup created and downloaded')
      alert('Backup downloaded successfully!')
      
    } catch (error: any) {
      console.error('Backup error:', error)
      alert(`Backup failed: ${error.message}`)
    }
  }

  async function migrateData() {
    if (status.isRunning) return
    
    setStatus(prev => ({ ...prev, isRunning: true, errors: [], migrated: 0 }))
    
    try {
      // First, ensure we have at least one school in the database
      console.log('🏫 Checking schools in database...')
      const { data: existingSchools } = await supabase
        .from('schools')
        .select('id, name')
      
      let defaultSchoolId: string | null = null
      
      if (!existingSchools || existingSchools.length === 0) {
        console.log('📝 Creating default school...')
        const { data: newSchool, error: schoolError } = await supabase
          .from('schools')
          .insert([{
            name: 'Default School',
            target_enrollment: 50,
            current_enrollment: 0,
            monthly_cost: 0,
            program_fee_per_student: 0
          }])
          .select()
          .single()
        
        if (schoolError) {
          console.error('Failed to create default school:', schoolError)
          throw schoolError
        }
        
        defaultSchoolId = newSchool?.id
        console.log('✅ Default school created with ID:', defaultSchoolId)
      } else {
        defaultSchoolId = existingSchools[0].id
        console.log(`✅ Using existing school "${existingSchools[0].name}" with ID: ${defaultSchoolId}`)
      }
      
      const localStudents = await localDB.getStudents()
      console.log(`🚀 Starting migration of ${localStudents.length} students...`)
      
      for (let i = 0; i < localStudents.length; i++) {
        const student = localStudents[i]
        
        try {
          // Check if student already exists in Supabase
          const { data: existing } = await supabase
            .from('students')
            .select('id')
            .eq('first_name', student.first_name)
            .eq('last_name', student.last_name)
            .eq('parent_email', student.parent_email)
            .limit(1)
          
          if (existing && existing.length > 0) {
            console.log(`⏭️ Skipping ${student.first_name} ${student.last_name} - already exists`)
            continue
          }
          
          // Check if the student's school exists in the database
          let validSchoolId = student.school_id
          if (validSchoolId) {
            const { data: schoolExists } = await supabase
              .from('schools')
              .select('id')
              .eq('id', validSchoolId)
              .single()
            
            if (!schoolExists) {
              console.log(`⚠️ School ID ${validSchoolId} not found, using default school`)
              validSchoolId = defaultSchoolId
            }
          } else {
            validSchoolId = defaultSchoolId
          }
          
          // Prepare student data for Supabase (remove fields that don't exist in DB)
          const studentData: StudentInsert = {
            first_name: student.first_name,
            last_name: student.last_name,
            school_id: validSchoolId,
            grade: student.grade,
            parent_name: student.parent_name,
            parent_phone: student.parent_phone,
            parent_email: student.parent_email,
            status: student.status,
            class_type: student.class_type,
            payment_status: student.payment_status,
            consent_received: student.consent_received,
            certificate_given: student.certificate_given,
            cube_received: student.cube_received,
            items_purchased: student.items_purchased || [],
            tags: student.tags || [],
            notes: student.notes || ''
          }
          
          const { data, error } = await supabase
            .from('students')
            .insert([studentData])
            .select()
            .single()
          
          if (error) {
            throw error
          }
          
          console.log(`✅ Migrated: ${student.first_name} ${student.last_name}`)
          setStatus(prev => ({ ...prev, migrated: prev.migrated + 1 }))
          
        } catch (studentError: any) {
          const errorMsg = `Failed to migrate ${student.first_name} ${student.last_name}: ${studentError.message}`
          console.error('❌', errorMsg)
          setStatus(prev => ({ ...prev, errors: [...prev.errors, errorMsg] }))
        }
      }
      
      setStatus(prev => ({ ...prev, completed: true }))
      console.log('🎉 Migration completed!')
      
      // Refresh the counts
      await checkData()
      
    } catch (error: any) {
      console.error('Migration error:', error)
      setStatus(prev => ({ 
        ...prev, 
        errors: [...prev.errors, `Migration error: ${error.message}`] 
      }))
    } finally {
      setStatus(prev => ({ ...prev, isRunning: false }))
    }
  }

  if (!showMigration) {
    return (
      <div className="fixed bottom-4 left-4 bg-blue-900 text-white p-3 rounded-lg shadow-lg text-sm z-50">
        <div className="flex items-center gap-2">
          <span>📊 Local: {status.localStudents} | ☁️ DB: {status.supabaseStudents}</span>
          <button 
            onClick={() => setShowMigration(true)}
            className="bg-blue-600 px-2 py-1 rounded text-xs hover:bg-blue-700"
          >
            Migrate
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-4 bg-gray-900 text-white p-6 rounded-lg shadow-2xl max-w-2xl mx-auto my-8 overflow-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-400">🔄 Data Migration Tool</h2>
        <button 
          onClick={() => setShowMigration(false)}
          className="text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="font-semibold mb-2">📊 Data Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-300">Local Storage:</span>
              <span className="text-yellow-300 ml-2 font-mono">{status.localStudents} students</span>
            </div>
            <div>
              <span className="text-gray-300">Supabase DB:</span>
              <span className="text-green-300 ml-2 font-mono">{status.supabaseStudents} students</span>
            </div>
          </div>
          
          {status.migrated > 0 && (
            <div className="mt-2">
              <span className="text-gray-300">Migrated:</span>
              <span className="text-blue-300 ml-2 font-mono">{status.migrated} students</span>
            </div>
          )}
        </div>

        {localData.length > 0 && (
          <div className="bg-gray-800 p-4 rounded max-h-48 overflow-y-auto">
            <h3 className="font-semibold mb-2">👥 Local Students Preview</h3>
            <div className="text-xs space-y-1">
              {localData.slice(0, 10).map((student, i) => (
                <div key={i} className="text-gray-300">
                  {i + 1}. {student.first_name} {student.last_name} ({student.parent_email})
                </div>
              ))}
              {localData.length > 10 && (
                <div className="text-gray-500">... and {localData.length - 10} more</div>
              )}
            </div>
          </div>
        )}

        {status.errors.length > 0 && (
          <div className="bg-red-900 p-4 rounded max-h-32 overflow-y-auto">
            <h3 className="font-semibold mb-2 text-red-300">❌ Errors</h3>
            <div className="text-xs space-y-1">
              {status.errors.map((error, i) => (
                <div key={i} className="text-red-200">{error}</div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={backupData}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
            disabled={status.isRunning}
          >
            💾 Backup Data
          </button>
          
          <button
            onClick={migrateData}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            disabled={status.isRunning || status.localStudents === 0}
          >
            {status.isRunning ? (
              <>🔄 Migrating... ({status.migrated})</>
            ) : status.completed ? (
              <>✅ Migration Complete</>
            ) : (
              <>🚀 Migrate to Database</>
            )}
          </button>
        </div>

        <div className="text-xs text-gray-400">
          <p><strong>⚠️ Important:</strong> This will copy your localStorage data to Supabase. Always backup first!</p>
          <p>Existing students in the database won't be duplicated.</p>
        </div>
      </div>
    </div>
  )
}
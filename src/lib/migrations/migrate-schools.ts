/**
 * School Migration Script
 * Migrates school data from students.school TEXT field to schools table with FK relationship
 *
 * Usage:
 * 1. Ensure schools-schema.sql has been applied to create schools table
 * 2. Ensure migration-add-school-fk.sql has been applied to add school_id column
 * 3. Run this script from the CLI or call migrateSchools()
 * 4. Verify migration completed successfully
 * 5. Run DROP COLUMN to remove old school TEXT field (after verification)
 */

import { db } from '@/lib/db'
import { students, schools } from '@/lib/db/schema'
import { sql, eq } from 'drizzle-orm'

interface SchoolRecord {
  name: string
  studentCount: number
}

/**
 * Get unique schools and their student counts
 */
export async function getUniqueSchools(): Promise<SchoolRecord[]> {
  try {
    const result = await db.execute(
      sql`
        SELECT school as name, COUNT(*) as studentCount
        FROM students
        WHERE school IS NOT NULL AND school != ''
        GROUP BY school
        ORDER BY COUNT(*) DESC
      `
    )
    return result as SchoolRecord[]
  } catch (error) {
    console.error('Error fetching unique schools:', error)
    return []
  }
}

/**
 * Determine division based on student count
 * Division A: 8+ students
 * Division B: 4-7 students
 * Division C: <4 students
 */
function getDivision(studentCount: number): 'A' | 'B' | 'C' {
  if (studentCount >= 8) return 'A'
  if (studentCount >= 4) return 'B'
  return 'C'
}

/**
 * Create a school record with auto-assigned division
 */
export async function createSchool(name: string, studentCount: number): Promise<string | null> {
  try {
    const division = getDivision(studentCount)

    const result = await db
      .insert(schools)
      .values({
        name,
        division,
        abbreviation: generateAbbreviation(name),
        active: true
      })
      .returning({ id: schools.id })

    return result[0]?.id ?? null
  } catch (error) {
    console.error(`Error creating school '${name}':`, error)
    return null
  }
}

/**
 * Generate 3-4 letter abbreviation from school name
 */
function generateAbbreviation(schoolName: string): string {
  return schoolName
    .split(' ')
    .map(word => word[0]?.toUpperCase())
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

/**
 * Update all students with a specific school TEXT value to have school_id FK
 */
export async function updateStudentsSchoolId(schoolName: string, schoolId: string): Promise<number> {
  try {
    const result = await db
      .update(students)
      .set({ school_id: schoolId })
      .where(eq(students.school, schoolName))
      .returning({ id: students.id })

    return result.length
  } catch (error) {
    console.error(`Error updating students for school '${schoolName}':`, error)
    return 0
  }
}

/**
 * Main migration function
 * Orchestrates the full school migration process
 */
export async function migrateSchools(): Promise<{
  success: boolean
  totalSchools: number
  migratedStudents: number
  errors: string[]
}> {
  console.log('🚀 Starting school migration...\n')

  const errors: string[] = []
  let totalMigratedStudents = 0
  let successfulSchools = 0

  try {
    // Step 1: Get unique schools from students table
    console.log('📋 Step 1: Fetching unique schools from students table...')
    const uniqueSchools = await getUniqueSchools()
    console.log(`✅ Found ${uniqueSchools.length} unique schools\n`)

    if (uniqueSchools.length === 0) {
      return {
        success: true,
        totalSchools: 0,
        migratedStudents: 0,
        errors: ['No schools found to migrate']
      }
    }

    // Step 2: Create school records and link students
    console.log('🏫 Step 2: Creating school records and linking students...\n')

    for (const schoolRecord of uniqueSchools) {
      const { name, studentCount } = schoolRecord

      console.log(`Processing: ${name} (${studentCount} students)`)

      // Check if school already exists
      const existingSchool = await db.query.schools.findFirst({
        where: eq(schools.name, name)
      })

      let schoolId: string | null

      if (existingSchool) {
        schoolId = existingSchool.id
        console.log(`  ℹ️  School already exists in database`)
      } else {
        // Create new school
        schoolId = await createSchool(name, studentCount)
        if (!schoolId) {
          errors.push(`Failed to create school: ${name}`)
          console.log(`  ❌ Failed to create school`)
          continue
        }
        console.log(`  ✅ Created new school (Division ${getDivision(studentCount)})`)
        successfulSchools++
      }

      // Update students to link to school
      const updatedCount = await updateStudentsSchoolId(name, schoolId)
      totalMigratedStudents += updatedCount
      console.log(`  ✅ Linked ${updatedCount} students to school\n`)
    }

    // Step 3: Verify migration
    console.log('🔍 Step 3: Verifying migration...')
    const studentsWithSchoolId = await db.execute(
      sql`SELECT COUNT(*) as count FROM students WHERE school_id IS NOT NULL`
    )
    const migratedCount = (studentsWithSchoolId as any)[0]?.count ?? 0

    const totalStudents = await db.execute(
      sql`SELECT COUNT(*) as count FROM students WHERE school IS NOT NULL AND school != ''`
    )
    const totalCount = (totalStudents as any)[0]?.count ?? 0

    console.log(`✅ Migration Results:`)
    console.log(`   - Total schools: ${uniqueSchools.length}`)
    console.log(`   - Students with school_id: ${migratedCount}`)
    console.log(`   - Total students with school: ${totalCount}`)

    const success = migratedCount === totalCount

    if (success) {
      console.log(`\n✨ Migration completed successfully!`)
      console.log(`\nNext steps:`)
      console.log(`1. Verify data integrity in database`)
      console.log(`2. Test application with school-based features`)
      console.log(`3. Run: ALTER TABLE students DROP COLUMN school;`)
    } else {
      console.log(`\n⚠️  Migration incomplete - ${totalCount - migratedCount} students not linked`)
    }

    return {
      success,
      totalSchools: uniqueSchools.length,
      migratedStudents: totalMigratedStudents,
      errors
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    errors.push(`Migration failed: ${errorMessage}`)
    console.error('❌ Migration failed:', error)

    return {
      success: false,
      totalSchools: 0,
      migratedStudents: totalMigratedStudents,
      errors
    }
  }
}

// CLI Usage
if (require.main === module) {
  migrateSchools()
    .then(result => {
      console.log('\n' + JSON.stringify(result, null, 2))
      process.exit(result.success ? 0 : 1)
    })
    .catch(error => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

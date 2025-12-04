import { z } from "zod";

/**
 * Validation schemas for user inputs
 * These prevent malicious or invalid data from reaching the database
 */

// UUID validation
const UuidSchema = z.string().uuid("Invalid ID format");

// Search query validation
export const SearchQuerySchema = z.object({
  q: z
    .string()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query is too long")
    .trim(),
  grade: z.string().optional(),
  school: z.string().optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

// Student ID validation
export const StudentIdSchema = z.object({
  id: UuidSchema,
});

export type StudentId = z.infer<typeof StudentIdSchema>;

// Competition ID validation
export const CompetitionIdSchema = z.object({
  id: UuidSchema,
});

export type CompetitionId = z.infer<typeof CompetitionIdSchema>;

// Competition event ID validation
export const CompetitionEventIdSchema = z.object({
  id: UuidSchema,
});

export type CompetitionEventId = z.infer<typeof CompetitionEventIdSchema>;

// Time entry validation (for live competition entry)
export const TimeEntrySchema = z.object({
  competitionId: UuidSchema,
  eventId: UuidSchema,
  roundId: UuidSchema,
  studentId: UuidSchema,
  groupId: UuidSchema.optional(),
  time: z
    .number()
    .positive("Time must be positive")
    .finite("Time must be a finite number"),
  dnf: z.boolean().optional(),
  penalty: z.enum(["none", "+2", "dnf"]).optional(),
});

export type TimeEntry = z.infer<typeof TimeEntrySchema>;

// Pagination validation
export const PaginationSchema = z.object({
  page: z
    .number()
    .int("Page must be an integer")
    .positive("Page must be positive")
    .default(1),
  limit: z
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(50),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Export validation functions
export function validateSearchQuery(data: unknown) {
  return SearchQuerySchema.safeParse(data);
}

export function validateStudentId(data: unknown) {
  return StudentIdSchema.safeParse(data);
}

export function validateCompetitionId(data: unknown) {
  return CompetitionIdSchema.safeParse(data);
}

export function validateTimeEntry(data: unknown) {
  return TimeEntrySchema.safeParse(data);
}

export function validatePagination(data: unknown) {
  return PaginationSchema.safeParse(data);
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Upload, FileText, Check, X, AlertCircle } from "lucide-react";

interface ParsedStudent {
  first_name: string;
  last_name: string;
  email?: string;
  grade?: string;
  student_class?: string;
  school?: string;
  guardian_name?: string;
  guardian_email?: string;
  valid: boolean;
  error?: string;
}

export default function ImportStudentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedStudent[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      toast({
        title: "Invalid CSV",
        description: "CSV must have a header row and at least one data row",
        variant: "destructive",
      });
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const students: ParsedStudent[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      const student: ParsedStudent = {
        first_name: "",
        last_name: "",
        valid: true,
      };

      headers.forEach((header, index) => {
        const value = values[index] || "";
        switch (header) {
          case "first_name":
          case "firstname":
          case "first":
            student.first_name = value;
            break;
          case "last_name":
          case "lastname":
          case "last":
          case "surname":
            student.last_name = value;
            break;
          case "email":
            student.email = value || undefined;
            break;
          case "grade":
          case "year":
            student.grade = value || undefined;
            break;
          case "class":
          case "student_class":
          case "house":
            student.student_class = value || undefined;
            break;
          case "school":
            student.school = value || undefined;
            break;
          case "guardian_name":
          case "parent_name":
          case "parent":
            student.guardian_name = value || undefined;
            break;
          case "guardian_email":
          case "parent_email":
            student.guardian_email = value || undefined;
            break;
        }
      });

      // Validate
      if (!student.first_name) {
        student.valid = false;
        student.error = "Missing first name";
      } else if (!student.last_name) {
        student.valid = false;
        student.error = "Missing last name";
      }

      students.push(student);
    }

    setParsedData(students);
  };

  const handleImport = async () => {
    const validStudents = parsedData.filter((s) => s.valid);
    if (validStudents.length === 0) {
      toast({
        title: "No valid students",
        description: "Please fix the errors and try again",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);
    const supabase = createClient();
    let success = 0;
    let failed = 0;

    for (const student of validStudents) {
      const { error } = await supabase.from("students").insert({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email || null,
        grade: student.grade || null,
        student_class: student.student_class || null,
        school: student.school || null,
        guardian_name: student.guardian_name || null,
        guardian_email: student.guardian_email || null,
      });

      if (error) {
        failed++;
      } else {
        success++;
      }
    }

    setImportResults({ success, failed });
    setImporting(false);

    if (success > 0) {
      toast({
        title: "Import Complete!",
        description: `Successfully imported ${success} students`,
      });
    }
  };

  const validCount = parsedData.filter((s) => s.valid).length;
  const invalidCount = parsedData.filter((s) => !s.valid).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/students"
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Upload className="h-8 w-8 text-blue-500" />
          Import Students
        </h1>
        <p className="text-gray-500 mt-1">
          Upload a CSV file to bulk import students
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            CSV should have columns: first_name, last_name, email, grade, class, school, guardian_name, guardian_email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-sm text-gray-400 mt-1">CSV files only</p>
            </label>
          </div>

          {/* Sample Format */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Example CSV format:</p>
            <code className="text-xs text-gray-600 block">
              first_name,last_name,email,grade,class,school<br />
              John,Smith,john@email.com,Grade 3,3A,Central School<br />
              Jane,Doe,jane@email.com,Grade 4,4B,Central School
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {parsedData.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  {validCount} valid, {invalidCount} with errors
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="success">{validCount} Ready</Badge>
                {invalidCount > 0 && (
                  <Badge variant="destructive">{invalidCount} Errors</Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>School</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((student, index) => (
                    <TableRow key={index} className={!student.valid ? "bg-red-50" : ""}>
                      <TableCell>
                        {student.valid ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {student.first_name} {student.last_name}
                          </p>
                          {student.error && (
                            <p className="text-xs text-red-500">{student.error}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{student.email || "-"}</TableCell>
                      <TableCell>{student.grade || "-"}</TableCell>
                      <TableCell>{student.student_class || "-"}</TableCell>
                      <TableCell>{student.school || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Check className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-900">Import Complete!</p>
                <p className="text-sm text-green-700">
                  {importResults.success} students imported successfully
                  {importResults.failed > 0 && `, ${importResults.failed} failed`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {parsedData.length > 0 && !importResults && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setParsedData([]);
            }}
          >
            Clear
          </Button>
          <Button
            onClick={handleImport}
            disabled={importing || validCount === 0}
            className="flex-1"
          >
            {importing ? "Importing..." : `Import ${validCount} Students`}
          </Button>
        </div>
      )}

      {importResults && (
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard/students")}>
            View Students
          </Button>
          <Button
            onClick={() => {
              setFile(null);
              setParsedData([]);
              setImportResults(null);
            }}
          >
            Import More
          </Button>
        </div>
      )}
    </div>
  );
}

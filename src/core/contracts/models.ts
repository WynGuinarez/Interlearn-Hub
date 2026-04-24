export interface UploadedAsset {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  previewUrl: string;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  educationLevel: string;
  hourlyRate: number;
  subjects: string[];
  bankAccount?: string;
  hasProfilePic: boolean;
  hasTOR: boolean;
  hasDiploma: boolean;
  profilePicture?: UploadedAsset;
  documents?: UploadedAsset[];
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gradeLevel: string;
  subjects: string[];
  profilePicture?: UploadedAsset;
  documents?: UploadedAsset[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  days: string[];
  startTime: string;
  endTime: string;
  gradeLevel: string;
  facultyId: string;
}

export interface TimeLog {
  id: string;
  date: string;
  time: string;
  facultyId: string;
  facultyName: string;
  subject: string;
  grade: string;
  hours: number;
  hourlyRate: number;
  isOvertime: boolean;
  hasTOR: boolean;
  hasDiploma: boolean;
  periodStart?: string;
  periodEnd?: string;
  periodLabel?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  subject: string;
  status: 'Present' | 'Absent';
  periodStart?: string;
  periodEnd?: string;
  periodLabel?: string;
}

export interface AppBootstrapData {
  faculty: Faculty[];
  students: Student[];
  subjects: Subject[];
  timeLogs: TimeLog[];
  attendance: AttendanceRecord[];
}

export type CreateFacultyPayload = Faculty;
export type CreateStudentPayload = Student;
export type CreateSubjectPayload = Subject;
export type UpdateSubjectPayload = Partial<Subject>;

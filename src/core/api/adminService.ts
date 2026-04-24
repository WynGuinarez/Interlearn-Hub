import { apiRequest } from './apiClient';
import type {
  AppBootstrapData,
  AttendanceRecord,
  CreateFacultyPayload,
  CreateStudentPayload,
  CreateSubjectPayload,
  Faculty,
  Student,
  Subject,
  TimeLog,
  UpdateSubjectPayload,
} from '../contracts/models';

const USE_MOCKS = import.meta.env.VITE_ENABLE_MOCKS !== 'false';

const mockDb: AppBootstrapData = {
  faculty: [
    {
      id: 'FA-1001',
      name: 'Dr. Sarah Martinez',
      email: 'sarah.martinez@interlearn.edu',
      phone: '+1 (555) 123-4567',
      address: '123 Academic Ave, Education City',
      educationLevel: 'Doctorate',
      hourlyRate: 75,
      subjects: ['MATH-101'],
      bankAccount: '****-****-1234',
      hasProfilePic: true,
      hasTOR: true,
      hasDiploma: true,
    },
    {
      id: 'FA-1002',
      name: 'Prof. Daniel Kim',
      email: 'daniel.kim@interlearn.edu',
      phone: '+1 (555) 333-8181',
      address: '87 Learning Blvd, Education City',
      educationLevel: 'Masteral',
      hourlyRate: 68,
      subjects: ['SCI-201', 'ENG-301'],
      bankAccount: '****-****-7788',
      hasProfilePic: true,
      hasTOR: true,
      hasDiploma: true,
    },
    {
      id: 'FA-1003',
      name: 'Ms. Priya Nair',
      email: 'priya.nair@interlearn.edu',
      phone: '+1 (555) 262-1122',
      address: '22 Mentor St, Education City',
      educationLevel: 'Masteral',
      hourlyRate: 64,
      subjects: ['HIS-210'],
      bankAccount: '****-****-9012',
      hasProfilePic: true,
      hasTOR: true,
      hasDiploma: true,
    },
    {
      id: 'FA-1004',
      name: 'Mr. Carlos Mendez',
      email: 'carlos.mendez@interlearn.edu',
      phone: '+1 (555) 188-4001',
      address: '54 Scholar Rd, Education City',
      educationLevel: 'Bachelor',
      hourlyRate: 58,
      subjects: ['ICT-120'],
      bankAccount: '****-****-4455',
      hasProfilePic: true,
      hasTOR: true,
      hasDiploma: true,
    },
    {
      id: 'FA-1005',
      name: 'Dr. Amelia Cruz',
      email: 'amelia.cruz@interlearn.edu',
      phone: '+1 (555) 915-6622',
      address: '6 Faculty Lane, Education City',
      educationLevel: 'Doctorate',
      hourlyRate: 79,
      subjects: ['PHY-220'],
      bankAccount: '****-****-3321',
      hasProfilePic: true,
      hasTOR: true,
      hasDiploma: true,
    },
  ],
  students: [
    {
      id: 'ST-10001',
      name: 'Alex Johnson',
      email: 'alex.johnson@student.interlearn.edu',
      phone: '+1 (555) 111-2222',
      address: '321 Student St, Campus Town',
      gradeLevel: 'Grade 10',
      subjects: ['MATH-101'],
    },
    {
      id: 'ST-10002',
      name: 'Jamie Rivera',
      email: 'jamie.rivera@student.interlearn.edu',
      phone: '+1 (555) 444-9080',
      address: '91 Campus Loop, Campus Town',
      gradeLevel: 'Grade 10',
      subjects: ['MATH-101', 'SCI-201'],
    },
    {
      id: 'ST-10003',
      name: 'Morgan Lee',
      email: 'morgan.lee@student.interlearn.edu',
      phone: '+1 (555) 222-7070',
      address: '14 Scholar Ave, Campus Town',
      gradeLevel: 'Grade 11',
      subjects: ['ENG-301', 'SCI-201'],
    },
    {
      id: 'ST-10004',
      name: 'Taylor Brooks',
      email: 'taylor.brooks@student.interlearn.edu',
      phone: '+1 (555) 714-3003',
      address: '45 Elm St, Campus Town',
      gradeLevel: 'Grade 9',
      subjects: ['HIS-210', 'ICT-120'],
    },
    {
      id: 'ST-10005',
      name: 'Jordan Miles',
      email: 'jordan.miles@student.interlearn.edu',
      phone: '+1 (555) 640-1188',
      address: '92 Oak Drive, Campus Town',
      gradeLevel: 'Grade 10',
      subjects: ['MATH-101', 'ICT-120'],
    },
    {
      id: 'ST-10006',
      name: 'Riley Stone',
      email: 'riley.stone@student.interlearn.edu',
      phone: '+1 (555) 805-5511',
      address: '5 Maple Ave, Campus Town',
      gradeLevel: 'Grade 11',
      subjects: ['ENG-301', 'PHY-220'],
    },
    {
      id: 'ST-10007',
      name: 'Casey Morgan',
      email: 'casey.morgan@student.interlearn.edu',
      phone: '+1 (555) 224-7779',
      address: '33 Cedar St, Campus Town',
      gradeLevel: 'Grade 12',
      subjects: ['PHY-220', 'ENG-301'],
    },
    {
      id: 'ST-10008',
      name: 'Avery Gomez',
      email: 'avery.gomez@student.interlearn.edu',
      phone: '+1 (555) 339-4810',
      address: '71 Birch Rd, Campus Town',
      gradeLevel: 'Grade 9',
      subjects: ['HIS-210', 'SCI-201'],
    },
    {
      id: 'ST-10009',
      name: 'Noah Patel',
      email: 'noah.patel@student.interlearn.edu',
      phone: '+1 (555) 118-9322',
      address: '16 Pine St, Campus Town',
      gradeLevel: 'Grade 12',
      subjects: ['ICT-120', 'PHY-220'],
    },
    {
      id: 'ST-10010',
      name: 'Skylar Bennett',
      email: 'skylar.bennett@student.interlearn.edu',
      phone: '+1 (555) 470-6001',
      address: '8 Riverwalk, Campus Town',
      gradeLevel: 'Grade 10',
      subjects: ['MATH-101', 'SCI-201'],
    },
  ],
  subjects: [
    {
      id: 'MATH-101',
      code: 'MATH-101',
      name: 'Algebra Fundamentals',
      description: 'Introduction to algebraic concepts and problem-solving',
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '09:00',
      endTime: '10:30',
      gradeLevel: 'Grade 10',
      facultyId: 'FA-1001',
    },
    {
      id: 'SCI-201',
      code: 'SCI-201',
      name: 'General Science',
      description: 'Core scientific concepts with lab-style activities',
      days: ['Tuesday', 'Thursday'],
      startTime: '10:45',
      endTime: '12:00',
      gradeLevel: 'Grade 10',
      facultyId: 'FA-1002',
    },
    {
      id: 'ENG-301',
      code: 'ENG-301',
      name: 'English Composition',
      description: 'Writing fundamentals, grammar, and composition practice',
      days: ['Monday', 'Wednesday'],
      startTime: '13:00',
      endTime: '14:30',
      gradeLevel: 'Grade 11',
      facultyId: 'FA-1002',
    },
    {
      id: 'HIS-210',
      code: 'HIS-210',
      name: 'World History',
      description: 'Survey of key historical events and civilizations',
      days: ['Tuesday', 'Thursday'],
      startTime: '08:00',
      endTime: '09:15',
      gradeLevel: 'Grade 9',
      facultyId: 'FA-1003',
    },
    {
      id: 'ICT-120',
      code: 'ICT-120',
      name: 'Digital Literacy',
      description: 'Foundations of computing, productivity tools, and online safety',
      days: ['Monday', 'Friday'],
      startTime: '11:00',
      endTime: '12:15',
      gradeLevel: 'Grade 10',
      facultyId: 'FA-1004',
    },
    {
      id: 'PHY-220',
      code: 'PHY-220',
      name: 'Applied Physics',
      description: 'Practical physics concepts with problem-based learning',
      days: ['Wednesday', 'Friday'],
      startTime: '14:45',
      endTime: '16:00',
      gradeLevel: 'Grade 12',
      facultyId: 'FA-1005',
    },
  ],
  timeLogs: [
    {
      id: 'TL-2026-0411-001',
      date: '2026-04-11',
      time: '09:05',
      facultyId: 'FA-1001',
      facultyName: 'Dr. Sarah Martinez',
      subject: 'MATH-101',
      grade: 'Grade 10',
      hours: 2,
      hourlyRate: 75,
      isOvertime: false,
      hasTOR: true,
      hasDiploma: true,
      periodStart: '2026-04-11',
      periodEnd: '2026-04-25',
      periodLabel: '2026-04-11_to_2026-04-25',
    },
    {
      id: 'TL-2026-0415-002',
      date: '2026-04-15',
      time: '10:50',
      facultyId: 'FA-1002',
      facultyName: 'Prof. Daniel Kim',
      subject: 'SCI-201',
      grade: 'Grade 10',
      hours: 1.5,
      hourlyRate: 68,
      isOvertime: false,
      hasTOR: true,
      hasDiploma: true,
      periodStart: '2026-04-11',
      periodEnd: '2026-04-25',
      periodLabel: '2026-04-11_to_2026-04-25',
    },
    {
      id: 'TL-2026-0422-003',
      date: '2026-04-22',
      time: '13:10',
      facultyId: 'FA-1002',
      facultyName: 'Prof. Daniel Kim',
      subject: 'ENG-301',
      grade: 'Grade 11',
      hours: 2.5,
      hourlyRate: 68,
      isOvertime: true,
      hasTOR: true,
      hasDiploma: true,
      periodStart: '2026-04-11',
      periodEnd: '2026-04-25',
      periodLabel: '2026-04-11_to_2026-04-25',
    },
  ],
  attendance: [
    {
      id: 'AT-2026-0411-001',
      studentId: 'ST-10001',
      studentName: 'Alex Johnson',
      date: '2026-04-11',
      time: '09:00',
      subject: 'MATH-101',
      status: 'Present',
      periodStart: '2026-04-11',
      periodEnd: '2026-04-25',
      periodLabel: '2026-04-11_to_2026-04-25',
    },
    {
      id: 'AT-2026-0415-002',
      studentId: 'ST-10002',
      studentName: 'Jamie Rivera',
      date: '2026-04-15',
      time: '10:45',
      subject: 'SCI-201',
      status: 'Present',
      periodStart: '2026-04-11',
      periodEnd: '2026-04-25',
      periodLabel: '2026-04-11_to_2026-04-25',
    },
    {
      id: 'AT-2026-0422-003',
      studentId: 'ST-10003',
      studentName: 'Morgan Lee',
      date: '2026-04-22',
      time: '13:00',
      subject: 'ENG-301',
      status: 'Absent',
      periodStart: '2026-04-11',
      periodEnd: '2026-04-25',
      periodLabel: '2026-04-11_to_2026-04-25',
    },
  ],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export const adminService = {
  async getBootstrapData(): Promise<AppBootstrapData> {
    if (USE_MOCKS) return clone(mockDb);
    return apiRequest<AppBootstrapData>('/api/admin/bootstrap');
  },
  async createFaculty(payload: CreateFacultyPayload): Promise<Faculty> {
    if (USE_MOCKS) {
      mockDb.faculty.push(payload);
      return clone(payload);
    }
    return apiRequest<Faculty>('/api/faculty', { method: 'POST', body: JSON.stringify(payload) });
  },
  async createStudent(payload: CreateStudentPayload): Promise<Student> {
    if (USE_MOCKS) {
      mockDb.students.push(payload);
      return clone(payload);
    }
    return apiRequest<Student>('/api/students', { method: 'POST', body: JSON.stringify(payload) });
  },
  async createSubject(payload: CreateSubjectPayload): Promise<Subject> {
    if (USE_MOCKS) {
      mockDb.subjects.push(payload);
      return clone(payload);
    }
    return apiRequest<Subject>('/api/subjects', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateSubject(id: string, payload: UpdateSubjectPayload): Promise<Subject> {
    if (USE_MOCKS) {
      const current = mockDb.subjects.find((item) => item.id === id);
      if (!current) throw new Error('Subject not found');
      Object.assign(current, payload);
      return clone(current);
    }
    return apiRequest<Subject>(`/api/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async deleteSubject(id: string): Promise<void> {
    if (USE_MOCKS) {
      mockDb.subjects = mockDb.subjects.filter((item) => item.id !== id);
      return;
    }
    await apiRequest<void>(`/api/subjects/${id}`, { method: 'DELETE' });
  },
  async addTimeLog(payload: TimeLog): Promise<TimeLog> {
    if (USE_MOCKS) {
      mockDb.timeLogs.push(payload);
      return clone(payload);
    }
    return apiRequest<TimeLog>('/api/time-logs', { method: 'POST', body: JSON.stringify(payload) });
  },
  async addAttendance(payload: AttendanceRecord): Promise<AttendanceRecord> {
    if (USE_MOCKS) {
      mockDb.attendance.push(payload);
      return clone(payload);
    }
    return apiRequest<AttendanceRecord>('/api/attendance', { method: 'POST', body: JSON.stringify(payload) });
  },
};

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { adminService } from '../api/adminService';
import type {
  AttendanceRecord,
  Faculty,
  Student,
  Subject,
  TimeLog,
} from '../contracts/models';
import { getPayrollPeriod } from '../utils/payrollPeriod';

interface AppState {
  faculty: Faculty[];
  students: Student[];
  subjects: Subject[];
  timeLogs: TimeLog[];
  attendance: AttendanceRecord[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addFaculty: (faculty: Faculty) => Promise<void>;
  updateFaculty: (id: string, faculty: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  addSubject: (subject: Subject) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addTimeLog: (log: TimeLog) => Promise<void>;
  deleteTimeLog: (id: string) => void;
  addAttendance: (record: AttendanceRecord) => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getBootstrapData();
      setFaculty(data.faculty);
      setStudents(data.students);
      setSubjects(data.subjects);
      setTimeLogs(data.timeLogs);
      setAttendance(data.attendance);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load app data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const addFaculty = useCallback(async (newFaculty: Faculty) => {
    const created = await adminService.createFaculty(newFaculty);
    setFaculty((prev) => [...prev, created]);
  }, []);

  const updateFaculty = useCallback((id: string, updates: Partial<Faculty>) => {
    setFaculty((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const deleteFaculty = useCallback((id: string) => {
    setFaculty((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addStudent = useCallback(async (newStudent: Student) => {
    const created = await adminService.createStudent(newStudent);
    setStudents((prev) => [...prev, created]);
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    setStudents((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const deleteStudent = useCallback((id: string) => {
    setStudents((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addSubject = useCallback(async (newSubject: Subject) => {
    const created = await adminService.createSubject(newSubject);
    setSubjects((prev) => [...prev, created]);
  }, []);

  const updateSubject = useCallback(async (id: string, updates: Partial<Subject>) => {
    const updated = await adminService.updateSubject(id, updates);
    setSubjects((prev) => prev.map((item) => (item.id === id ? updated : item)));
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    await adminService.deleteSubject(id);
    setSubjects((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addTimeLog = useCallback(async (log: TimeLog) => {
    const period = getPayrollPeriod(log.date);
    const payload = {
      ...log,
      periodStart: log.periodStart ?? period.start,
      periodEnd: log.periodEnd ?? period.end,
      periodLabel: log.periodLabel ?? period.label,
    };
    const created = await adminService.addTimeLog(payload);
    setTimeLogs((prev) => [...prev, created]);
  }, []);

  const deleteTimeLog = useCallback((id: string) => {
    setTimeLogs((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addAttendance = useCallback(async (record: AttendanceRecord) => {
    const period = getPayrollPeriod(record.date);
    const payload = {
      ...record,
      periodStart: record.periodStart ?? period.start,
      periodEnd: record.periodEnd ?? period.end,
      periodLabel: record.periodLabel ?? period.label,
    };
    const created = await adminService.addAttendance(payload);
    setAttendance((prev) => [...prev, created]);
  }, []);

  const value = useMemo(
    () => ({
      faculty,
      students,
      subjects,
      timeLogs,
      attendance,
      isLoading,
      error,
      reload,
      addFaculty,
      updateFaculty,
      deleteFaculty,
      addStudent,
      updateStudent,
      deleteStudent,
      addSubject,
      updateSubject,
      deleteSubject,
      addTimeLog,
      deleteTimeLog,
      addAttendance,
    }),
    [
      attendance,
      addAttendance,
      addFaculty,
      addStudent,
      addSubject,
      addTimeLog,
      deleteFaculty,
      deleteStudent,
      deleteSubject,
      deleteTimeLog,
      error,
      faculty,
      isLoading,
      reload,
      students,
      subjects,
      timeLogs,
      updateFaculty,
      updateStudent,
      updateSubject,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

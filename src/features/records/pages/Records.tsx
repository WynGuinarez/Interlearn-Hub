import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import { useApp } from '@/core/state/store';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatTime12Hour } from '@/core/utils/time';
import { getCurrentPayrollPeriod, resolvePeriodLabel } from '@/core/utils/payrollPeriod';

export function Records() {
  const { faculty, students, subjects, timeLogs, attendance } = useApp();
  const location = useLocation();
  const currentPeriod = getCurrentPayrollPeriod();
  const [activeTab, setActiveTab] = useState<'faculty' | 'students'>(
    location.state?.tab === 'students' ? 'students' : 'faculty'
  );
  
  useEffect(() => {
    if (location.state?.tab === 'faculty' || location.state?.tab === 'students') {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);
  
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedPeriodLabel, setSelectedPeriodLabel] = useState(currentPeriod.label);
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const toggleRow = (id: string) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
    }
  };

  const getSubjPopulation = (subjectId: string) => {
    return students.filter(s => s.subjects.includes(subjectId)).length;
  };

  const getWeeklyInput = (subject: typeof subjects[0]) => {
    if (!subject.startTime || !subject.endTime) return '0 hrs';
    // basic mock calculation for weekly input
    const start = parseInt(subject.startTime.split(':')[0]) || 0;
    const end = parseInt(subject.endTime.split(':')[0]) || 0;
    const diff = Math.max(1, end - start);
    return `${diff * subject.days.length} hrs`;
  };

  const formatDays = (days: string[]) => {
    const map: Record<string, string> = {
      'Monday': 'M',
      'Tuesday': 'T',
      'Wednesday': 'W',
      'Thursday': 'TH',
      'Friday': 'F'
    };
    return days.map(d => map[d] || d.charAt(0)).join(',');
  };

  const getFacultyPeriodLogs = (facultyId: string) =>
    timeLogs
      .filter(
        (log) =>
          log.facultyId === facultyId &&
          resolvePeriodLabel(log.date, log.periodLabel) === selectedPeriodLabel
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStudentPeriodAttendance = (studentId: string) =>
    attendance
      .filter(
        (record) =>
          record.studentId === studentId &&
          resolvePeriodLabel(record.date, record.periodLabel) === selectedPeriodLabel
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const availablePeriodOptions = useMemo(() => {
    const sourceLabels =
      activeTab === 'faculty'
        ? timeLogs.map((log) => resolvePeriodLabel(log.date, log.periodLabel))
        : attendance.map((record) => resolvePeriodLabel(record.date, record.periodLabel));

    const labels = Array.from(new Set([currentPeriod.label, ...sourceLabels])).sort((a, b) =>
      b.localeCompare(a)
    );

    return labels.map((label) => {
      const [start = '', end = ''] = label.split('_to_');
      return { label, display: `${start} to ${end}` };
    });
  }, [activeTab, attendance, currentPeriod.label, timeLogs]);

  const selectedPeriodDisplay =
    availablePeriodOptions.find((option) => option.label === selectedPeriodLabel)?.display ??
    `${currentPeriod.start} to ${currentPeriod.end}`;

  const filteredFaculty = useMemo(() => {
    const query = facultySearchQuery.trim().toLowerCase();
    if (!query) return faculty;

    return faculty.filter(
      (record) =>
        record.name.toLowerCase().includes(query) || record.id.toLowerCase().includes(query)
    );
  }, [faculty, facultySearchQuery]);

  const filteredStudents = useMemo(() => {
    const query = studentSearchQuery.trim().toLowerCase();
    if (!query) return students;

    return students.filter(
      (record) =>
        record.name.toLowerCase().includes(query) || record.id.toLowerCase().includes(query)
    );
  }, [studentSearchQuery, students]);

  useEffect(() => {
    if (!availablePeriodOptions.some((option) => option.label === selectedPeriodLabel)) {
      setSelectedPeriodLabel(currentPeriod.label);
    }
  }, [availablePeriodOptions, currentPeriod.label, selectedPeriodLabel]);

  return (
    <div className="p-8 h-full text-foreground bg-background overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Master Records</h1>
        <p className="text-muted-foreground mt-1">Detailed directory of all faculty and student information</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-border pb-2">
        <button
          onClick={() => { setActiveTab('faculty'); setExpandedRowId(null); }}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'faculty' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Faculty Records
        </button>
        <button
          onClick={() => { setActiveTab('students'); setExpandedRowId(null); }}
          className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'students' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Student Records
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <label className="text-sm text-muted-foreground">Attendance Period</label>
          <select
            value={selectedPeriodLabel}
            onChange={(e) => setSelectedPeriodLabel(e.target.value)}
            className="px-3 py-2 border border-border bg-input-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
          >
            {availablePeriodOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.display}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          value={activeTab === 'faculty' ? facultySearchQuery : studentSearchQuery}
          onChange={(e) =>
            activeTab === 'faculty'
              ? setFacultySearchQuery(e.target.value)
              : setStudentSearchQuery(e.target.value)
          }
          placeholder={
            activeTab === 'faculty'
              ? 'Search by name or faculty ID...'
              : 'Search by name or student ID...'
          }
          className="w-full md:w-80 px-3 py-2 border border-border bg-input-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm text-foreground"
        />
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {activeTab === 'faculty' ? (
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 w-8"></th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Faculty ID</th>
                <th className="px-6 py-3 text-right">Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFaculty.map((f) => (
                <React.Fragment key={f.id}>
                  <tr 
                    onClick={() => toggleRow(f.id)}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      {expandedRowId === f.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{f.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{f.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground text-right font-medium">
                      {subjects.filter(s => f.subjects.includes(s.id)).length}
                    </td>
                  </tr>
                  
                  {expandedRowId === f.id && (
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="px-14 py-6 border-b border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Phone Number</p>
                            <p className="text-foreground">{f.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Email</p>
                            <p className="text-foreground">{f.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Educational Level</p>
                            <p className="text-foreground">{f.educationLevel}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Compensation Rate</p>
                            <p className="text-foreground font-medium">${f.hourlyRate}/hr</p>
                          </div>
                        </div>
                        <div className="mb-5">
                          <h3 className="text-sm font-semibold text-foreground mb-2">Uploaded Files</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {f.profilePicture?.previewUrl && (
                              <a
                                href={f.profilePicture.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 text-xs rounded border border-border bg-background hover:bg-muted/50"
                              >
                                Profile: {f.profilePicture.fileName}
                              </a>
                            )}
                            {f.documents && f.documents.length > 0 ? (
                              f.documents.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.previewUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 text-xs rounded border border-border bg-background hover:bg-muted/50"
                                >
                                  {doc.label}: {doc.fileName}
                                </a>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No additional documents uploaded.</span>
                            )}
                          </div>
                        </div>
                        <div className="mb-2">
                          <h3 className="text-sm font-semibold text-foreground">Assigned Subjects</h3>
                        </div>
                        <div className="bg-background border border-border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-muted border-b border-border text-muted-foreground font-medium text-xs">
                              <tr>
                                <th className="px-4 py-3">Subject Code</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-center">Day</th>
                                <th className="px-4 py-3 text-center">Time</th>
                                <th className="px-4 py-3 text-center">Total Subj. Population</th>
                                <th className="px-4 py-3 text-right">Total Expected Weekly Input</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {subjects.filter(s => f.subjects.includes(s.id)).length > 0 ? (
                                subjects.filter(s => f.subjects.includes(s.id)).map(sub => (
                                  <tr key={sub.id} className="hover:bg-muted/50 transition-colors bg-background">
                                    <td className="px-4 py-3 text-foreground font-medium">{sub.code}</td>
                                    <td className="px-4 py-3 text-foreground uppercase">{sub.name}</td>
                                    <td className="px-4 py-3 text-foreground text-center">{formatDays(sub.days)}</td>
                                    <td className="px-4 py-3 text-foreground text-center">{formatTime12Hour(sub.startTime, { meridiemSpacing: 'compact' })} - {formatTime12Hour(sub.endTime, { meridiemSpacing: 'compact' })}</td>
                                    <td className="px-4 py-3 text-foreground text-center">{getSubjPopulation(sub.id)}</td>
                                    <td className="px-4 py-3 text-foreground text-right">{getWeeklyInput(sub)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-4 py-4 text-center text-muted-foreground italic bg-background">No assigned subjects found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-5 mb-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            Faculty Attendance ({selectedPeriodDisplay})
                          </h3>
                        </div>
                        <div className="bg-background border border-border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-muted border-b border-border text-muted-foreground font-medium text-xs">
                              <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3 text-center">Time</th>
                                <th className="px-4 py-3 text-right">Hours</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {getFacultyPeriodLogs(f.id).length > 0 ? (
                                getFacultyPeriodLogs(f.id).map((log) => (
                                  <tr key={log.id} className="hover:bg-muted/50 transition-colors bg-background">
                                    <td className="px-4 py-3 text-foreground">{log.date}</td>
                                    <td className="px-4 py-3 text-foreground">{log.subject}</td>
                                    <td className="px-4 py-3 text-foreground text-center">{formatTime12Hour(log.time, { meridiemSpacing: 'compact' })}</td>
                                    <td className="px-4 py-3 text-foreground text-right">{log.hours.toFixed(2)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground italic bg-background">
                                    No faculty attendance found for the selected period.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                    No faculty records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border text-muted-foreground text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3 w-8"></th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Student ID</th>
                <th className="px-6 py-3 text-right">Subjects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.map((s) => (
                <React.Fragment key={s.id}>
                  <tr 
                    onClick={() => toggleRow(s.id)}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      {expandedRowId === s.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{s.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{s.id}</td>
                    <td className="px-6 py-4 text-sm text-foreground text-right font-medium">{s.subjects.length}</td>
                  </tr>
                  
                  {expandedRowId === s.id && (
                    <tr className="bg-muted/30">
                      <td colSpan={4} className="px-14 py-6 border-b border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Phone Number</p>
                            <p className="text-foreground">{s.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Email</p>
                            <p className="text-foreground">{s.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase">Academic Info</p>
                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary/20 text-primary-foreground/90 rounded-full text-xs">
                              {s.gradeLevel}
                            </span>
                          </div>
                        </div>
                        <div className="mb-5">
                          <h3 className="text-sm font-semibold text-foreground mb-2">Uploaded Files</h3>
                          <div className="flex flex-wrap items-center gap-2">
                            {s.profilePicture?.previewUrl && (
                              <a
                                href={s.profilePicture.previewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 text-xs rounded border border-border bg-background hover:bg-muted/50"
                              >
                                Profile: {s.profilePicture.fileName}
                              </a>
                            )}
                            {s.documents && s.documents.length > 0 ? (
                              s.documents.map((doc) => (
                                <a
                                  key={doc.id}
                                  href={doc.previewUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2 py-1 text-xs rounded border border-border bg-background hover:bg-muted/50"
                                >
                                  {doc.label}: {doc.fileName}
                                </a>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">No additional documents uploaded.</span>
                            )}
                          </div>
                        </div>
                        <div className="mb-2">
                          <h3 className="text-sm font-semibold text-foreground">Enrolled Subjects</h3>
                        </div>
                        <div className="bg-background border border-border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-muted border-b border-border text-muted-foreground font-medium text-xs">
                              <tr>
                                <th className="px-4 py-3">Subject Code</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 text-center">Day</th>
                                <th className="px-4 py-3 text-center">Time</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {s.subjects.length > 0 ? (
                                subjects.filter(sub => s.subjects.includes(sub.id)).map(sub => (
                                  <tr key={sub.id} className="hover:bg-muted/50 transition-colors bg-background">
                                    <td className="px-4 py-3 text-foreground font-medium">{sub.code}</td>
                                    <td className="px-4 py-3 text-foreground uppercase">{sub.name}</td>
                                    <td className="px-4 py-3 text-foreground text-center">{formatDays(sub.days)}</td>
                                    <td className="px-4 py-3 text-foreground text-center">{formatTime12Hour(sub.startTime, { meridiemSpacing: 'compact' })} - {formatTime12Hour(sub.endTime, { meridiemSpacing: 'compact' })}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground italic bg-background">No enrolled subjects found.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-5 mb-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            Student Attendance ({selectedPeriodDisplay})
                          </h3>
                        </div>
                        <div className="bg-background border border-border shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-muted border-b border-border text-muted-foreground font-medium text-xs">
                              <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Subject</th>
                                <th className="px-4 py-3 text-center">Time</th>
                                <th className="px-4 py-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {getStudentPeriodAttendance(s.id).length > 0 ? (
                                getStudentPeriodAttendance(s.id).map((record) => (
                                  <tr key={record.id} className="hover:bg-muted/50 transition-colors bg-background">
                                    <td className="px-4 py-3 text-foreground">{record.date}</td>
                                    <td className="px-4 py-3 text-foreground">{record.subject}</td>
                                    <td className="px-4 py-3 text-foreground text-center">{record.time}</td>
                                    <td className="px-4 py-3 text-right">
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        record.status === 'Present'
                                          ? 'bg-primary/20 text-primary-foreground/90'
                                          : 'bg-destructive/20 text-destructive-foreground'
                                      }`}>
                                        {record.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-4 text-center text-muted-foreground italic bg-background">
                                    No student attendance found for the selected period.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground italic">
                    No student records match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

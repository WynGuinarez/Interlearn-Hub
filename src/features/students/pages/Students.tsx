import { useMemo, useState } from 'react';
import { useApp } from '@/core/state/store';
import { Calendar, ChevronDown, ChevronUp, Filter, Mail, MapPin, Phone, Plus, Search, X } from 'lucide-react';
import { getCurrentPayrollPeriod, resolvePeriodLabel } from '@/core/utils/payrollPeriod';
import type { UploadedAsset } from '@/core/contracts/models';

interface UploadDraft {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  previewUrl: string;
}

const makeUploadDraft = (label: string): UploadDraft => ({
  id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  label,
  fileName: '',
  mimeType: '',
  previewUrl: '',
});

const toAsset = (doc: UploadDraft): UploadedAsset => ({
  id: doc.id,
  label: doc.label || 'Document',
  fileName: doc.fileName,
  mimeType: doc.mimeType || 'application/octet-stream',
  previewUrl: doc.previewUrl,
});

export function Students() {
  const { students, subjects, attendance, addStudent } = useApp();
  const currentPeriod = getCurrentPayrollPeriod();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [profilePicture, setProfilePicture] = useState<UploadDraft | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    gradeLevel: '',
    subjects: [] as string[],
  });

  const gradeLevels = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

  const filteredStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
          (filterGrade === '' || s.gradeLevel === filterGrade)
      ),
    [students, searchQuery, filterGrade]
  );

  const availableSubjects = formData.gradeLevel
    ? subjects.filter((s) => s.gradeLevel === formData.gradeLevel)
    : subjects;

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      gradeLevel: '',
      subjects: [],
    });
    setSelectedSubjectId('');
    setProfilePicture(null);
  };

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `ST-${Math.floor(10000 + Math.random() * 90000)}`;

    addStudent({
      id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      gradeLevel: formData.gradeLevel,
      subjects: formData.subjects,
      profilePicture: profilePicture ? toAsset(profilePicture) : undefined,
      documents: [],
    });

    setIsCreating(false);
    resetForm();
  };

  if (isCreating) {
    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

    return (
      <div className="p-8 text-foreground bg-background h-full overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Registration Form - STUDENT</h1>
          <button onClick={() => { setIsCreating(false); resetForm(); }}><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submitCreate} className="space-y-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border border-border rounded-lg bg-card">
            <input required value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Full name" />
            <input required type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Email" />
            <input required value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Phone" />
            <input required type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Password" />
            <input required value={formData.address} onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))} className="px-3 py-2 border border-border rounded bg-input-background md:col-span-2" placeholder="Address" />
            <select required value={formData.gradeLevel} onChange={(e) => setFormData((p) => ({ ...p, gradeLevel: e.target.value, subjects: [] }))} className="px-3 py-2 border border-border rounded bg-input-background">
              <option value="">Select grade level</option>
              {gradeLevels.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </div>

          <div className="p-5 border border-border rounded-lg bg-card space-y-3">
            <h2 className="font-semibold">Subject Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background">
                <option value="">Select subject</option>
                {availableSubjects.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
              </select>
              <input readOnly value={selectedSubject?.name || ''} className="px-3 py-2 border border-border rounded bg-muted/40 md:col-span-2" placeholder="Description" />
              <button type="button" onClick={() => {
                if (!selectedSubjectId || formData.subjects.includes(selectedSubjectId)) return;
                setFormData((p) => ({ ...p, subjects: [...p.subjects, selectedSubjectId] }));
                setSelectedSubjectId('');
              }} className="px-3 py-2 border border-primary/40 rounded text-primary">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map((id) => {
                const s = subjects.find((item) => item.id === id);
                if (!s) return null;
                return (
                  <button key={id} type="button" onClick={() => setFormData((p) => ({ ...p, subjects: p.subjects.filter((sub) => sub !== id) }))} className="px-2 py-1 text-sm rounded border border-border bg-muted/30">
                    {s.code} <span className="ml-1 text-muted-foreground">x</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 border border-border rounded-lg bg-card space-y-2">
            <h2 className="font-semibold">Upload Profile Picture</h2>
            <div className="flex items-center gap-3">
              <label htmlFor="student-profile-file" className="px-3 py-2 border border-border rounded bg-input-background hover:bg-muted/40 cursor-pointer text-sm">
                Choose file
              </label>
              <input
                id="student-profile-file"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setProfilePicture({
                    ...makeUploadDraft('Profile Picture'),
                    fileName: file.name,
                    mimeType: file.type,
                    previewUrl: URL.createObjectURL(file),
                  });
                }}
              />
              <span className="text-sm text-muted-foreground">{profilePicture?.fileName || 'No file chosen'}</span>
            </div>
            {profilePicture?.previewUrl && <a href={profilePicture.previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">{profilePicture.fileName}</a>}
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setIsCreating(false); resetForm(); }} className="px-4 py-2 border border-border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Register Student</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 text-foreground bg-background h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Student Accounts</h1>
          <p className="text-muted-foreground mt-1">Dropdown details with visible/clickable profile image</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <Plus className="w-5 h-5" /> Create Account
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-border bg-input-background rounded-lg" placeholder="Search by name or student ID" />
        </div>
        <div className="relative w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)} className="w-full pl-9 pr-4 py-3 border border-border bg-input-background rounded-lg appearance-none">
            <option value="">All Grades</option>
            {gradeLevels.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {filteredStudents.map((student) => {
          const isExpanded = expandedId === student.id;
          const studentSubjects = subjects.filter((subject) => student.subjects.includes(subject.id));
          const studentAttendance = attendance.filter(
            (record) =>
              record.studentId === student.id &&
              resolvePeriodLabel(record.date, record.periodLabel) === currentPeriod.label
          );

          return (
            <div key={student.id}>
              <button onClick={() => setExpandedId(isExpanded ? null : student.id)} className="w-full p-4 text-left hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.id} ? {student.gradeLevel}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">{student.subjects.length} subjects</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{student.email}</p>
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{student.phone}</p>
                      <p className="flex items-center gap-2 md:col-span-2"><MapPin className="w-4 h-4 text-muted-foreground" />{student.address}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Uploaded Files</p>
                      {student.profilePicture?.previewUrl ? (
                        <div>
                          <a href={student.profilePicture.previewUrl} target="_blank" rel="noreferrer" className="inline-block">
                            <img
                              src={student.profilePicture.previewUrl}
                              alt={`${student.name} profile`}
                              className="h-20 w-20 rounded-lg object-cover border border-border bg-muted/20"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </a>
                          <a href={student.profilePicture.previewUrl} target="_blank" rel="noreferrer" className="block text-sm text-primary underline mt-1">
                            Profile: {student.profilePicture.fileName}
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No profile picture uploaded.</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Enrolled Subjects</p>
                      <div className="space-y-2">
                        {studentSubjects.map((subject) => (
                          <div key={subject.id} className="p-2 rounded border border-border bg-background text-sm">
                            {subject.code} - {subject.name}
                          </div>
                        ))}
                        {studentSubjects.length === 0 && <p className="text-sm text-muted-foreground">No enrolled subjects.</p>}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Attendance</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Active period {currentPeriod.start} to {currentPeriod.end}
                      </p>
                      {studentAttendance.slice(0, 8).map((record) => (
                        <div key={record.id} className="p-2 rounded border border-border bg-background text-sm mb-2 flex justify-between">
                          <span className="inline-flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" />{record.subject} - {record.date}</span>
                          <span>{record.status}</span>
                        </div>
                      ))}
                      {studentAttendance.length === 0 && <p className="text-sm text-muted-foreground">No attendance records.</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useApp } from '@/core/state/store';
import { ChevronDown, ChevronUp, Mail, MapPin, Phone, Plus, Search, X } from 'lucide-react';
import { getCurrentPayrollPeriod, resolvePeriodLabel } from '@/core/utils/payrollPeriod';
import type { UploadedAsset } from '@/core/contracts/models';

interface UploadDraft {
  id: string;
  label: string;
  fileName: string;
  mimeType: string;
  previewUrl: string;
}

const makeUploadDraft = (): UploadDraft => ({
  id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label: '',
  fileName: '',
  mimeType: '',
  previewUrl: '',
});

export function Faculty() {
  const { faculty, subjects, timeLogs, addFaculty } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const currentPeriod = getCurrentPayrollPeriod();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    educationLevel: '',
    hourlyRate: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
    subjects: [] as string[],
    documents: [makeUploadDraft()] as UploadDraft[],
  });
  const [profilePicture, setProfilePicture] = useState<UploadDraft | null>(null);

  const filteredFaculty = useMemo(
    () =>
      faculty.filter(
        (f) =>
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [faculty, searchQuery]
  );

  const updateForm = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addSubject = () => {
    if (!selectedSubjectId || formData.subjects.includes(selectedSubjectId)) return;
    updateForm('subjects', [...formData.subjects, selectedSubjectId]);
    setSelectedSubjectId('');
  };

  const removeSubject = (id: string) => {
    updateForm(
      'subjects',
      formData.subjects.filter((subjectId) => subjectId !== id)
    );
  };

  const updateDoc = (id: string, patch: Partial<UploadDraft>) => {
    updateForm(
      'documents',
      formData.documents.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc))
    );
  };

  const addDocumentRow = () => updateForm('documents', [...formData.documents, makeUploadDraft()]);

  const removeDocumentRow = (id: string) => {
    if (formData.documents.length === 1) return;
    updateForm(
      'documents',
      formData.documents.filter((doc) => doc.id !== id)
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      educationLevel: '',
      hourlyRate: '',
      bankName: '',
      bankAccountName: '',
      bankAccountNumber: '',
      subjects: [],
      documents: [makeUploadDraft()],
    });
    setSelectedSubjectId('');
    setProfilePicture(null);
  };

  const toAsset = (doc: UploadDraft): UploadedAsset => ({
    id: doc.id,
    label: doc.label || 'Document',
    fileName: doc.fileName,
    mimeType: doc.mimeType || 'application/octet-stream',
    previewUrl: doc.previewUrl,
  });

  const submitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `FA-${Math.floor(1000 + Math.random() * 9000)}`;
    const documents = formData.documents
      .filter((doc) => doc.fileName && doc.previewUrl)
      .map(toAsset);

    addFaculty({
      id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      educationLevel: formData.educationLevel,
      hourlyRate: Number.parseFloat(formData.hourlyRate) || 0,
      subjects: formData.subjects,
      bankAccount: `${formData.bankName} - ${formData.bankAccountNumber} (${formData.bankAccountName})`,
      hasProfilePic: Boolean(profilePicture?.previewUrl),
      hasTOR: documents.some((d) => d.label.toLowerCase().includes('tor')),
      hasDiploma: documents.some((d) => d.label.toLowerCase().includes('diploma')),
      profilePicture: profilePicture ? toAsset(profilePicture) : undefined,
      documents,
    });

    setIsCreating(false);
    resetForm();
  };

  if (isCreating) {
    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
    return (
      <div className="p-8 text-foreground bg-background h-full overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Registration Form - FACULTY</h1>
          <button onClick={() => { setIsCreating(false); resetForm(); }}><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submitCreate} className="space-y-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border border-border rounded-lg bg-card">
            <input required value={formData.name} onChange={(e) => updateForm('name', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Full name" />
            <input required type="email" value={formData.email} onChange={(e) => updateForm('email', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Email" />
            <input required value={formData.phone} onChange={(e) => updateForm('phone', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Phone" />
            <input required type="password" value={formData.password} onChange={(e) => updateForm('password', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Password" />
            <input required value={formData.address} onChange={(e) => updateForm('address', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background md:col-span-2" placeholder="Address" />
            <input required value={formData.educationLevel} onChange={(e) => updateForm('educationLevel', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Education level" />
            <input required type="number" step="0.01" value={formData.hourlyRate} onChange={(e) => updateForm('hourlyRate', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Hourly rate" />
            <input required value={formData.bankName} onChange={(e) => updateForm('bankName', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Bank name" />
            <input required value={formData.bankAccountName} onChange={(e) => updateForm('bankAccountName', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Account name" />
            <input required value={formData.bankAccountNumber} onChange={(e) => updateForm('bankAccountNumber', e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background" placeholder="Account number" />
          </div>

          <div className="p-5 border border-border rounded-lg bg-card space-y-3">
            <h2 className="font-semibold">Subject Assignment</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="px-3 py-2 border border-border rounded bg-input-background">
                <option value="">Select subject</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.code}</option>)}
              </select>
              <input readOnly value={selectedSubject?.name || ''} className="px-3 py-2 border border-border rounded bg-muted/40 md:col-span-2" placeholder="Description" />
              <button type="button" onClick={addSubject} className="px-3 py-2 border border-primary/40 rounded text-primary">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.subjects.map((id) => {
                const s = subjects.find((item) => item.id === id);
                if (!s) return null;
                return (
                  <button key={id} type="button" onClick={() => removeSubject(id)} className="px-2 py-1 text-sm rounded border border-border bg-muted/30">
                    {s.code} <span className="ml-1 text-muted-foreground">x</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 border border-border rounded-lg bg-card space-y-4">
            <h2 className="font-semibold">Uploads</h2>
            <div className="space-y-2">
              <p className="text-sm">Profile picture</p>
              <div className="flex items-center gap-3">
                <label htmlFor="faculty-profile-file" className="px-3 py-2 border border-border rounded bg-input-background hover:bg-muted/40 cursor-pointer text-sm">
                  Choose file
                </label>
                <input
                  id="faculty-profile-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setProfilePicture({
                      id: `profile-${Date.now()}`,
                      label: 'Profile Picture',
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

            {formData.documents.map((doc, idx) => (
              <div key={doc.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                <input value={doc.label} onChange={(e) => updateDoc(doc.id, { label: e.target.value })} className="px-3 py-2 border border-border rounded bg-input-background md:col-span-2" placeholder="Document label" />
                <div className="md:col-span-2 flex items-center gap-3">
                  <label htmlFor={`faculty-doc-${doc.id}`} className="px-3 py-2 border border-border rounded bg-input-background hover:bg-muted/40 cursor-pointer text-sm">
                    Choose file
                  </label>
                  <input
                    id={`faculty-doc-${doc.id}`}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      updateDoc(doc.id, {
                        fileName: file.name,
                        mimeType: file.type,
                        previewUrl: URL.createObjectURL(file),
                      });
                    }}
                  />
                  <span className="text-sm text-muted-foreground truncate">{doc.fileName || 'No file chosen'}</span>
                </div>
                <div className="flex justify-end gap-2">
                  {doc.previewUrl && <a href={doc.previewUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">View</a>}
                  {idx > 0 && <button type="button" onClick={() => removeDocumentRow(doc.id)} className="text-sm text-destructive">Remove</button>}
                </div>
              </div>
            ))}

            <button type="button" onClick={addDocumentRow} className="inline-flex items-center gap-2 px-3 py-2 border border-primary/40 rounded text-primary">
              <Plus className="w-4 h-4" /> Add more
            </button>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => { setIsCreating(false); resetForm(); }} className="px-4 py-2 border border-border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded">Register Faculty</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 text-foreground bg-background h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Faculty Accounts</h1>
          <p className="text-muted-foreground mt-1">Dropdown details with document visibility</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          <Plus className="w-5 h-5" /> Create Account
        </button>
      </div>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-border bg-input-background rounded-lg" placeholder="Search by name or ID" />
      </div>

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {filteredFaculty.map((f) => {
          const isExpanded = expandedId === f.id;
          const facultySubjects = subjects.filter((s) => f.subjects.includes(s.id));
          const logs = timeLogs.filter((log) => log.facultyId === f.id);
          const activePeriodLogs = logs.filter((log) => resolvePeriodLabel(log.date, log.periodLabel) === currentPeriod.label);

          return (
            <div key={f.id}>
              <button onClick={() => setExpandedId(isExpanded ? null : f.id)} className="w-full p-4 text-left hover:bg-muted/40">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{f.name}</p>
                    <p className="text-sm text-muted-foreground">{f.id} ? {f.educationLevel}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm">${f.hourlyRate}/hr</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" />{f.email}</p>
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" />{f.phone}</p>
                      <p className="flex items-center gap-2 md:col-span-2"><MapPin className="w-4 h-4 text-muted-foreground" />{f.address}</p>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Uploaded Files</p>
                      {f.profilePicture?.previewUrl && (
                        <div className="mb-2">
                          <a href={f.profilePicture.previewUrl} target="_blank" rel="noreferrer" className="inline-block">
                            <img
                              src={f.profilePicture.previewUrl}
                              alt={`${f.name} profile`}
                              className="h-20 w-20 rounded-lg object-cover border border-border bg-muted/20"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </a>
                          <a href={f.profilePicture.previewUrl} target="_blank" rel="noreferrer" className="inline-flex text-primary underline text-sm mt-1">
                            Profile: {f.profilePicture.fileName}
                          </a>
                        </div>
                      )}
                      {f.documents && f.documents.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {f.documents.map((doc) => (
                            <a key={doc.id} href={doc.previewUrl} target="_blank" rel="noreferrer" className="px-2 py-1 rounded border border-border text-sm hover:bg-muted">
                              {doc.label}: {doc.fileName}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No additional documents.</p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Subject Assignments</p>
                      <div className="space-y-2">
                        {facultySubjects.map((subject) => (
                          <div key={subject.id} className="p-2 rounded border border-border bg-background text-sm">
                            {subject.code} - {subject.name}
                          </div>
                        ))}
                        {facultySubjects.length === 0 && <p className="text-sm text-muted-foreground">No subjects assigned.</p>}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-semibold mb-2">Attendance</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Active period {currentPeriod.start} to {currentPeriod.end}: {activePeriodLogs.length} logs
                      </p>
                      {logs.slice(0, 5).map((log) => (
                        <div key={log.id} className="text-sm p-2 rounded border border-border bg-background mb-2">
                          {log.date} - {log.subject} - {log.hours.toFixed(2)} hrs
                        </div>
                      ))}
                      {logs.length === 0 && <p className="text-sm text-muted-foreground">No attendance logs.</p>}
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

import { useState, useMemo } from 'react';
import { useApp } from '@/core/state/store';
import { FileText, Calendar, DollarSign, Calculator } from 'lucide-react';
import learnhubLogo from '@/assets/images/LEARNHUB-BLACK.png';
import { addHoursToTime12Hour, formatTime12Hour } from '@/core/utils/time';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatLongDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
};

const formatDayAndDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const date = d.getDate();
  const day = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  return `${month} ${date} - ${day}`;
};

const formatCurrency = (amount: number) => {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export function Payroll() {
  const { faculty, timeLogs, subjects } = useApp();
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deduction, setDeduction] = useState<number>(0);
  const [formError, setFormError] = useState('');

  const selectedFacultyData = faculty.find(f => f.id === selectedFaculty);
  
  const filteredLogs = useMemo(() => {
    return timeLogs.filter(
      log => log.facultyId === selectedFaculty &&
             (!startDate || log.date >= startDate) &&
             (!endDate || log.date <= endDate)
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [timeLogs, selectedFaculty, startDate, endDate]);

  const facultySubjects = useMemo(() => {
    return subjects.filter(s => s.facultyId === selectedFaculty);
  }, [subjects, selectedFaculty]);

  const totalHours = filteredLogs.reduce((sum, log) => sum + log.hours, 0);
  const hourlyRate = selectedFacultyData?.hourlyRate || 0;
  const grossPay = totalHours * hourlyRate;
  const netPay = grossPay - deduction;
  const hasFilters = Boolean(selectedFaculty || startDate || endDate);

  const handlePrint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacultyData || !startDate || !endDate) {
      setFormError('Please select a faculty member and specify a date range.');
      return;
    }
    setFormError('');
    const originalTitle = document.title;
    document.title = '';

    const restoreTitle = () => {
      document.title = originalTitle;
    };

    window.addEventListener('afterprint', restoreTitle, { once: true });
    window.print();

    // Fallback for browsers that do not fire afterprint reliably.
    setTimeout(restoreTitle, 1000);
  };

  return (
    <div className="p-6 pb-10 print:p-0 print:m-0 text-foreground bg-background h-full overflow-auto">
      {/* Preload logo for print so it shows up instantly in PDF */}
      <img src={learnhubLogo} alt="" className="fixed top-0 left-0 w-0 h-0 opacity-0 pointer-events-none" aria-hidden="true" />
      
      {/* --- UI Section (Hidden on Print) --- */}
      <div className="print:hidden max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-foreground">Generate Payroll</h1>
          <p className="text-muted-foreground mt-1">Calculate and prepare payroll documents</p>
          {formError && <p className="text-sm text-destructive mt-2">{formError}</p>}
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-5">
          <div className="p-4 border-b border-border bg-muted">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-border bg-input-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-border bg-input-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Faculty Name</label>
                <select
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                  className="w-full px-3 py-2 border border-border bg-input-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="">Choose faculty member</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Total Hours Rendered</label>
                <div className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground font-semibold text-right">
                  {totalHours > 0 ? `${totalHours} Hrs` : '0 Hrs'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted border-b border-border text-muted-foreground font-medium uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Time Start</th>
                  <th className="px-6 py-3">Time End</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3 text-right">Hours Rendered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-foreground">{formatDate(log.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{formatTime12Hour(log.time)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">{addHoursToTime12Hour(log.time, log.hours)}</td>
                      <td className="px-6 py-4 text-foreground">{log.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-foreground">
                        {log.hours}
                        {log.isOvertime && <span className="ml-2 text-xs text-primary-foreground bg-primary/80 px-2 py-0.5 rounded-full">Overtime</span>}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-5 text-center text-muted-foreground">
                      <p className="font-medium">No records found for the selected criteria.</p>
                      <p className="text-xs mt-1">
                        {hasFilters
                          ? 'Try adjusting faculty or date range.'
                          : 'Select a faculty member and date range to generate payroll rows.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border bg-muted">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-4 items-end">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Total Salary</label>
                  <div className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground font-bold text-right text-lg">
                    ${grossPay.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Total Deduction</label>
                  <div className="relative w-full">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={deduction || ''}
                      onChange={(e) => setDeduction(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-3 py-2 border border-border bg-input-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-right text-foreground"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Net Pay</label>
                  <div className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-foreground font-bold text-right text-lg text-primary">
                    ${netPay.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-stretch xl:items-end gap-2">
                <p className="text-xs text-muted-foreground italic font-mono flex items-center xl:justify-end">
                  <Calculator className="w-3 h-3 mr-1" />
                  200 / 60 = 3.33 per min
                </p>
                <button
                  onClick={handlePrint}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-44"
                  disabled={!selectedFacultyData || !startDate || !endDate}
                >
                  <FileText className="w-5 h-5" />
                  GENERATE PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Print Section --- */}
      {selectedFacultyData && startDate && endDate && (
        <div className="hidden print:block print:p-0 w-full max-w-4xl mx-auto bg-white text-black leading-tight">
          <style>
            {`
              @media print {
                @page { size: A4; margin: 1.8cm 1.4cm 1.4cm 1.4cm; }
                body { padding: 0; }
                .print-doc {
                  break-inside: auto;
                  page-break-inside: auto;
                }
                .print-section {
                  break-inside: avoid;
                  page-break-inside: avoid;
                }
                .print-section-safe-break {
                  break-before: auto;
                  page-break-before: auto;
                }
                .print-row {
                  orphans: 3;
                  widows: 3;
                }
              }
            `}
          </style>
          <div className="print-doc">
          {/* Header */}
          <div className="print-section text-center mb-8 font-sans text-black flex flex-col items-center">
            <img src={learnhubLogo} alt="Logo" className="w-64 object-contain mb-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }} />
            <div className="text-lg font-bold uppercase tracking-wider">PAYROLL SUMMARY</div>
          </div>

          {/* Info Section */}
          <div className="print-section mb-6 space-y-3 text-sm font-medium text-black">
            <div className="print-row flex items-start gap-4">
              <span className="uppercase font-bold w-48 shrink-0">NAME :</span>
              <span className="font-bold uppercase tracking-widest">{selectedFacultyData.name}</span>
            </div>
            
            <div className="print-row flex items-start gap-4">
              <span className="uppercase font-bold w-48 shrink-0">PAYROLL DATE :</span>
              <span className="uppercase max-w-md leading-relaxed">
                {formatLongDate(startDate)} TO {formatLongDate(endDate)}<br/>
                / {new Date(startDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} {new Date(startDate).getDate()} - {new Date(endDate).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()} {new Date(endDate).getDate()}
              </span>
            </div>

            <div className="print-row flex items-start gap-4">
              <span className="uppercase font-bold w-48 shrink-0">DISBURSEMENT DATE :</span>
              <span className="uppercase max-w-md leading-relaxed">
                15TH DAY OF THE MO. /<br/>END OF THE MON. - DAY
              </span>
            </div>
          </div>

          {/* Logs Box */}
          <div className="print-section border border-black p-4 mb-7 min-h-[220px] text-black">
            <div className="flex justify-between font-bold pb-3 text-sm uppercase">
              <div>MON DATE - DAY - [ST - ET]</div>
              <div>TOTAL HRS</div>
            </div>
            
            <div className="space-y-1.5 text-sm font-medium">
              {filteredLogs.map(log => (
                <div key={log.id} className="print-row flex justify-between uppercase">
                  <div>
                    {formatDayAndDate(log.date)} - [{formatTime12Hour(log.time)} - {addHoursToTime12Hour(log.time, log.hours)}]
                  </div>
                  <div className="w-24 text-right pr-4">
                    {log.hours.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Hours & Name */}
          <div className="print-section mb-8 space-y-4 text-sm font-bold uppercase text-black">
            <div className="print-row flex items-end gap-2">
              <span className="w-24">TOTAL HRS</span>
              <span className="border-b border-black w-64 px-2">{totalHours.toFixed(2)}</span>
            </div>
            <div className="print-row flex items-end gap-2">
              <span className="w-24 leading-snug">FACULTY<br/>NAME :</span>
              <span className="border-b border-black w-80 px-2">{selectedFacultyData.name}</span>
            </div>
          </div>

          {/* Subject Schedule */}
          <div className="print-section print-section-safe-break mb-8 text-black">
            <div className="font-bold uppercase mb-3 text-sm">SUBJECT SCHEDULE</div>
            <div className="ml-8">
              <div className="text-sm font-bold uppercase mb-2 tracking-wide flex flex-wrap gap-2">
                <span>SUBJECT CODE</span> <span className="font-normal">|</span> <span>DESCRIPTION</span> <span className="font-normal">|</span> <span>DAY</span> <span className="font-normal">|</span> <span>TIME</span>
              </div>
              
              <div className="space-y-1.5 text-sm font-medium">
                {facultySubjects.length > 0 ? (
                  facultySubjects.map(sub => (
                    <div key={sub.id} className="print-row uppercase tracking-wide flex flex-wrap gap-2">
                      <span>{sub.code}</span> <span className="font-normal">|</span> <span>{sub.name}</span> <span className="font-normal">|</span> <span>{sub.days.join(', ')}</span> <span className="font-normal">|</span> <span>{formatTime12Hour(sub.startTime)} - {formatTime12Hour(sub.endTime)}</span>
                    </div>
                  ))
                ) : (
                  <div className="italic opacity-70">No scheduled subjects found.</div>
                )}
              </div>
            </div>
          </div>

          {/* Statement of Account */}
          <div className="print-section print-section-safe-break mt-2 text-black">
            <div className="font-bold uppercase mb-3 text-sm">STATEMENT OF ACCOUNT</div>
            <div className="border-t border-b border-black py-3 px-2 space-y-2.5 text-sm uppercase">
              <div className="print-row grid grid-cols-[1fr_auto] items-end gap-6">
                <span className="font-bold">TOTAL HRS</span>
                <span className="min-w-36 text-right">{totalHours.toFixed(2)}</span>
              </div>
              <div className="print-row grid grid-cols-[1fr_auto] items-end gap-6">
                <span className="font-bold">RATE PER HR</span>
                <span className="min-w-36 text-right">{formatCurrency(hourlyRate)}</span>
              </div>
              <div className="print-row grid grid-cols-[1fr_auto] items-end gap-6">
                <span className="font-bold">GROSS AMOUNT</span>
                <span className="min-w-36 text-right">{formatCurrency(grossPay)}</span>
              </div>
              <div className="print-row grid grid-cols-[1fr_auto] items-end gap-6">
                <span className="font-bold">NET AMOUNT</span>
                <span className="min-w-36 text-right">{formatCurrency(netPay)}</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

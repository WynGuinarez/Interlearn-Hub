import { useNavigate } from 'react-router';
import { useApp } from '@/core/state/store';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, DollarSign, Users } from 'lucide-react';
import { getCurrentPayrollPeriod, resolvePeriodLabel } from '@/core/utils/payrollPeriod';

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
};

const getPayoutDateFromPeriodLabel = (periodLabel: string) => {
  const [start = '', end = ''] = periodLabel.split('_to_');
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  const payoutDay = startDate.getDate() === 26 ? 15 : 30;
  return new Date(endDate.getFullYear(), endDate.getMonth(), payoutDay);
};

export function Dashboard() {
  const { timeLogs, faculty, subjects, students } = useApp();
  const navigate = useNavigate();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentPeriod = getCurrentPayrollPeriod();
  const currentDay = new Date().getDate();
  const upcomingPayoutDay = currentDay >= 11 && currentDay <= 25 ? 30 : 15;
  const upcomingPeriodLogs = timeLogs.filter(
    (log) => resolvePeriodLabel(log.date, log.periodLabel) === currentPeriod.label
  );

  const expenditureByDate = new Map<string, { rawDate: string; date: string; standardPay: number; overtimePay: number }>();
  timeLogs.forEach((log) => {
    const periodLabel = resolvePeriodLabel(log.date, log.periodLabel);
    const payoutDate = getPayoutDateFromPeriodLabel(periodLabel);
    if (payoutDate.getMonth() !== currentMonth || payoutDate.getFullYear() !== currentYear) {
      return;
    }

    const rawDate = payoutDate.toISOString().split('T')[0];
    const formattedDate = payoutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const hourlyRate = log.isOvertime ? log.hourlyRate * 1.5 : log.hourlyRate;
    const logCost = log.hours * hourlyRate;
    const existing = expenditureByDate.get(rawDate) || {
      rawDate,
      date: formattedDate,
      standardPay: 0,
      overtimePay: 0,
    };

    if (log.isOvertime) {
      existing.overtimePay += logCost;
    } else {
      existing.standardPay += logCost;
    }

    expenditureByDate.set(rawDate, existing);
  });

  const expenditureTrend = Array.from(expenditureByDate.values())
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate))
    .map((entry, index) => ({
      id: `trend-${index}`,
      ...entry,
      standardPay: Number(entry.standardPay.toFixed(2)),
      overtimePay: Number(entry.overtimePay.toFixed(2)),
    }));

  const populationPerGrade = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((grade) => ({
    name: grade,
    population: students.filter((student) => student.gradeLevel === grade).length,
  }));

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0);
  const overtimeHours = timeLogs
    .filter((log) => log.isOvertime)
    .reduce((sum, log) => sum + log.hours, 0);
  const upcomingPayoutProjection = upcomingPeriodLogs.reduce((sum, log) => {
    const hourlyRate = log.isOvertime ? log.hourlyRate * 1.5 : log.hourlyRate;
    return sum + log.hours * hourlyRate;
  }, 0);
  const COLORS = ['#BA9731', '#DACE84', '#907421', '#F2E8C6', '#717171', '#333333'];

  // Format currency for tooltips
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  return (
    <div className="p-8 text-foreground bg-background min-h-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard & Analytics</h1>
        <p className="text-muted-foreground mt-1">Financial overview and payroll cost analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border hover:border-border-gold transition-colors duration-200 text-card-foreground shadow-sm group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Current Projected Payroll </p>
              <p className="text-3xl font-bold text-foreground mt-1">${upcomingPayoutProjection.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-success mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-success"></span>
                For payout on {upcomingPayoutDay}th ({currentPeriod.start} to {currentPeriod.end})
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center shadow-inner group-hover:bg-primary transition-colors">
              <DollarSign className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border hover:border-border-gold transition-colors duration-200 text-card-foreground shadow-sm group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Total Hours Tracked</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalHours.toFixed(1)}</p>
              <p className="text-xs text-warning mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning"></span>
                {overtimeHours.toFixed(1)} OT hours
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center shadow-inner group-hover:bg-primary transition-colors">
              <Clock className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/records', { state: { tab: 'faculty' } })}
          className="w-full text-left bg-card rounded-lg p-6 border border-border hover:border-border-gold transition-colors duration-200 text-card-foreground shadow-sm group focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">No# of faculty accounts</p>
              <p className="text-3xl font-bold text-foreground mt-1">{faculty.length}</p>
              <p className="text-xs text-info mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-info"></span>
                Active faculty
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center shadow-inner group-hover:bg-primary transition-colors">
              <Users className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => navigate('/records', { state: { tab: 'students' } })}
          className="w-full text-left bg-card rounded-lg p-6 border border-border hover:border-border-gold transition-colors duration-200 text-card-foreground shadow-sm group focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">No# of student accounts</p>
              <p className="text-3xl font-bold text-foreground mt-1">{students.length.toLocaleString()}</p>
              <p className="text-xs text-info mt-1 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-info"></span>
                Active students
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center shadow-inner group-hover:bg-primary transition-colors">
              <Users className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Graph - Payroll Expenditure Trend (Takes up 2 columns) */}
        <div className="bg-card rounded-lg p-6 border border-border lg:col-span-2 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Payroll Expenditure Trend</h2>
          {expenditureTrend.length > 0 ? (
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              <ResponsiveContainer key="trend-rc" width="99%" height={300}>
                <BarChart key="trend-chart" id="payroll-bar-chart" data={expenditureTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid key="trend-grid" strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis key="trend-xaxis" dataKey="date" tick={{ fill: 'var(--muted-foreground)' }} stroke="var(--border)" />
                  <YAxis key="trend-yaxis" tick={{ fill: 'var(--muted-foreground)' }} stroke="var(--border)" tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    key="trend-tooltip"
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend key="trend-legend" iconType="circle" wrapperStyle={{ color: 'var(--foreground)' }} />
                  <Bar key="trend-bar1" isAnimationActive={false} dataKey="standardPay" name="Standard Pay" fill="#BA9731" radius={[4, 4, 0, 0]} />
                  <Bar key="trend-bar2" isAnimationActive={false} dataKey="overtimePay" name="Overtime/Bonus Pay" fill="#DACE84" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex items-center justify-center text-muted-foreground" style={{ height: 300 }}>
               No payroll payout data for this month
             </div>
          )}
        </div>

        {/* Secondary Graph - Population per Grade Level (Takes up 1 column) */}
        <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Population by Grade Level</h2>
          {populationPerGrade.length > 0 ? (
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              <ResponsiveContainer key="cost-rc" width="99%" height={300}>
                <PieChart key="cost-chart" id="payroll-pie-chart">
                  <Pie
                    key="cost-pie"
                    isAnimationActive={false}
                    data={populationPerGrade}
                    cx="40%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="population"
                    nameKey="name"
                  >
                    {populationPerGrade.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    key="cost-tooltip"
                    formatter={(value: number) => [value, "Students"]}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)', color: 'var(--foreground)' }}
                    itemStyle={{ color: 'var(--foreground)' }}
                  />
                  <Legend 
                    key="cost-legend"
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ color: 'var(--foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center text-muted-foreground" style={{ height: 300 }}>
              No population data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Time Logs Table */}
      <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Recent Time Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Date</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Faculty</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Subject</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Grade</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Hours</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted-foreground">Type</th>
                <th className="px-6 py-3 text-sm font-semibold text-muted-foreground text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {timeLogs.length > 0 ? (
                timeLogs.slice(0, 5).map((log) => {
                  const facultyMember = faculty.find(f => f.id === log.facultyId);
                  const subject = subjects.find(s => s.code === log.subject);
                  const rate = log.isOvertime ? log.hourlyRate * 1.5 : log.hourlyRate;
                  const cost = log.hours * rate;
                  
                  return (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-foreground">
                        {new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {facultyMember?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {subject?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {log.grade || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {log.hours}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          log.isOvertime ? 'bg-primary/20 text-primary-foreground/90' : 'bg-accent text-accent-foreground'
                        }`}>
                          {log.isOvertime ? 'Overtime' : 'Standard'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground text-right">
                        ${cost.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground text-sm">
                    No recent time logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

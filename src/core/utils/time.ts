type FormatTimeOptions = {
  meridiemSpacing?: 'compact' | 'spaced';
};

export const formatTime12Hour = (time: string, options?: FormatTimeOptions) => {
  if (!time) return '';

  const [h, m] = time.split(':').map(Number);
  const hours = Number.isFinite(h) ? h : 0;
  const minutes = Number.isFinite(m) ? m : 0;
  const meridiem = hours >= 12 ? 'PM' : 'AM';
  const formattedHour = hours % 12 || 12;
  const separator = options?.meridiemSpacing === 'compact' ? '' : ' ';

  return `${formattedHour}:${minutes.toString().padStart(2, '0')}${separator}${meridiem}`;
};

export const addHoursToTime12Hour = (time: string, hoursToAdd: number) => {
  if (!time) return '';

  const [h, m] = time.split(':').map(Number);
  const startHour = Number.isFinite(h) ? h : 0;
  const startMinute = Number.isFinite(m) ? m : 0;
  const totalMinutes = startHour * 60 + startMinute + (hoursToAdd || 0) * 60;
  const nextHour = Math.floor(totalMinutes / 60) % 24;
  const nextMinute = Math.round(totalMinutes % 60);
  const meridiem = nextHour >= 12 ? 'PM' : 'AM';
  const formattedHour = nextHour % 12 || 12;

  return `${formattedHour}:${nextMinute.toString().padStart(2, '0')} ${meridiem}`;
};

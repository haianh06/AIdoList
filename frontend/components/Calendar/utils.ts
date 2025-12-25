export const CATEGORY_COLORS: Record<string, string> = {
  work: '#10b981',
  study: '#f59e0b',
  personal: '#3b82f6',
  all: '#6366f1',
  default: '#6366f1'
};

export const getCategoryColor = (cat: string): string => {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS.default;
};

export const toInputDateTimeString = (dateInput: Date | string): string => {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  return localISOTime;
};

export const formatDateTimeRange = (startStr: string, endStr: string) => {
  if (!startStr) return '';
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : start;

  if (isNaN(start.getTime())) return 'Invalid Date';

  const dateOpt: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const timeOpt: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

  return `${start.toLocaleDateString('en-US', dateOpt)} • ${start.toLocaleTimeString('en-US', timeOpt)} - ${end.toLocaleTimeString('en-US', timeOpt)}`;
};

export const generateRecurringInstances = (baseEvent: any, recurrence: string, viewStart: Date, viewEnd: Date) => {
  if (!baseEvent.start || !baseEvent.end) return [];
  
  const exceptionDates = baseEvent.extendedProps?.exceptionDates || [];
  const instances: any[] = [];
  const originalStart = new Date(baseEvent.start);
  const originalEnd = new Date(baseEvent.end);
  const durationMs = originalEnd.getTime() - originalStart.getTime();

  const isException = (date: Date) => {
    const isoString = date.toISOString(); 
    return exceptionDates.some((exDate: string) => {
        return new Date(exDate).getTime() === date.getTime();
    });
  };


  if (isNaN(originalStart.getTime())) return [];
  if (!['daily', 'weekly', 'monthly'].includes(recurrence)) return [baseEvent];
  
  const totalOccurrences = baseEvent.recurrenceCount && baseEvent.recurrenceCount > 0 
    ? baseEvent.recurrenceCount 
    : Infinity; 
  
  const VIEW_RENDER_LIMIT = 100;

  let currentDate = new Date(originalStart);
  const originalDay = originalStart.getDate(); 
  let count = 0;

  const advanceDate = (date: Date, rule: string, originalDayVal: number): Date => {
    const d = new Date(date);
    if (rule === 'daily') d.setDate(d.getDate() + 1);
    else if (rule === 'weekly') d.setDate(d.getDate() + 7);
    else if (rule === 'monthly') {
      d.setDate(1);
      d.setMonth(d.getMonth() + 1);
      const daysInTargetMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      d.setDate(Math.min(originalDayVal, daysInTargetMonth));
      d.setHours(originalStart.getHours(), originalStart.getMinutes(), 0, 0);
    }
    return d;
  };

  while (currentDate < viewStart) {
     if (count >= totalOccurrences) return [];

     const nextDate = advanceDate(currentDate, recurrence, originalDay);
     
     if (nextDate.getTime() <= currentDate.getTime()) break; 
     
     const instanceEnd = new Date(currentDate.getTime() + durationMs);
     if (instanceEnd >= viewStart) break;

     currentDate = nextDate;
     count++;
  }

  let renderedCount = 0;

  while (currentDate <= viewEnd) {
    if (count >= totalOccurrences) break;
    if (renderedCount >= VIEW_RENDER_LIMIT) break;

    const instanceStartISO = currentDate.toISOString();

    if (!isException(currentDate)) {
        const instanceEnd = new Date(currentDate.getTime() + durationMs);
        if (instanceEnd >= viewStart && currentDate <= viewEnd) {
           instances.push({
            ...baseEvent,
            id: `${baseEvent.id}_rec_${currentDate.getTime()}`,
            start: instanceStartISO,
            end: instanceEnd.toISOString(),
            originalId: baseEvent.id,
            isRecurring: true,
            originalInstanceDate: instanceStartISO, 
            editable: true 
          });
          renderedCount++;
        }
    }

    const nextDate = advanceDate(currentDate, recurrence, originalDay);
    if (nextDate.getTime() <= currentDate.getTime()) break;
    currentDate = nextDate;
    count++;
  }

  return instances;
};
export interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  category: string;
  reminder: string;
  recurrence: string;
  recurrenceCount: number | null;
}

export interface PopoverState {
  isOpen: boolean;
  type: 'create' | 'preview' | null;
  x: number;
  y: number;
  data: any;
}
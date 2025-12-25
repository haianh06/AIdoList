'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { Plus } from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateSelectArg, EventClickArg, EventDropArg } from '@fullcalendar/core';
import api from '@/utils/api';
import Swal from 'sweetalert2';

import { EventData, PopoverState } from './type';
import { getCategoryColor, toInputDateTimeString, generateRecurringInstances } from './utils';
import QuickAddPopover from './QuickAddPopover';
import EventPreviewPopover from './EventPreviewPopover';
import EventModal from './EventModal';

function Calendar({ lang = 'en', filter = 'all' }: { lang?: string; filter?: string }) {
  const calendarRef = useRef<FullCalendar>(null);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [popover, setPopover] = useState<PopoverState>({
    isOpen: false, type: null, x: 0, y: 0, data: null
  });

  const [formData, setFormData] = useState<EventData>({
    id: '', title: '', description: '', location: '',
    startTime: '', endTime: '', category: 'default',
    reminder: 'none', recurrence: 'none', recurrenceCount: null
  });

  useEffect(() => {
      const handleSearchEvent = (e: any) => {
          setSearchQuery(e.detail);
      };
      document.addEventListener('searchEvents', handleSearchEvent);
      return () => document.removeEventListener('searchEvents', handleSearchEvent);
  }, []);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.fc-event') && !target.closest('.calendar-popover') && !target.closest('.swal2-container')) {
        setPopover(p => ({ ...p, isOpen: false }));
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPopover(p => ({ ...p, isOpen: false }));
        setModalOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const fetchEvents = useCallback(async (info: any, successCallback: any, failureCallback: any) => {
    try {
      const res = await api.get('/events');
      const rawEvents = res.data;
      let displayEvents: any[] = [];

      rawEvents.forEach((ev: any) => {
        if (searchQuery && !ev.title.toLowerCase().includes(searchQuery.toLowerCase())) return;
        if (filter !== 'all' && ev.category !== filter) return;
        
        const eventProps = {
          ...ev,
          start: ev.start,
          end: ev.end,
          backgroundColor: getCategoryColor(ev.category),
          borderColor: getCategoryColor(ev.category),
          textColor: 'white',
          className: 'shadow-sm border-0 font-medium text-xs py-0.5 px-1',
          extendedProps: { ...ev } 
        };

        if (ev.recurrence && ev.recurrence !== 'none') {
          const instances = generateRecurringInstances(eventProps, ev.recurrence, info.start, info.end);
          displayEvents.push(...instances);
        } else {
          displayEvents.push(eventProps);
        }
      });
      successCallback(displayEvents);
    } catch (err) {
      console.error(err);
      failureCallback(err);
    }
  }, [filter, searchQuery]);

  const calculatePopoverPosition = (jsEvent: MouseEvent) => {
    const popoverWidth = 340;
    const popoverHeight = 300;
    let x = jsEvent.clientX;
    let y = jsEvent.clientY;
    if (x + popoverWidth > window.innerWidth) x = window.innerWidth - popoverWidth - 20;
    if (y + popoverHeight > window.innerHeight) y = window.innerHeight - popoverHeight - 20;
    if (x < 0) x = 20;
    if (y < 0) y = 20;
    return { x, y };
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
  };

  const handleRightClick = useCallback((e: MouseEvent) => {
    e.preventDefault();

    const target = e.target as HTMLElement;
    const dateEl = target.closest('.fc-daygrid-day, .fc-timegrid-col');

    if (dateEl) {
      const dateStr = dateEl.getAttribute('data-date');
      
      if (dateStr) {
        const { x, y } = calculatePopoverPosition(e);
        
        const baseDate = new Date(dateStr);
        baseDate.setHours(0, 0, 0, 0); 
        
        const startTimeStr = toInputDateTimeString(baseDate);
        
        const endDate = new Date(baseDate);
        endDate.setHours(23, 59, 59, 999);
        const endTimeStr = toInputDateTimeString(endDate);

        const initData: EventData = {
          id: '', title: '', description: '', location: '',
          startTime: startTimeStr,
          endTime: endTimeStr,
          category: 'default', reminder: 'none', recurrence: 'none', recurrenceCount: null
        };

        setFormData(initData);
        setPopover({ isOpen: true, type: 'create', x, y, data: initData });
      }
    }
  }, []);


  const handleEventClick = (clickInfo: EventClickArg) => {
    clickInfo.jsEvent.preventDefault();
    const { x, y } = calculatePopoverPosition(clickInfo.jsEvent as MouseEvent);
    const event = clickInfo.event;
    const props = event.extendedProps || {};
    const isRec = props.isRecurring;

    const startVal = event.start ? toInputDateTimeString(event.start) : '';
    const endVal = event.end ? toInputDateTimeString(event.end) : startVal;

    const eventData: EventData = {
      id: isRec ? props.originalId : event.id as string,
      title: event.title || '',
      startTime: startVal,
      endTime: endVal,
      description: props.description || '',
      location: props.location || '',
      category: props.category || 'default',
      reminder: props.reminder || 'none',
      recurrence: props.recurrence || 'none',
      recurrenceCount: props.recurrenceCount ?? null
    };
    setFormData(eventData);
    setPopover({ isOpen: true, type: 'preview', x, y, data: eventData });
  };

  const handleSave = async (dataToSave: EventData) => {
    if (!dataToSave.title.trim()) return;

    const startDate = new Date(dataToSave.startTime);
    const endDate = new Date(dataToSave.endTime);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        Swal.fire('Error', 'Invalid Date Format', 'error');
        return;
    }

    const payload = {
      title: dataToSave.title,
      description: dataToSave.description,
      location: dataToSave.location,
      start: startDate.toISOString(), 
      end: endDate.toISOString(),
      category: dataToSave.category,
      reminder: dataToSave.reminder,
      recurrence: dataToSave.recurrence,
      recurrenceCount: dataToSave.recurrenceCount
    };

    try {
      if (dataToSave.id) await api.put(`/events/${dataToSave.id}`, payload);
      else await api.post('/events', payload);
      
      setPopover(p => ({ ...p, isOpen: false }));
      setModalOpen(false);
      calendarRef.current?.getApi().refetchEvents();
      calendarRef.current?.getApi().unselect();
      
      Swal.fire({ 
        icon: 'success', 
        title: dataToSave.id ? 'Updated!' : 'Saved!',
        toast: true, position: 'bottom-end', showConfirmButton: false, timer: 1500 
      });
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Failed to save', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    setPopover(p => ({ ...p, isOpen: false }));
    const result = await Swal.fire({
      title: 'Delete Event?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Delete'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/events/${id}`);
        setModalOpen(false);
        calendarRef.current?.getApi().refetchEvents();
        Swal.fire({ icon: 'success', title: 'Deleted', toast: true, position: 'bottom-end', showConfirmButton: false, timer: 1500 });
      } catch (err) {
        Swal.fire('Error', 'Failed to delete', 'error');
      }
    }
  };

  const handleEventDrop = async (info: EventDropArg) => {
    const { event, revert } = info;
    const props = event.extendedProps;

    if (!props.isRecurring) {
        try {
            const newStart = event.start;
            const newEnd = event.end || newStart;
            if (!newStart) throw new Error("Invalid date");

            await api.put(`/events/${event.id}`, {
                ...props,
                title: event.title,
                start: newStart.toISOString(),
                end: newEnd ? newEnd.toISOString() : null,
                recurrence: props.recurrence || 'none',
                recurrenceCount: props.recurrenceCount ?? null
            });
        } catch (e) {
            console.error(e);
            revert();
            Swal.fire('Error', 'Failed to update event', 'error');
        }
        return;
    }

    revert();

    const result = await Swal.fire({
        title: 'Edit recurring event',
        text: 'This is a recurring event. Do you want to edit only this instance?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'This event only',
        cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
        try {
            await api.post('/events/recurrence-exception', {
                originalEventId: props.originalId,
                exceptionDate: props.originalInstanceDate,
                newStart: info.event.start?.toISOString(),
                newEnd: info.event.end?.toISOString()
            });
          
            calendarRef.current?.getApi().refetchEvents();
            
            Swal.fire({ 
                icon: 'success', title: 'Updated instance!', 
                toast: true, position: 'bottom-end', showConfirmButton: false, timer: 1500 
            });
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to update recurrence exception', 'error');
        }
    }
  };

  const handleExpandToModal = () => {
    setPopover(p => ({ ...p, isOpen: false }));
    setModalOpen(true);
  };
  
  const handleEditFromPreview = () => {
    setPopover(p => ({ ...p, isOpen: false }));
    setModalOpen(true);
  }

  return (
    <div className="mx-[0%] h-[90%] w-[100%] bg-white p-2 relative select-none"
      onContextMenu={handleRightClick}>
      <style jsx global>{`
          html, body, #__next { height: 100%; }
          .fc-daygrid-event { border-radius: 4px; transition: transform 0.1s; }
          .fc-daygrid-event:hover { transform: scale(1.02); }
      `}</style>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: 'prev,next,today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        unselectAuto={false}
        editable={true} 
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop} 
        events={fetchEvents}
        height="100%"
        locale={lang}
        nowIndicator={true}
      />

      {mounted && popover.isOpen && popover.type === 'create' && (
        <QuickAddPopover 
          isOpen={true}
          position={{ x: popover.x, y: popover.y }}
          initialData={formData}
          onClose={() => setPopover(p => ({ ...p, isOpen: false }))}
          onSave={(data) => handleSave(data)}
          onExpand={handleExpandToModal}
        />
      )}

      {mounted && popover.isOpen && popover.type === 'preview' && (
        <EventPreviewPopover
           isOpen={true}
           position={{ x: popover.x, y: popover.y }}
           data={popover.data}
           onClose={() => setPopover(p => ({ ...p, isOpen: false }))}
           onDelete={handleDelete}
           onEdit={handleEditFromPreview}
        />
      )}

      {mounted && modalOpen && (
        <EventModal 
          isOpen={true}
          initialData={formData}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default function CalendarHome() {
  const router = useRouter();
  const [lang, setLang] = useState('en'); 
  const [filter, setFilter] = useState('all'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    document.body.classList.remove('dark-mode');
  }, [router]);

  const handleSetLang = (l: string) => {
    setLang(l);
    localStorage.setItem('language', l);
  };

  const openCreateModal = () => {
    document.dispatchEvent(new CustomEvent('openEventModal'));
  };

  if (loading) return null;

  return (
    <main className="h-screen flex flex-col bg-white">
        <Navbar lang={lang} setLang={handleSetLang} />

        <div className="flex flex-1 ">
            <Sidebar currentFilter={filter} setFilter={setFilter} lang={lang} />

            <div className="flex-1 p-6 bg-[#f8fafc]">
                <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] h-full p-1">
                    <Calendar lang={lang} filter={filter} />
                </div>

                <button 
                    onClick={openCreateModal}
                    className="fixed bottom-10 left-8 md:left-[19rem] w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(79,70,229,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50"
                    title="Add Event"
                >
                    <Plus size={28} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    </main>
  );
}
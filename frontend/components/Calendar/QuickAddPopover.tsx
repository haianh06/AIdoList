import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, ArrowRight, Maximize2 } from 'lucide-react';
import { EventData } from './type';
import Swal from 'sweetalert2'; 

interface QuickAddPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  initialData: EventData;
  onClose: () => void;
  onSave: (data: EventData) => void;
  onExpand: () => void;
}

export default function QuickAddPopover({ isOpen, position, initialData, onClose, onSave, onExpand }: QuickAddPopoverProps) {
  const [formData, setFormData] = useState<EventData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleSaveInternal = () => {
    if (!formData.title.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Title required',
            text: 'Please enter a title for the event',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    const start = new Date(formData.startTime).getTime();
    const end = new Date(formData.endTime).getTime();

    if (end < start) {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Time',
            text: 'End time cannot be earlier than start time',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
        return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed z-[1000] calendar-popover animate-in fade-in zoom-in-95 duration-150"
      style={{ top: position.y, left: position.x }}
    >
      <div className="bg-[#ffffff] rounded-[15px] py-[10px] px-[10px] shadow-2xl border border-slate-200 w-[300px] h-[180px] overflow-hidden flex flex-col">
        <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center handle cursor-move">
          <span className="text-sm font-semibold text-slate-700 mx-[5px] text-[18px]">New Event</span>
          <button onClick={onClose} className="text-slate-400 bg-transparent border-0 hover:text-slate-600 hover:bg-slate-200 p-1"><X size={16}/></button>
        </div>

        <div className="p-4 flex flex-col gap-4">
          <input
            autoFocus
            className="w-[247px] h-[30px] mx-[30px] my-[10px] px-[8px] text-lg font-medium rounded-[15px] border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-1 placeholder-slate-400 text-slate-700 transition-colors"
            placeholder="Add title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveInternal(); }}
          />
          
          <div className="bg-slate-50 p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Clock size={25} className="text-indigo-500 shrink-0"/>
                <input 
                  type="datetime-local" 
                  className="bg-transparent rounded-full px-[5px] mx-[5px] text-sm font-medium text-slate-600 focus:outline-none w-[295px] h-[20px] cursor-pointer hover:text-indigo-600"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <ArrowRight size={25} className="text-slate-300 shrink-0 ml-0.5 mt-[10px]"/>
                <input 
                  type="datetime-local" 
                  className="bg-transparent rounded-full px-[5px] mx-[5px] mt-[10px] text-sm font-medium text-slate-600 focus:outline-none w-full cursor-pointer hover:text-indigo-600"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
          </div>
          <div className="bg-slate-50 p-3 flex flex-col gap-[5px]">
            <div className="items-center gap-[10px] flex">
                <button 
                    type="button"
                    onClick={onExpand}
                    className="px-[50px] py-2 bg-[#ffffff] w-[150px] border border-slate-200 hover:bg-[#ffffff]/90 text-slate-600 rounded-full text-sm text-[20px] font-medium transition flex items-center gap-[5px] active:scale-[0.98]"
                >
                    More <Maximize2 size={14}/> 
                </button>

                <button 
                    onClick={handleSaveInternal}
                    className="flex-1 bg-[#3160F7] hover:bg-[#3160F7]/90 text-[#ffffff] py-2 my-[5px] rounded-full text-sm text-[20px] font-semibold shadow-sm transition active:scale-[0.98]"
                >
                    Save
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
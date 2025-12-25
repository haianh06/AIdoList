import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, MapPin, AlignLeft, Repeat, Tag, Edit2, Plus, Hash } from 'lucide-react';
import { EventData } from './type';
import { CATEGORY_COLORS, getCategoryColor } from './utils';
import Swal from 'sweetalert2';

interface EventModalProps {
  isOpen: boolean;
  initialData: EventData;
  onClose: () => void;
  onSave: (data: EventData) => void;
}

export default function EventModal({ isOpen, initialData, onClose, onSave }: EventModalProps) {
  const [formData, setFormData] = useState<EventData>(initialData);
  const [isInfinite, setIsInfinite] = useState(initialData.recurrenceCount === null);
  
  useEffect(() => {
    setFormData(initialData);
    setIsInfinite(initialData.recurrenceCount === null);
  }, [initialData, isOpen]);

  const handleSaveInternal = () => {
      if (!formData.title.trim()) {
        Swal.fire('Error', 'Title is required', 'warning');
        return;
      }
      const start = new Date(formData.startTime).getTime();
      const end = new Date(formData.endTime).getTime();
      if (end < start) {
        Swal.fire('Error', 'End time cannot be earlier than start time', 'warning');
        return;
      }

      // Handle recurrenceCount based on isInfinite
      const finalData = {
        ...formData,
        recurrenceCount: isInfinite ? null : formData.recurrenceCount,
      };

      onSave(finalData);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-[1px] z-[9000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#ffffff] rounded-2xl w-[350px] h-[500px] rounded-[15px] p-[10px] max-w-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-[10px] border-b border-slate-100 flex justify-between items-center bg-white">
           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-[5px]">
              {formData.id ? <Edit2 size={20} className="text-indigo-600"/> : <Plus size={20} className="text-indigo-600"/>}
              {formData.id ? ' Edit Event' : ' Create Event'}
           </h2>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 border-0 bg-transparent"><X size={24}/></button>
        </div>

        <div className="p-[10px] overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          <input
            required
            className="w-[288px] text-2xl font-semibold rounded-[10px] border-b border-slate-200 px-[10px] py-[5px] mx-[10px] focus:border-indigo-600 focus:outline-none text-slate-800 placeholder-slate-300"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Add title"
          />

          <div className="">
            <div className="bg-slate-50 p-[10px] m-[10px] rounded-[10px] border border-slate-100 hover:border-indigo-200 transition">
              <label className="text-xs font-[500] text-slate-500 mb-1 block">Start</label>
              <input type="datetime-local" className="w-full rounded-[10px] bg-transparent text-sm font-medium focus:outline-none" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
            </div>
            <div className="bg-slate-50 p-[10px] m-[10px] rounded-[10px] border border-slate-100 hover:border-indigo-200 transition">
              <label className="text-xs font-[500] text-slate-500 mb-1 block">End</label>
              <input type="datetime-local" className="w-full rounded-[10px] bg-transparent text-sm font-medium focus:outline-none" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
            </div>
          </div>

          <div className="space-y-[10px] px-[10px]">
            <div className="flex items-center gap-[10px] group">
              <div className="w-[30px] flex justify-center"><MapPin size={18} className="text-slate-400 group-hover:text-indigo-500 transition" /></div>
              <input className="flex-1 rounded-[10px] border-b border[#e5e7eb] py-[5px] text-sm focus:border-indigo-500 focus:outline-none transition" placeholder="Add location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div className="flex items-start gap-[10px] group">
              <div className="w-[30px] flex justify-center mt-2"><AlignLeft size={18} className="text-slate-400 group-hover:text-indigo-500 transition" /></div>
              <textarea className="flex-1 rounded-[10px] border-[2px] py-[5px] text-sm focus:border-indigo-500 focus:outline-none min-h-[80px] resize-none transition" placeholder="Add description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
          </div>
          
          <div className="grid grid-cols-[1fr_1fr] gap-[50px] p-[10px]">
             <div>
                <label className="flex items-center gap-[5px] text-sm text-slate-600 mb-[5px] font-medium"><Repeat size={14}/> Recurrence</label>
                <div className="relative">
                  <select className="w-full p-[5px] border-[2px] rounded-[10px] text-sm bg-[#ffffff] focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none appearance-none" value={formData.recurrence} onChange={(e) => setFormData({ ...formData, recurrence: e.target.value })}>
                    <option value="none">Does not repeat</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                {formData.recurrence !== 'none' && (
                  <div className="mt-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input 
                        type="checkbox" 
                        checked={isInfinite} 
                        onChange={(e) => {
                          setIsInfinite(e.target.checked);
                          if (e.target.checked) setFormData({ ...formData, recurrenceCount: null });
                        }} 
                      />
                      Infinite
                    </label>
                    {!isInfinite && (
                      <input 
                        type="number" 
                        min={1} 
                        className="w-full mt-1 p-1 border rounded" 
                        value={formData.recurrenceCount ?? 10} 
                        onChange={(e) => setFormData({ ...formData, recurrenceCount: parseInt(e.target.value) || null })} 
                      />
                    )}
                  </div>
                )}
             </div>
             <div>
                <label className="flex items-center gap-2 text-sm text-slate-600 mb-2 font-medium"><Tag size={14}/> Category</label>
                <div className="flex gap-[5px] pt-[5px]">
                  {['work', 'study', 'personal', 'all'].map(c => (
                     <button 
                       key={c} type="button" 
                       onClick={() => setFormData({...formData, category: c})}
                       className={`w-[30px] h-[30px] rounded-full border-2 transition-all ${formData.category === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                       style={{ backgroundColor: getCategoryColor(c), borderColor: 'white' }}
                       title={c}
                     />
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="flex justify-end gap-[10px] bg-slate-50">
          <button onClick={onClose} className="px-[15px] py-[9px] bg-[#3160F7] rounded-[15px] text-[#ffffff] hover:bg-[#3160F7]/90 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 transition flex items-center gap-[5px]">Cancel</button>
          <button onClick={handleSaveInternal} className="px-[15px] py-[9px] bg-[#3160F7] rounded-[15px] text-[#ffffff] hover:bg-[#3160F7]/90 text-white rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 transition flex items-center gap-[5px]">
             <Check size={16}/> Save Event
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
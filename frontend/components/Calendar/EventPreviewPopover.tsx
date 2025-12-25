import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, Edit2, MapPin, AlignLeft, Clock, Circle, CircuitBoardIcon } from 'lucide-react';
import { getCategoryColor, formatDateTimeRange } from './utils';
import { get } from 'http';

interface EventPreviewPopoverProps {
  isOpen: boolean;
  position: { x: number; y: number };
  data: any;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export default function EventPreviewPopover({ isOpen, position, data, onClose, onEdit, onDelete }: EventPreviewPopoverProps) {
  if (!isOpen || !data) return null;

  return createPortal(
    <div 
      className="fixed z-9999 calendar-popover animate-in fade-in zoom-in-95 duration-150"
      style={{ top: position.y, left: position.x }}
    >
       <div className="bg-[#ffffff] rounded-[15px] pb-[10px] shadow-2xl border w-[320px] overflow-hidden">
          <div className="flex justify-end p-2 gap-1 bg-slate-50/50">
            <button onClick={onEdit} className="p-1.5 hover:bg-slate-200 rounded tooltip-trigger" title="Edit"><Edit2 size={16}/></button>
            <button onClick={() => onDelete(data.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded text-slate-500 tooltip-trigger" title="Delete"><Trash2 size={16}/></button>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded text-slate-400"><X size={18}/></button>
          </div>
          
          <div className="px-5 pb-5 pt-0">
            <div className='flex justify-between items-center border-b text-[25px] font-[500]'>
              <div className="flex items-center p-[10px] rounded-[15px] m-[10px]">
                 <span className="truncate">{data.title}</span>
              </div>
              <div className="flex items-center p-[10px] gap-[10px] rounded-[15px] m-[10px] border-[2px]" style={{ backgroundColor: getCategoryColor(data.category)}}>
              </div>
            </div>
            <div className="flex items-center gap-[10px] text-sm text-slate-600 p-[10px] rounded-[15px] border-[2px] m-[10px]">
               <Clock size={16} className=" shrink-0"/> <span className="truncate">{formatDateTimeRange(data.startTime, data.endTime)}</span>
            </div>

            {data.location && (
              <div className="flex items-center gap-[10px] text-sm text-slate-600 p-[10px] rounded-[15px] border-[2px] m-[10px]">
                 <MapPin size={16} className="shrink-0"/> <span className="truncate">{data.location}</span>
              </div>
            )}
            
            {data.description && (
               <div className="flex items-start gap-[10px] text-sm text-slate-600 mt-3 bg-slate-50 p-[10px] rounded-[15px] border-[2px] m-[10px]">
                  <AlignLeft size={16} className=" flex-shrink-0"/> 
                  <span className="line-clamp-3">{data.description}</span>
               </div>
            )}
          </div>
       </div>
    </div>,
    document.body
  );
}
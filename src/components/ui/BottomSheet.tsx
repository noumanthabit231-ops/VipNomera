import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../cn';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-xl mx-auto bg-[#0A0A0A] border-t border-[#D4AF37]/30 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full duration-300 ease-out">
        
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-800 rounded-full" />

        <div className="px-6 pt-8 pb-10 max-h-[90vh] overflow-y-auto hide-scrollbar">
          
          <div className="flex items-center justify-between mb-6">
            {title && (
              <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">
                {title}
              </h2>
            )}
            <button 
              onClick={onClose}
              className="p-2 bg-[#151515] hover:bg-[#222] text-gray-400 hover:text-white rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div>
            {children}
          </div>
          
        </div>
      </div>
    </div>
  );
};

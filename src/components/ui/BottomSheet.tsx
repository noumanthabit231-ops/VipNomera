import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const BottomSheet = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[60] bg-black/10 backdrop-blur-md" 
          onClick={onClose} 
        />
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }} 
          transition={{ type: "tween", duration: 0.3, ease: "circOut" }} 
          className="fixed bottom-0 left-0 right-0 z-[70] bg-white border-t border-gray-100 rounded-t-[2.5rem] shadow-2xl overflow-hidden touch-none"
        >
          <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto my-4" onClick={onClose} />
          <div className="px-6 pb-10 pt-2 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight uppercase">{title}</h2>
              <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400"><X size={20}/></button>
            </div>
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

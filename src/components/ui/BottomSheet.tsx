import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const BottomSheet = ({ isOpen, onClose, title, children }: any) => (
  <AnimatePresence>
    {isOpen && (
      <>
        {/* Оверлей */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" 
          onClick={onClose} 
        />
        {/* Само окно */}
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }} 
          transition={{ type: "spring", damping: 25, stiffness: 200 }} 
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 rounded-t-[3rem] shadow-2xl overflow-hidden"
        >
          {/* Индикатор для свайпа */}
          <div className="w-16 h-1.5 bg-gray-200 rounded-full mx-auto my-5 cursor-pointer" onClick={onClose} />
          
          <div className="px-8 pb-14 pt-2 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
              <button 
                onClick={onClose} 
                className="p-3 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X size={20}/>
              </button>
            </div>
            {children}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

import { motion } from 'framer-motion';
import { cn } from '../../cn';

export const Card = ({ children, className = "", onClick, isLight = false }: any) => (
  <motion.div 
    layout 
    onClick={onClick} 
    className={cn(
      "border rounded-[2.5rem] p-6 shadow-sm transition-all",
      isLight 
        ? "bg-white border-gray-100 shadow-gray-200/50" 
        : "bg-[#0F0F0F] border-gray-800 shadow-black/50",
      onClick && "cursor-pointer active:scale-[0.98] transition-transform",
      className
    )}
  >
    {children}
  </motion.div>
);

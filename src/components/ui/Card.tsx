import { motion } from 'framer-motion';
import { cn } from '../../cn';

export const Card = ({ children, className = "", onClick }: any) => (
  <motion.div 
    layout 
    onClick={onClick} 
    className={cn(
      "bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-sm shadow-gray-200/50", 
      onClick && "cursor-pointer active:scale-[0.98] transition-transform",
      className
    )}
  >
    {children}
  </motion.div>
);

import { motion } from 'framer-motion';
import { cn } from '../../cn';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  disabled = false, 
  className = "" 
}: ButtonProps) => {
  
  const variants = {
    primary: "bg-[#D4AF37] text-white hover:bg-[#C4A130] shadow-md shadow-[#D4AF37]/20",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/5",
    ghost: "text-gray-400 hover:text-gray-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4.5 text-base"
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      onClick={onClick} 
      className={cn(
        "rounded-[1.25rem] font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
    >
      {children}
    </motion.button>
  );
};

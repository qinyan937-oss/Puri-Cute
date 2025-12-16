import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon' | 'danger'; 
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  // Base: 3D Gummy Style
  const baseStyles = "relative inline-flex items-center justify-center font-extrabold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95 active:translate-y-1 select-none";
  
  const sizeStyles = {
    sm: "text-xs py-1 px-3 rounded-lg border-b-2",
    md: "text-sm py-3 px-5 rounded-xl border-b-4",
    lg: "text-lg py-4 px-8 rounded-2xl border-b-[6px]",
  };

  const variants = {
    // Pink Gummy
    primary: "bg-pink-400 text-white border-pink-600 shadow-xl shadow-pink-200 hover:bg-pink-500",
    
    // Blue Gummy
    secondary: "bg-sky-400 text-white border-sky-600 shadow-xl shadow-sky-200 hover:bg-sky-500",
    
    // Red/Danger Gummy
    danger: "bg-red-400 text-white border-red-600 shadow-xl shadow-red-200 hover:bg-red-500",
    
    // White 3D Card
    outline: "bg-white text-slate-600 border-slate-200 hover:border-pink-300 hover:text-pink-500 shadow-sm",
    
    // Ghost (Minimal)
    ghost: "bg-transparent text-slate-400 hover:text-pink-500 border-b-0 py-2 active:translate-y-0 active:bg-pink-50",

    // Icon Circle (Special)
    icon: "bg-white text-pink-500 border-slate-100 hover:border-pink-300 rounded-full p-2 aspect-square border-b-4 shadow-md flex items-center justify-center"
  };

  // Override size styles for icon/ghost to remove border-b logic if needed
  const finalSize = variant === 'ghost' ? '' : sizeStyles[size];
  const widthClass = fullWidth ? 'w-full flex' : '';
  
  return (
    <button 
      className={`${baseStyles} ${finalSize} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
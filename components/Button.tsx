import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon'; 
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  // Base: Chunky cute button with bounce
  // "active:translate-y-1 active:border-b-0" creates the 3D press effect
  const baseStyles = "relative inline-flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform";
  
  const variants = {
    // Pink Candy Button
    primary: "bg-pink-400 hover:bg-pink-500 text-white rounded-2xl border-b-4 border-pink-600 active:border-b-0 active:translate-y-1 py-3 px-6 shadow-lg shadow-pink-200",
    
    // Blue Candy Button
    secondary: "bg-blue-400 hover:bg-blue-500 text-white rounded-2xl border-b-4 border-blue-600 active:border-b-0 active:translate-y-1 py-3 px-6 shadow-lg shadow-blue-200",
    
    // White Card Button
    outline: "bg-white text-slate-600 border-2 border-slate-200 hover:border-pink-300 hover:text-pink-500 rounded-xl py-2 px-4 shadow-sm active:scale-95",
    
    // Ghost (Text only)
    ghost: "bg-transparent text-slate-400 hover:text-pink-500 hover:bg-pink-50 rounded-full p-2 active:scale-95",

    // Icon Button (Circle)
    icon: "bg-white text-pink-500 border-2 border-pink-100 hover:border-pink-300 rounded-full p-2 shadow-sm active:scale-90"
  };

  const widthClass = fullWidth ? 'w-full flex' : '';
  
  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
import React from 'react';

interface LogoProps {
  className?: string;
  fill?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", fill = "currentColor" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      width="32"
      height="32"
      stroke={fill} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      style={{ minWidth: '24px', minHeight: '24px', maxWidth: '100%', maxHeight: '100%' }}
    >
      {/* Anchor Base */}
      <path d="M12 21a9 9 0 0 0 9-9h-2a7 7 0 0 1-14 0H3a9 9 0 0 0 9 9z" fill={fill} stroke="none" />
      <path d="M12 21V8" />
      
      {/* Lotus/Flower Top symbolizing Relief */}
      <path d="M12 8c0-3-2.5-5-4-3C6.5 6.5 7 10 12 13" />
      <path d="M12 8c0-3 2.5-5 4-3 1.5 1.5 1 5-4 8" />
      <path d="M12 2a3 3 0 0 1 0 6 3 3 0 0 1 0-6z" fill="none" />
    </svg>
  );
};

export default Logo;
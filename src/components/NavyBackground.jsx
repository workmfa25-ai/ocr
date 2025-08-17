import React from 'react';

const NavyBackground = ({ children, className = '' }) => {
  return (
    <div 
      className={`min-h-screen bg-cover bg-center bg-no-repeat relative ${className}`}
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1521041601476-47a88cecb403?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
      }}
    >
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-xs"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default NavyBackground;

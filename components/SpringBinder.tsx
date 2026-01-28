
import React from 'react';

const SpringBinder: React.FC = () => {
  return (
    <div className="absolute left-1/2 top-0 bottom-0 w-8 -ml-4 z-20 flex flex-col justify-around py-8 pointer-events-none">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          <div className="w-10 h-3 bg-gradient-to-r from-gray-400 via-gray-200 to-gray-400 rounded-full shadow-md border border-gray-500/20" />
        </div>
      ))}
    </div>
  );
};

export default SpringBinder;

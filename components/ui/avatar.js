// components/ui/avatar/AvatarComponents.js
import React from 'react';

// Avatar Component
export const Avatar = ({ children, className, ...props }) => {
  return (
    <div
      className={`avatar ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// AvatarFallback Component
export const AvatarFallback = ({ children, className, ...props }) => {
  return (
    <div
      className={`avatar-fallback ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// AvatarImage Component
export const AvatarImage = ({ src, alt, className, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`avatar-image ${className}`}
      {...props}
    />
  );
};

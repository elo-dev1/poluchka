import React, { useState, useEffect } from 'react';

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name = 'Игрок',
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [avatarUrl]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-16 h-16 text-2xl',
  }[size];

  const initial = (name || 'U').trim().charAt(0).toUpperCase() || 'U';

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover border border-primary/40 shadow-sm shrink-0 ${sizeClasses} ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-tr from-primary via-blue-600 to-indigo-600 flex items-center justify-center font-black text-white shadow-md border border-white/20 shrink-0 ${sizeClasses} ${className}`}
    >
      {initial}
    </div>
  );
};

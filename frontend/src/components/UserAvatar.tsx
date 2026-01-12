import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/api';


interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  previewUrl?: string | null;
  showBadge?: boolean;
}

export function UserAvatar({ user, size = 'md', className = '', previewUrl, showBadge = false }: UserAvatarProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const hasCustomPhoto = !!(previewUrl || user?.profile_picture_url);
  const hasStravaAvatar = !!user?.strava_profile_url;
  const currentImageSrc = previewUrl || 
    (user?.profile_picture_url ? `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${user.profile_picture_url}` : undefined) ||
    user?.strava_profile_url;

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} ${className}`}>
        <AvatarImage 
          src={currentImageSrc} 
          alt={user ? `${user.first_name} ${user.last_name}` : 'User'}
        />
        <AvatarFallback className={textSizes[size]}>
          {user ? getInitials(user.first_name, user.last_name) : 'U'}
        </AvatarFallback>
      </Avatar>
    </div>
  );
} 
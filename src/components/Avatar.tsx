import { User } from '../types';

type AvatarProps = {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
};

const Avatar = ({ user, size = 'md', showStatus = true }: AvatarProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <div className="relative">
      <img
        src={user.profileImage}
        alt={user.name}
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
      {showStatus && user.isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-whatsapp-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

export default Avatar;

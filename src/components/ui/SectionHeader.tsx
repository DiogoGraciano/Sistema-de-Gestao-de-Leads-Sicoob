import React from 'react';
import { CheckCircle, type LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  isActive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  isCompleted = false,
  isActive = false,
  className = "",
  size = 'md'
}) => {
  const sizeClasses = {
    sm: {
      container: 'mb-4',
      icon: 'w-8 h-8',
      iconInner: 'w-4 h-4',
      title: 'text-base',
      subtitle: 'text-xs',
      badge: 'text-xs',
      badgeIcon: 'w-3 h-3'
    },
    md: {
      container: 'mb-6',
      icon: 'w-10 h-10',
      iconInner: 'w-5 h-5',
      title: 'text-lg',
      subtitle: 'text-sm',
      badge: 'text-sm',
      badgeIcon: 'w-4 h-4'
    },
    lg: {
      container: 'mb-8',
      icon: 'w-12 h-12',
      iconInner: 'w-6 h-6',
      title: 'text-xl',
      subtitle: 'text-base',
      badge: 'text-base',
      badgeIcon: 'w-5 h-5'
    }
  };

  const classes = sizeClasses[size];
  
  return (
    <div className={`flex items-center justify-between ${classes.container} ${className}`}>
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 ${classes.icon} rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
          isCompleted 
            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
            : isActive
            ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
            : 'bg-gradient-to-br from-gray-400 to-gray-500'
        }`}>
          {isCompleted ? (
            <CheckCircle className={`${classes.iconInner} text-white`} />
          ) : (
            <Icon className={`${classes.iconInner} text-white`} />
          )}
        </div>
        <div>
          <h3 className={`${classes.title} font-semibold text-gray-900 flex items-center`}>
            {title}
            {isCompleted && <span className="ml-2 text-green-500 text-sm">✓</span>}
          </h3>
          {subtitle && <p className={`${classes.subtitle} text-gray-600`}>{subtitle}</p>}
        </div>
      </div>
      {isCompleted && (
        <div className={`flex items-center text-green-600 ${classes.badge} font-medium animate-in slide-in-from-right-2`}>
          <CheckCircle className={`${classes.badgeIcon} mr-1`} />
          Completo
        </div>
      )}
    </div>
  );
};

export default SectionHeader;

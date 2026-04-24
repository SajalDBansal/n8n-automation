import {
  Bot,
  MessageCircle,
  Mail,
  Play,
  Zap,
  Database,
  Globe,
  Settings,
  Cloud,
  Code,
  LucideIcon,
  KeySquare
} from 'lucide-react';
import Image from 'next/image';

// Map of icon names to Lucide components
const lucideIcons: { [key: string]: LucideIcon } = {
  Bot,
  MessageCircle,
  Mail,
  Play,
  Zap,
  Database,
  Globe,
  Settings,
  Cloud,
  Code,
  KeySquare
};

export interface INodeIcon {
  type: 'font-awesome' | 'lucide' | 'file' | 'url' | 'svg';
  value: string;
  color?: string;
  light?: string; // For theme-based icons
  dark?: string;  // For theme-based icons
}

interface NodeIconProps {
  icon: string | INodeIcon | any;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NodeIcon({ icon, size = 'md', className = '' }: NodeIconProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (typeof icon === 'string') {
    return <LegacyIcon icon={icon} size={size} className={className} />;
  }


  const { type, value, color } = icon;
  const iconClass = `${sizeClasses[size]} ${className}`;
  const iconColor = color || 'currentColor';

  switch (type) {
    case 'lucide': {
      const LucideComponent = lucideIcons[value];
      if (LucideComponent) {
        return <LucideComponent className={iconClass} style={{ color: iconColor }} />;
      }
      // Fallback if icon not found
      return <Settings className={iconClass} style={{ color: iconColor }} />;
    }

    case 'font-awesome':
      return <FontAwesomeIcon icon={value} className={iconClass} style={{ color: iconColor }} />;

    case 'file': {
      // Handle theme-based icons (light/dark variants)
      if (icon.light || icon.dark) {
        const iconFile = icon.light || icon.value;
        console.log(value);
        return (
          <Image  // #todo: here i should use next/image
            src={`/node-icons/${iconFile}`}
            alt="Node icon"
            className={iconClass}
            style={{ filter: color ? `hue-rotate(${getHueRotation(color)})` : undefined }}
          />
        );
      }

      // Single file icon
      return (
        <img
          src={`/node-icons/${value}`}
          alt="Node icon"
          className={iconClass}
          style={{ filter: color ? `hue-rotate(${getHueRotation(color)})` : undefined }}
        />
      );
    }

    case 'url':
      return (
        <img  // #todo: here i should use next/image
          src={value}
          alt="Node icon"
          className={iconClass}
          style={{ color: iconColor }}
        />
      );

    case 'svg':
      return (
        <div
          className={iconClass}
          style={{ color: iconColor }}
          dangerouslySetInnerHTML={{ __html: value }}
        />
      );

    default:
      return <Settings className={iconClass} style={{ color: iconColor }} />;
  }
}

// Legacy icon handler for backward compatibility
function LegacyIcon({ icon, size, className }: { icon: string; size: string; className: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconClass = `${sizeClasses[size as keyof typeof sizeClasses]} ${className}`;

  if (icon.startsWith('fa:')) {
    const iconName = icon.replace('fa:', '');
    return <FontAwesomeIcon icon={iconName} className={iconClass} />;
  }

  if (icon.startsWith('file:')) {
    const fileName = icon.replace('file:', '');
    return <img src={`/icons/${fileName}`} alt="Node icon" className={iconClass} />;
  }

  // Default fallback
  return <Settings className={iconClass} />;
}

// Placeholder for FontAwesome component
function FontAwesomeIcon({ className, style }: { icon: string; className: string; style?: React.CSSProperties }) {
  // This would be replaced with actual FontAwesome implementation
  // For now, return a fallback
  return <Settings className={className} style={style} />;
}

// Utility function to get color class for Tailwind
export function getNodeIconColor(color?: string): string {
  const colorMap: { [key: string]: string } = {
    black: 'text-black',
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    gray: 'text-gray-500',
    yellow: 'text-yellow-500',
    pink: 'text-pink-500',
  };

  return colorMap[color || 'gray'] || 'text-gray-500';
}

// Utility function to convert color names to hue rotation values for SVG filtering
function getHueRotation(color?: string): string {
  const hueMap: { [key: string]: string } = {
    blue: '200deg',
    green: '120deg',
    red: '0deg',
    purple: '270deg',
    orange: '30deg',
    yellow: '60deg',
    pink: '320deg',
    black: '0deg',
    gray: '0deg',
  };

  return hueMap[color || 'gray'] || '0deg';
}
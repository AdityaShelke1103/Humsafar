import {
  Folder,
  Globe,
  FileText,
  Building,
  CheckCircle,
  Award,
  MessageSquare,
  Brain,
  Search,
  ShieldCheck,
  List,
  Map,
  Home,
  GraduationCap,
  Users,
  IdCard,
  Compass,
} from 'lucide-react';

const iconMap: Record<string, typeof Folder> = {
  folder: Folder,
  globe: Globe,
  'file-text': FileText,
  building: Building,
  'check-circle': CheckCircle,
  award: Award,
  message: MessageSquare,
  brain: Brain,
  search: Search,
  'shield-check': ShieldCheck,
  list: List,
  map: Map,
  home: Home,
  'graduation-cap': GraduationCap,
  users: Users,
  'id-card': IdCard,
  compass: Compass,
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, className, size, strokeWidth = 1.6 }: IconProps) {
  const Cmp = iconMap[name] ?? Compass;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} />;
}

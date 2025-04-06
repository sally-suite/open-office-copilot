import { icons } from "lucide-react";
export interface IconProps {
  name: keyof typeof icons;
  color?: string;
  size?: number;
}
const Icon = ({ name, color, size }: IconProps) => {
  const LucideIcon = icons[name];

  return <LucideIcon color={color} size={size} />;
};

export default Icon;

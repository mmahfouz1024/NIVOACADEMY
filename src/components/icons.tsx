import {
  BookOpen, Languages, BrainCircuit, Code2, Megaphone, Palette, BarChart3, Briefcase,
  Camera, GraduationCap, Cpu, Globe, PenTool, Video, Calculator, HeartPulse, Music,
  Smartphone, ShieldCheck, Rocket, Sparkles, Bot, type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  BookOpen, Languages, BrainCircuit, Code2, Megaphone, Palette, BarChart3, Briefcase,
  Camera, GraduationCap, Cpu, Globe, PenTool, Video, Calculator, HeartPulse, Music,
  Smartphone, ShieldCheck, Rocket, Sparkles, Bot,
};

export const ICON_NAMES = Object.keys(ICONS);

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || BookOpen;
  return <Icon className={className} />;
}

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowRight, ArrowLeft, ArrowUpRight, Plus, Check, ShieldCheck, CircleCheck, Clock, CalendarDays, BriefcaseBusiness, ChevronRight, ChevronDown, X, Search, ChartNoAxesCombined, Presentation, Megaphone, Users, LayoutDashboard, FileText, Sparkles, MessageSquare, LifeBuoy, Settings, LogOut, Menu, GraduationCap, MapPin, Star, CheckCheck, Mail, Download, RotateCcw, Circle, Wallet, Layers, Target, ExternalLink, Info, CheckCircle, Send, Pencil, Bell, FolderOpen, CheckSquare, Monitor, HeartHandshake, AlertCircle, Columns2, type LucideIcon } from 'lucide-react';
import type { Student } from '@/lib/data';

const icons: Record<string, LucideIcon> = {
  arrowRight: ArrowRight, 'arrow-right': ArrowRight, arrowLeft: ArrowLeft, 'arrow-left': ArrowLeft,
  arrowUpRight: ArrowUpRight, 'arrow-up-right': ArrowUpRight, plus: Plus, check: Check, shield: ShieldCheck,
  'shield-check': ShieldCheck, 'check-circle': CircleCheck, checkCircle: CheckCircle, clock: Clock, calendar: CalendarDays,
  briefcase: BriefcaseBusiness, 'chevron-right': ChevronRight, chevronRight: ChevronRight, 'chevron-down': ChevronDown, chevronDown: ChevronDown,
  x: X, search: Search, chart: ChartNoAxesCombined, presentation: Presentation, megaphone: Megaphone, users: Users,
  dashboard: LayoutDashboard, file: FileText, 'file-text': FileText, sparkle: Sparkles, sparkles: Sparkles,
  message: MessageSquare, 'message-square': MessageSquare, support: LifeBuoy, settings: Settings, logout: LogOut,
  menu: Menu, graduation: GraduationCap, 'graduation-cap': GraduationCap, location: MapPin, 'map-pin': MapPin,
  star: Star, checkCheck: CheckCheck, mail: Mail, download: Download, reset: RotateCcw, circle: Circle,
  wallet: Wallet, layers: Layers, target: Target, external: ExternalLink, info: Info, send: Send, edit: Pencil,
  bell: Bell, folder: FolderOpen, checklist: CheckSquare, monitor: Monitor, handshake: HeartHandshake, alert: AlertCircle, columns: Columns2,
};

export function Icon({ name, size = 20, className = '' }: { name: string; size?: number; className?: string }) {
  const Component = icons[name] || Circle;
  return <Component size={size} strokeWidth={1.75} className={className} aria-hidden="true" />;
}

export function Avatar({ student, size = 'md' }: { student: Student; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`avatar avatar-${student.color} avatar-${size}`} aria-hidden="true">{student.initials}</span>;
}

export function Badge({ children, variant = 'neutral' }: { children: ReactNode; variant?: 'green' | 'orange' | 'neutral' }) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
    return () => { if (dialog.open) dialog.close(); };
  }, [open]);
  return <dialog ref={ref} className="modal" aria-labelledby={titleId} onKeyDown={(event) => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')).filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
    const first = controls[0], last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose(); } }}>
    <div className="modal-heading"><h2 id={titleId}>{title}</h2><button type="button" className="icon-button" aria-label="Close" onClick={onClose}><Icon name="x" /></button></div>
    <div className="modal-body">{children}</div>
  </dialog>;
}

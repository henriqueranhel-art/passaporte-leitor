import React from 'react';
import { clsx } from 'clsx';

// ============================================================================
// BUTTON
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2';

  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    success: 'bg-success hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-800',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// ============================================================================
// CARD
// ============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, onClick, hover, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-2xl border border-gray-200 bg-white p-6',
        hover && 'cursor-pointer hover:shadow-lg transition-shadow',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// ============================================================================
// INPUT
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export function Input({ label, icon, error, className, ...props }: InputProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-800">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
            {icon}
          </span>
        )}
        <input
          className={clsx(
            'w-full px-4 py-3 rounded-xl border-2 text-lg transition-colors',
            'focus:outline-none focus:border-primary',
            icon && 'pl-12',
            error ? 'border-red-300' : 'border-gray-200',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================================================
// SELECT
// ============================================================================

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  options: (string | number | { label: string; value: string | number })[];
  onChange?: (value: any) => void;
  placeholder?: string;
}

export function Select({ label, icon, error, className, options, onChange, ...props }: SelectProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-800">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
            {icon}
          </span>
        )}
        <select
          className={clsx(
            'w-full px-4 py-3 rounded-xl border-2 text-lg transition-colors appearance-none bg-white',
            'focus:outline-none focus:border-primary',
            icon && 'pl-12',
            error ? 'border-red-300' : 'border-gray-200',
            className
          )}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          <option value="" disabled selected>
            {props.placeholder || 'Selecionar...'}
          </option>
          {options.map((opt) => {
            const value = typeof opt === 'object' ? opt.value : opt;
            const label = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={value} value={value}>
                {label}
              </option>
            );
          })}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          ▼
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// ============================================================================
// MODAL
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white';
}

export function Modal({ isOpen, onClose, title, children, size = 'md', variant = 'default' }: ModalProps) {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const headerStyles = variant === 'default'
    ? 'bg-primary text-white border-b-transparent'
    : 'bg-white text-gray-800 border-b-gray-100';

  const closeButtonStyles = variant === 'default'
    ? 'text-white/80 hover:text-white'
    : 'text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center';

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={clsx(
          'bg-white rounded-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in',
          sizes[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={clsx("p-6 border-b flex justify-between items-center", headerStyles)}>
          <div className="text-xl font-bold flex items-center gap-2">{title}</div>
          <button
            onClick={onClose}
            className={clsx("text-2xl leading-none transition-colors", closeButtonStyles)}
          >
            &times;
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary',
        sizes[size]
      )}
    />
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, color = '#E67E22', showLabel }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">{value}</span>
          <span className="text-gray-400">/ {max}</span>
        </div>
      )}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <span className="text-6xl mb-4 block">{icon}</span>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  );
}

// ============================================================================
// BADGE
// ============================================================================

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function Badge({ children, color = '#E67E22', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'px-3 py-1 rounded-full text-xs font-bold text-white',
        className
      )}
      style={{ backgroundColor: color }}
    >
      {children}
    </span>
  );
}

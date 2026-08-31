"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success"
  | "glass"
  | "accent";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 hover:shadow-glow-brand active:scale-[0.97] shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:active:scale-100",
  secondary:
    "bg-bg-elevated text-fg-primary border border-border-subtle hover:border-brand-500/50 hover:bg-bg-tertiary active:bg-bg-primary active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
  outline:
    "bg-transparent text-fg-primary border border-border-strong hover:border-brand-500 hover:text-brand-400 active:bg-brand-500/10 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
  ghost:
    "bg-transparent text-fg-secondary hover:bg-white/5 hover:text-fg-primary active:bg-white/10 active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
  danger:
    "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 hover:shadow-glow-danger active:scale-[0.97] shadow-md shadow-danger-500/20 disabled:opacity-50 disabled:active:scale-100",
  success:
    "bg-success-500 text-white hover:bg-success-600 active:bg-success-700 hover:shadow-glow-success active:scale-[0.97] shadow-md shadow-success-500/20 disabled:opacity-50 disabled:active:scale-100",
  glass:
    "bg-white/5 text-white border border-border-subtle hover:border-border-strong hover:bg-white/10 active:bg-white/15 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-[0.97] disabled:opacity-50 disabled:active:scale-100",
  accent:
    "bg-accent-500 text-neutral-950 font-bold hover:bg-accent-400 active:bg-accent-600 hover:shadow-glow-accent active:scale-[0.97] shadow-md shadow-accent-500/20 disabled:opacity-50 disabled:active:scale-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 min-h-[44px] px-3 text-xs",
  md: "h-10 min-h-[44px] px-4 text-sm",
  lg: "h-12 min-h-[48px] px-6 text-base",
  icon: "h-10 w-10 min-h-[44px] min-w-[44px] p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium",
          "transition-all duration-200 ease-out",
          "focus-visible:ring-brand-500 focus-visible:ring-offset-bg-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          "disabled:cursor-not-allowed",
          "touch-manipulation whitespace-nowrap select-none",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";

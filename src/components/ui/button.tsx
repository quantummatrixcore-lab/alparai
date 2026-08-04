"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
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
    "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 hover:shadow-[0_0_20px_rgba(27,149,192,0.4)] disabled:opacity-50",
  secondary:
    "bg-bg-elevated text-fg-primary border border-border-subtle hover:border-brand-500 hover:bg-bg-tertiary disabled:opacity-50",
  outline:
    "bg-transparent text-fg-primary border border-border-strong hover:border-brand-500 hover:text-brand-400 disabled:opacity-50",
  ghost:
    "bg-transparent text-fg-secondary hover:bg-bg-tertiary hover:text-fg-primary disabled:opacity-50",
  danger:
    "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50",
  success:
    "bg-success-500 text-black hover:bg-success-600 active:bg-success-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-10 w-10 p-0",
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
          "whitespace-nowrap select-none",
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

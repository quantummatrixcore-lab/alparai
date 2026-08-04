"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "gradient" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const variantClasses = {
  default: "bg-bg-secondary border border-border-subtle",
  elevated: "bg-bg-elevated border border-border-subtle shadow-xl",
  outline: "bg-transparent border border-border-strong",
  gradient: "bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-brand-500/20",
  glass: "bg-glass",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-6",
  lg: "p-8",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", padding = "md", interactive = false, ...props }, ref) => {
    const localRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => localRef.current!);
    const [coords, setCoords] = React.useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = React.useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive || !localRef.current) return;
      const rect = localRef.current.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    return (
      <div
        ref={localRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => interactive && setIsHovered(true)}
        onMouseLeave={() => interactive && setIsHovered(false)}
        className={cn(
          "relative overflow-hidden rounded-xl transition-all duration-300",
          variantClasses[variant],
          paddingClasses[padding],
          interactive &&
            "hover:border-brand-500/30 cursor-pointer hover:scale-[1.015] hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]",
          className,
        )}
        {...props}
      >
        {interactive && isHovered && (
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300"
            style={{
              background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(168, 85, 247, 0.08), transparent 80%)`,
            }}
          />
        )}
        {props.children}
      </div>
    );
  },
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg leading-tight font-semibold tracking-tight", className)}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-fg-muted text-sm", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("", className)} {...props} />,
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

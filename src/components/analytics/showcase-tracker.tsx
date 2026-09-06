"use client";

import React, { useEffect } from "react";
import { trackShowcasePageView, trackShowcaseCtaClick } from "@/lib/analytics";
import { Link } from "@/i18n/routing";

interface ShowcasePageTrackerProps {
  pagePath: string;
}

export function ShowcasePageTracker({ pagePath }: ShowcasePageTrackerProps) {
  useEffect(() => {
    trackShowcasePageView(pagePath);
  }, [pagePath]);

  return null;
}

interface TrackedCtaButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  pagePath: string;
  ctaAction: string;
  extraData?: Record<string, unknown>;
  asChild?: boolean;
  children: React.ReactNode;
}

export function TrackedCtaButton({
  pagePath,
  ctaAction,
  extraData,
  asChild,
  children,
  onClick,
  ...props
}: TrackedCtaButtonProps) {
  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as { onClick?: React.MouseEventHandler };
    return React.cloneElement(
      children as React.ReactElement<{ onClick?: React.MouseEventHandler }>,
      {
        onClick: (e: React.MouseEvent) => {
          trackShowcaseCtaClick(pagePath, ctaAction, extraData);
          if (childProps.onClick) {
            childProps.onClick(e);
          }
        },
      },
    );
  }

  return (
    <a
      {...props}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        trackShowcaseCtaClick(pagePath, ctaAction, extraData);
        if (onClick) onClick(e);
      }}
    >
      {children}
    </a>
  );
}

interface TrackedLinkProps extends React.ComponentProps<typeof Link> {
  pagePath: string;
  ctaAction: string;
  extraData?: Record<string, unknown>;
  children?: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function TrackedLink({
  pagePath,
  ctaAction,
  extraData,
  children,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        trackShowcaseCtaClick(pagePath, ctaAction, extraData);
        if (onClick) onClick(e);
      }}
    >
      {children}
    </Link>
  );
}

"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";

type Props = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    activeClassName?: string;
    exact?: boolean;
  };

export const NavLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ className, activeClassName, exact = true, href, ...props }, ref) => {
    const pathname = usePathname();

    // Normalize href to a string path for comparison
    const hrefPath =
      typeof href === "string"
        ? href
        : href.pathname
        ? String(href.pathname)
        : "";

    const isActive = exact ? pathname === hrefPath : pathname?.startsWith(hrefPath);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  }
);

NavLink.displayName = "NavLink";

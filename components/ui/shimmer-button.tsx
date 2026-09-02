import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type BaseProps = {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: React.ReactNode;
};

export type ShimmerButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & {
    href?: string;
  };

/**
 * Pill CTA with a conic-gradient spark that orbits the border.
 * Defaults to the market's look: near-black fill, lime spark, off-white label.
 * Pass `href` to render it as a link.
 */
const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "var(--color-accent)",
      shimmerSize = "0.06em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "var(--color-paper)",
      className,
      children,
      href,
      ...props
    },
    ref,
  ) => {
    const style = {
      "--spread": "90deg",
      "--shimmer-color": shimmerColor,
      "--radius": borderRadius,
      "--speed": shimmerDuration,
      "--cut": shimmerSize,
      "--bg": background,
    } as React.CSSProperties;

    const classes = cn(
      "group relative z-0 flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap border border-line px-7 py-3.5 text-sm font-bold tracking-wide text-ink [background:var(--bg)] [border-radius:var(--radius)]",
      "transform-gpu transition-transform duration-300 ease-in-out hover:-translate-y-0.5 active:translate-y-px",
      className,
    );

    const inner = (
      <>
        {/* spark container */}
        <div className="absolute inset-0 -z-30 overflow-visible blur-[2px] [container-type:size]">
          <div className="animate-shimmer-slide absolute inset-0 h-[100cqh] [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {children}

        {/* highlight */}
        <div className="absolute inset-0 size-full transform-gpu rounded-[inherit] shadow-[inset_0_-8px_10px_#ffffff12] transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_10px_#ffffff20] group-active:shadow-[inset_0_-10px_10px_#ffffff20]" />

        {/* backdrop */}
        <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
      </>
    );

    if (href) {
      return (
        <Link href={href} style={style} className={classes}>
          {inner}
        </Link>
      );
    }

    return (
      <button ref={ref} style={style} className={classes} {...props}>
        {inner}
      </button>
    );
  },
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };

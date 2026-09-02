"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  images: string[];
  className?: string;
}

/** Primary CTA — a lime pill, in the market's visual language (was a red button). */
function ActionButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-accent px-7 py-3 text-sm font-bold tracking-wide shadow-[4px_4px_0_0_var(--color-ink)] transition-colors hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-accent-ink"
      >
        {children}
        <ArrowUpRight size={18} />
      </Link>
    </motion.div>
  );
}

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  ctaHref,
  secondaryCtaText,
  secondaryCtaHref,
  images,
  className,
}) => {
  const reduce = useReducedMotion();

  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: reduce ? 0 : 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 20 },
    },
  } as const;

  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative flex w-full flex-col items-center justify-center overflow-hidden bg-paper px-4 pb-[38vh] pt-28 text-center md:pb-[34vh] md:pt-32",
        "min-h-[92vh]",
        className,
      )}
    >
      <div className="z-10 flex flex-col items-center">
        {/* Tagline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-6 inline-flex items-center rounded-full border border-line bg-white/60 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-muted backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: reduce ? 0 : 0.08 } },
          }}
          className="font-display text-[clamp(3rem,11vw,8.5rem)] leading-[0.86] tracking-[-0.02em] text-ink"
        >
          {typeof title === "string"
            ? title.split("").map((word, i) => (
                <motion.span
                  key={i}
                  variants={FADE_IN_ANIMATION_VARIANTS}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))
            : title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: reduce ? 0 : 0.5 }}
          className="mt-7 max-w-xl text-lg leading-tight text-muted md:text-xl"
        >
          {description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: reduce ? 0 : 0.6 }}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <ActionButton href={ctaHref}>{ctaText}</ActionButton>
          {secondaryCtaText && secondaryCtaHref ? (
            <Link
              href={secondaryCtaHref}
              className="mt-8 inline-flex items-center gap-1.5 px-2 py-3 text-sm font-bold tracking-wide text-ink u-link"
            >
              {secondaryCtaText}
              <MoveRight size={16} />
            </Link>
          ) : null}
        </motion.div>
      </div>

      {/* Animated image marquee */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-1/3 w-full [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] md:h-2/5">
        <motion.div
          className="flex gap-4"
          animate={
            reduce
              ? undefined
              : {
                  x: ["-100%", "0%"],
                  transition: {
                    ease: "linear",
                    duration: 40,
                    repeat: Infinity,
                  },
                }
          }
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-48 flex-shrink-0 md:h-64"
              style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                aria-hidden="true"
                className="h-full w-full rounded-2xl border border-ink/10 object-cover shadow-md"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

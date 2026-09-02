"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface EventCardProps {
  icon: React.ReactNode;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  locationIcon: React.ReactNode;
  location: string;
  frequency?: string;
  description?: string;
  className?: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
} as const;

/**
 * Event card — icon + title, then a plain-language line of pills:
 * "on {date} from {start} until {end} at {location} every {frequency}".
 * Adapted to the market's dark editorial theme.
 */
export const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  (
    {
      icon,
      title,
      date,
      startTime,
      endTime,
      locationIcon,
      location,
      frequency,
      description,
      className,
    },
    ref,
  ) => {
    const Pill = ({ children }: { children: React.ReactNode }) => (
      <span className="inline-flex items-center gap-2 rounded-md border border-line bg-paper/60 px-2.5 py-1 font-semibold text-ink">
        {children}
      </span>
    );
    const Word = ({ children }: { children: React.ReactNode }) => (
      <span className="text-muted">{children}</span>
    );

    return (
      <motion.div
        ref={ref}
        className={cn(
          "w-full rounded-2xl border border-line bg-white p-6 text-ink shadow-sm",
          className,
        )}
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0px 16px 34px -16px rgba(0,0,0,0.75)",
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        aria-label={`${title} event details`}
      >
        <div className="flex flex-col space-y-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-accent/15 text-accent-ink">
              {icon}
            </div>
            <h3 className="font-display text-xl leading-tight tracking-tight">
              {title}
            </h3>
          </div>

          {description ? (
            <p className="text-sm leading-relaxed text-muted">{description}</p>
          ) : null}

          {/* Date & time */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm">
            <Word>on</Word>
            <Pill>{date}</Pill>
            {startTime && endTime ? (
              <>
                <Word>from</Word>
                <Pill>{startTime}</Pill>
                <Word>until</Word>
                <Pill>{endTime}</Pill>
              </>
            ) : null}
          </div>

          {/* Location & frequency */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm">
            <Word>at</Word>
            <Pill>
              {locationIcon}
              <span>{location}</span>
            </Pill>
            {frequency ? (
              <>
                <Word>every</Word>
                <Pill>{frequency}</Pill>
              </>
            ) : null}
          </div>
        </div>
      </motion.div>
    );
  },
);

EventCard.displayName = "EventCard";

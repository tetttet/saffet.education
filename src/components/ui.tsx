import Link from "next/link";
import type { ReactNode } from "react";
import { reveal } from "@/lib/reveal";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function SectionHeading({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div {...reveal} className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h2 className="section-title mt-4">{title}</h2>
        {text && <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600">{text}</p>}
      </div>
      {action && (
        <Link href={action.href} className="btn-ghost group">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

const chipTones = {
  default: "border border-line bg-surface text-[#3b4350]",
  dark: "bg-ink-900 text-white",
  accent: "bg-sun text-ink-900",
  success: "bg-[#e9f8f1] text-success",
  glass: "bg-white/90 text-ink-900 backdrop-blur",
  brand: "bg-brand-soft text-brand",
};

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: keyof typeof chipTones }) {
  return <span className={`chip ${chipTones[tone]}`}>{children}</span>;
}

const buttonVariants = {
  primary: "btn-primary",
  outline: "btn-ghost",
  light: "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[15px] font-bold text-ink-900 hover:bg-white/90",
  sun: "inline-flex items-center justify-center gap-2 rounded-full bg-sun px-6 py-3 text-[15px] font-bold text-ink-900 hover:bg-sun-400",
  glass: "inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-[15px] font-bold text-white backdrop-blur hover:bg-white/20",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonVariants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/** Round arrow used at the end of card rows. */
export function ArrowDot({ className = "" }: { className?: string }) {
  return (
    <span className={`arrow-dot grid size-8 shrink-0 place-items-center rounded-full bg-ink-900 text-white group-hover:bg-brand ${className}`} aria-hidden>
      →
    </span>
  );
}

/** Rounded square with a line icon, as on subject and step cards. */
export function IconTile({ children, tone = "brand" }: { children: ReactNode; tone?: "brand" | "sun" }) {
  return (
    <span className={`grid size-12 place-items-center rounded-2xl ${tone === "sun" ? "bg-sun text-ink-900" : "bg-brand-soft text-brand"}`}>
      {children}
    </span>
  );
}

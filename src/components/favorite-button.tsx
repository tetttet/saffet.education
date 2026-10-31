"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { toggleFavorite, useFavorites } from "@/lib/favorites";

export function HeartIcon({ filled, className }: { filled: boolean; className?: string }) {
  // Each icon has its own gradient: a shared id would point at the copy in the hidden desktop or phone header.
  const gradient = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? `url(#${gradient})` : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6b81" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

/** Adds a program to the favorites or takes it out. `className` sets its size and position. */
export function FavoriteButton({ id, labels, className = "size-10" }: { id: string; labels: { add: string; remove: string }; className?: string }) {
  const on = useFavorites().includes(id);
  const [pop, setPop] = useState(false);
  const text = on ? labels.remove : labels.add;
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={text}
      title={text}
      onClick={() => {
        toggleFavorite(id);
        setPop(true);
      }}
      className={`grid shrink-0 place-items-center rounded-full bg-white/95 text-ink-600 shadow-[0_1px_2px_rgb(11_22_48/0.05)] ring-1 ring-ink/5 transition hover:text-[#e11d48] ${className}`}
    >
      <span className={pop ? "heart-pop" : ""} onAnimationEnd={() => setPop(false)}>
        <HeartIcon filled={on} className="block size-5" />
      </span>
    </button>
  );
}

/** Heart in the header with the number of saved programs. */
export function FavoritesLink({ href, label }: { href: string; label: string }) {
  const count = useFavorites().length;
  return (
    <Link href={href} aria-label={count ? `${label}: ${count}` : label} title={label} className="group relative grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink transition hover:border-ink/20">
      <HeartIcon filled={count > 0} className="heart-beat size-[21px]" />
      {count > 0 && (
        <span key={count} className="heart-pop absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#e11d48] px-1 text-[11px] leading-none font-bold text-white ring-2 ring-white">
          {count}
        </span>
      )}
    </Link>
  );
}

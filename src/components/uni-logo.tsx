import type { CSSProperties } from "react";
import type { Logo } from "@/lib/images";
import { Picture } from "./picture";

type Props = { logo?: Logo; initials: string; hue: number; className?: string; style?: CSSProperties };

/** University logo on a small tile, or its initials when there is no logo. Size comes from className. */
export function LogoTile({ logo, initials, hue, className = "size-11 rounded-xl p-1.5", style }: Props) {
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden ring-1 ring-ink/10 ${logo?.dark ? "bg-[#0b1633]" : "bg-white"} ${className}`}
      style={style}
    >
      {logo ? (
        <Picture src={logo.src} sizes="96px" className="size-full object-contain" />
      ) : (
        <span className="font-display text-sm font-bold tracking-tight" style={{ color: `hsl(${hue} 55% 34%)` }}>
          {initials}
        </span>
      )}
    </span>
  );
}

/** Stand-in for a missing campus photo: the logo on a white card over a soft tint, filling its positioned parent. */
export function LogoCover({ logo, initials, hue, size = "md" }: Props & { size?: "sm" | "md" | "lg" }) {
  const card = { sm: "h-[64%] w-[78%] p-2.5", md: "h-[58%] w-[72%] p-4", lg: "h-[52%] w-[62%] p-6" }[size];
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ backgroundColor: `hsl(${hue} 45% 93%)` }}>
      {logo ? (
        <span className={`grid place-items-center rounded-2xl shadow-[0_8px_24px_-16px_rgb(11_22_48/0.35)] ${logo.dark ? "bg-[#0b1633]" : "bg-white"} ${card}`}>
          <Picture src={logo.src} sizes="(min-width: 1024px) 320px, 200px" className="size-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        </span>
      ) : (
        <span className="font-display text-5xl font-bold tracking-tight" style={{ color: `hsl(${hue} 45% 38%)` }}>
          {initials}
        </span>
      )}
    </div>
  );
}

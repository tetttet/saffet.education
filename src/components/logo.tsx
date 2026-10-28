import Image from "next/image";
import Link from "next/link";

/** Saffet Education logo: cap mark + wordmark (public/logo.png, 800×251). */
export function Logo({ href }: { href: string }) {
  return (
    <Link href={href} className="flex items-center" aria-label="Saffet Education">
      <Image src="/logo.png" alt="Saffet Education" width={800} height={251} priority sizes="150px" className="h-10 w-auto sm:h-11" />
    </Link>
  );
}

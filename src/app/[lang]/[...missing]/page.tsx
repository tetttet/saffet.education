import { notFound } from "next/navigation";

// Always throws notFound(), so there is no page to check for instant navigation.
export const instant = false;

// Without this the head would keep the layout's default (home page) title once the page loads in a browser.
export function generateMetadata(): never {
  notFound();
}

/**
 * Any path no other route matches. The root layout sits under [lang], so Next would otherwise answer
 * with its built-in 404; this hands the request to [lang]/not-found.tsx in the visitor's language.
 */
export default function Missing() {
  notFound();
}

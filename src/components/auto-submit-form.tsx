"use client";

import Form from "next/form";
import { useRef, type ComponentProps } from "react";

/** Milliseconds to wait after the last keystroke before searching. */
const TYPING_DELAY = 350;

/**
 * GET form that re-submits as soon as a select, checkbox or radio changes, and shortly after
 * typing stops in a text field. It replaces the URL without scrolling, so the field keeps focus.
 */
export function AutoSubmitForm(props: ComponentProps<typeof Form>) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  return (
    <Form
      replace
      scroll={false}
      {...props}
      // Leave empty fields ("All", blank search) out of the URL: disabled fields are not submitted.
      onSubmitCapture={(e) => {
        const active = document.activeElement;
        const empty = [...e.currentTarget.elements].filter(
          (el): el is HTMLInputElement | HTMLSelectElement =>
            (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) && !!el.name && el.value === "" && (!(el instanceof HTMLInputElement) || el.type !== "radio" || el.checked),
        );
        empty.forEach((el) => (el.disabled = true));
        setTimeout(() => {
          empty.forEach((el) => (el.disabled = false));
          if (active instanceof HTMLElement && empty.includes(active as HTMLInputElement)) active.focus();
        });
      }}
      onChange={(e) => {
        const t = e.target as HTMLElement;
        const form = e.currentTarget;
        // Unnamed controls (like the mobile "Filters" toggle) are UI only and must not submit.
        if (!(t as HTMLInputElement).name) return;
        if (t instanceof HTMLSelectElement || (t instanceof HTMLInputElement && (t.type === "checkbox" || t.type === "radio"))) {
          form.requestSubmit();
        } else if (t instanceof HTMLInputElement) {
          clearTimeout(timer.current);
          timer.current = setTimeout(() => form.requestSubmit(), TYPING_DELAY);
        }
      }}
    />
  );
}

/**
 * Spread on elements that fade in on scroll. RevealObserver adds data-shown to them, sometimes before
 * React has hydrated them (a page or segment that streams in later), so React must not report that
 * attribute as a server/client mismatch. Suppression covers only this element's own attributes.
 */
export const reveal = { "data-reveal": true, suppressHydrationWarning: true };

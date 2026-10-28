import { getI18n } from "@/i18n/server";
import { whatsappLink } from "@/lib/site";

export async function WhatsAppButton() {
  const { t } = await getI18n();
  return (
    <a
      href={whatsappLink(t.whatsapp.hello)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.label}
      title={t.whatsapp.label}
      className="fixed right-5 bottom-5 z-50 grid size-[54px] place-items-center rounded-full bg-[#25d366] text-white shadow-[0_0_0_6px_#25d36626,0_12px_28px_#0b152540] transition hover:scale-105 [html[data-menu-open]_&]:pointer-events-none [html[data-menu-open]_&]:scale-75 [html[data-menu-open]_&]:opacity-0"
    >
      <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3c-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.8-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" />
      </svg>
    </a>
  );
}

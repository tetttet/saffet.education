import { Header } from "./header";
import { Footer } from "./footer";
import { WhatsAppButton } from "./whatsapp-button";

/** Header, footer and the WhatsApp button around a regular page (everything except the bare /form). */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

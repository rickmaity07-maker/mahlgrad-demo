import { CartDrawer } from "@/components/shop/CartDrawer";
import { ItemSheet } from "@/components/shop/ItemSheet";
import { ShopProvider } from "@/components/shop/ShopProvider";
import { SiteFooter } from "@/components/shop/SiteFooter";
import { SiteHeader } from "@/components/shop/SiteHeader";
import { getExtras, getMenu, getSettings, isDemo } from "@/lib/data";
import { openNow, pickupSlots } from "@/lib/slots";

export default async function ShopLayout({ children }: LayoutProps<"/">) {
  const [menu, extras, settings] = await Promise.all([getMenu(), getExtras(), getSettings()]);
  const demo = isDemo();
  const slots = pickupSlots(settings.hours, demo);
  const asapOpen = demo || openNow(settings.hours);
  return (
    <ShopProvider menu={menu} extras={extras} slots={slots} asapOpen={asapOpen}>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
      <CartDrawer />
      <ItemSheet />
    </ShopProvider>
  );
}

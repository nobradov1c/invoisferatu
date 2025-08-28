import type { ReactNode } from "react";
import { MobileSettingsNav } from "@/components/mobile-settings-nav";
import { SettingsSidebar } from "@/components/settings-sidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        <div className="hidden lg:block">
          <SettingsSidebar />
        </div>
        <div className="min-w-0 flex-1">
          <MobileSettingsNav />
          {children}
        </div>
      </div>
    </div>
  );
}

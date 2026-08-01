import prisma from "@/lib/db";
import SettingsClient from "./SettingsClient";

export const metadata = {
  title: "Settings - Antonic Admin",
};

export default async function SettingsPage() {
  const settings = await prisma.siteSettings.findFirst();

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted mt-2">Manage global integrations and site configuration.</p>
      </div>
      
      <SettingsClient initialSettings={settings} />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { saveSettings, testConnection } from "./actions";
import { Info, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [isPending, startTransition] = useTransition();
  const [isTesting, setIsTesting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [form, setForm] = useState({
    fourthwallEnabled: initialSettings?.fourthwallEnabled || false,
    fourthwallStoreUrl: initialSettings?.fourthwallStoreUrl || "",
    fourthwallToken: initialSettings?.fourthwallToken || "",
    fourthwallCollection: initialSettings?.fourthwallCollection || "all",
    fourthwallLimit: initialSettings?.fourthwallLimit || 4,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTestConnection = async () => {
    if (!form.fourthwallToken) {
      setFeedback({ type: "error", message: "Storefront Token is required to test." });
      return;
    }

    setIsTesting(true);
    setFeedback(null);
    
    try {
      const formData = new FormData();
      formData.append("fourthwallToken", form.fourthwallToken);
      formData.append("fourthwallCollection", form.fourthwallCollection);
      
      const result = await testConnection(formData);
      
      if (result.success) {
        setFeedback({ type: "success", message: `${result.message} Found ${result.count} products.` });
      } else {
        setFeedback({ type: "error", message: result.message });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: "Failed to test connection." });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("fourthwallEnabled", form.fourthwallEnabled.toString());
        formData.append("fourthwallStoreUrl", form.fourthwallStoreUrl);
        formData.append("fourthwallToken", form.fourthwallToken);
        formData.append("fourthwallCollection", form.fourthwallCollection);
        formData.append("fourthwallLimit", form.fourthwallLimit.toString());

        await saveSettings(formData);
        
        setFeedback({ type: "success", message: "Settings saved successfully." });
      } catch (err: any) {
        setFeedback({ type: "error", message: err.message || "Failed to save settings." });
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border bg-zinc-900/50">
        <h2 className="text-xl font-semibold">Fourthwall Merch Integration</h2>
        <p className="text-sm text-muted mt-1">Automatically display your latest merch directly from Fourthwall.</p>
      </div>

      <div className="p-6">
        <details className="mb-8 group border border-border rounded-lg bg-zinc-900/30 overflow-hidden">
          <summary className="p-4 cursor-pointer font-medium flex items-center gap-2 hover:bg-zinc-800/50 transition-colors">
            <Info size={18} className="text-blue-400" />
            How to connect Fourthwall
          </summary>
          <div className="p-4 pt-0 text-sm text-zinc-300 space-y-3 border-t border-border mt-2">
            <ol className="list-decimal pl-5 space-y-1.5 marker:text-zinc-500">
              <li>Sign in to your Fourthwall creator dashboard.</li>
              <li>Open your shop's developer settings.</li>
              <li>Create or copy a Storefront token.</li>
              <li>Paste the token into the "Fourthwall Storefront Token" field below.</li>
              <li>Open your public Fourthwall shop in a browser.</li>
              <li>Copy the main shop address from the browser's address bar.</li>
              <li>Paste that address into the "Fourthwall Store URL" field.</li>
              <li>Leave the collection handle as "all" to show every public product.</li>
              <li>To show only one collection, open that public collection in Fourthwall and use the final section of its URL as the collection handle.</li>
              <li>Click <strong>Test Connection</strong> to verify it works.</li>
              <li>After the connection succeeds, turn on "Enable Merch Section" and click <strong>Save Settings</strong>.</li>
            </ol>
            <div className="bg-blue-950/30 border border-blue-900/50 p-3 rounded-md mt-4 text-blue-200">
              <strong>Note:</strong> New public products added through Fourthwall will appear automatically. Products that are hidden or removed from Fourthwall should no longer be displayed after the website refreshes its product data (cache updates every 15 minutes).
            </div>
          </div>
        </details>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fourthwall Store URL</label>
              <input
                type="url"
                name="fourthwallStoreUrl"
                value={form.fourthwallStoreUrl}
                onChange={handleChange}
                placeholder="https://myshop.fourthwall.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-zinc-500">Used for the "View All Merch" button.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fourthwall Storefront Token</label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  name="fourthwallToken"
                  value={form.fourthwallToken}
                  onChange={handleChange}
                  placeholder="ptkn_xxxxxxxxxxxxxxxxxx"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 pr-10 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="text-xs text-zinc-500">This token is stored securely and never exposed publicly.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fourthwall Collection Handle</label>
              <input
                type="text"
                name="fourthwallCollection"
                value={form.fourthwallCollection}
                onChange={handleChange}
                placeholder="all"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-zinc-500">Use "all" for everything, or a specific collection handle.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Products to Display</label>
              <input
                type="number"
                name="fourthwallLimit"
                min="1"
                max="8"
                value={form.fourthwallLimit}
                onChange={handleChange}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p className="text-xs text-zinc-500">Maximum amount of products shown (1-8).</p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="fourthwallEnabled"
              name="fourthwallEnabled"
              checked={form.fourthwallEnabled}
              onChange={handleChange}
              className="w-4 h-4 accent-blue-500 rounded border-zinc-800 bg-zinc-950"
            />
            <label htmlFor="fourthwallEnabled" className="text-sm font-medium cursor-pointer">
              Enable Merch Section
            </label>
          </div>

          {feedback && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${feedback.type === "success" ? "bg-green-950/30 text-green-400 border border-green-900/50" : "bg-red-950/30 text-red-400 border border-red-900/50"}`}>
              {feedback.type === "success" ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertCircle size={18} className="mt-0.5 shrink-0" />}
              <span className="text-sm">{feedback.message}</span>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={isPending || isTesting}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || isPending}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isTesting && <Loader2 size={16} className="animate-spin" />}
              Test Connection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

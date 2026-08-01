import AnalyticsChart from "@/components/admin/AnalyticsChart";
import prisma from "@/lib/db";

export default async function AnalyticsPage() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Fetch real data
  const views = await prisma.pageView.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
  });

  const clicks = await prisma.linkClick.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
  });

  // Process Chart Data
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const chartDataMap: Record<string, { name: string, views: number, clicks: number, order: number }> = {};
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const name = days[d.getDay()];
    chartDataMap[name] = { name, views: 0, clicks: 0, order: 6 - i };
  }

  views.forEach(v => {
    const name = days[v.createdAt.getDay()];
    if (chartDataMap[name]) chartDataMap[name].views++;
  });

  clicks.forEach(c => {
    const name = days[c.createdAt.getDay()];
    if (chartDataMap[name]) chartDataMap[name].clicks++;
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => a.order - b.order).map(d => ({ name: d.name, views: d.views, clicks: d.clicks }));

  // Process Top Links
  const blockClickCounts: Record<string, number> = {};
  clicks.forEach(c => {
    blockClickCounts[c.blockId] = (blockClickCounts[c.blockId] || 0) + 1;
  });

  const topBlockIds = Object.keys(blockClickCounts).sort((a, b) => blockClickCounts[b] - blockClickCounts[a]).slice(0, 5);
  let topLinks: { name: string, count: number }[] = [];
  
  if (topBlockIds.length > 0) {
    const normalBlockIds = topBlockIds.filter(id => !id.startsWith("merch-"));
    const blocks = await prisma.pageBlock.findMany({
      where: { id: { in: normalBlockIds } }
    });

    const blockMap = Object.fromEntries(blocks.map(b => [b.id, b]));
    
    topLinks = topBlockIds.map(id => {
      if (id.startsWith("merch-")) {
        return { name: `Merch Item`, count: blockClickCounts[id] };
      }
      const block = blockMap[id];
      let name = "Unknown Link";
      if (block) {
        try {
          const content = JSON.parse(block.contentJson);
          name = content.text || content.url || "Link";
        } catch(e) {}
      }
      return { name, count: blockClickCounts[id] };
    });
  }

  // Process Devices
  const totalDevices = views.length;
  let mobile = 0;
  let desktop = 0;
  
  views.forEach(v => {
    if (v.deviceClass === "Mobile") mobile++;
    else desktop++;
  });

  const mobilePercent = totalDevices > 0 ? Math.round((mobile / totalDevices) * 100) : 0;
  const desktopPercent = totalDevices > 0 ? Math.round((desktop / totalDevices) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <button className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors">
          Export CSV
        </button>
      </div>
      
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Traffic Overview (Last 7 Days)</h3>
        <AnalyticsChart data={chartData} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top Links</h3>
          <div className="flex flex-col gap-3">
            {topLinks.length === 0 ? (
              <p className="text-zinc-500 text-sm">No clicks recorded yet.</p>
            ) : (
              topLinks.map((link, idx) => (
                <div key={idx} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                  <span className="truncate pr-4">{link.name}</span>
                  <span className="font-semibold shrink-0">{link.count} click{link.count !== 1 ? 's' : ''}</span>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Devices</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span>Mobile</span>
              <span className="font-semibold">{mobilePercent}%</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span>Desktop</span>
              <span className="font-semibold">{desktopPercent}%</span>
            </div>
            {totalDevices === 0 && (
              <p className="text-zinc-500 text-sm mt-2">Waiting for traffic data...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

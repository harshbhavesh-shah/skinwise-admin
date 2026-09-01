import { getAnalyticsSummary } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <div className="mb-1.5 text-[12.5px] font-medium uppercase tracking-[0.5px] text-ink-soft">
        {label}
      </div>
      <div className="text-[26px] font-medium">{value}</div>
      {sub && <div className="mt-1 text-[12.5px] text-ink-soft">{sub}</div>}
    </div>
  );
}

function formatDayLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export default async function AnalyticsPage() {
  let summary;
  let loadError: string | null = null;
  try {
    summary = await getAnalyticsSummary();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Couldn't load analytics.";
  }

  if (loadError || !summary) {
    return (
      <div className="mx-auto max-w-6xl px-8 py-14">
        <h1 className="mb-8 text-[28px] font-medium">Analytics</h1>
        <p className="rounded-2xl border border-line bg-red-50 p-8 text-center text-red-700">
          {loadError}
        </p>
      </div>
    );
  }

  const { orderCount, grossRevenue, avgOrderValue, byStatus, revenueByDay, topProducts } = summary;
  const maxDayRevenue = Math.max(1, ...revenueByDay.map((d) => d.revenue));
  const maxProductQty = Math.max(1, ...topProducts.map((p) => p.qty));

  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <div className="mb-8">
        <h1 className="text-[28px] font-medium">Analytics</h1>
        <p className="text-sm text-ink-soft">All-time, across {orderCount} order{orderCount === 1 ? "" : "s"}</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Gross Revenue" value={formatPrice(grossRevenue)} sub="Sum of every order total" />
        <StatTile label="Orders" value={String(orderCount)} />
        <StatTile label="Avg Order Value" value={formatPrice(Math.round(avgOrderValue))} />
      </div>

      <div className="mb-8 rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-5 text-[15px] font-semibold">Revenue — last 14 days</h2>
        {revenueByDay.every((d) => d.revenue === 0) ? (
          <p className="text-[13.5px] text-ink-soft">No orders in this window yet.</p>
        ) : (
          <div className="flex h-40 items-end gap-2">
            {revenueByDay.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2" title={`${formatDayLabel(d.date)}: ${formatPrice(d.revenue)} (${d.count} order${d.count === 1 ? "" : "s"})`}>
                <div className="flex h-32 w-full items-end">
                  <div
                    className="w-full rounded-t-sm bg-accent transition-opacity hover:opacity-80"
                    style={{ height: `${Math.max(2, (d.revenue / maxDayRevenue) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-ink-soft">{formatDayLabel(d.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="mb-5 text-[15px] font-semibold">Orders by status</h2>
          {byStatus.length === 0 ? (
            <p className="text-[13.5px] text-ink-soft">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {byStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between text-[13.5px]">
                  <StatusBadge status={s.status} />
                  <span className="text-ink-soft">
                    {s.count} order{s.count === 1 ? "" : "s"}
                  </span>
                  <span className="font-medium">{formatPrice(s.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="mb-5 text-[15px] font-semibold">Top products</h2>
          {topProducts.length === 0 ? (
            <p className="text-[13.5px] text-ink-soft">No orders yet.</p>
          ) : (
            <div className="flex flex-col gap-3.5">
              {topProducts.map((p) => (
                <div key={p.slug}>
                  <div className="mb-1 flex items-baseline justify-between text-[13px]">
                    <span className="truncate pr-3" title={`${p.brand} ${p.name}`}>
                      {p.brand} {p.name}
                    </span>
                    <span className="shrink-0 text-ink-soft">
                      {p.qty} sold &middot; {formatPrice(p.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${Math.max(4, (p.qty / maxProductQty) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

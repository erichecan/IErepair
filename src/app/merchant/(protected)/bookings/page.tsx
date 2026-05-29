"use client";

import { useState, useEffect, useCallback } from "react";

interface RepairBooking {
  id: number;
  orderNumber: string;
  status: string;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  appointmentTime: string;
  quotedPrice: number;
  actualPrice: number | null;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  repairService: {
    deviceModel: { name: string; brand: { name: string; category: { name: string } } };
    repairType: { name: string };
  };
}

type DateRange = "today" | "week" | "custom";
type StatusTab = "pending_confirm" | "confirmed" | "completed" | "cancelled";

interface ActionModal {
  type: "reject" | "complete";
  bookingId: number;
  reason: string;
  actualPrice: string;
  error: string;
  saving: boolean;
}

function maskName(name: string) {
  if (!name) return "—";
  return name.charAt(0) + "**";
}

function maskPhone(phone: string) {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function todayRange(): [string, string] {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return [from.toISOString(), to.toISOString()];
}

function weekRange(): [string, string] {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - ((day === 0 ? 7 : day) - 1));
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return [mon.toISOString(), sun.toISOString()];
}

const STATUS_LABELS: Record<string, string> = {
  pending_confirm: "待确认",
  confirmed: "已确认",
  completed: "已完成",
  cancelled: "已取消",
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending_confirm: { bg: "#fff8e1", color: "#f59e0b" },
  confirmed: { bg: "#e8f0fe", color: "#1a73e8" },
  completed: { bg: "#e8f7f0", color: "#146345" },
  cancelled: { bg: "#f5f5f7", color: "#6e6e73" },
};

const TABS: StatusTab[] = ["pending_confirm", "confirmed", "completed", "cancelled"];

export default function MerchantBookingsPage() {
  const [activeTab, setActiveTab] = useState<StatusTab>("pending_confirm");
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [total, setTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modal, setModal] = useState<ActionModal | null>(null);

  const getDateParams = useCallback((): [string | null, string | null] => {
    if (dateRange === "today") {
      const [f, t] = todayRange();
      return [f, t];
    }
    if (dateRange === "week") {
      const [f, t] = weekRange();
      return [f, t];
    }
    return [customFrom ? new Date(customFrom).toISOString() : null, customTo ? new Date(customTo + "T23:59:59").toISOString() : null];
  }, [dateRange, customFrom, customTo]);

  const fetchBookings = useCallback(() => {
    setLoading(true);
    const [dateFrom, dateTo] = getDateParams();
    const params = new URLSearchParams({ status: activeTab, limit: String(PAGE_SIZE), offset: String(page * PAGE_SIZE) });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    fetch(`/api/merchant/bookings?${params}`)
      .then(r => r.json())
      .then(d => {
        setBookings(d.bookings ?? []);
        setTotal(d.total ?? 0);
        setPendingCount(d.pendingCount ?? 0);
      })
      .finally(() => setLoading(false));
  }, [activeTab, page, getDateParams]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => { setPage(0); }, [activeTab, dateRange, customFrom, customTo]);

  async function doAction() {
    if (!modal) return;
    const { type, bookingId, reason, actualPrice } = modal;

    if (type === "reject" && !reason.trim()) {
      setModal(m => m ? { ...m, error: "请填写拒绝原因" } : null);
      return;
    }
    if (type === "complete") {
      const price = parseFloat(actualPrice);
      if (isNaN(price) || price < 0) {
        setModal(m => m ? { ...m, error: "请输入有效金额" } : null);
        return;
      }
    }

    setModal(m => m ? { ...m, saving: true, error: "" } : null);
    const body: Record<string, unknown> = { action: type === "reject" ? "reject" : "complete" };
    if (type === "reject") body.cancelReason = reason;
    if (type === "complete") body.actualPrice = parseFloat(actualPrice);

    const res = await fetch(`/api/merchant/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setModal(null);
      fetchBookings();
    } else {
      const d = await res.json();
      setModal(m => m ? { ...m, saving: false, error: d.error || "操作失败" } : null);
    }
  }

  async function acceptBooking(id: number) {
    const res = await fetch(`/api/merchant/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    if (res.ok) fetchBookings();
  }

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>预约管理</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>管理用户预约和维修订单</p>
      </div>

      {/* Status tabs */}
      <div style={{ display: "flex", gap: 4, background: "#f5f5f7", padding: 4, borderRadius: 24, width: "fit-content", marginBottom: 20 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
              background: activeTab === tab ? "#146345" : "transparent",
              color: activeTab === tab ? "#fff" : "#6e6e73",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {STATUS_LABELS[tab]}
            {tab === "pending_confirm" && pendingCount > 0 && (
              <span style={{ background: activeTab === tab ? "rgba(255,255,255,0.3)" : "#c0392b", color: "#fff", borderRadius: 10, fontSize: 11, padding: "1px 6px", fontWeight: 700 }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Date filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
        {(["today", "week", "custom"] as DateRange[]).map(r => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            style={{
              padding: "6px 14px",
              border: `1px solid ${dateRange === r ? "#146345" : "#d1d1d6"}`,
              borderRadius: 20,
              fontSize: 13,
              cursor: "pointer",
              background: dateRange === r ? "#e8f7f0" : "#fff",
              color: dateRange === r ? "#146345" : "#6e6e73",
              fontWeight: dateRange === r ? 600 : 400,
            }}
          >
            {r === "today" ? "今天" : r === "week" ? "本周" : "自定义"}
          </button>
        ))}
        {dateRange === "custom" && (
          <>
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              style={{ padding: "5px 10px", border: "1px solid #d1d1d6", borderRadius: 6, fontSize: 13 }}
            />
            <span style={{ color: "#6e6e73" }}>—</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              style={{ padding: "5px 10px", border: "1px solid #d1d1d6", borderRadius: 6, fontSize: 13 }}
            />
          </>
        )}
        <span style={{ fontSize: 13, color: "#aeaeb2", marginLeft: 4 }}>共 {total} 条</span>
      </div>

      {/* Booking list */}
      {loading ? (
        <div style={{ color: "#6e6e73", fontSize: 14, padding: "40px", textAlign: "center" }}>加载中...</div>
      ) : bookings.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>暂无{STATUS_LABELS[activeTab]}预约</div>
          <div style={{ fontSize: 14, color: "#6e6e73" }}>此时间段内没有符合条件的预约记录</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {bookings.map(b => {
            const expanded = expandedId === b.id;
            const statusStyle = STATUS_COLORS[b.status] ?? STATUS_COLORS.cancelled;
            const service = b.repairService;
            const deviceLabel = `${service.deviceModel.brand.name} ${service.deviceModel.name}`;

            return (
              <div key={b.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", overflow: "hidden" }}>
                {/* Card header */}
                <div
                  onClick={() => setExpandedId(expanded ? null : b.id)}
                  style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}
                >
                  {/* Order + status */}
                  <div style={{ flex: "0 0 auto", minWidth: 140 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", fontFamily: "monospace" }}>{b.orderNumber}</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </div>
                  </div>

                  {/* User */}
                  <div style={{ flex: "0 0 auto", minWidth: 100 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>{maskName(b.userName)}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>{maskPhone(b.userPhone)}</div>
                  </div>

                  {/* Device + repair type */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 14, color: "#1d1d1f" }}>{deviceLabel}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>{service.repairType.name}</div>
                  </div>

                  {/* Time */}
                  <div style={{ flex: "0 0 auto", minWidth: 110, textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#1d1d1f" }}>{fmtDate(b.appointmentTime)}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>预约时间</div>
                  </div>

                  {/* Price */}
                  <div style={{ flex: "0 0 auto", minWidth: 80, textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#146345" }}>€{Number(b.quotedPrice).toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 2 }}>报价</div>
                  </div>

                  {/* Actions */}
                  <div style={{ flex: "0 0 auto", display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                    {b.status === "pending_confirm" && (
                      <>
                        <button
                          onClick={() => acceptBooking(b.id)}
                          style={{ padding: "6px 14px", background: "#146345", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          接受
                        </button>
                        <button
                          onClick={() => setModal({ type: "reject", bookingId: b.id, reason: "", actualPrice: "", error: "", saving: false })}
                          style={{ padding: "6px 14px", background: "#fff", border: "1px solid #ffccc7", borderRadius: 6, color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          拒绝
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => setModal({ type: "complete", bookingId: b.id, reason: "", actualPrice: String(Number(b.quotedPrice)), error: "", saving: false })}
                          style={{ padding: "6px 14px", background: "#1a73e8", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          完成维修
                        </button>
                        <button
                          onClick={() => setModal({ type: "reject", bookingId: b.id, reason: "", actualPrice: "", error: "", saving: false })}
                          style={{ padding: "6px 14px", background: "#fff", border: "1px solid #d1d1d6", borderRadius: 6, color: "#6e6e73", fontSize: 12, cursor: "pointer" }}
                        >
                          取消
                        </button>
                      </>
                    )}
                  </div>

                  {/* Expand icon */}
                  <div style={{ color: "#aeaeb2", fontSize: 12, userSelect: "none" }}>{expanded ? "▲" : "▼"}</div>
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div style={{ borderTop: "1px solid #f0f0f5", padding: "16px 20px", background: "#fafafa", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                    <Detail label="订单号" value={b.orderNumber} mono />
                    <Detail label="品类" value={service.deviceModel.brand.category.name} />
                    <Detail label="用户姓名" value={b.userName} />
                    <Detail label="设备型号" value={deviceLabel} />
                    <Detail label="联系电话" value={b.userPhone} />
                    <Detail label="维修项目" value={service.repairType.name} />
                    <Detail label="预约时间" value={fmtDate(b.appointmentTime)} />
                    <Detail label="报价金额" value={`€${Number(b.quotedPrice).toFixed(2)}`} />
                    {b.actualPrice != null && <Detail label="实收金额" value={`€${Number(b.actualPrice).toFixed(2)}`} />}
                    {b.userEmail && <Detail label="邮箱" value={b.userEmail} />}
                    {b.notes && <div style={{ gridColumn: "1 / -1" }}><Detail label="备注" value={b.notes} /></div>}
                    {b.cancelReason && <div style={{ gridColumn: "1 / -1" }}><Detail label="取消原因" value={b.cancelReason} /></div>}
                    <Detail label="创建时间" value={fmtDate(b.createdAt)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "6px 14px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>上一页</button>
          <span style={{ padding: "6px 14px", fontSize: 13, color: "#6e6e73" }}>{page + 1} / {pageCount}</span>
          <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} style={{ padding: "6px 14px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: page >= pageCount - 1 ? "not-allowed" : "pointer", opacity: page >= pageCount - 1 ? 0.4 : 1 }}>下一页</button>
        </div>
      )}

      {/* Action modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={e => { if (e.target === e.currentTarget && !modal.saving) setModal(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", width: 380, boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
            {modal.type === "reject" ? (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", margin: "0 0 6px" }}>拒绝预约</h3>
                <p style={{ fontSize: 14, color: "#6e6e73", marginBottom: 16 }}>请填写拒绝原因，将通知给用户。</p>
                <textarea
                  value={modal.reason}
                  onChange={e => setModal(m => m ? { ...m, reason: e.target.value, error: "" } : null)}
                  rows={4}
                  placeholder="例如：该时间段已满档，建议改约..."
                  autoFocus
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${modal.error ? "#ffccc7" : "#d1d1d6"}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                />
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", margin: "0 0 6px" }}>完成维修</h3>
                <p style={{ fontSize: 14, color: "#6e6e73", marginBottom: 16 }}>请输入实际收取的维修费用（€）。</p>
                <input
                  type="number"
                  value={modal.actualPrice}
                  onChange={e => setModal(m => m ? { ...m, actualPrice: e.target.value, error: "" } : null)}
                  min={0}
                  step="0.01"
                  autoFocus
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${modal.error ? "#ffccc7" : "#d1d1d6"}`, borderRadius: 8, fontSize: 15, outline: "none", boxSizing: "border-box" }}
                />
              </>
            )}
            {modal.error && <div style={{ fontSize: 12, color: "#c0392b", marginTop: 8 }}>{modal.error}</div>}
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => { if (!modal.saving) setModal(null); }}
                style={{ flex: 1, padding: "10px", border: "1px solid #d1d1d6", borderRadius: 8, background: "#fff", fontSize: 14, cursor: "pointer" }}
              >
                取消
              </button>
              <button
                onClick={doAction}
                disabled={modal.saving}
                style={{
                  flex: 1, padding: "10px", border: "none", borderRadius: 8,
                  background: modal.type === "reject" ? "#c0392b" : "#146345",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: modal.saving ? "not-allowed" : "pointer",
                  opacity: modal.saving ? 0.7 : 1,
                }}
              >
                {modal.saving ? "处理中..." : modal.type === "reject" ? "确认拒绝" : "确认完成"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span style={{ fontSize: 12, color: "#aeaeb2" }}>{label}：</span>
      <span style={{ fontSize: 13, color: "#1d1d1f", fontFamily: mono ? "monospace" : "inherit" }}>{value}</span>
    </div>
  );
}

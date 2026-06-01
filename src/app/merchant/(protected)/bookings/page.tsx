"use client";

import { useState, useEffect, useCallback } from "react";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

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

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending_confirm: { bg: "#fff8e1", color: "#f59e0b" },
  confirmed: { bg: "#e8f0fe", color: "#1a73e8" },
  completed: { bg: "#e8f7f0", color: "#146345" },
  cancelled: { bg: "#f5f5f7", color: "#6e6e73" },
};

const TABS: StatusTab[] = ["pending_confirm", "confirmed", "completed", "cancelled"];

export default function MerchantBookingsPage() {
  const [lang] = useLang("zh");
  const t = useMerchantT(lang);

  const statusLabels: Record<string, string> = {
    pending_confirm: t.statusPending,
    confirmed: t.statusConfirmed,
    completed: t.statusCompleted,
    cancelled: t.statusCancelled,
  };

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
      setModal(m => m ? { ...m, error: t.errorRejectRequired } : null);
      return;
    }
    if (type === "complete") {
      const price = parseFloat(actualPrice);
      if (isNaN(price) || price < 0) {
        setModal(m => m ? { ...m, error: t.errorInvalidAmount } : null);
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
      setModal(m => m ? { ...m, saving: false, error: d.error || t.errorActionFailed } : null);
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
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>{t.bookingsPageTitle}</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>{t.bookingsDesc}</p>
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
            {statusLabels[tab]}
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
            {r === "today" ? t.filterToday : r === "week" ? t.filterWeek : t.filterCustom}
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
        <span style={{ fontSize: 13, color: "#aeaeb2", marginLeft: 4 }}>{t.totalCount(total)}</span>
      </div>

      {/* Booking list */}
      {loading ? (
        <div style={{ color: "#6e6e73", fontSize: 14, padding: "40px", textAlign: "center" }}>{t.loadingText}</div>
      ) : bookings.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5ea", padding: "60px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f", marginBottom: 6 }}>{t.noBookingsInTab(statusLabels[activeTab])}</div>
          <div style={{ fontSize: 14, color: "#6e6e73" }}>{t.noBookingsDesc}</div>
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
                        {statusLabels[b.status]}
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
                    <div style={{ fontSize: 13, color: "#1d1d1f" }}>{t.fmtDate(new Date(b.appointmentTime))}</div>
                    <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>{t.colApptTime}</div>
                  </div>

                  {/* Price */}
                  <div style={{ flex: "0 0 auto", minWidth: 80, textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#146345" }}>€{Number(b.quotedPrice).toFixed(2)}</div>
                    <div style={{ fontSize: 11, color: "#aeaeb2", marginTop: 2 }}>{t.colQuoted}</div>
                  </div>

                  {/* Actions */}
                  <div style={{ flex: "0 0 auto", display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                    {b.status === "pending_confirm" && (
                      <>
                        <button
                          onClick={() => acceptBooking(b.id)}
                          style={{ padding: "6px 14px", background: "#146345", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          {t.actionAccept}
                        </button>
                        <button
                          onClick={() => setModal({ type: "reject", bookingId: b.id, reason: "", actualPrice: "", error: "", saving: false })}
                          style={{ padding: "6px 14px", background: "#fff", border: "1px solid #ffccc7", borderRadius: 6, color: "#c0392b", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          {t.actionReject}
                        </button>
                      </>
                    )}
                    {b.status === "confirmed" && (
                      <>
                        <button
                          onClick={() => setModal({ type: "complete", bookingId: b.id, reason: "", actualPrice: String(Number(b.quotedPrice)), error: "", saving: false })}
                          style={{ padding: "6px 14px", background: "#1a73e8", border: "none", borderRadius: 6, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          {t.actionComplete}
                        </button>
                        <button
                          onClick={() => setModal({ type: "reject", bookingId: b.id, reason: "", actualPrice: "", error: "", saving: false })}
                          style={{ padding: "6px 14px", background: "#fff", border: "1px solid #d1d1d6", borderRadius: 6, color: "#6e6e73", fontSize: 12, cursor: "pointer" }}
                        >
                          {t.actionCancel}
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
                    <Detail label={t.detailOrderNo} value={b.orderNumber} mono />
                    <Detail label={t.detailCategory} value={service.deviceModel.brand.category.name} />
                    <Detail label={t.detailCustomer} value={b.userName} />
                    <Detail label={t.detailDevice} value={deviceLabel} />
                    <Detail label={t.detailPhone} value={b.userPhone} />
                    <Detail label={t.detailRepairType} value={service.repairType.name} />
                    <Detail label={t.detailApptTime} value={t.fmtDate(new Date(b.appointmentTime))} />
                    <Detail label={t.detailQuoted} value={`€${Number(b.quotedPrice).toFixed(2)}`} />
                    {b.actualPrice != null && <Detail label={t.detailActual} value={`€${Number(b.actualPrice).toFixed(2)}`} />}
                    {b.userEmail && <Detail label={t.detailEmail} value={b.userEmail} />}
                    {b.notes && <div style={{ gridColumn: "1 / -1" }}><Detail label={t.detailNotes} value={b.notes} /></div>}
                    {b.cancelReason && <div style={{ gridColumn: "1 / -1" }}><Detail label={t.detailCancelReason} value={b.cancelReason} /></div>}
                    <Detail label={t.detailCreated} value={t.fmtDate(new Date(b.createdAt))} />
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
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "6px 14px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: page === 0 ? "not-allowed" : "pointer", opacity: page === 0 ? 0.4 : 1 }}>{t.prevPage}</button>
          <span style={{ padding: "6px 14px", fontSize: 13, color: "#6e6e73" }}>{page + 1} / {pageCount}</span>
          <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={page >= pageCount - 1} style={{ padding: "6px 14px", border: "1px solid #d1d1d6", borderRadius: 6, background: "#fff", fontSize: 13, cursor: page >= pageCount - 1 ? "not-allowed" : "pointer", opacity: page >= pageCount - 1 ? 0.4 : 1 }}>{t.nextPage}</button>
        </div>
      )}

      {/* Action modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={e => { if (e.target === e.currentTarget && !modal.saving) setModal(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", width: 380, boxShadow: "0 16px 48px rgba(0,0,0,0.16)" }}>
            {modal.type === "reject" ? (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", margin: "0 0 6px" }}>{t.rejectTitle}</h3>
                <p style={{ fontSize: 14, color: "#6e6e73", marginBottom: 16 }}>{t.rejectDesc}</p>
                <textarea
                  value={modal.reason}
                  onChange={e => setModal(m => m ? { ...m, reason: e.target.value, error: "" } : null)}
                  rows={4}
                  placeholder={t.rejectPlaceholder}
                  autoFocus
                  style={{ width: "100%", padding: "10px 12px", border: `1px solid ${modal.error ? "#ffccc7" : "#d1d1d6"}`, borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }}
                />
              </>
            ) : (
              <>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", margin: "0 0 6px" }}>{t.completeTitle}</h3>
                <p style={{ fontSize: 14, color: "#6e6e73", marginBottom: 16 }}>{t.completeDesc}</p>
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
                {modal.type === "reject" ? t.rejectCancel : t.completeCancel}
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
                {modal.saving ? t.processingText : modal.type === "reject" ? t.rejectConfirm : t.completeConfirm}
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

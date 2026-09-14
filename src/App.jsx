import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, CalendarCheck, MessageSquareText, Star, CreditCard,
  Users, Dumbbell, Image as ImageIcon, Settings as SettingsIcon, LogOut,
  Search, Trash2, Check, X, Plus, Loader2, TrendingUp
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

/* ============================================================
   CONFIG — paste your deployed Apps Script Web App URL here
   ============================================================ */
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbw52bCy9DjDhG6RkGVbVhPEtkVZHd_vuVfPQTTr7U1EhLkx6PYXkFi7Jdc5vrw7nG90/exec";

async function apiGet(action, params = {}, token) {
  const query = new URLSearchParams({ action, ...(token ? { token } : {}), ...params }).toString();
  const res = await fetch(`${API_BASE_URL}?${query}`);
  return res.json();
}
async function apiPost(action, data = {}, token) {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...(token ? { token } : {}), ...data }),
  });
  return res.json();
}

/* ============================================================
   DESIGN TOKENS
   ============================================================ */
const C = {
  bg: "#0d1210",
  panel: "#151b18",
  panelHover: "#1b2320",
  border: "#242c27",
  green: "#8bec3f",
  greenDark: "#6bc42f",
  text: "#eef2ee",
  muted: "#8b968e",
  danger: "#ef6a5f",
  warn: "#f0b23d",
};

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');
`;

/* ============================================================
   DEMO DATA (shown when API_BASE_URL isn't configured yet)
   ============================================================ */
const DEMO_STATS = {
  totalBookings: 248, todaysBookings: 18, pendingBookings: 6,
  totalEnquiries: 57, newEnquiries: 9, activePlans: 3,
  bookingTrend: [
    { date: "Mon", count: 14 }, { date: "Tue", count: 22 }, { date: "Wed", count: 18 },
    { date: "Thu", count: 27 }, { date: "Fri", count: 31 }, { date: "Sat", count: 24 }, { date: "Sun", count: 12 },
  ],
};
const DEMO_BOOKINGS = [
  { ID: "1", FullName: "Rohit Das", Phone: "9840012233", Service: "HIIT", Date: "2026-09-13", Time: "7:00 AM", Trainer: "Rohit Das", Status: "Pending" },
  { ID: "2", FullName: "Sneha Iyer", Phone: "9840099887", Service: "Yoga", Date: "2026-09-13", Time: "6:00 PM", Trainer: "Sneha Iyer", Status: "Confirmed" },
  { ID: "3", FullName: "Arjun Kumar", Phone: "9840055443", Service: "Strength Training", Date: "2026-09-14", Time: "8:00 AM", Trainer: "Arjun Kumar", Status: "Completed" },
];
const DEMO_ENQUIRIES = [
  { ID: "1", Name: "Kavya M", Phone: "9840011122", Message: "Pro plan pricing details venum", Status: "New" },
  { ID: "2", Name: "Vignesh R", Phone: "9840033445", Message: "Personal training available-a?", Status: "Contacted" },
];
const DEMO_REVIEWS = [
  { ID: "1", Name: "Divya S", Rating: 5, Message: "Best gym in the area, great trainers!", Approved: false },
  { ID: "2", Name: "Karthik B", Rating: 4, Message: "Clean equipment, flexible timings.", Approved: true },
];

/* ============================================================
   SMALL UI PRIMITIVES
   ============================================================ */
function Badge({ status }) {
  const map = {
    Pending: C.warn, New: C.warn,
    Confirmed: C.green, Contacted: C.green, Completed: C.green,
    Cancelled: C.danger, Closed: C.muted,
  };
  const color = map[status] || C.muted;
  return (
    <span style={{
      color, background: `${color}1a`, border: `1px solid ${color}44`,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14,
      padding: "20px 22px", flex: 1, minWidth: 180,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>{label}</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: C.text }}>{value}</div>
          {sub && <div style={{ color: C.green, fontSize: 12.5, marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: "#8bec3f14",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={18} color={C.green} />
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = "solid", small, disabled }) {
  const styles = {
    solid: { background: C.green, color: "#0d1210", border: "none" },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.danger, border: `1px solid ${C.danger}44` },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles,
        padding: small ? "6px 12px" : "9px 16px",
        borderRadius: 8, fontSize: small ? 12.5 : 14, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "'Inter', sans-serif", transition: "opacity .15s",
      }}
    >
      {children}
    </button>
  );
}

function Table({ columns, rows, renderActions }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#101613" }}>
            {columns.map((c) => (
              <th key={c} style={{
                textAlign: "left", padding: "13px 18px", fontSize: 12.5,
                color: C.muted, fontWeight: 600, borderBottom: `1px solid ${C.border}`,
              }}>{c}</th>
            ))}
            {renderActions && <th style={{ borderBottom: `1px solid ${C.border}` }}></th>}
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   LOGIN SCREEN
   ============================================================ */
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (API_BASE_URL.startsWith("PASTE_")) {
        // demo mode — let anything through
        onLogin("demo-token");
        return;
      }
      const res = await apiPost("adminLogin", { username, password });
      if (res.success) onLogin(res.data.token);
      else setError(res.error || "Login failed");
    } catch (err) {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif",
    }}>
      <style>{fontImport}</style>
      <form onSubmit={submit} style={{
        background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: "40px 36px", width: 360,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: C.green,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Dumbbell size={18} color="#0d1210" />
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: C.text }}>
            IRONFIT
          </div>
        </div>
        <div style={{ color: C.muted, fontSize: 13.5, marginBottom: 28 }}>Admin dashboard login</div>

        <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6 }}>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required
          style={inputStyle} placeholder="admin" />

        <label style={{ fontSize: 13, color: C.muted, display: "block", margin: "16px 0 6px" }}>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password"
          style={inputStyle} placeholder="••••••••" />

        {error && <div style={{ color: C.danger, fontSize: 13, marginTop: 14 }}>{error}</div>}
        {API_BASE_URL.startsWith("PASTE_") && (
          <div style={{ color: C.warn, fontSize: 12, marginTop: 14, lineHeight: 1.5 }}>
            Demo mode — API_BASE_URL not set yet. Any login works with sample data.
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Btn small={false} disabled={loading} onClick={submit}>
            {loading ? <Loader2 size={16} className="spin" /> : null}
            {loading ? "Signing in…" : "Sign in"}
          </Btn>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", background: C.bg, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 14, fontFamily: "'Inter', sans-serif",
  outline: "none",
};

/* ============================================================
   DASHBOARD TAB
   ============================================================ */
function DashboardTab({ token, demo }) {
  const [stats, setStats] = useState(demo ? DEMO_STATS : null);
  const [loading, setLoading] = useState(!demo);

  useEffect(() => {
    if (demo) return;
    (async () => {
      const res = await apiGet("getDashboardStats", {}, token);
      if (res.success) setStats(res.data);
      setLoading(false);
    })();
  }, [demo, token]);

  if (loading || !stats) return <Centered>Loading dashboard…</Centered>;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total Bookings" value={stats.totalBookings} icon={CalendarCheck} sub={`${stats.todaysBookings} today`} />
        <StatCard label="Pending Bookings" value={stats.pendingBookings} icon={CalendarCheck} />
        <StatCard label="Total Enquiries" value={stats.totalEnquiries} icon={MessageSquareText} sub={`${stats.newEnquiries} new`} />
        <StatCard label="Active Plans" value={stats.activePlans} icon={CreditCard} />
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <TrendingUp size={16} color={C.green} />
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: C.text }}>
            Bookings — last 7 days
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={stats.bookingTrend}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.green} stopOpacity={0.35} />
                <stop offset="100%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.border} vertical={false} />
            <XAxis dataKey="date" stroke={C.muted} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke={C.muted} fontSize={12} tickLine={false} axisLine={false} width={28} />
            <Tooltip contentStyle={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13 }} />
            <Area type="monotone" dataKey="count" stroke={C.green} strokeWidth={2.5} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Centered({ children }) {
  return <div style={{ color: C.muted, padding: 60, textAlign: "center", fontSize: 14 }}>{children}</div>;
}

/* ============================================================
   BOOKINGS TAB
   ============================================================ */
function BookingsTab({ token, demo }) {
  const [rows, setRows] = useState(demo ? DEMO_BOOKINGS : []);
  const [loading, setLoading] = useState(!demo);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    if (demo) return;
    setLoading(true);
    const res = await apiGet("getAllBookings", {}, token);
    if (res.success) setRows(res.data);
    setLoading(false);
  }, [demo, token]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    setRows((r) => r.map((b) => (b.ID === id ? { ...b, Status: status } : b)));
    if (!demo) await apiPost("updateBookingStatus", { id, status }, token);
  };
  const remove = async (id) => {
    setRows((r) => r.filter((b) => b.ID !== id));
    if (!demo) await apiPost("deleteBooking", { id }, token);
  };

  const filtered = rows.filter((b) =>
    (b.FullName || "").toLowerCase().includes(q.toLowerCase()) ||
    (b.Phone || "").includes(q)
  );

  return (
    <div>
      <SearchBar q={q} setQ={setQ} placeholder="Search by name or phone…" />
      {loading ? <Centered>Loading bookings…</Centered> : (
        <Table
          columns={["Name", "Phone", "Service", "Date", "Time", "Trainer", "Status"]}
          renderActions
          rows={filtered.map((b) => (
            <tr key={b.ID} style={{ borderBottom: `1px solid ${C.border}` }}>
              <Td>{b.FullName}</Td>
              <Td>{b.Phone}</Td>
              <Td>{b.Service}</Td>
              <Td>{String(b.Date).slice(0, 10)}</Td>
              <Td>{b.Time}</Td>
              <Td>{b.Trainer || "—"}</Td>
              <Td><Badge status={b.Status} /></Td>
              <Td>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={b.Status} onChange={(e) => setStatus(b.ID, e.target.value)} style={selectStyle}>
                    {["Pending", "Confirmed", "Completed", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <IconBtn onClick={() => remove(b.ID)}><Trash2 size={14} /></IconBtn>
                </div>
              </Td>
            </tr>
          ))}
        />
      )}
    </div>
  );
}

/* ============================================================
   ENQUIRIES TAB
   ============================================================ */
function EnquiriesTab({ token, demo }) {
  const [rows, setRows] = useState(demo ? DEMO_ENQUIRIES : []);
  const [loading, setLoading] = useState(!demo);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    if (demo) return;
    setLoading(true);
    const res = await apiGet("getAllEnquiries", {}, token);
    if (res.success) setRows(res.data);
    setLoading(false);
  }, [demo, token]);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    setRows((r) => r.map((e) => (e.ID === id ? { ...e, Status: status } : e)));
    if (!demo) await apiPost("updateEnquiryStatus", { id, status }, token);
  };
  const remove = async (id) => {
    setRows((r) => r.filter((e) => e.ID !== id));
    if (!demo) await apiPost("deleteEnquiry", { id }, token);
  };

  const filtered = rows.filter((e) => (e.Name || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <SearchBar q={q} setQ={setQ} placeholder="Search by name…" />
      {loading ? <Centered>Loading enquiries…</Centered> : (
        <Table
          columns={["Name", "Phone", "Message", "Status"]}
          renderActions
          rows={filtered.map((e) => (
            <tr key={e.ID} style={{ borderBottom: `1px solid ${C.border}` }}>
              <Td>{e.Name}</Td>
              <Td>{e.Phone}</Td>
              <Td style={{ maxWidth: 320 }}>{e.Message}</Td>
              <Td><Badge status={e.Status} /></Td>
              <Td>
                <div style={{ display: "flex", gap: 6 }}>
                  <select value={e.Status} onChange={(ev) => setStatus(e.ID, ev.target.value)} style={selectStyle}>
                    {["New", "Contacted", "Closed"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <IconBtn onClick={() => remove(e.ID)}><Trash2 size={14} /></IconBtn>
                </div>
              </Td>
            </tr>
          ))}
        />
      )}
    </div>
  );
}

/* ============================================================
   REVIEWS TAB
   ============================================================ */
function ReviewsTab({ token, demo }) {
  const [rows, setRows] = useState(demo ? DEMO_REVIEWS : []);
  const [loading, setLoading] = useState(!demo);

  const load = useCallback(async () => {
    if (demo) return;
    setLoading(true);
    const res = await apiGet("getAllReviews", {}, token);
    if (res.success) setRows(res.data);
    setLoading(false);
  }, [demo, token]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id) => {
    setRows((r) => r.map((rv) => (rv.ID === id ? { ...rv, Approved: true } : rv)));
    if (!demo) await apiPost("approveReview", { id }, token);
  };
  const remove = async (id) => {
    setRows((r) => r.filter((rv) => rv.ID !== id));
    if (!demo) await apiPost("deleteReview", { id }, token);
  };

  return (
    <div>
      {loading ? <Centered>Loading reviews…</Centered> : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((rv) => (
            <div key={rv.ID} style={{
              background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
              padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{rv.Name}</span>
                  <span style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill={i < rv.Rating ? C.green : "none"} color={C.green} />
                    ))}
                  </span>
                  {(rv.Approved === true || rv.Approved === "TRUE") && <Badge status="Confirmed" />}
                </div>
                <div style={{ color: C.muted, fontSize: 13.5 }}>{rv.Message}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {!(rv.Approved === true || rv.Approved === "TRUE") && (
                  <Btn small variant="ghost" onClick={() => approve(rv.ID)}><Check size={13} /> Approve</Btn>
                )}
                <IconBtn onClick={() => remove(rv.ID)}><Trash2 size={14} /></IconBtn>
              </div>
            </div>
          ))}
          {rows.length === 0 && <Centered>No reviews yet.</Centered>}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SETTINGS TAB
   ============================================================ */
function SettingsTab({ token, demo }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(!demo);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (demo) {
      setSettings({ gymName: "IronFit", phone: "", whatsapp: "", address: "", adminEmail: "", instagram: "", snapchat: "", mapsEmbedUrl: "" });
      return;
    }
    (async () => {
      const res = await apiGet("getSettings", {}, token);
      if (res.success) setSettings(res.data);
      setLoading(false);
    })();
  }, [demo, token]);

  const save = async () => {
    if (!demo) await apiPost("updateSettings", { settings }, token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = ["gymName", "phone", "whatsapp", "address", "adminEmail", "instagram", "snapchat", "mapsEmbedUrl"];

  if (loading) return <Centered>Loading settings…</Centered>;

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 26, maxWidth: 520 }}>
      {fields.map((f) => (
        <div key={f} style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, color: C.muted, display: "block", marginBottom: 6, textTransform: "capitalize" }}>
            {f.replace(/([A-Z])/g, " $1")}
          </label>
          <input
            value={settings[f] || ""}
            onChange={(e) => setSettings({ ...settings, [f]: e.target.value })}
            style={inputStyle}
          />
        </div>
      ))}
      <Btn onClick={save}>{saved ? <Check size={15} /> : null}{saved ? "Saved" : "Save changes"}</Btn>
    </div>
  );
}

/* ============================================================
   SHARED SMALL PIECES
   ============================================================ */
function Td({ children, style }) {
  return <td style={{ padding: "13px 18px", fontSize: 13.5, color: C.text, ...style }}>{children}</td>;
}
function IconBtn({ children, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: "transparent", border: `1px solid ${C.border}`, color: C.danger,
      borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer",
    }}>
      {children}
    </button>
  );
}
function SearchBar({ q, setQ, placeholder }) {
  return (
    <div style={{ position: "relative", marginBottom: 18, maxWidth: 320 }}>
      <Search size={15} color={C.muted} style={{ position: "absolute", left: 12, top: 11 }} />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder}
        style={{ ...inputStyle, paddingLeft: 34 }} />
    </div>
  );
}
const selectStyle = {
  background: C.bg, border: `1px solid ${C.border}`, color: C.text,
  borderRadius: 7, fontSize: 12.5, padding: "5px 8px", fontFamily: "'Inter', sans-serif",
};

/* ============================================================
   MAIN APP
   ============================================================ */
const NAV = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "bookings", label: "Bookings", icon: CalendarCheck },
  { key: "enquiries", label: "Enquiries", icon: MessageSquareText },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

export default function IronFitAdminDashboard() {
  const [token, setToken] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const demo = API_BASE_URL.startsWith("PASTE_");

  if (!token) return <LoginScreen onLogin={setToken} />;

  const TabComponent = {
    dashboard: DashboardTab, bookings: BookingsTab, enquiries: EnquiriesTab,
    reviews: ReviewsTab, settings: SettingsTab,
  }[tab];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', sans-serif" }}>
      <style>{`${fontImport} .spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}} input:focus{border-color:${C.green}!important}`}</style>

      {/* Sidebar */}
      <div style={{ width: 220, borderRight: `1px solid ${C.border}`, padding: "22px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "0 8px", marginBottom: 30 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: C.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={16} color="#0d1210" />
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15.5, color: C.text, letterSpacing: 0.3 }}>IRONFIT</div>
        </div>

        {NAV.map((n) => {
          const Icon = n.icon;
          const active = tab === n.key;
          return (
            <button key={n.key} onClick={() => setTab(n.key)} style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              background: active ? "#8bec3f14" : "transparent",
              color: active ? C.green : C.muted,
              border: "none", borderRadius: 9, padding: "10px 12px", marginBottom: 3,
              fontSize: 13.5, fontWeight: 500, cursor: "pointer", textAlign: "left",
              fontFamily: "'Inter', sans-serif",
            }}>
              <Icon size={16} /> {n.label}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />
        <button onClick={() => setToken(null)} style={{
          display: "flex", alignItems: "center", gap: 10, background: "transparent",
          color: C.muted, border: "none", padding: "10px 12px", fontSize: 13.5,
          cursor: "pointer", fontFamily: "'Inter', sans-serif",
        }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "26px 34px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 22, color: C.text, textTransform: "capitalize" }}>
            {tab}
          </div>
          {demo && (
            <span style={{ color: C.warn, fontSize: 12.5, background: "#f0b23d14", border: `1px solid ${C.warn}44`, padding: "4px 10px", borderRadius: 20 }}>
              Demo data — set API_BASE_URL to go live
            </span>
          )}
        </div>
        <TabComponent token={token} demo={demo} />
      </div>
    </div>
  );
}

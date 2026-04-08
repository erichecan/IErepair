import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const mockSettings = {
  name: "O'Neill's Repairs",
  email: 'info@oneills.ie',
  phone: '01 234 5678',
  address: "12 O'Connell Street",
  city: 'Dublin',
  county: 'Dublin',
  description: 'Premium mobile repair service in the heart of Dublin. Specializing in iPhone and Samsung repairs with genuine parts.',
  photos: [
    { id: '1', url: 'https://placehold.co/300x200/f5f5f5/898989?text=Shop+Front' },
    { id: '2', url: 'https://placehold.co/300x200/f5f5f5/898989?text=Workspace' },
  ],
};

const mockHours = DAYS.map((_, i) => ({
  day_of_week: i + 1 === 7 ? 0 : i + 1,
  open_time: i < 5 ? '09:00' : i === 5 ? '10:00' : '',
  close_time: i < 5 ? '18:00' : i === 5 ? '16:00' : '',
  is_closed: i === 6,
}));

const mockSlots = { slot_duration: 30, max_concurrent: 3, buffer_minutes: 0, advance_days: 14 };

const s = {
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 800,
    color: 'var(--text-main)',
    letterSpacing: '-0.03em',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
  },
  section: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    marginBottom: 20,
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid var(--border-muted)',
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: 700,
    color: 'var(--text-main)',
  },
  sectionSub: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    marginTop: 2,
  },
  sectionBody: {
    padding: '20px 24px',
  },
  savedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '3px 10px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(22,163,74,0.08)',
    color: '#16a34a',
    fontSize: '0.72rem',
    fontWeight: 700,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 20,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  fieldFull: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    gridColumn: '1 / -1',
  },
  label: {
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
  },
  input: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  textarea: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
    minHeight: 80,
  },
  select: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-muted)',
    background: 'var(--input-bg)',
    color: 'var(--text-main)',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    outline: 'none',
    cursor: 'pointer',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: 12,
    marginBottom: 16,
  },
  photoCard: {
    position: 'relative',
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    border: '1px solid var(--border-muted)',
    aspectRatio: '3/2',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoDelete: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: 'rgba(220,38,38,0.85)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.78rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  hoursRow: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 1fr 80px',
    gap: 12,
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border-muted)',
  },
  hoursRowLast: {
    display: 'grid',
    gridTemplateColumns: '110px 1fr 1fr 80px',
    gap: 12,
    alignItems: 'center',
    padding: '8px 0',
  },
  dayLabel: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--text-main)',
  },
  closedCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  slotsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 20,
  },
};

export default function Settings() {
  const [info, setInfo] = useState({ name: '', email: '', phone: '', address: '', city: '', county: '', description: '' });
  const [photos, setPhotos] = useState([]);
  const [hours, setHours] = useState(mockHours);
  const [slots, setSlots] = useState(mockSlots);
  const [savedSection, setSavedSection] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await merchantAPI.get('/settings');
        const d = res.data?.data || res.data;
        setInfo({ name: d.name || '', email: d.email || '', phone: d.phone || '', address: d.address || '', city: d.city || '', county: d.county || '', description: d.description || '' });
        if (d.photos) setPhotos(d.photos);
        if (d.business_hours) setHours(d.business_hours);
        if (d.booking_slots) setSlots(d.booking_slots);
      } catch {
        setInfo({ name: mockSettings.name, email: mockSettings.email, phone: mockSettings.phone, address: mockSettings.address, city: mockSettings.city, county: mockSettings.county, description: mockSettings.description });
        setPhotos(mockSettings.photos);
      }
    };
    load();
  }, []);

  function flash(section) {
    setSavedSection(section);
    setTimeout(() => setSavedSection(''), 2000);
  }

  async function saveInfo() {
    try { await merchantAPI.patch('/settings', info); } catch { /* demo */ }
    flash('info');
  }

  async function saveHours() {
    try { await merchantAPI.put('/settings/hours', hours); } catch { /* demo */ }
    flash('hours');
  }

  async function saveSlots() {
    try { await merchantAPI.patch('/settings/slots', slots); } catch { /* demo */ }
    flash('slots');
  }

  async function deletePhoto(id) {
    try { await merchantAPI.delete(`/settings/photos/${id}`); } catch { /* demo */ }
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function updateHour(idx, field, value) {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  }

  return (
    <div className="animate-up">
      <div style={s.header}>
        <div style={s.title}>Shop Settings</div>
        <div style={s.subtitle}>Manage your shop profile, hours, and booking configuration</div>
      </div>

      {/* Shop Information */}
      <div style={s.section}>
        <div style={s.sectionHead}>
          <div>
            <div style={s.sectionTitle}>Shop Information</div>
            <div style={s.sectionSub}>Your public profile visible to customers</div>
          </div>
          {savedSection === 'info' && <span style={s.savedBadge}>✓ Saved</span>}
        </div>
        <div style={s.sectionBody}>
          <div style={s.formGrid}>
            <div style={s.field}>
              <label style={s.label}>Shop Name</label>
              <input style={s.input} value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Phone</label>
              <input style={s.input} value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Address</label>
              <input style={s.input} value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>City</label>
              <input style={s.input} value={info.city} onChange={(e) => setInfo({ ...info, city: e.target.value })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>County</label>
              <input style={s.input} value={info.county} onChange={(e) => setInfo({ ...info, county: e.target.value })} />
            </div>
            <div style={s.fieldFull}>
              <label style={s.label}>Description</label>
              <textarea style={s.textarea} value={info.description} onChange={(e) => setInfo({ ...info, description: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveInfo}>Save Changes</button>
        </div>
      </div>

      {/* Shop Photos */}
      <div style={s.section}>
        <div style={s.sectionHead}>
          <div>
            <div style={s.sectionTitle}>Shop Photos</div>
            <div style={s.sectionSub}>Images shown on your public shop listing</div>
          </div>
        </div>
        <div style={s.sectionBody}>
          <div style={s.photoGrid}>
            {photos.map((p) => (
              <div key={p.id} style={s.photoCard}>
                <img src={p.url} alt="Shop" style={s.photoImg} />
                <button style={s.photoDelete} onClick={() => deletePhoto(p.id)} title="Remove">×</button>
              </div>
            ))}
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const id = Date.now().toString();
              setPhotos((prev) => [...prev, { id, url: `https://placehold.co/300x200/f5f5f5/898989?text=Photo+${prev.length + 1}` }]);
            }}
          >
            + Add Photo
          </button>
        </div>
      </div>

      {/* Business Hours */}
      <div style={s.section}>
        <div style={s.sectionHead}>
          <div>
            <div style={s.sectionTitle}>Business Hours</div>
            <div style={s.sectionSub}>Set when your shop is open for bookings</div>
          </div>
          {savedSection === 'hours' && <span style={s.savedBadge}>✓ Saved</span>}
        </div>
        <div style={s.sectionBody}>
          {hours.map((h, i) => (
            <div key={i} style={i < hours.length - 1 ? s.hoursRow : s.hoursRowLast}>
              <span style={s.dayLabel}>{DAYS[i]}</span>
              <input
                type="time"
                style={{ ...s.input, opacity: h.is_closed ? 0.3 : 1 }}
                value={h.open_time}
                disabled={h.is_closed}
                onChange={(e) => updateHour(i, 'open_time', e.target.value)}
              />
              <input
                type="time"
                style={{ ...s.input, opacity: h.is_closed ? 0.3 : 1 }}
                value={h.close_time}
                disabled={h.is_closed}
                onChange={(e) => updateHour(i, 'close_time', e.target.value)}
              />
              <label style={s.closedCheck}>
                <input
                  type="checkbox"
                  checked={h.is_closed}
                  onChange={(e) => updateHour(i, 'is_closed', e.target.checked)}
                />
                Closed
              </label>
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={saveHours}>Save Hours</button>
        </div>
      </div>

      {/* Booking Slot Config */}
      <div style={s.section}>
        <div style={s.sectionHead}>
          <div>
            <div style={s.sectionTitle}>Booking Slot Configuration</div>
            <div style={s.sectionSub}>Control how appointments are scheduled</div>
          </div>
          {savedSection === 'slots' && <span style={s.savedBadge}>✓ Saved</span>}
        </div>
        <div style={s.sectionBody}>
          <div style={s.slotsGrid}>
            <div style={s.field}>
              <label style={s.label}>Slot Duration</label>
              <select style={s.select} value={slots.slot_duration} onChange={(e) => setSlots({ ...slots, slot_duration: Number(e.target.value) })}>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
            <div style={s.field}>
              <label style={s.label}>Max Concurrent</label>
              <input type="number" style={s.input} min={1} max={20} value={slots.max_concurrent}
                onChange={(e) => setSlots({ ...slots, max_concurrent: Number(e.target.value) })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Buffer (minutes)</label>
              <input type="number" style={s.input} min={0} max={60} value={slots.buffer_minutes}
                onChange={(e) => setSlots({ ...slots, buffer_minutes: Number(e.target.value) })} />
            </div>
            <div style={s.field}>
              <label style={s.label}>Advance Days</label>
              <input type="number" style={s.input} min={1} max={90} value={slots.advance_days}
                onChange={(e) => setSlots({ ...slots, advance_days: Number(e.target.value) })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveSlots}>Save Slot Settings</button>
        </div>
      </div>
    </div>
  );
}

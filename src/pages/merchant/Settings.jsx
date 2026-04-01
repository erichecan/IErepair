import React, { useState, useEffect } from 'react';
import { merchantAPI } from '../../api/client';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const mockSettings = {
  name: "O'Neill's Repairs", email: 'info@oneills.ie', phone: '01 234 5678',
  address: "12 O'Connell Street", city: 'Dublin', county: 'Dublin',
  description: 'Premium mobile repair service in the heart of Dublin. Specializing in iPhone and Samsung repairs with genuine parts.',
  photos: [
    { id: '1', url: 'https://placehold.co/300x200/121418/00D084?text=Shop+Front' },
    { id: '2', url: 'https://placehold.co/300x200/121418/00D084?text=Workspace' },
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
  heading: { fontFamily: "'Outfit', sans-serif", fontSize: '1.4rem', fontWeight: 700, marginBottom: 24 },
  section: { marginBottom: 32, padding: 24, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-muted)', background: 'var(--bg-card)' },
  sectionTitle: { fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 },
  fieldFull: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, gridColumn: '1 / -1' },
  label: { fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 },
  input: {
    background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff',
    padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
  },
  textarea: {
    background: 'var(--input-bg)', border: '1px solid var(--border-muted)', color: '#fff',
    padding: '10px 14px', borderRadius: 8, outline: 'none', fontFamily: 'inherit', fontSize: '0.9rem',
    resize: 'vertical', minHeight: 80,
  },
  primaryBtn: {
    background: 'var(--primary-green)', color: '#000', fontWeight: 700, border: 'none',
    padding: '10px 24px', borderRadius: 20, cursor: 'pointer', fontSize: '0.9rem',
  },
  ghostBtn: {
    padding: '10px 20px', borderRadius: 20, border: '1px solid var(--border-muted)',
    background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
  },
  dangerBtn: {
    background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)',
    padding: '4px 10px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
  },
  hoursTable: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' },
  hoursRow: { display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px', gap: 12, alignItems: 'center', marginBottom: 6 },
  dayLabel: { fontSize: '0.9rem', fontWeight: 500 },
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 },
  photoCard: {
    position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden',
    border: '1px solid var(--border-muted)', aspectRatio: '3/2',
  },
  photoImg: { width: '100%', height: '100%', objectFit: 'cover' },
  photoDelete: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%',
    background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', cursor: 'pointer',
    fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  slotsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 },
  saved: { color: 'var(--primary-green)', fontSize: '0.85rem', marginLeft: 12 },
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

  const flash = (section) => { setSavedSection(section); setTimeout(() => setSavedSection(''), 2000); };

  const saveInfo = async () => {
    try { await merchantAPI.patch('/settings', info); } catch { /* demo */ }
    flash('info');
  };

  const saveHours = async () => {
    try { await merchantAPI.put('/settings/hours', hours); } catch { /* demo */ }
    flash('hours');
  };

  const saveSlots = async () => {
    try { await merchantAPI.patch('/settings/slots', slots); } catch { /* demo */ }
    flash('slots');
  };

  const deletePhoto = async (id) => {
    try { await merchantAPI.delete(`/settings/photos/${id}`); } catch { /* demo */ }
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const updateHour = (idx, field, value) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  return (
    <div className="animate-up">
      <h2 style={s.heading}>Shop Settings</h2>

      {/* Shop Info */}
      <div style={s.section}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={s.sectionTitle}>Shop Information</h3>
          {savedSection === 'info' && <span style={s.saved}>Saved!</span>}
        </div>
        <div style={s.formGrid}>
          <div style={s.field}>
            <label style={s.label}>Shop Name</label>
            <input style={s.input} value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input style={s.input} value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Phone</label>
            <input style={s.input} value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Address</label>
            <input style={s.input} value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>City</label>
            <input style={s.input} value={info.city} onChange={e => setInfo({ ...info, city: e.target.value })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>County</label>
            <input style={s.input} value={info.county} onChange={e => setInfo({ ...info, county: e.target.value })} />
          </div>
          <div style={s.fieldFull}>
            <label style={s.label}>Description</label>
            <textarea style={s.textarea} value={info.description} onChange={e => setInfo({ ...info, description: e.target.value })} />
          </div>
        </div>
        <button style={s.primaryBtn} onClick={saveInfo}>Save Changes</button>
      </div>

      {/* Photos */}
      <div style={s.section}>
        <h3 style={s.sectionTitle}>Shop Photos</h3>
        <div style={s.photoGrid}>
          {photos.map(p => (
            <div key={p.id} style={s.photoCard}>
              <img src={p.url} alt="Shop" style={s.photoImg} />
              <button style={s.photoDelete} onClick={() => deletePhoto(p.id)} title="Remove">&times;</button>
            </div>
          ))}
        </div>
        <button style={s.ghostBtn} onClick={() => {
          const id = Date.now().toString();
          setPhotos(prev => [...prev, { id, url: `https://placehold.co/300x200/121418/00D084?text=Photo+${prev.length + 1}` }]);
        }}>+ Add Photo</button>
      </div>

      {/* Business Hours */}
      <div style={s.section}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={s.sectionTitle}>Business Hours</h3>
          {savedSection === 'hours' && <span style={s.saved}>Saved!</span>}
        </div>
        {hours.map((h, i) => (
          <div key={i} style={s.hoursRow}>
            <span style={s.dayLabel}>{DAYS[i]}</span>
            <input type="time" style={{ ...s.input, opacity: h.is_closed ? 0.3 : 1 }} value={h.open_time} disabled={h.is_closed}
              onChange={e => updateHour(i, 'open_time', e.target.value)} />
            <input type="time" style={{ ...s.input, opacity: h.is_closed ? 0.3 : 1 }} value={h.close_time} disabled={h.is_closed}
              onChange={e => updateHour(i, 'close_time', e.target.value)} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={h.is_closed} onChange={e => updateHour(i, 'is_closed', e.target.checked)} />
              Closed
            </label>
          </div>
        ))}
        <button style={{ ...s.primaryBtn, marginTop: 12 }} onClick={saveHours}>Save Hours</button>
      </div>

      {/* Booking Slots */}
      <div style={s.section}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={s.sectionTitle}>Booking Slot Configuration</h3>
          {savedSection === 'slots' && <span style={s.saved}>Saved!</span>}
        </div>
        <div style={s.slotsGrid}>
          <div style={s.field}>
            <label style={s.label}>Slot Duration (minutes)</label>
            <select style={s.input} value={slots.slot_duration} onChange={e => setSlots({ ...slots, slot_duration: Number(e.target.value) })}>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>
          <div style={s.field}>
            <label style={s.label}>Max Concurrent Bookings</label>
            <input type="number" style={s.input} min={1} max={20} value={slots.max_concurrent}
              onChange={e => setSlots({ ...slots, max_concurrent: Number(e.target.value) })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Buffer Minutes</label>
            <input type="number" style={s.input} min={0} max={60} value={slots.buffer_minutes}
              onChange={e => setSlots({ ...slots, buffer_minutes: Number(e.target.value) })} />
          </div>
          <div style={s.field}>
            <label style={s.label}>Advance Days</label>
            <input type="number" style={s.input} min={1} max={90} value={slots.advance_days}
              onChange={e => setSlots({ ...slots, advance_days: Number(e.target.value) })} />
          </div>
        </div>
        <button style={s.primaryBtn} onClick={saveSlots}>Save Slot Settings</button>
      </div>
    </div>
  );
}

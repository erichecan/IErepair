export default function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6e6e73", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}{required && <span style={{ color: "#ff3b30", marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#aeaeb2", marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{
        width: "100%", padding: "9px 12px", border: "1px solid #e5e5ea", borderRadius: 8,
        fontSize: 14, color: "#1d1d1f", background: "#fff", outline: "none",
        boxSizing: "border-box",
      }}
      onFocus={e => (e.currentTarget.style.borderColor = "#146345")}
      onBlur={e => (e.currentTarget.style.borderColor = "#e5e5ea")}
    />
  );
}

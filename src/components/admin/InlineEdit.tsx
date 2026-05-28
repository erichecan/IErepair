"use client";

import { KeyboardEvent } from "react";

export default function InlineEdit({
  isEditing,
  displayText,
  editValue,
  onStartEdit,
  onChange,
  onCommit,
  onCancel,
  inputType = "text",
  inputWidth = 100,
}: {
  isEditing: boolean;
  displayText: string;
  editValue: string;
  onStartEdit: () => void;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  inputType?: "text" | "number";
  inputWidth?: number;
}) {
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); onCommit(); }
    if (e.key === "Escape") onCancel();
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        type={inputType}
        value={editValue}
        onChange={e => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={handleKeyDown}
        style={{
          width: inputWidth,
          padding: "3px 8px",
          fontSize: 13,
          border: "1px solid #146345",
          borderRadius: 6,
          outline: "none",
          background: "#fff",
          color: "#1d1d1f",
        }}
      />
    );
  }

  return (
    <span
      onClick={onStartEdit}
      title="点击编辑"
      style={{ cursor: "text", padding: "3px 6px", borderRadius: 6, display: "inline-block" }}
      onMouseEnter={e => (e.currentTarget.style.background = "#f0f9f4")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {displayText}
    </span>
  );
}

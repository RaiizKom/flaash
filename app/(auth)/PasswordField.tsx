"use client";

import { useState } from "react";

interface PasswordFieldProps {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
}

export default function PasswordField({
  id,
  name,
  label,
  autoComplete,
  placeholder,
  minLength,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="f-input-wrap">
      <label className="f-label" htmlFor={id}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          placeholder={placeholder}
          className="f-input-box"
          style={{ paddingRight: 96 }}
        />
        <button
          type="button"
          aria-controls={id}
          aria-pressed={isVisible}
          onClick={() => setIsVisible((value) => !value)}
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            color: "var(--fg-3)",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            padding: "8px 4px",
          }}
        >
          {isVisible ? "Masquer" : "Afficher"}
        </button>
      </div>
    </div>
  );
}

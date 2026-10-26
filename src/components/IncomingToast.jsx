import React from 'react';

export default function IncomingToast({ visible, message }) {
  return (
    <div
      id="incoming-toast"
      className={`incoming-toast mono ${visible ? "is-visible" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="incoming-dot" aria-hidden="true" />
      <span id="incoming-toast-text">{message}</span>
    </div>
  );
}

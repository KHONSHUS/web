import React, { useState } from 'react';
import PORTFOLIO from '../data.js';

export default function Contact() {
  const { contact, ui } = PORTFOLIO;

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [invalidFields, setInvalidFields] = useState({});
  const [status, setStatus] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyScale, setCopyScale] = useState(false);

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(contact.email);
      } else {
        const ta = document.createElement("textarea");
        ta.value = contact.email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }

      setCopyScale(true);
      setTimeout(() => setCopyScale(false), 150);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {}
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (invalidFields[name]) {
      setInvalidFields((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const missing = {};
    if (!formData.name.trim()) missing.name = true;
    if (!formData.email.trim()) missing.email = true;
    if (!formData.message.trim()) missing.message = true;

    if (Object.keys(missing).length > 0) {
      setInvalidFields(missing);
      const first = Object.keys(missing)[0];
      setStatus({ text: `Please fill in your ${first}.`, type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setInvalidFields({ email: true });
      setStatus({ text: "Enter a valid email address, like name@example.com.", type: "error" });
      return;
    }

    const formspreeURL = contact.formspree;
    if (formspreeURL) {
      setIsSubmitting(true);
      setStatus({ text: "", type: "" });

      fetch(formspreeURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        })
      })
        .then((res) => {
          setIsSubmitting(false);
          if (res.ok) {
            setStatus({ text: ui.sent || "Message sent — thank you!", type: "success" });
            setFormData({ name: "", email: "", message: "" });
            setInvalidFields({});
          } else {
            return res.json().then((data) => {
              const msg = (data.errors && data.errors.map((err) => err.message).join(", ")) || "";
              setStatus({ text: msg || (ui.sendError || "Something went wrong. Please try again."), type: "error" });
            });
          }
        })
        .catch(() => {
          setIsSubmitting(false);
          setStatus({ text: ui.sendError || "Something went wrong. Please try again or email me directly.", type: "error" });
        });
    } else {
      const subject = encodeURIComponent("Portfolio message from " + formData.name.trim());
      const body = encodeURIComponent(formData.message.trim() + "\n\nFrom: " + formData.name.trim() + " (" + formData.email.trim() + ")");
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      setStatus({ text: "Opening your email app. Press send there to finish.", type: "" });
      setFormData({ name: "", email: "", message: "" });
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="wrap section">
        <div className="section-head">
          <h2>{contact.heading}</h2>
          <span className="mono">{contact.number}</span>
        </div>

        <div className="contact-grid reveal-on-scroll">
          <div>
            <p className="contact-lede">{contact.lede}</p>
            <ul className="contact-links" id="contact-links">
              <li className="contact-email-row">
                <a href={`mailto:${contact.email}`} className="contact-email-link">
                  {contact.email}
                </a>
                <button
                  type="button"
                  className="email-copy-btn mono"
                  id="email-copy-btn"
                  aria-label="Copy email address to clipboard"
                  onClick={handleCopyEmail}
                  style={copyScale ? { transform: "scale(0.92)" } : undefined}
                >
                  <span className="copy-label">{ui.copy}</span>
                  <svg className="copy-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <span
                  id="copy-toast"
                  className={`copy-toast mono ${copied ? "is-visible" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {ui.copied}
                </span>
              </li>

              {contact.linkedin && (
                <li>
                  <a href={contact.linkedin} target="_blank" rel="noopener">
                    {ui.linkedin} <span className="link-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              )}
              {contact.github && (
                <li>
                  <a href={contact.github} target="_blank" rel="noopener">
                    {ui.github} <span className="link-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              )}
              {contact.resume && (
                <li>
                  <a href={contact.resume} download>
                    {ui.resume} <span className="link-arrow" aria-hidden="true">↓</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          <form id="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label className="mono" htmlFor="name">{ui.name}</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={invalidFields.name ? "invalid" : ""}
                required
              />
            </div>
            <div className="field">
              <label className="mono" htmlFor="email">{ui.email}</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={invalidFields.email ? "invalid" : ""}
                required
              />
            </div>
            <div className="field">
              <label className="mono" htmlFor="message">{ui.message}</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className={invalidFields.message ? "invalid" : ""}
                required
              />
            </div>
            <p id="form-status" className={`form-status ${status.type}`} role="status" aria-live="polite">
              {status.text}
            </p>
            <button className="btn btn-solid mono" type="submit" disabled={isSubmitting}>
              {isSubmitting ? (ui.sending || "Sending…") : ui.send}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

import React, { useRef, useState } from 'react';

// FormSubmit's AJAX endpoint keeps the visitor on the page instead of bouncing
// them to a third-party thank-you screen.
const ENDPOINT = 'https://formsubmit.co/ajax/dom@domthedeveloper.com';

const EMPTY = { name: '', email: '', message: '' };

const validate = ({ name, email, message }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Your name, so I know who I am replying to.';
  if (!email.trim()) errors.email = 'An email address, or I cannot write back.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'That address does not look right.';
  if (!message.trim()) errors.message = 'A message would help.';
  else if (message.trim().length < 10) errors.message = 'A little more detail, please.';
  return errors;
};

const ContactForm = () => {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [failure, setFailure] = useState('');
  // Bots fill in every field they find; humans never see this one.
  const honeypot = useRef(null);

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;

    if (honeypot.current && honeypot.current.value) {
      // Silently accept and drop — no feedback for scripts to learn from.
      setStatus('sent');
      return;
    }

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.querySelector('[data-invalid="true"]');
      if (first) first.focus();
      return;
    }

    setStatus('sending');
    setFailure('');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
          _subject: `Portfolio message from ${values.name.trim()}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
      setStatus('sent');
      setValues(EMPTY);
    } catch (err) {
      setStatus('error');
      setFailure(err.message || 'Something went wrong.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="contact-form contact-form--sent" role="status" aria-live="polite">
        <div className="contact-form__check" aria-hidden="true">✓</div>
        <h3 className="contact-form__sent-title">Message sent.</h3>
        <p className="contact-form__sent-text">
          Thanks for reaching out &mdash; I&apos;ll get back to you soon.
        </p>
        <button
          type="button"
          className="contact-form__reset"
          onClick={() => { setStatus('idle'); setErrors({}); }}
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = status === 'sending';

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="contact-form__row">
        <div className="contact-form__field">
          <label htmlFor="cf-name">Name</label>
          <input
            id="cf-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={update('name')}
            disabled={sending}
            data-invalid={errors.name ? 'true' : undefined}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'cf-name-err' : undefined}
            placeholder="Ada Lovelace"
          />
          {errors.name && <p className="contact-form__error" id="cf-name-err">{errors.name}</p>}
        </div>

        <div className="contact-form__field">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            disabled={sending}
            data-invalid={errors.email ? 'true' : undefined}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'cf-email-err' : undefined}
            placeholder="ada@example.com"
          />
          {errors.email && <p className="contact-form__error" id="cf-email-err">{errors.email}</p>}
        </div>
      </div>

      <div className="contact-form__field">
        <label htmlFor="cf-message">Message</label>
        <textarea
          id="cf-message"
          name="message"
          rows="5"
          value={values.message}
          onChange={update('message')}
          disabled={sending}
          data-invalid={errors.message ? 'true' : undefined}
          aria-invalid={errors.message ? 'true' : undefined}
          aria-describedby={errors.message ? 'cf-message-err' : undefined}
          placeholder="What are you building?"
        />
        {errors.message && <p className="contact-form__error" id="cf-message-err">{errors.message}</p>}
      </div>

      <input
        ref={honeypot}
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="contact-form__honey"
      />

      <div className="contact-form__actions">
        <button type="submit" className="contact-form__submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </button>
        <p className="contact-form__status" role="status" aria-live="polite">
          {sending && 'Sending your message…'}
          {status === 'error' && (
            <span className="contact-form__status--error">
              {failure} You can also email me directly at{' '}
              <a href="mailto:dom@domthedeveloper.com">dom@domthedeveloper.com</a>.
            </span>
          )}
        </p>
      </div>
    </form>
  );
};

export default ContactForm;

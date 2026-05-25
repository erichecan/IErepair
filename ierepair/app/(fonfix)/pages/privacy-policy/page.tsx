export const metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-[var(--fonfix-text)] mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--fonfix-text-muted)] mb-10">Last updated: April 2026</p>

        <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-[var(--fonfix-text)] prose-p:text-[var(--fonfix-text-muted)] prose-p:leading-relaxed">
          <h2>1. Who we are</h2>
          <p>
            IErepair Ireland Ltd ("IErepair", "we", "us") operates repair centres in Ireland and the IErepair.ie
            website. Our registered address is 14 Henry Street, Dublin 1, D01 F9X6.
          </p>

          <h2>2. What data we collect</h2>
          <p>
            When you book a repair we collect: your name, phone number, email address, device model and
            IMEI (optional), and payment information (processed by Stripe — we never store card details).
            We also collect anonymous analytics data (page views, device type) via privacy-respecting tools.
          </p>

          <h2>3. How we use your data</h2>
          <p>
            We use your data to: process and fulfil your repair booking; send SMS/email appointment
            reminders and status updates; respond to your support queries; improve our services. We do not
            sell your data to third parties.
          </p>

          <h2>4. Data retention</h2>
          <p>
            Booking records are retained for 3 years for warranty and legal compliance purposes. You may
            request deletion at any time (subject to legal obligations) by emailing privacy@ierepair.ie.
          </p>

          <h2>5. Your rights (GDPR)</h2>
          <p>
            Under GDPR you have the right to access, correct, delete, or port your personal data. Contact
            privacy@ierepair.ie to exercise any of these rights. You also have the right to lodge a complaint
            with the Data Protection Commission (dataprotection.ie).
          </p>

          <h2>6. Cookies</h2>
          <p>
            We use essential cookies only (session management, CSRF protection). No advertising or
            third-party tracking cookies are set without your consent.
          </p>

          <h2>7. Contact</h2>
          <p>
            For privacy-related queries: <a href="mailto:privacy@ierepair.ie">privacy@ierepair.ie</a>
          </p>
        </div>
      </div>
    </div>
  );
}

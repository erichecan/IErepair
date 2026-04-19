export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-extrabold text-[var(--fonfix-text)] mb-2">Terms of Service</h1>
        <p className="text-sm text-[var(--fonfix-text-muted)] mb-10">Last updated: April 2026</p>

        <div className="prose prose-slate max-w-none prose-headings:font-extrabold prose-headings:text-[var(--fonfix-text)] prose-p:text-[var(--fonfix-text-muted)] prose-p:leading-relaxed">
          <h2>1. Service description</h2>
          <p>
            Fonfix provides phone and device repair services at our Irish retail locations and facilitates
            online booking through Fonfix.ie. By booking a repair, you agree to these terms.
          </p>

          <h2>2. Booking and payment</h2>
          <p>
            A deposit is required at time of booking. The remaining balance is due upon collection of your
            device. Deposits are refunded in full for cancellations made more than 2 hours before the
            appointment.
          </p>

          <h2>3. No Fix, No Fee</h2>
          <p>
            If we cannot repair your device, you will not be charged. Your device will be returned in the
            same condition. This guarantee does not apply where the device was misrepresented at the time
            of booking.
          </p>

          <h2>4. Warranty</h2>
          <p>
            All repairs carry a 180-day warranty covering defects in parts and workmanship. See our
            Warranty page for full details on coverage and exclusions.
          </p>

          <h2>5. Liability</h2>
          <p>
            Fonfix's liability for any claim arising from a repair is limited to the price paid for that
            repair. We are not liable for data loss — please back up your device before bringing it in.
          </p>

          <h2>6. Governing law</h2>
          <p>
            These terms are governed by the laws of Ireland. Disputes are subject to the exclusive
            jurisdiction of the Irish courts.
          </p>
        </div>
      </div>
    </div>
  );
}

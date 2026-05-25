export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    category: "Repairs",
    question: "How long does a typical repair take?",
    answer:
      "Most screen replacements and battery swaps are completed within 30–60 minutes while you wait. More complex repairs (water damage, motherboard issues) may take 24–48 hours. We'll give you an accurate estimate when you drop off your device.",
  },
  {
    id: "faq-2",
    category: "Repairs",
    question: "Do you offer a warranty on repairs?",
    answer:
      "Yes. All our repairs come with a 180-day warranty covering parts and labour. If the same fault reoccurs within the warranty period, we'll fix it for free.",
  },
  {
    id: "faq-3",
    category: "Pricing",
    question: "How are repair prices determined?",
    answer:
      "Prices depend on the device model, the type of repair, and the quality of parts used. You can get an instant quote on our website before booking. We always show you the full price upfront — no hidden fees.",
  },
  {
    id: "faq-4",
    category: "Pricing",
    question: "What is your 'No Fix, No Fee' policy?",
    answer:
      "If we can't fix your device, you pay nothing. We'll return your device in the same condition we received it. This applies to all repairs we attempt in-store.",
  },
  {
    id: "faq-5",
    category: "Booking",
    question: "How do I book a repair?",
    answer:
      "Select your device and repair type on our website, choose a nearby store and time slot, then pay a small deposit to secure your booking. You'll receive a confirmation by SMS and email.",
  },
  {
    id: "faq-6",
    category: "Booking",
    question: "Can I cancel or reschedule my booking?",
    answer:
      "Yes. You can cancel or reschedule up to 2 hours before your appointment via your account page or by calling the store directly. Deposits are fully refunded for cancellations made in time.",
  },
  {
    id: "faq-7",
    category: "Parts",
    question: "What quality of parts do you use?",
    answer:
      "We use OEM-equivalent parts sourced from certified suppliers. For certain Apple devices we also offer genuine Apple parts (Service Programme parts) at a higher price point — ask in-store.",
  },
  {
    id: "faq-8",
    category: "Parts",
    question: "Will my repair affect my device warranty?",
    answer:
      "Third-party repairs may void the manufacturer's warranty. However, IErepair repairs come with our own 180-day warranty, which in most cases provides better coverage than what remains on a manufacturer warranty.",
  },
  {
    id: "faq-9",
    category: "Data & Privacy",
    question: "Is my data safe during a repair?",
    answer:
      "We recommend backing up your device before bringing it in. Our technicians only access what's necessary to perform the repair. We never copy, transfer, or view personal data.",
  },
  {
    id: "faq-10",
    category: "Data & Privacy",
    question: "Do I need to provide my passcode?",
    answer:
      "For most repairs (screen, battery, back cover) we don't need your passcode. For software-related issues or Touch ID / Face ID repairs, temporary access may be required — we'll ask your permission first.",
  },
];

export const FAQ_CATEGORIES = ["All", "Repairs", "Pricing", "Booking", "Parts", "Data & Privacy"];

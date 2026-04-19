export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  category: string;
  readTime: number;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "iphone-screen-repair-guide",
    title: "iPhone Screen Repair: What to Expect and How to Prepare",
    excerpt:
      "Cracked your iPhone screen? Here's everything you need to know before walking into a repair shop — from types of screen damage to what OEM-quality actually means.",
    content: `
<p>A cracked iPhone screen is one of the most common tech accidents. Whether it's a hairline crack or a completely shattered display, a professional repair is the fastest and safest way to get your phone back to normal.</p>
<h2>Types of Screen Damage</h2>
<p>There are two main types: surface cracks (only the glass) and full display damage (glass + OLED/LCD). Surface cracks are cheaper to fix but can worsen quickly if left untreated.</p>
<h2>What is OEM-Quality?</h2>
<p>OEM-quality parts are manufactured to the same specifications as the original Apple screen, but not made by Apple itself. They offer the same brightness, colour accuracy, and touch sensitivity as the factory display.</p>
<h2>How to Prepare</h2>
<ul><li>Back up your device via iCloud or iTunes before your appointment</li><li>Remove your case and screen protector</li><li>Note your current battery health percentage (Settings → Battery)</li></ul>
<p>At Fonfix, most iPhone screen repairs are done in under 45 minutes. Book online and pay just a 20% deposit.</p>
    `.trim(),
    coverImage: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg",
    author: "Fonfix Editorial",
    publishedAt: "2026-04-10",
    category: "Repair Guides",
    readTime: 4,
  },
  {
    slug: "samsung-battery-replacement-signs",
    title: "5 Signs Your Samsung Battery Needs Replacing",
    excerpt:
      "Battery issues can sneak up on you. Learn the five telltale signs that your Samsung's battery is failing — and why replacing it sooner rather than later saves you money.",
    content: `
<p>Smartphone batteries degrade over time, and Samsung devices are no exception. If you're noticing any of the following signs, it's time to consider a battery replacement.</p>
<h2>1. Your phone dies before the percentage hits zero</h2>
<p>If your phone shuts off at 20%, 15%, or even 30% battery, the battery's capacity has degraded enough that it can no longer supply consistent power under load.</p>
<h2>2. Overnight charging no longer lasts a full day</h2>
<p>A healthy battery should comfortably last a full day of moderate use. If you're plugging in before dinner, the battery is likely below 70% of its original capacity.</p>
<h2>3. Your phone gets unusually hot</h2>
<p>Some heat during charging is normal, but excessive warmth during normal use signals a battery working harder than it should.</p>
<h2>4. The back cover is bulging</h2>
<p>This is the most urgent sign. A swollen battery can crack the screen and poses a safety risk. Bring your device in immediately.</p>
<h2>5. Slow performance despite recent software updates</h2>
<p>Android may throttle performance to compensate for poor battery delivery. A new battery often restores previous performance levels.</p>
<p>Fonfix battery replacements come with a 180-day warranty. Same-day service available at all our stores.</p>
    `.trim(),
    coverImage: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg",
    author: "Fonfix Editorial",
    publishedAt: "2026-04-03",
    category: "Tips & Advice",
    readTime: 3,
  },
  {
    slug: "water-damage-first-steps",
    title: "Phone Dropped in Water? Do These 5 Things Immediately",
    excerpt:
      "The first 60 seconds after water exposure are critical. These steps maximise your device's chances of survival before you reach a repair shop.",
    content: `
<p>Water damage is one of the leading causes of phone death — but fast action dramatically improves your odds. Here's what to do the moment your phone gets wet.</p>
<h2>1. Power it off immediately</h2>
<p>Do not attempt to unlock or use the device. Short circuits happen when current flows through wet components. Power off completely.</p>
<h2>2. Do NOT use a hairdryer</h2>
<p>Heat can damage internal components. Similarly, avoid putting your phone in rice — it's a myth that provides no meaningful benefit and wastes critical time.</p>
<h2>3. Remove the SIM card</h2>
<p>Open the SIM tray and let it air dry. This prevents corrosion on the SIM contacts.</p>
<h2>4. Pat dry gently</h2>
<p>Use a lint-free cloth to absorb surface moisture. Tilt the device to let water drain from ports naturally.</p>
<h2>5. Get to a repair shop within 24 hours</h2>
<p>Professional ultrasonic cleaning removes mineral deposits before they cause permanent corrosion. The sooner you bring it in, the higher the success rate. Fonfix offers water damage assessment with no diagnostic fee.</p>
    `.trim(),
    coverImage: "/images/devices/20260209-959958bcbf6e4b9886d80b6f1b1cebef.jpg",
    author: "Fonfix Editorial",
    publishedAt: "2026-03-28",
    category: "Tips & Advice",
    readTime: 3,
  },
  {
    slug: "choosing-right-screen-protector",
    title: "Tempered Glass vs. Film Screen Protectors: Which Is Worth It?",
    excerpt:
      "Not all screen protectors are equal. We break down the real differences between tempered glass and plastic film so you can make the right choice for your device.",
    content: `<p>Full content coming soon.</p>`,
    coverImage: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg",
    author: "Fonfix Editorial",
    publishedAt: "2026-03-20",
    category: "Buying Guides",
    readTime: 5,
  },
  {
    slug: "oneplus-vs-pixel-repairability",
    title: "OnePlus vs. Google Pixel: Which Is Easier (and Cheaper) to Repair?",
    excerpt:
      "We compared real repair costs and part availability for both brands across screen, battery, and charging port repairs.",
    content: `<p>Full content coming soon.</p>`,
    coverImage: "/images/devices/20260209-e8823b5010274226a2ef2674c436833a.jpg",
    author: "Fonfix Editorial",
    publishedAt: "2026-03-14",
    category: "Repair Guides",
    readTime: 6,
  },
];

export const BLOG_CATEGORIES = ["All", "Repair Guides", "Tips & Advice", "Buying Guides"];

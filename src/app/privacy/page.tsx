import LegalPage, { type Section } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Privacy",
  description: "What Popsule collects, why, how long we keep it and the choices you have.",
  alternates: { canonical: "/privacy" },
};

const sections: Section[] = [
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p>Only what we need to make and send your jar:</p>
        <ul>
          <li>
            <strong>Your design.</strong> Your formula, capsule count, tones, glass and the name on the label.
          </li>
          <li>
            <strong>Order details.</strong> Your name, email and delivery address, and what you ordered and when.
          </li>
          <li>
            <strong>Payment.</strong> Handled by our payment provider. We never see or store your full card number.
          </li>
          <li>
            <strong>How the site is used.</strong> Basic, anonymous measures such as which pages load slowly, so we can fix them.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it",
    body: (
      <>
        <p>To blend and print your order, ship it, send each monthly refill and email you a few days before it ships.</p>
        <p>To answer you when you write to us, and to keep the site working and secure.</p>
        <p>We don&apos;t sell your data, and we don&apos;t use your health goals for advertising.</p>
      </>
    ),
  },
  {
    id: "browser",
    title: "On your device",
    body: (
      <>
        <p>Your bag, your current design and your recent orders are saved in your browser&apos;s local storage, so they&apos;re still there when you come back. They stay on your device.</p>
        <p>We don&apos;t use advertising cookies. Clearing your browser&apos;s site data removes everything saved this way.</p>
      </>
    ),
  },
  {
    id: "share",
    title: "Who we share it with",
    body: (
      <>
        <p>Only the companies that help us deliver your order:</p>
        <ul>
          <li>our payment provider, to take payment;</li>
          <li>our delivery partners, who get your name and address;</li>
          <li>our email service, to send receipts and refill reminders.</li>
        </ul>
        <p>Each one may only use your data to do that job for us.</p>
      </>
    ),
  },
  {
    id: "keep",
    title: "How long we keep it",
    body: (
      <p>
        Order records are kept for as long as tax law requires. If you cancel your refills, we keep your design for a year in case you come back, then delete it. Ask us and
        we&apos;ll delete it sooner.
      </p>
    ),
  },
  {
    id: "rights",
    title: "Your choices",
    body: (
      <>
        <p>You can ask to see the data we hold about you, correct it, download it or have it deleted. You can stop marketing emails with the link in any of them; order and refill emails continue while you have an active order.</p>
        <p>Depending on where you live, you may also have the right to complain to your local data protection authority.</p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: <p>Questions about your data? Reply to any email from us and it reaches a person on our team. We aim to answer within five working days.</p>,
  },
];

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Your data, kept small."
      intro="We collect only what it takes to make your jar and send your refills. Here is what that is, why we need it and what you can ask us to do with it."
      updated="24 October 2026"
      sections={sections}
    />
  );
}

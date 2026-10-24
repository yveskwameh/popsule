import LegalPage, { type Section } from "@/components/legal/LegalPage";

export const metadata = {
  title: "Terms",
  description: "How Popsule orders, monthly refills, delivery, returns and cancellations work.",
  alternates: { canonical: "/terms" },
};

const sections: Section[] = [
  {
    id: "orders",
    title: "Orders",
    body: (
      <>
        <p>When you place an order, we blend your formula and print the name you chose on the glass. Because every jar is made for one person, please check the spelling on your label before you order.</p>
        <p>Prices are shown in US dollars and include the glass jar. Delivery is free unless you choose Express.</p>
      </>
    ),
  },
  {
    id: "refills",
    title: "Monthly refills",
    body: (
      <>
        <p>With Monthly refills, a new canister ships every 30 days and you&apos;re charged when it ships. We email you a few days before, so you can change your formula, skip a month or pause.</p>
        <p>You can cancel any time before your next refill ships. There are no fees and no minimum number of months.</p>
      </>
    ),
  },
  {
    id: "delivery",
    title: "Delivery",
    body: <p>We print and blend each order in about two days, then ship it. Standard delivery takes three to five working days; Express takes one to two. Delivery dates are estimates, and we&apos;ll tell you if anything is delayed.</p>,
  },
  {
    id: "returns",
    title: "Returns and breakage",
    body: (
      <>
        <p>If your jar arrives damaged, tell us within 30 days and we&apos;ll replace it free. If it breaks later, we&apos;ll send a new one at cost, printed with the same name and tone.</p>
        <p>Opened capsules can&apos;t be returned for hygiene reasons. If a refill isn&apos;t right, write to us and we&apos;ll make it right.</p>
      </>
    ),
  },
  {
    id: "canisters",
    title: "Returning canisters",
    body: <p>Each refill comes with a prepaid sleeve. Send the empty canister back in it and we clean and refill it. It&apos;s optional, and free.</p>,
  },
  {
    id: "health",
    title: "Health",
    body: (
      <>
        <p>
          Popsule makes dietary supplements, not medicines. These statements have not been evaluated by the Food and Drug Administration. Our products are not intended to diagnose,
          treat, cure or prevent any disease.
        </p>
        <p>Talk to your doctor before taking supplements if you are pregnant, breastfeeding, taking medication or have a medical condition. Keep out of reach of children.</p>
      </>
    ),
  },
  {
    id: "site",
    title: "Using the site",
    body: <p>The site, its designs, 3D models and words belong to Popsule. You&apos;re welcome to share links and pictures of your own jar. Please don&apos;t copy the rest.</p>,
  },
  {
    id: "changes",
    title: "Changes",
    body: <p>If we change these terms, we&apos;ll update the date at the top and, if the change affects your refills, email you before it applies.</p>,
  },
];

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="The fine print, kept plain."
      intro="How orders, monthly refills, delivery and returns work at Popsule. If anything here is unclear, write to us and we'll explain."
      updated="24 October 2026"
      sections={sections}
    />
  );
}

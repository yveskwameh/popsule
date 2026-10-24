import LabClient from "@/components/lab/LabClient";

export const metadata = {
  title: "Build your jar",
  alternates: { canonical: "/build" },
  description: "Build your Popsule in 3D: the formula, capsules a day, tones, glass and the name printed on the label.",
};

export default function BuildPage() {
  return <LabClient />;
}

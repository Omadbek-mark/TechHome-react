export interface InstallmentPlan {
  months: number;
  label: string;
  description: string;
  markup: string;
}

export const plansData: InstallmentPlan[] = [
  {
    months: 0,
    label: "Cash",
    description: "Demo display of the full product price.",
    markup: "Demo full price",
  },
  {
    months: 6,
    label: "6 months",
    description: "Demo price breakdown over 6 months.",
    markup: "Demo price breakdown",
  },
  {
    months: 12,
    label: "12 months",
    description: "Demo price breakdown over 12 months.",
    markup: "Demo price breakdown",
  },
];

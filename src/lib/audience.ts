export const AUDIENCES = ["MEN", "WOMEN", "KIDS"] as const;

export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  MEN: "Men",
  WOMEN: "Women",
  KIDS: "Kids",
};

export function isAudience(value: string | null | undefined): value is Audience {
  return !!value && (AUDIENCES as readonly string[]).includes(value);
}

/**
 * Maps app badge variant strings to Tremor Badge color prop.
 * Use with <Badge color={getBadgeColor(variant)} size="xs" /> from @/components/Badge.
 */
const VARIANT_TO_COLOR = {
  default: "indigo",
  neutral: "gray",
  success: "emerald",
  error: "red",
  warning: "amber",
} as const

type BadgeVariant = keyof typeof VARIANT_TO_COLOR

export function getBadgeColor(
  variant: BadgeVariant | string
): "indigo" | "gray" | "emerald" | "red" | "amber" {
  if (variant in VARIANT_TO_COLOR) {
    return VARIANT_TO_COLOR[variant as BadgeVariant]
  }
  return "gray"
}

import { cx } from "@/lib/utils"

const TABIB_COLOR = "#118ee3"
const DESK_COLOR = "#2cd5a0"

interface BrandNameProps {
  className?: string
}

/**
 * Renders the TabibDesk brand name with "Tabib" in blue and "Desk" in green.
 */
export function BrandName({ className }: BrandNameProps) {
  return (
    <span
      className={cx("font-bold tracking-tight", className)}
      style={{ fontFamily: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif" }}
    >
      <span style={{ color: TABIB_COLOR }}>Tabib</span>
      <span style={{ color: DESK_COLOR }}>Desk</span>
    </span>
  )
}

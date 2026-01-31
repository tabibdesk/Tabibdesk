# Tremor Usage Guide

This project uses [@tremor/react](https://www.npmjs.com/package/@tremor/react) for charts, cards, badges, and other dashboard/analytics UI. Follow these rules to keep the experience consistent.

## When to Use Tremor

- **Dashboard / analytics**: Cards, AreaChart, LineChart, BarChart, ProgressBar, BadgeDelta, Metric-style layouts.
- **Badges**: Use Tremor `Badge` with `getBadgeColor(variant)` from `@/lib/badgeColors` (maps app variants like `success`/`error` to Tremor colors).
- **Date pickers**: Tremor `DatePicker`, `DateRangePicker` where a calendar UI is needed.
- **Overview / insights**: Prefer Tremor Card, AreaChart, ProgressBar for overview and insights sections.

## When to Keep Custom Components

- **Buttons**: Use the app’s `Button` (loading, variants) unless you need a Tremor-specific look.
- **Forms**: Keep existing Input, Select, form patterns unless replacing a specific analytics form.
- **Skeletons**: **Do not replace** skeleton loading with Tremor. Keep `Skeleton`, `WidgetSkeleton`, `PageSkeleton`, `ListSkeleton`, `CardSkeleton`, `SummarySkeleton`, `LoadingSpinner` and all existing skeleton usage. Only the **loaded** content (e.g. Card, chart) may be Tremor; the loading state stays the same.

## Theme (Tailwind)

Tremor theme tokens are in `tailwind.config.ts` under `theme.extend`:

- **Colors**: `tremor` (light) and `dark-tremor` (dark) with `brand`, `background`, `border`, `ring`, `content`, `title`, `label`.
- **Border radius**: `rounded-tremor-default`, `rounded-tremor-full`.
- **Shadow**: `shadow-tremor-card`, `shadow-tremor-dropdown`, and `dark-tremor-*` variants.

Brand colors are aligned with the app primary (indigo override). Use `text-tremor-content-*`, `bg-tremor-background-*`, etc. when styling content inside Tremor components or matching their look.

## Reference Implementations

- **Metric cards + chart**: `src/features/insights/MetricCards.tsx` (Tremor Card + AreaChart + Badge).
- **Overview progress**: `src/components/ui/overview/DashboardProgressBarCard.tsx` (Tremor BadgeDelta + ProgressBar).
- **Badge usage**: Any file importing `Badge` from `@tremor/react` and `getBadgeColor` from `@/lib/badgeColors`.

## Adding New Tremor Usage

1. Prefer Tremor for new dashboard/analytics/chart UI.
2. Keep existing skeletons; only swap the loaded view to Tremor.
3. Use Tremor theme classes for text/backgrounds when matching Tremor styling.
4. Run `npm run typecheck` and `npm run build` before committing.

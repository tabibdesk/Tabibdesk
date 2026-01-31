import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import React, { act } from "react"
import { createRoot } from "react-dom/client"
import { useDebounce } from "./useDebounce"
function TestComponent({ value, delay }: { value: string; delay: number }) {
  const debounced = useDebounce(value, delay)
  return <span data-testid="debounced">{debounced}</span>
}

describe("useDebounce", () => {
  let container: HTMLDivElement
  let root: ReturnType<typeof createRoot>

  beforeEach(() => {
    vi.useFakeTimers()
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    vi.useRealTimers()
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it("returns initial value immediately", () => {
    act(() => {
      root.render(<TestComponent value="initial" delay={300} />)
    })
    const el = container.querySelector('[data-testid="debounced"]')
    expect(el?.textContent).toBe("initial")
  })

  it("updates after delay when value changes", () => {
    act(() => {
      root.render(<TestComponent value="first" delay={300} />)
    })
    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe("first")

    act(() => {
      root.render(<TestComponent value="second" delay={300} />)
    })
    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe("first")

    act(() => {
      vi.advanceTimersByTime(300)
    })
    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe("second")
  })

  it("does not update before delay", () => {
    act(() => {
      root.render(<TestComponent value="first" delay={300} />)
    })
    act(() => {
      root.render(<TestComponent value="second" delay={300} />)
    })
    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(container.querySelector('[data-testid="debounced"]')?.textContent).toBe("first")
  })
})

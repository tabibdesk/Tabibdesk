import "@testing-library/jest-dom"

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => null,
  setItem: (key: string, value: string) => {},
  removeItem: (key: string) => {},
  clear: () => {},
  length: 0,
  key: (index: number) => null,
}

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
})

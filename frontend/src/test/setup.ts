import '@testing-library/jest-dom'

// Mock browser APIs not available in jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock AudioContext (used by Quiz sound effects)
window.AudioContext = vi.fn().mockImplementation(() => ({
  createOscillator: () => ({
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { setValueAtTime: vi.fn() },
    type: '',
  }),
  createGain: () => ({
    connect: vi.fn(),
    gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
  }),
  destination: {},
  currentTime: 0,
})) as unknown as typeof AudioContext

// Mock window.getSelection (used by Dashboard highlight feature)
window.getSelection = vi.fn().mockReturnValue({
  toString: () => '',
  removeAllRanges: vi.fn(),
})

// Mock Element.scrollTo (not implemented in jsdom)
Element.prototype.scrollTo = vi.fn()
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

// Mock IntersectionObserver (not available in jsdom)
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})) as unknown as typeof IntersectionObserver

// Mock ResizeObserver (not available in jsdom)
class MockResizeObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  constructor(_callback: ResizeObserverCallback) {}
}
window.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver

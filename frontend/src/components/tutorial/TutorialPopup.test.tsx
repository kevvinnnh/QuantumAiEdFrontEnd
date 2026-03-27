import { render } from '@testing-library/react'
import TutorialPopup from './TutorialPopup'

describe('TutorialPopup', () => {
  it('renders without crashing', () => {
    const anchor = document.createElement('div')
    document.body.appendChild(anchor)
    const { container } = render(
      <TutorialPopup
        step={1}
        anchorElement={anchor}
        onNext={vi.fn()}
        onClose={vi.fn()}
      />
    )
    expect(container).toBeDefined()
    document.body.removeChild(anchor)
  })
})

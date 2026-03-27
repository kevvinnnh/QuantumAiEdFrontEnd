import { render, screen } from '@testing-library/react'
import ExitConfirmModal from './ExitConfirmModal'

describe('ExitConfirmModal', () => {
  it('renders without crashing', () => {
    render(
      <ExitConfirmModal
        exitModalRef={null}
        onClose={vi.fn()}
        onConfirmExit={vi.fn()}
        onOverlayClick={vi.fn()}
      />
    )
    expect(screen.getByText('Exit Quiz?')).toBeInTheDocument()
    expect(screen.getByText('Exit quiz')).toBeInTheDocument()
    expect(screen.getByText('Go back')).toBeInTheDocument()
  })
})

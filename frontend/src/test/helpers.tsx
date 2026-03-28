import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/AuthContext'
import { GoogleOAuthProvider } from '@react-oauth/google'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="test-client-id">
      <AuthProvider>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

export { render, screen, waitFor, within } from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

import React, { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function LoginWithGoogle() {
  const { loginWithGoogle } = useAuth()
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    if (!clientId) return
    const scriptId = 'google-identity-client'
    if (document.getElementById(scriptId)) return
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.id = scriptId
    s.async = true
    s.defer = true
    s.onload = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async tokenResponse => {
            try {
              await loginWithGoogle(tokenResponse.credential)
              // successful login; client may handle redirect/state
            } catch (err) {
              console.error('Login failed', err)
              alert('Login failed')
            }
          }
        })
        window.google.accounts.id.renderButton(
          document.getElementById('gsi-button'),
          { theme: 'outline', size: 'large' }
        )
      } catch (e) {
        console.error('Google Identity init error', e)
      }
    }
    document.body.appendChild(s)

    return () => {
      // cleanup not strictly necessary for the GSI script
    }
  }, [clientId, loginWithGoogle])

  const handleManual = async () => {
    const idToken = window.prompt('Paste Google ID token here (demo)')
    if (!idToken) return
    try {
      await loginWithGoogle(idToken)
      alert('Login successful')
    } catch (err) {
      alert('Login failed: ' + (err.response?.data || err.message))
    }
  }

  return (
    <div>
      <h2>Sign in with Google</h2>
      {!clientId && (
        <p style={{ color: 'orange' }}>
          Set `VITE_GOOGLE_CLIENT_ID` to enable Google Sign-In one-tap/button.
        </p>
      )}
      <div id="gsi-button" />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleManual}>Manual (paste token)</button>
      </div>
    </div>
  )
}

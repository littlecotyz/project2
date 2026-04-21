// Minimal React example using Google Identity Services
// Install: npm install @google/identity-api

import React from 'react'

export default function LoginWithGoogle() {
  // This example expects you to load Google's Identity Services script:
  // <script src="https://accounts.google.com/gsi/client" async defer></script>
  // and set window.google

  const handleCredentialResponse = async (response) => {
    const id_token = response.credential
    // Send token to backend
    const res = await fetch('/api/auth/google/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token })
    })
    const data = await res.json()
    // store access token
    console.log(data)
  }

  React.useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: '<YOUR_GOOGLE_CLIENT_ID>',
        callback: handleCredentialResponse
      })
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { theme: 'outline', size: 'large' }
      )
    }
  }, [])

  return (
    <div>
      <div id="google-signin-button"></div>
    </div>
  )
}

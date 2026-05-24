import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as fbCreateUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithPopup as fbSignInWithPopup,
  GoogleAuthProvider as fbGoogleAuthProvider
} from 'firebase/auth';
import type { Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

let realAuth: Auth | null = null;

if (isFirebaseConfigured) {
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }
  realAuth = getAuth();
}

// Memory DB Fallback variables for resilience
type AuthListener = (user: any | null) => void;
const listeners = new Set<AuthListener>();
let currentMockUser: any = null;
let isInitialized = false;

const API_BASE = 'http://localhost:5000/api';

const initSession = async () => {
  const token = localStorage.getItem('errix_auth_token');
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentMockUser = data;
      } else {
        localStorage.removeItem('errix_auth_token');
      }
    } catch (e) {
      console.error('Session restoration failed:', e);
    }
  }
  isInitialized = true;
  listeners.forEach(l => l(currentMockUser));
};

// Start session validation immediately
initSession();

export const mockAuth = {
  currentUser: currentMockUser,
  signInWithEmailAndPassword: async (email: string, pass: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed.');
    }
    const data = await res.json();
    currentMockUser = data.user;
    localStorage.setItem('errix_auth_token', data.token);
    listeners.forEach(l => l(data.user));
    return { user: data.user };
  },
  createUserWithEmailAndPassword: async (email: string, pass: string) => {
    const placeholderName = email.split('@')[0];
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: placeholderName, email, password: pass, company: 'Errix Workspace' })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Operator registration failed.');
    }
    const data = await res.json();
    currentMockUser = data.user;
    localStorage.setItem('errix_auth_token', data.token);
    listeners.forEach(l => l(data.user));
    return { user: data.user };
  },
  signInWithPopup: async (_auth: any, _provider: any) => {
    return new Promise<{ user: any }>((resolve, reject) => {
      const width = 500;
      const height = 550;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        "",
        "Google Sign-In",
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no,location=no`
      );
      
      if (!popup) {
        reject(new Error("Blocker prevented Google login popup. Please allow popups."));
        return;
      }
      
      const popupHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Sign in with Google</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Roboto', sans-serif;
              background-color: #ffffff;
              color: #202124;
              margin: 0;
              padding: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            .card {
              width: 360px;
              padding: 40px;
              border: 1px solid #dadce0;
              border-radius: 8px;
              text-align: center;
            }
            .google-logo {
              height: 32px;
              margin-bottom: 16px;
            }
            h1 {
              font-size: 24px;
              font-weight: 400;
              margin: 0 0 8px 0;
              color: #202124;
            }
            p {
              font-size: 16px;
              color: #5f6368;
              margin: 0 0 24px 0;
            }
            .input-group {
              margin-bottom: 16px;
              text-align: left;
            }
            label {
              display: block;
              font-size: 12px;
              font-weight: 500;
              color: #5f6368;
              margin-bottom: 6px;
            }
            input {
              width: 100%;
              box-sizing: border-box;
              padding: 12px;
              font-size: 14px;
              border: 1px solid #dadce0;
              border-radius: 4px;
              outline: none;
              transition: border-color 0.15s;
            }
            input:focus {
              border-color: #1a73e8;
            }
            button {
              background-color: #1a73e8;
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 14px;
              font-weight: 500;
              border-radius: 4px;
              cursor: pointer;
              width: 100%;
              margin-top: 10px;
              transition: background-color 0.15s;
            }
            button:hover {
              background-color: #1557b0;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <svg class="google-logo" viewBox="0 0 24 24" width="32" height="32">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <h1>Sign in with Google</h1>
            <p>to continue to Errix AI</p>
            <form id="loginForm">
              <div class="input-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" placeholder="example@gmail.com" required autofocus>
              </div>
              <div class="input-group">
                <label for="name">Operator Display Name</label>
                <input type="text" id="name" placeholder="John Doe">
              </div>
              <button type="submit">Continue</button>
            </form>
          </div>
          <script>
            document.getElementById('loginForm').addEventListener('submit', function(e) {
              e.preventDefault();
              const email = document.getElementById('email').value;
              let name = document.getElementById('name').value;
              if (!name) name = email.split('@')[0];
              
              window.opener.postMessage({
                type: 'GOOGLE_AUTH_SUCCESS',
                email: email,
                displayName: name
              }, '*');
              window.close();
            });
          </script>
        </body>
        </html>
      `;
      popup.document.write(popupHtml);
      popup.document.close();
      
      const messageListener = async (event: MessageEvent) => {
        if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          const { email, displayName } = event.data;
          
          try {
            const res = await fetch(`${API_BASE}/auth/google-login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, displayName })
            });
            if (!res.ok) {
              const err = await res.json();
              reject(new Error(err.error || 'Google login verification failed.'));
              return;
            }
            const data = await res.json();
            currentMockUser = data.user;
            localStorage.setItem('errix_auth_token', data.token);
            listeners.forEach(l => l(data.user));
            resolve({ user: data.user });
          } catch (e: any) {
            reject(new Error(e.message || 'Google Auth service failure.'));
          }
        }
      };
      
      window.addEventListener('message', messageListener);
    });
  },
  signOut: async () => {
    const token = localStorage.getItem('errix_auth_token');
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Logout request failed:', e);
      }
    }
    currentMockUser = null;
    localStorage.removeItem('errix_auth_token');
    listeners.forEach(l => l(null));
  },
  onAuthStateChanged: (callback: AuthListener) => {
    listeners.add(callback);
    if (isInitialized) {
      callback(currentMockUser);
    }
    return () => {
      listeners.delete(callback);
    };
  }
};

// Export active authentication adapter based on config state
export const auth = isFirebaseConfigured ? realAuth! : (mockAuth as any);
export const GoogleAuthProvider = isFirebaseConfigured ? fbGoogleAuthProvider : class { providerId = 'google.com'; };
export const signInWithPopup = isFirebaseConfigured ? fbSignInWithPopup : (async (_: any, __: any) => mockAuth.signInWithPopup(null, null));
export const signInWithEmailAndPassword = isFirebaseConfigured ? fbSignInWithEmailAndPassword : (async (_: any, e: string, p: string) => mockAuth.signInWithEmailAndPassword(e, p));
export const createUserWithEmailAndPassword = isFirebaseConfigured ? fbCreateUserWithEmailAndPassword : (async (_: any, e: string, p: string) => mockAuth.createUserWithEmailAndPassword(e, p));
export const signOut = isFirebaseConfigured ? fbSignOut : (async () => mockAuth.signOut());
export const onAuthStateChanged = isFirebaseConfigured ? fbOnAuthStateChanged : ((_: any, callback: any) => mockAuth.onAuthStateChanged(callback));

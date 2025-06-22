import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

// Default admin account display name
const ADMIN_DISPLAY_NAME = 'System Administrator';

const DirectAdminInit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const navigate = useNavigate();

  const handleInitialize = async () => {
    // Form validation
    if (!adminEmail || !adminPassword) {
      setMessage('Please enter admin email and password');
      return;
    }
    
    setLoading(true);
    setMessage('Initializing admin account, please wait...');
    
    try {
      // Step 1: Try to create user (if already exists, try to login)
      let uid;
      try {
        console.log('Attempting to create user');
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        uid = userCredential.user.uid;
        console.log('User created successfully, UID:', uid);
      } catch (createError: any) {
        console.log('User creation failed:', createError.message);
        
        // If user already exists, try to login
        if (createError.code === 'auth/email-already-in-use') {
          try {
            console.log('Attempting to login existing user');
            const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            uid = userCredential.user.uid;
            console.log('Login successful, UID:', uid);
          } catch (loginError: any) {
            console.error('Login failed:', loginError);
            setSuccess(false);
            setMessage(`Login failed: ${loginError.message}. If you forgot your password, please use the password reset feature.`);
            setLoading(false);
            return;
          }
        } else {
          throw createError;
        }
      }
      
      // Step 2: Set admin permissions
      if (uid) {
        try {
          console.log('Setting admin permissions, UID:', uid);
          await setDoc(doc(db, 'users', uid), {
            email: adminEmail,
            displayName: ADMIN_DISPLAY_NAME,
            isAdmin: true,
            createdAt: new Date()
          }, { merge: true });
          
          setSuccess(true);
          setMessage(`Admin account has been successfully initialized, please login with this account.`);
          
          // Redirect to login page after 5 seconds
          setTimeout(() => {
            navigate('/login');
          }, 5000);
        } catch (error) {
          console.error('Failed to set admin permissions:', error);
          setSuccess(false);
          setMessage(`Failed to set admin permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error('Error during initialization:', error);
      setSuccess(false);
      setMessage(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1>Direct Admin Account Initialization</h1>
      <p>This page will create and authorize an admin account. Please enter the admin email and password you want to use.</p>
      
      <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Admin Email:
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Enter admin email"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Admin Password:
            </label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter admin password"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              required
            />
            <p style={{ fontSize: '0.8rem', color: '#666', margin: '0.5rem 0 0' }}>
              Please use a strong password, preferably including uppercase and lowercase letters, numbers, and special characters.
            </p>
          </div>
        </div>
        
        <p style={{ color: '#dc3545', fontWeight: 'bold', marginTop: '1rem' }}>
          Important Security Notice: Please remember the credentials you set. After initialization, it is recommended to login immediately and verify permissions.
        </p>
      </div>
      
      <button 
        onClick={handleInitialize}
        disabled={loading || !adminEmail || !adminPassword}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0077be',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '1rem',
          cursor: (loading || !adminEmail || !adminPassword) ? 'not-allowed' : 'pointer',
          opacity: (loading || !adminEmail || !adminPassword) ? 0.7 : 1
        }}
      >
        {loading ? 'Initializing...' : 'Initialize Admin Account'}
      </button>
      
      {message && (
        <div style={{ 
          margin: '1.5rem 0', 
          padding: '1rem', 
          backgroundColor: success ? '#d4edda' : '#f8d7da',
          color: success ? '#155724' : '#721c24',
          borderRadius: '4px',
          border: `1px solid ${success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <p>{message}</p>
          {success && <p>Initialization successful! Redirecting to login page in 5 seconds.</p>}
        </div>
      )}
      
      <p>
        <a href="/login" style={{ color: '#0077be', textDecoration: 'none' }}>
          Back to Login Page
        </a>
      </p>
    </div>
  );
};

export default DirectAdminInit; 
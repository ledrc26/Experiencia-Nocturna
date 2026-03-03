'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        
        {/* LOGO */}
        <div style={styles.logoContainer}>
          <Image
            src="/logo.png"
            alt="Granja Papilia"
            width={110}
            height={120}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* TITULO */}
        <h2 style={styles.title}>Ingresar a tu cuenta</h2>
        <p style={styles.subtitle}>
          Ingresa tu correo electrónico y contraseña a continuación
          para iniciar sesión
        </p>

        {/* FORM */}
        <form onSubmit={onSubmit} style={styles.form}>
          
          <label style={styles.label}>Correo electrónico</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <div style={styles.passwordHeader}>
            <label style={styles.label}>Contraseña</label>
            <span style={styles.forgot}>¿Olvidaste tu contraseña?</span>
          </div>

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Iniciar sesión
          </button>
        </form>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    fontFamily: 'system-ui, sans-serif',
  },

  card: {
    width: 420,
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },

  logoContainer: {
    marginBottom: 20,
  },

  brand: {
    margin: 8,
    fontWeight: 600,
    fontSize: 14,
    color: '#444',
  },

  subBrand: {
    margin: 0,
    fontSize: 12,
    color: '#777',
  },

  title: {
    margin: '10px 0',
    fontSize: 20,
    fontWeight: 600,
    color: '#222',
  },

  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 30,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    textAlign: 'left',
  },

  label: {
    fontSize: 14,
    fontWeight: 500,
    color: '#333',
  },

  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  forgot: {
    fontSize: 12,
    color: '#3b82f6',
    cursor: 'pointer',
  },

  input: {
    padding: 10,
    borderRadius: 6,
    border: '1px solid #ccc',
    marginBottom: 10,
  },

  button: {
    marginTop: 10,
    padding: 12,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#3b97c8',
    color: '#fff',
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: 14,
  },
};
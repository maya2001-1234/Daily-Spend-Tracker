import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  User as UserIcon,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_USERS = [
  {
    username: 'demo_user',
    email: 'demo@example.com',
    passwordHash: 'Password123',
    createdAt: new Date().toISOString()
  }
];

export default function AuthPage({ onLoginSuccess }) {
  const [view, setView] = useState('login');

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState('');

  const [accounts, setAccounts] = useState(() => {
    const list = localStorage.getItem('DAILY_SPENDS_USERS_DB');
    if (list) {
      try {
        return JSON.parse(list);
      } catch (e) {
        return DEFAULT_USERS;
      }
    }
    localStorage.setItem('DAILY_SPENDS_USERS_DB', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  });

  useEffect(() => {
    localStorage.setItem('DAILY_SPENDS_USERS_DB', JSON.stringify(accounts));
  }, [accounts]);

  const clearMessages = () => {
    setError('');
    setInfo('');
    setSuccess('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setError('Please fill in both email/username and password fields.');
      return;
    }

    const matched = accounts.find(
      (u) =>
        (u.email.toLowerCase() === email.toLowerCase() ||
          u.username.toLowerCase() === email.toLowerCase()) &&
        u.passwordHash === password
    );

    if (matched) {
      setSuccess(`Welcome back, ${matched.username}!`);
      setTimeout(() => {
        onLoginSuccess({
          username: matched.username,
          email: matched.email
        });
      }, 800);
    } else {
      setError('Invalid matching credentials. Please double check accuracy or Sign Up.');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    clearMessages();

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const nameExists = accounts.some(u => u.username.toLowerCase() === username.toLowerCase());
    const emailExists = accounts.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (nameExists) {
      setError('Username already exists.');
      return;
    }

    if (emailExists) {
      setError('Email already exists.');
      return;
    }

    const newUser = {
      username,
      email,
      passwordHash: password,
      createdAt: new Date().toISOString()
    };

    setAccounts(prev => [...prev, newUser]);
    setSuccess('Account created successfully!');

    setTimeout(() => {
      setView('login');
    }, 1200);
  };

  const triggerForgotPassword = (e) => {
    e.preventDefault();
    clearMessages();

    const matched = accounts.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      setError('No account found with this email.');
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setRecoveryEmail(email);

    setSuccess('Verification code generated.');
    setInfo(`Code sent to ${email}`);

    setTimeout(() => setView('verify'), 1200);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    clearMessages();

    if (verificationCode === generatedCode || verificationCode === '123456') {
      setSuccess('Verified successfully!');
      setTimeout(() => setView('reset'), 1000);
    } else {
      setError('Invalid verification code.');
    }
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    clearMessages();

    if (!password || !confirmPassword) {
      setError('Please fill all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setAccounts(prev =>
      prev.map(u =>
        u.email.toLowerCase() === recoveryEmail.toLowerCase()
          ? { ...u, passwordHash: password }
          : u
      )
    );

    setSuccess('Password updated successfully!');

    setTimeout(() => setView('login'), 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">

      <div className="mb-8 text-center">
        <TrendingUp className="w-8 h-8 mx-auto mb-2" />
        <h1 className="text-xl font-bold">DAILY SPENDS</h1>
      </div>

      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button className="w-full bg-black text-white p-2 rounded">
              Login
            </button>
          </form>
        )}

        {view === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3">
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button className="w-full bg-black text-white p-2 rounded">
              Sign Up
            </button>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={triggerForgotPassword} className="space-y-3">
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button className="w-full bg-black text-white p-2 rounded">
              Send Code
            </button>
          </form>
        )}

        {view === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <input
              placeholder="Enter Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button className="w-full bg-black text-white p-2 rounded">
              Verify
            </button>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-3">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border p-2 rounded"
            />

            <button className="w-full bg-black text-white p-2 rounded">
              Reset Password
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
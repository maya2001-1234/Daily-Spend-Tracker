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
import { User, AuthSession } from '../types';

interface AuthPageProps {
  onLoginSuccess: (session: AuthSession) => void;
}

const DEFAULT_USERS: User[] = [
  {
    username: 'demo_user',
    email: 'demo@example.com',
    passwordHash: 'Password123',
    createdAt: new Date().toISOString()
  }
];

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'verify' | 'reset'>('login');
  
  // Input fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Verification states
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  // Message statuses
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState('');

  // Local Accounts database
  const [accounts, setAccounts] = useState<User[]>(() => {
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email || !password) {
      setError('Please fill in both email/username and password fields.');
      return;
    }

    const matched = accounts.find(
      (u) => 
        (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()) && 
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

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!username || !email || !password || !confirmPassword) {
      setError('All fields are requested to provision a secure workspace ledger.');
      return;
    }

    // Email basic check
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please specify a syntactically correct email address.');
      return;
    }

    if (username.length < 3) {
      setError('Username must contain at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 secure characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords mismatch. Both password fields must have identical entries.');
      return;
    }

    const nameExists = accounts.some(u => u.username.toLowerCase() === username.toLowerCase());
    const emailExists = accounts.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (nameExists) {
      setError('This username is already claimed by another user.');
      return;
    }

    if (emailExists) {
      setError('This email is already associated with an account. Try Signing In.');
      return;
    }

    const newUser: User = {
      username,
      email,
      passwordHash: password, // simple direct validation storage
      createdAt: new Date().toISOString()
    };

    setAccounts(prev => [...prev, newUser]);
    setSuccess('Wallet ledger created successfully! You can login now.');
    
    // Autofill login credentials and switch
    setEmail(email);
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    
    setTimeout(() => {
      setView('login');
      setInfo('Account provisioned. Please authenticate to start your sessions.');
    }, 1200);
  };

  const triggerForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!email) {
      setError('Please enter your account email to proceed with verification.');
      return;
    }

    const matched = accounts.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      setError('No registered account was found associated with this email address.');
      return;
    }

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setRecoveryEmail(email);

    setSuccess(`Security verification email broadcast successfully!`);
    setInfo(`Simulated code sent to: ${email}`);

    setTimeout(() => {
      setView('verify');
    }, 1500);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (verificationCode === generatedCode || verificationCode === '123456') {
      setSuccess('Identity verify checks validated! Complete password change.');
      setTimeout(() => {
        setView('reset');
      }, 1000);
    } else {
      setError('Incorrect security verification code. Please input the exact simulated code.');
    }
  };

  const handlePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!password || !confirmPassword) {
      setError('Please enter your new credential credentials.');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords mismatch. Enter matching credentials.');
      return;
    }

    // Update password in local DB array
    setAccounts(prev => prev.map(u => {
      if (u.email.toLowerCase() === recoveryEmail.toLowerCase()) {
        return {
          ...u,
          passwordHash: password
        };
      }
      return u;
    }));

    setSuccess('Password updated successfully! Welcome back to financial peace.');
    
    // Autofill login and transition
    setEmail(recoveryEmail);
    setPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setView('login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center px-4 py-12 transition-all duration-300">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md mb-3">
          <TrendingUp className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
          DAILY SPENDS
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Personal Capital Ledger & Comparison Hub
        </p>
      </div>

      {/* Main Authentic Card Container */}
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl overflow-hidden p-6 sm:p-8 transition-colors">
        
        {/* Navigation Tabs (Only when in login or signup state) */}
        {(view === 'login' || view === 'signup') && (
          <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl mb-6">
            <button
              id="auth-tab-signin"
              onClick={() => { setView('login'); clearMessages(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                view === 'login'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => { setView('signup'); clearMessages(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                view === 'signup'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Dynamic Alerts Feedback */}
        <AnimatePresence mode="popLayout">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 p-3.5 rounded-xl text-xs mb-4 border border-rose-100 dark:border-rose-950"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl text-xs mb-4 border border-emerald-100 dark:border-emerald-950"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {info && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 p-3.5 rounded-xl text-xs mb-4 border border-zinc-200 dark:border-zinc-700"
            >
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-zinc-500" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">Verification Event</span>
                <span>{info}</span>
                {generatedCode && view === 'verify' && (
                  <div className="mt-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white px-2.5 py-1.5 rounded text-[11px] font-mono inline-block font-extrabold uppercase tracking-widest">
                    Verification Code: {generatedCode}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth Panels */}
        <AnimatePresence mode="wait">
          {view === 'login' && (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="login-username-input"
                    type="text"
                    required
                    placeholder="demo@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    Password
                  </label>
                  <button
                    id="login-forgot-link"
                    type="button"
                    onClick={() => { setView('forgot'); clearMessages(); }}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 font-bold underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                  <button
                    id="login-toggle-pass-btn"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full mt-2 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md group"
              >
                Sign In 
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="text-center pt-2">
                <span className="text-[11px] text-zinc-400 font-medium">
                  Quick demo credential: <span className="font-mono text-zinc-600 dark:text-zinc-300 font-bold">demo@example.com</span> / <span className="font-mono text-zinc-600 dark:text-zinc-300 font-bold">Password123</span>
                </span>
              </div>
            </motion.form>
          )}

          {view === 'signup' && (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleSignup}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Pick a unique Username *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-username-input"
                    type="text"
                    required
                    minLength={3}
                    placeholder="rupee_savvy"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-email-input"
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-password-input"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="signup-confirm-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <button
                id="signup-submit-btn"
                type="submit"
                className="w-full mt-2 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Register
              </button>
            </motion.form>
          )}

          {view === 'forgot' && (
            <motion.form
              key="forgot"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={triggerForgotPassword}
              className="space-y-4"
            >
              <div className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-1">
                Enter your registered workspace email. We'll generate a verification ticket session with a secure, simulated security token.
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Verify Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="forgot-email-input"
                    type="email"
                    required
                    placeholder="demo@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  id="forgot-back-btn"
                  type="button"
                  onClick={() => { setView('login'); clearMessages(); }}
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 py-2.5 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer text-center"
                >
                  Back to Sign In
                </button>
                <button
                  id="forgot-submit-btn"
                  type="submit"
                  className="flex-1 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md"
                >
                  Verify Email
                </button>
              </div>
            </motion.form>
          )}

          {view === 'verify' && (
            <motion.form
              key="verify"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleVerifyCode}
              className="space-y-4"
            >
              <div className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-1">
                Enter the safety token to prove identity. (Hint: look at the yellow verification card badge or enter <span className="font-mono text-zinc-900 dark:text-white font-bold">123456</span>)
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5 font-mono">
                  Enter 6-Digit Code
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <input
                    id="verify-code-input"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm font-mono tracking-widest text-center bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200 text-base font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  id="verify-back-btn"
                  type="button"
                  onClick={() => { setView('forgot'); clearMessages(); }}
                  className="flex-1 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 py-2.5 rounded-xl font-bold text-xs text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer text-center"
                >
                  Resend Email
                </button>
                <button
                  id="verify-submit-btn"
                  type="submit"
                  className="flex-1 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all shadow-md"
                >
                  Verify Code
                </button>
              </div>
            </motion.form>
          )}

          {view === 'reset' && (
            <motion.form
              key="reset"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handlePasswordReset}
              className="space-y-4"
            >
              <div className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-1">
                Security clearance validated. Please enter your new login password parameters below.
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-password-input"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-zinc-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reset-confirm-input"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 focus:bg-white dark:bg-zinc-800 dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>

              <button
                id="reset-submit-btn"
                type="submit"
                className="w-full mt-2 cursor-pointer bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                Reset Password & Continue
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

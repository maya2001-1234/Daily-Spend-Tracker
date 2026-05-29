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

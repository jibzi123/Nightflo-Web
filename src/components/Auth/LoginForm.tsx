import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Facebook, ToggleLeft as Google, Github, Twitter, ArrowLeft, Mail, Lock, CheckCircle } from 'lucide-react';
import '../../styles/auth.css';

type AuthStep = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-password' | 'forgot-success';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const { login, isLoading } = useAuth();

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    setCurrentStep('forgot-email');
    setError('');
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setError('');
    setForgotEmail('');
    setOtp(['', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!forgotEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setForgotLoading(true);
    try {
      // Mock API call - in real app, this would send OTP to email
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('forgot-otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError('Please enter the complete 4-digit OTP.');
      return;
    }

    setForgotLoading(true);
    try {
      // Mock API call - in real app, this would verify OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any 4-digit OTP
      if (otpValue === '0000') {
        setError('Invalid OTP. Please try again.');
        return;
      }
      
      setCurrentStep('forgot-password');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      // Mock API call - in real app, this would reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      setCurrentStep('forgot-success');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const renderForgotEmailStep = () => (
    <div className="auth-form-section">
      <div className="auth-header">
        <button
          type="button"
          onClick={handleBackToLogin}
          style={{
            background: 'none',
            border: 'none',
            color: '#405189',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your email address and we'll send you a verification code.</p>
      </div>

      <form className="auth-form" onSubmit={handleSendOTP}>
        {error && <div className="auth-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="forgot-email" className="form-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type="email"
              id="forgot-email"
              className="form-input"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Enter your email address"
              style={{ paddingLeft: '40px' }}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={forgotLoading}
        >
          {forgotLoading ? 'Sending Code...' : 'Send Verification Code'}
        </button>
      </form>
    </div>
  );

  const renderOTPStep = () => (
    <div className="auth-form-section">
      <div className="auth-header">
        <button
          type="button"
          onClick={() => setCurrentStep('forgot-email')}
          style={{
            background: 'none',
            border: 'none',
            color: '#405189',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="auth-title">Enter Verification Code</h1>
        <p className="auth-subtitle">We've sent a 4-digit code to {forgotEmail}</p>
      </div>

      <form className="auth-form" onSubmit={handleVerifyOTP}>
        {error && <div className="auth-error">{error}</div>}
        
        <div className="form-group">
          <label className="form-label">Verification Code</label>
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                style={{
                  width: '50px',
                  height: '50px',
                  textAlign: 'center',
                  fontSize: '18px',
                  fontWeight: '600',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && index > 0) {
                    const prevInput = document.getElementById(`otp-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={forgotLoading}
        >
          {forgotLoading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={handleSendOTP}
            style={{
              background: 'none',
              border: 'none',
              color: '#405189',
              cursor: 'pointer',
              fontSize: '13px',
              textDecoration: 'underline'
            }}
          >
            Didn't receive the code? Resend
          </button>
        </div>
      </form>
    </div>
  );

  const renderPasswordResetStep = () => (
    <div className="auth-form-section">
      <div className="auth-header">
        <button
          type="button"
          onClick={() => setCurrentStep('forgot-otp')}
          style={{
            background: 'none',
            border: 'none',
            color: '#405189',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '13px',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="auth-title">Create New Password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>
      </div>

      <form className="auth-form" onSubmit={handleResetPassword}>
        {error && <div className="auth-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="new-password" className="form-label">New Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="new-password"
              className="form-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={{ paddingLeft: '40px', paddingRight: '40px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirm-password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              style={{ paddingLeft: '40px', paddingRight: '40px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={forgotLoading}
        >
          {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="auth-form-section">
      <div className="auth-header" style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle size={32} style={{ color: 'white' }} />
        </div>
        <h1 className="auth-title">Password Reset Successful!</h1>
        <p className="auth-subtitle">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          type="button"
          onClick={handleBackToLogin}
          className="auth-button"
        >
          Continue to Sign In
        </button>
      </div>
    </div>
  );

  const renderLoginStep = () => (
    <div className="auth-form-section">
      <div className="auth-header">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to access your club management portal.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="auth-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="email" className="form-label">Username</label>
          <input
            type="email"
            id="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ paddingRight: '40px' }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="remember-me-group">
          <input type="checkbox" id="remember-me" style={{ marginRight: '8px' }} />
          <label htmlFor="remember-me">Remember me</label>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="forgot-password"
            style={{ marginLeft: 'auto' }}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="auth-button"
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="social-login-separator">Sign In with</div>
      <div className="social-buttons-container">
        <div className="social-button facebook"><Facebook size={20} /></div>
        <div className="social-button google"><Google size={20} /></div>
        <div className="social-button github"><Github size={20} /></div>
        <div className="social-button twitter"><Twitter size={20} /></div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '13px', color: '#495057' }}>
        Don't have an account? <a href="#" className="forgot-password" style={{ color: '#007bff' }}>Signup</a>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image-section">
          <div className="auth-image-content">
            <h1 className="auth-image-title">NIGHTFLO</h1>
            <div className="quote-icon">"</div>
            <p className="auth-image-subtitle">
              "Revolutionizing nightclub management with cutting-edge technology and seamless experiences."
            </p>
            <div className="pagination-dots">
              <div className="dot active"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          </div>
        </div>

        {currentStep === 'login' && renderLoginStep()}
        {currentStep === 'forgot-email' && renderForgotEmailStep()}
        {currentStep === 'forgot-otp' && renderOTPStep()}
        {currentStep === 'forgot-password' && renderPasswordResetStep()}
        {currentStep === 'forgot-success' && renderSuccessStep()}
      </div>
      <div className="auth-footer">
        © 2025 NightFlo. Powering the future of nightclub management.
      </div>
    </div>
  );
};

export default LoginForm;
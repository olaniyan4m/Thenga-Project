import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo2 from '../../assets/Logo2.PNG';

interface LoginForm {
  phone: string;
  password: string;
}

export const LoginScreen: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data.phone, data.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="login-screen">
      <div className="phone-frame">
        <div className="login-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="login-header"
          >
            <div className="logo">
              <img 
                src={Logo2} 
                alt="Pezela Logo" 
                className="login-logo" 
                style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '20px' }}
              />
              <h1>Pezela</h1>
              <p>Digital Commerce for South Africa</p>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="login-form-container"
          >
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your merchant account</p>

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^\+27[0-9]{9}$/,
                      message: 'Please enter a valid South African phone number (+27XXXXXXXXX)',
                    },
                  })}
                  type="tel"
                  id="phone"
                  placeholder="+27821234567"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  id="password"
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && (
                  <span className="error-message">{errors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="login-button"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="login-footer">
              <p>Don't have an account?</p>
              <button
                type="button"
                onClick={handleRegister}
                className="register-link"
              >
                Create Account
              </button>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="features"
          >
            <div className="feature">
              <span className="feature-icon">📱</span>
              <span>Mobile-First Design</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span>Offline Support</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🇿🇦</span>
              <span>South African Focus</span>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .login-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }


        .login-container {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 32px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .login-header {
          padding: 40px 20px 20px;
          text-align: center;
          background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%);
          color: white;
        }

        .logo h1 {
          font-size: 32px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }

        .logo p {
          font-size: 14px;
          opacity: 0.9;
          margin: 0;
        }

        .login-form-container {
          flex: 1;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
        }

        .login-form-container h2 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 0 0 8px 0;
          text-align: center;
        }

        .login-subtitle {
          color: #666;
          text-align: center;
          margin: 0 0 30px 0;
        }

        .login-form {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #2E7D32;
        }

        .form-group input.error {
          border-color: #f44336;
        }

        .error-message {
          color: #f44336;
          font-size: 14px;
          margin-top: 4px;
          display: block;
        }

        .login-button {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-top: auto;
        }

        .login-button:hover:not(:disabled) {
          background: #1B5E20;
        }

        .login-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 20px;
        }

        .login-footer p {
          color: #666;
          margin: 0 0 8px 0;
        }

        .register-link {
          background: none;
          border: none;
          color: #2E7D32;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
        }

        .features {
          display: flex;
          justify-content: space-around;
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          color: #666;
        }

        .feature-icon {
          font-size: 20px;
          margin-bottom: 4px;
        }

      `}</style>
    </div>
  );
};

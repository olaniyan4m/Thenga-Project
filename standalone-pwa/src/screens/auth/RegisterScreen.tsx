import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Logo2 from '../../assets/Logo2.PNG';

interface RegisterForm {
  name: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  businessType: string;
}

export const RegisterScreen: React.FC = () => {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        name: data.name,
        phone: data.phone,
        email: data.email,
        password: data.password,
        businessName: data.businessName,
        businessType: data.businessType,
      });
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigate('/');
  };

  return (
    <div className="register-screen">
      <div className="phone-frame">
        <div className="register-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="register-header"
          >
            <div className="logo">
              <img 
                src={Logo2} 
                alt="Thenga Logo" 
                className="login-logo" 
                style={{ width: '120px', height: '120px', objectFit: 'contain', marginBottom: '20px' }}
              />
              <h1>Thenga</h1>
              <p>Join South Africa's Digital Commerce Revolution</p>
            </div>
          </motion.div>

          {/* Register Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="register-form-container"
          >
            <h2>Create Account</h2>
            <p className="register-subtitle">Start your digital commerce journey</p>

            <form onSubmit={handleSubmit(onSubmit)} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    id="name"
                    placeholder="John Doe"
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && (
                    <span className="error-message">{errors.name.message}</span>
                  )}
                </div>

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
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  {...register('email', {
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="businessName">Business Name</label>
                  <input
                    {...register('businessName', {
                      required: 'Business name is required',
                      minLength: {
                        value: 2,
                        message: 'Business name must be at least 2 characters',
                      },
                    })}
                    type="text"
                    id="businessName"
                    placeholder="John's Coffee Shop"
                    className={errors.businessName ? 'error' : ''}
                  />
                  {errors.businessName && (
                    <span className="error-message">{errors.businessName.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="businessType">Business Type</label>
                  <select
                    {...register('businessType', {
                      required: 'Business type is required',
                    })}
                    id="businessType"
                    className={errors.businessType ? 'error' : ''}
                  >
                    <option value="">Select business type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="retail">Retail</option>
                    <option value="services">Services</option>
                    <option value="beauty">Beauty & Wellness</option>
                    <option value="automotive">Automotive</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && (
                    <span className="error-message">{errors.businessType.message}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
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
                    placeholder="Create a password"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm password"
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword.message}</span>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="register-button"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="register-footer">
              <p>Already have an account?</p>
              <button
                type="button"
                onClick={handleLogin}
                className="login-link"
              >
                Sign In
              </button>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="benefits"
          >
            <div className="benefit">
              <span className="benefit-icon">🚀</span>
              <span>Start selling in minutes</span>
            </div>
            <div className="benefit">
              <span className="benefit-icon">📱</span>
              <span>WhatsApp commerce</span>
            </div>
            <div className="benefit">
              <span className="benefit-icon">💰</span>
              <span>Multiple payment options</span>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .register-screen {
          width: 100%;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }


        .register-container {
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 32px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .register-header {
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

        .register-form-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }

        .register-form-container h2 {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin: 0 0 8px 0;
          text-align: center;
        }

        .register-subtitle {
          color: #666;
          text-align: center;
          margin: 0 0 20px 0;
        }

        .register-form {
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #333;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #2E7D32;
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #f44336;
        }

        .error-message {
          color: #f44336;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }

        .register-button {
          background: #2E7D32;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-top: 10px;
        }

        .register-button:hover:not(:disabled) {
          background: #1B5E20;
        }

        .register-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .register-footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }

        .register-footer p {
          color: #666;
          margin: 0 0 8px 0;
          font-size: 14px;
        }

        .login-link {
          background: none;
          border: none;
          color: #2E7D32;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          font-size: 14px;
        }

        .benefits {
          display: flex;
          justify-content: space-around;
          padding: 16px;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .benefit {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 11px;
          color: #666;
        }

        .benefit-icon {
          font-size: 16px;
          margin-bottom: 4px;
        }

      `}</style>
    </div>
  );
};

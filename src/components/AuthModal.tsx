import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineXMark, HiOutlineEnvelope, HiOutlineUser, HiOutlineLockClosed, HiOutlineBuildingOffice, HiOutlinePhone } from 'react-icons/hi2';
import { ApiService } from '../services/api';
import type { User } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (isLogin) {
        const res = await ApiService.login({ email, password });
        if (res.success && res.data?.user) {
          onSuccess(res.data.user);
          onClose();
        } else {
          setErrorMessage(res.message || 'Invalid credentials');
        }
      } else {
        const res = await ApiService.register({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          phone,
          company,
        });
        if (res.success && res.data?.user) {
          onSuccess(res.data.user);
          onClose();
        } else {
          setErrorMessage(res.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors || 'Authentication error';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setEmail('admin@example.com');
      setPassword('admin123');
    } else {
      setEmail('customer@example.com');
      setPassword('user123');
    }
    setIsLogin(true);
    setErrorMessage(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-icon.png"
                alt="GramWork"
                className="h-9 w-9 object-contain"
              />
              <div>
                <span className="text-[11px] font-bold tracking-wider text-gold uppercase">GRAMWORK PORTAL</span>
                <h3 className="text-lg font-bold text-navy">
                  {isLogin ? 'Sign In to Your Account' : 'Create Customer Account'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy"
            >
              <HiOutlineXMark className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {/* Quick Demo Credentials Buttons */}
            <div className="mb-5 rounded-xl border border-gold/30 bg-gold-50/40 p-3">
              <span className="text-[11px] font-bold text-navy">One-Click Demo Credentials:</span>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="flex-1 rounded-lg bg-navy px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-navy-dark"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('customer')}
                  className="flex-1 rounded-lg border border-navy/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-navy shadow-sm hover:bg-gray-50"
                >
                  Customer User
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs font-semibold text-gray-600">Full Name</label>
                  <div className="relative mt-1">
                    <HiOutlineUser className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="Sample User"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input w-full pl-9 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600">Email Address</label>
                <div className="relative mt-1">
                  <HiOutlineEnvelope className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input w-full pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Password</label>
                <div className="relative mt-1">
                  <HiOutlineLockClosed className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input w-full pl-9 text-sm"
                  />
                </div>
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Confirm Password</label>
                    <div className="relative mt-1">
                      <HiOutlineLockClosed className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        className="form-input w-full pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                    <div className="relative mt-1">
                      <HiOutlinePhone className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="+91 98000 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="form-input w-full pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Company Name (Optional)</label>
                    <div className="relative mt-1">
                      <HiOutlineBuildingOffice className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Sample Technologies Ltd"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="form-input w-full pl-9 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary mt-2 w-full justify-center py-3 text-sm font-semibold"
              >
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMessage(null);
                }}
                className="text-xs font-semibold text-gold hover:underline"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, Sparkles, Heart, Star } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface FormData {
    name: string;
    email: string;
    password: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    password?: string;
    general?: string;
}

export default function LoginScreen() {
    const [formData, setFormData] = useState<FormData>({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const navigate = useNavigate();
    const { login, signup, googleAuth, isAuthenticated, user, isLoading: authLoading } = useAuth();

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!authLoading && isAuthenticated && user) {
            redirectBasedOnRole(user.is_admin ? 'admin' : 'user');
        }
    }, [isAuthenticated, user, authLoading]);

    const redirectBasedOnRole = (role: string) => {
        if (role === 'admin') {
            navigate('/admin');
        } else {
            navigate('/user');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear specific field error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        // Clear success message when user starts typing
        if (successMessage) {
            setSuccessMessage('');
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (isSignUp && !formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!EMAIL_REGEX.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            if (isSignUp) {
                const result = await signup(formData.name, formData.email, formData.password);
                if (result.success) {
                    // Show success message and switch to login mode
                    setSuccessMessage('Account created successfully! Please sign in with your credentials.');
                    setIsSignUp(false);
                    setFormData({ name: '', email: formData.email, password: '' });
                }
            } else {
                await login(formData.email, formData.password);
                // Navigation will be handled by the useEffect hook
            }
        } catch (error: any) {
            console.error('Authentication error:', error);
            setErrors({
                general: error.response?.data?.error || 'Authentication failed. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');
        
        try {
            await googleAuth();
            // Navigation will be handled by the useEffect hook
        } catch (error: any) {
            console.error('Google Sign-In Error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Google authentication failed. Please try again.';
            setErrors({
                general: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const floatingElements = Array.from({ length: 20 }, (_, i) => i);

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Background floating elements */}
            <div className="absolute inset-0 pointer-events-none">
                {floatingElements.map((i) => (
                    <div
                        key={i}
                        className={`absolute opacity-30 animate-pulse`}
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    >
                        {i % 3 === 0 && <Sparkles className="w-4 h-4 text-gray-300" />}
                        {i % 3 === 1 && <Heart className="w-3 h-3 text-gray-400" />}
                        {i % 3 === 2 && <Star className="w-3 h-3 text-gray-500" />}
                    </div>
                ))}
            </div>

            {/* Left side - Hero section */}
            <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-gray-700/20 to-black/20 animate-pulse"></div>

                    {/* Floating geometric shapes */}
                    <div className="absolute inset-0">
                        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }}></div>
                        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '1s', animationDuration: '8s' }}></div>
                        <div className="absolute bottom-40 left-16 w-40 h-40 bg-gradient-to-r from-gray-700 to-black rounded-full opacity-15 animate-bounce" style={{ animationDelay: '2s', animationDuration: '7s' }}></div>
                        <div className="absolute top-32 left-40 w-16 h-4 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full opacity-65 animate-spin" style={{ animationDuration: '8s' }}></div>
                        <div className="absolute top-72 left-32 w-20 h-4 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full opacity-70 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
                        <div className="absolute top-60 right-32 w-28 h-6 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute bottom-60 right-16 w-32 h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                        <div className="absolute top-80 left-8 w-28 h-7 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full opacity-55">
                            <div className="w-full h-full bg-gradient-to-r from-gray-600 to-gray-800 rounded-full animate-ping"></div>
                        </div>
                    </div>
                </div>

                {/* Hero content */}
                <div className={`relative z-10 flex flex-col justify-center items-center h-full text-white transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center space-x-2 mb-4">
                            <Sparkles className="w-8 h-8 text-gray-300 animate-spin" />
                            <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Welcome
                            </h1>
                            <Sparkles className="w-8 h-8 text-gray-300 animate-spin" style={{ animationDirection: 'reverse' }} />
                        </div>

                        <h2 className="text-2xl font-light text-gray-200 opacity-90 animate-pulse">
                            to our amazing platform
                        </h2>

                        <p className="text-lg opacity-80 leading-relaxed max-w-md mx-auto text-center animate-fade-in text-gray-300">
                            Experience the future of digital interaction with our cutting-edge platform.
                            Join thousands of satisfied users in this incredible journey.
                        </p>

                        <div className="flex justify-center space-x-4 mt-8">
                            <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <motion.div className="w-180 bg-white/95 backdrop-blur-sm flex flex-col justify-center px-12 shadow-2xl relative">
                <motion.div className="w-full max-w-sm mx-auto relative z-10">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <motion.div layout className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-black to-gray-800 rounded-full mb-4 shadow-lg animate-pulse">
                                {isSignUp ? <Heart className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                                {isSignUp ? 'CREATE ACCOUNT' : 'USER LOGIN'}
                            </h2>
                            <p className="text-gray-500 mt-2">
                                {isSignUp ? 'Quick and painless' : 'Enter your credentials to continue'}
                            </p>
                        </motion.div>

                        {/* Name field for signup */}
                        <AnimatePresence initial={false}>
                            {isSignUp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.35 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <User className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-4 py-4 text-black bg-white/80 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400 hover:shadow-md placeholder-gray-400 ${errors.name ? 'border-red-500' : 'border-gray-200'
                                                }`}
                                            placeholder="Full Name"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className={`w-full pl-10 pr-4 py-4 text-black bg-white/80 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400 hover:shadow-md placeholder-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Email"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        {/* Password field */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-black transition-colors" />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full pl-10 pr-12 py-4 text-black bg-white/80 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all hover:border-gray-400 hover:shadow-md placeholder-gray-400 ${errors.password ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-black transition-all hover:scale-110" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-black transition-all hover:scale-110" />
                                )}
                            </button>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>

                        {/* General error/success message */}
                        {errors.general && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                                {errors.general}
                            </div>
                        )}
                        {successMessage && (
                            <div className="text-green-500 text-sm text-center bg-green-50 p-3 rounded-lg">
                                {successMessage}
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 rounded-xl font-semibold hover:from-gray-900 hover:to-black transform hover:scale-105 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>{isSignUp ? 'Creating account…' : 'Logging in…'}</span>
                                </div>
                            ) : (
                                <span className="relative z-10">{isSignUp ? 'SIGN UP' : 'LOGIN'}</span>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        </button>

                        {/* Divider */}
                        <div className="relative flex items-center justify-center mt-8 mb-6">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <span className="relative px-3 text-gray-400 text-sm">or</span>
                        </div>

                        {/* Google login */}
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold bg-white border-2 border-gray-200 hover:ring-2 hover:ring-black hover:border-black hover:shadow-lg transition-all text-gray-700 hover:text-black shadow"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 48 48">
                                <g>
                                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.2 3.23l6.86-6.86C36.68 2.7 30.74 0 24 0 14.82 0 6.71 5.8 2.69 14.09l7.98 6.2C12.13 13.13 17.56 9.5 24 9.5z" />
                                    <path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.42-4.74H24v9.01h12.42c-.54 2.9-2.18 5.36-4.65 7.02l7.2 5.6C43.98 37.13 46.1 31.36 46.1 24.55z" />
                                    <path fill="#FBBC05" d="M10.67 28.29a14.5 14.5 0 0 1 0-8.58l-7.98-6.2A23.97 23.97 0 0 0 0 24c0 3.82.92 7.44 2.69 10.89l7.98-6.2z" />
                                    <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.15 15.9-5.85l-7.2-5.6c-2.01 1.35-4.6 2.16-8.7 2.16-6.44 0-11.87-3.63-14.33-8.89l-7.98 6.2C6.71 42.2 14.82 48 24 48z" />
                                    <path fill="none" d="M0 0h48v48H0z" />
                                </g>
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-6">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setErrors({});
                                    setSuccessMessage('');
                                    setFormData({ name: '', email: '', password: '' });
                                }}
                                className="text-black hover:text-gray-700 font-semibold ml-1 transition-colors"
                            >
                                {isSignUp ? 'Login here' : 'Sign up here'}
                            </button>
                        </p>
                    </form>
                </motion.div>
            </motion.div>

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 1s ease-out 0.5s both;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { LogIn, User, Lock, Loader2 } from 'lucide-react';
import { loginSchema, LoginInput } from '../types';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      setUser(response.data.user);
      toast.success('Access Granted. Operator session initialized.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 font-mono">
      <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-8 rounded-2xl border border-neon-green/20 shadow-[0_0_20px_rgba(0,255,65,0.05)] backdrop-blur-sm">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-neon-green/10 border border-neon-green/30">
              <LogIn className="w-8 h-8 text-neon-green" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            System <span className="text-neon-green">Login</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your credentials to access the terminal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1 block">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="h-5 w-5" />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 bg-black border ${
                    errors.username ? 'border-red-500' : 'border-zinc-800 focus:border-neon-green'
                  } rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-neon-green transition-all`}
                  placeholder="zero_cool"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-1 block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className={`block w-full pl-10 pr-3 py-3 bg-black border ${
                    errors.password ? 'border-red-500' : 'border-zinc-800 focus:border-neon-green'
                  } rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-neon-green transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-black bg-neon-green hover:bg-neon-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neon-green transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                'Authenticate'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-zinc-500">New recruit? </span>
            <Link to="/signup" className="text-neon-green hover:underline">
              Create an identity
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

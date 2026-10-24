import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { UserPlus, Lock, User, Loader2 } from 'lucide-react';
import { registerSchema, RegisterInput } from '../types';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';

const Signup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.data.user);
      toast.success('Identity Created. Welcome to the underground.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Try a different username.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 font-mono">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-neon-green/20 bg-zinc-900/50 p-6 backdrop-blur-sm sm:p-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-neon-green/10 border border-neon-green/30">
              <UserPlus className="w-8 h-8 text-neon-green" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            Identity <span className="text-neon-green">Creation</span>
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Join the FsocietyPK network
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
              <p className="text-xs text-zinc-500 mb-2">
                Must include: uppercase, lowercase, number, and special character
              </p>
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
                'Create Identity'
              )}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-zinc-500">Already registered? </span>
            <Link to="/login" className="text-neon-green hover:underline">
              Access Terminal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

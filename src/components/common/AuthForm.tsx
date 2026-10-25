import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { loginSchema, registerSchema, LoginInput } from "../../types";
import { authService } from "../../services/auth.service";
import { useAuthStore } from "../../store/authStore";
import BrandLogo from "./BrandLogo";
export default function AuthForm({ signup = false }: { signup?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failure, setFailure] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((s) => s.setUser);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(signup ? registerSchema : loginSchema),
  });
  const submit = async (values: LoginInput) => {
    setBusy(true);
    setFailure("");
    try {
      const response = await (signup
        ? authService.register(values)
        : authService.login(values));
      setUser(response.data.user);
      toast.success(signup ? "Welcome to the community." : "Welcome back.");
      const from = location.state?.from;
      const path =
        typeof from?.pathname === "string" &&
        from.pathname.startsWith("/") &&
        !from.pathname.startsWith("//")
          ? from.pathname + (from.search || "")
          : "/dashboard";
      navigate(path, { replace: true });
    } catch (error: any) {
      setFailure(
        error.response?.data?.message ||
          error.message ||
          "We could not complete this request. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <section className="auth-art">
        <span className="eyebrow">Fsociety PK</span>
        <h1>
          Practice cybersecurity.
          <br />
          Solve CTF challenges.
        </h1>
        <BrandLogo className="auth-logo" />
        <p>
          Practice CTFs, learn from others, and share your skills.
        </p>
      </section>
      <section className="auth-form">
        <span className="eyebrow">
          {signup
            ? "Join Fsociety PK"
            : "Log in to Fsociety PK"}
        </span>
        <h1>{signup ? "Create an account." : "Welcome back."}</h1>
        <p>
          {signup
            ? "Start solving challenges and track your progress."
            : "Log in to continue your challenges."}
        </p>
        <form onSubmit={handleSubmit(submit)} className="mt-8" noValidate>
          {failure && (
            <div className="notice mb-5 text-status-error" role="alert">
              {failure}
            </div>
          )}
          <div className="form-field">
            <label htmlFor="auth-username">Username</label>
            <input
              id="auth-username"
              autoComplete="username"
              className="input"
              placeholder="Your username"
              aria-invalid={!!errors.username}
              {...register("username")}
            />
            {errors.username && (
              <span className="field-error">{errors.username.message}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="auth-password">Password</label>
            <div className="relative">
              <input
                id="auth-password"
                className="input pr-12"
                type={visible ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-3 top-3.5 text-text-muted"
                aria-label={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
            {signup && (
              <small>
                At least 8 characters, with uppercase, lowercase, a number, and
                a special character.
              </small>
            )}
            {errors.password && (
              <span className="field-error">{errors.password.message}</span>
            )}
          </div>
          <button className="btn-primary w-full mt-3" disabled={busy}>
            {busy ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <>
                {signup ? "Create account" : "Log in"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
          <p className="text-sm text-text-muted mt-7">
            {signup ? "Already part of the community?" : "New to Fsociety PK?"}{" "}
            <Link
              to={signup ? "/login" : "/signup"}
              className="text-brand font-semibold hover:underline"
            >
              {signup ? "Log in" : "Create an account"}
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}

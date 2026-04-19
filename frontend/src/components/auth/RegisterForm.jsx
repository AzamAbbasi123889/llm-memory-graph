import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { register as registerRequest } from "../../api/authApi";
import { getFriendlyErrorMessage } from "../../api/axios";
import { PASSWORD_STRENGTH_LEVELS } from "../../utils/constants";
import useAuthStore from "../../store/authStore";

const scorePassword = (value) => {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
};

export default function RegisterForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const score = scorePassword(password);
  const strength = [...PASSWORD_STRENGTH_LEVELS].reverse().find((item) => score >= item.minScore);

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: ({ user, token }) => {
      login(user, token);
      reset();
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(getFriendlyErrorMessage(error, "We couldn't create that account."));
    }
  });

  return (
    <form
      onSubmit={handleSubmit(({ confirmPassword: _confirmPassword, ...values }) =>
        mutation.mutate(values)
      )}
      className="glass-panel rounded-[28px] p-8"
    >
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-light">
          Create account
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Build your memory layer</h1>
        <p className="mt-3 text-sm text-text-muted">
          NeuroGraph keeps useful answers searchable long after the tab closes.
        </p>
      </div>

      <div className="space-y-5">
        <Input
          id="username"
          label="Username"
          autoComplete="username"
          placeholder="Your name"
          icon={UserRound}
          disabled={mutation.isPending}
          error={errors.username?.message}
          {...register("username", {
            required: "Username is required",
            minLength: {
              value: 3,
              message: "Username should be at least 3 characters"
            }
          })}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          icon={Mail}
          disabled={mutation.isPending}
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Enter a valid email address"
            }
          })}
        />

        <div className="space-y-3">
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            icon={LockKeyhole}
            disabled={mutation.isPending}
            error={errors.password?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="focus-ring rounded-full p-1 text-text-muted transition-colors duration-150 hover:text-text-primary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            }
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })}
          />

          <div className="rounded-2xl border border-border bg-bg-elevated/50 p-4">
            {/* UX NOTE: Strength feedback is live so users can correct issues before submission friction. */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-muted">Password strength</span>
              <span className="font-medium text-text-primary">{strength?.label || "Weak"}</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={[
                    "h-2 rounded-full transition-colors duration-150",
                    index < score ? strength?.color || "bg-error" : "bg-border"
                  ].join(" ")}
                />
              ))}
            </div>
          </div>
        </div>

        <Input
          id="confirmPassword"
          label="Confirm Password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Repeat your password"
          icon={LockKeyhole}
          disabled={mutation.isPending}
          error={errors.confirmPassword?.message}
          hint={
            confirmPassword && password === confirmPassword
              ? "Passwords match"
              : "Re-enter your password"
          }
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="focus-ring rounded-full p-1 text-text-muted transition-colors duration-150 hover:text-text-primary"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => value === password || "Passwords do not match"
          })}
        />
      </div>

      <Button
        type="submit"
        fullWidth
        loading={mutation.isPending}
        className="mt-8"
      >
        Create Account
      </Button>
    </form>
  );
}


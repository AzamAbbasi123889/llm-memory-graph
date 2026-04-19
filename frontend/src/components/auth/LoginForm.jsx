import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { login as loginRequest } from "../../api/authApi";
import { getFriendlyErrorMessage } from "../../api/axios";
import useAuthStore from "../../store/authStore";

export default function LoginForm() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ user, token }) => {
      login(user, token);
      reset({ email: "", password: "" });
      navigate("/", { replace: true });
    },
    onError: (error) => {
      setShake(true);
      window.setTimeout(() => setShake(false), 380);
      toast.error(getFriendlyErrorMessage(error, "Those credentials didn't work."));
    }
  });

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className={[
        "glass-panel rounded-[28px] p-8",
        shake ? "animate-shake" : ""
      ].join(" ")}
    >
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary-light">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">Sign in to NeuroGraph</h1>
        <p className="mt-3 text-sm text-text-muted">
          Search with memory, not just context windows.
        </p>
      </div>

      <div className="space-y-5">
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

        <Input
          id="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
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
      </div>

      <Button
        type="submit"
        fullWidth
        loading={mutation.isPending}
        className="mt-8"
      >
        Sign In
      </Button>
    </form>
  );
}


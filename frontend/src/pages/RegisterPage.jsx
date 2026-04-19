import { Link } from "react-router-dom";
import RegisterForm from "../components/auth/RegisterForm";

const floatingLines = Array.from({ length: 12 }, (_, index) => ({
  width: `${120 + (index % 5) * 32}px`,
  top: `${6 + ((index * 8) % 82)}%`,
  left: `${index % 2 === 0 ? 12 : 42}%`,
  delay: `${(index % 4) * 0.8}s`
}));

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen bg-bg-primary lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-hero-grid px-12 py-14 lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-80">
          {floatingLines.map((line, index) => (
            <div
              key={index}
              className="absolute h-px animate-pulseSoft bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              style={{
                width: line.width,
                top: line.top,
                left: line.left,
                animationDelay: line.delay
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mt-auto max-w-lg">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary-light">
            Build Long-Term Recall
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-text-primary">
            Start a knowledge graph around your questions
          </h1>
          <p className="mt-5 max-w-md text-lg text-text-muted">
            Register once, then let NeuroGraph connect answers, sessions, and ideas automatically.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <RegisterForm />
          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link className="font-medium text-primary-light hover:text-primary" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}


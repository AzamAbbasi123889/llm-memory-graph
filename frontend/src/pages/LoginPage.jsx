import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

const floatingNodes = Array.from({ length: 16 }, (_, index) => ({
  size: index % 3 === 0 ? 16 : 10,
  top: `${8 + ((index * 11) % 80)}%`,
  left: `${6 + ((index * 13) % 82)}%`,
  delay: `${(index % 6) * 0.9}s`,
  duration: `${7 + (index % 5)}s`
}));

export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-bg-primary lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-hero-grid px-12 py-14 lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-70">
          {floatingNodes.map((node, index) => (
            <div
              key={index}
              className="absolute animate-float rounded-full border border-white/10 bg-white/5 shadow-glow"
              style={{
                width: node.size,
                height: node.size,
                top: node.top,
                left: node.left,
                animationDelay: node.delay,
                animationDuration: node.duration
              }}
            />
          ))}
        </div>

        <div className="relative z-10 mt-auto max-w-lg">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary-light">
            NeuroGraph AI
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight text-text-primary">
            Memory that grows with you
          </h1>
          <p className="mt-5 max-w-md text-lg text-text-muted">
            A premium AI workspace where every answer becomes part of a searchable, living graph.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <LoginForm />
          <p className="mt-6 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link className="font-medium text-primary-light hover:text-primary" to="/register">
              Register
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}


import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import useAuthStore from "../store/authStore";

export default function NotFoundPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <p className="gradient-text text-7xl font-semibold sm:text-8xl">404</p>
        <h1 className="mt-5 text-2xl font-semibold text-text-primary">
          This page doesn&apos;t exist in any knowledge graph.
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          The link may be stale, or the route was never mapped into memory.
        </p>
        <Link to={isAuthenticated ? "/" : "/login"} className="mt-8 inline-block">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

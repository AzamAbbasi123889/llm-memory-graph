import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { AppError } from "../utils/errors.js";

export default function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required.", 401));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email
    };
    return next();
  } catch (error) {
    return next(new AppError("Your session is no longer valid.", 401));
  }
}


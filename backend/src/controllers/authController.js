import { getCurrentUser, loginUser, registerUser } from "../services/authService.js";

export async function register(req, res) {
  const payload = await registerUser(req.body);
  res.status(201).json(payload);
}

export async function login(req, res) {
  const payload = await loginUser(req.body);
  res.json(payload);
}

export async function me(req, res) {
  const user = await getCurrentUser(req.user.id);
  res.json({ user });
}


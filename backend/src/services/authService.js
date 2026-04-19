import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import env from "../config/env.js";
import { runInSession } from "../config/neo4j.js";
import { AppError } from "../utils/errors.js";

const sanitizeUser = (record) => ({
  id: record.get("id"),
  username: record.get("username"),
  email: record.get("email"),
  createdAt: record.get("createdAt")
});

const signToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

export async function registerUser({ username, email, password }) {
  const trimmedUsername = username?.trim();
  const normalizedEmail = email?.trim().toLowerCase();

  if (!trimmedUsername || !normalizedEmail || !password) {
    throw new AppError("Username, email, and password are required.", 400);
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters.", 400);
  }

  const existing = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (u:User {email: $email})
        RETURN u.id AS id
        LIMIT 1
      `,
      { email: normalizedEmail }
    )
  );

  if (existing.records.length) {
    throw new AppError("An account with that email already exists.", 409);
  }

  const passwordHash = await argon2.hash(password);
  const now = new Date().toISOString();
  const userId = uuidv4();

  const result = await runInSession("WRITE", (session) =>
    session.run(
      `
        CREATE (u:User {
          id: $id,
          username: $username,
          email: $email,
          passwordHash: $passwordHash,
          createdAt: $createdAt
        })
        RETURN u.id AS id, u.username AS username, u.email AS email, u.createdAt AS createdAt
      `,
      {
        id: userId,
        username: trimmedUsername,
        email: normalizedEmail,
        passwordHash,
        createdAt: now
      }
    )
  );

  const user = sanitizeUser(result.records[0]);
  return {
    user,
    token: signToken(user)
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new AppError("Email and password are required.", 400);
  }

  const result = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (u:User {email: $email})
        RETURN u.id AS id, u.username AS username, u.email AS email, u.createdAt AS createdAt, u.passwordHash AS passwordHash
        LIMIT 1
      `,
      { email: normalizedEmail }
    )
  );

  if (!result.records.length) {
    throw new AppError("Incorrect email or password.", 401);
  }

  const record = result.records[0];
  const passwordHash = record.get("passwordHash");
  const matches = await argon2.verify(passwordHash, password);

  if (!matches) {
    throw new AppError("Incorrect email or password.", 401);
  }

  const user = {
    id: record.get("id"),
    username: record.get("username"),
    email: record.get("email"),
    createdAt: record.get("createdAt")
  };

  return {
    user,
    token: signToken(user)
  };
}

export async function getCurrentUser(userId) {
  const result = await runInSession("READ", (session) =>
    session.run(
      `
        MATCH (u:User {id: $userId})
        RETURN u.id AS id, u.username AS username, u.email AS email, u.createdAt AS createdAt
        LIMIT 1
      `,
      { userId }
    )
  );

  if (!result.records.length) {
    throw new AppError("User not found.", 404);
  }

  return sanitizeUser(result.records[0]);
}


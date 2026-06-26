import { SignJWT } from "jose";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env.local"), override: true });

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production"
);

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ id: "test-admin", email: "admin@test.com", name: "TestAdmin", role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

export async function createUserToken(): Promise<string> {
  return new SignJWT({ id: "test-user", email: "user@test.com", name: "테스트유저", role: "user" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);
}

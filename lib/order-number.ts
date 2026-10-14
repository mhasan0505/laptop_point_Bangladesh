import crypto from "node:crypto";
import { Prisma } from "@prisma/client";

/**
 * Generates a collision-safe, non-trivially-guessable order number.
 * Format: BLG-YYMMDD-XXXXXX (e.g. BLG-261006-9A3F1B)
 * Provides 16,777,216 cryptographically random combinations per calendar day.
 */
export function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `BLG-${datePart}-${randPart}`;
}

/**
 * Executes an order creation callback with automatic retry upon unique constraint collisions.
 */
export async function createWithUniqueOrderNumber<T>(
  createFn: (orderNumber: string) => Promise<T>,
  maxRetries = 5
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const orderNumber = generateOrderNumber();
    try {
      return await createFn(orderNumber);
    } catch (error: unknown) {
      lastError = error;
      const isUniqueViolation =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (isUniqueViolation && attempt < maxRetries - 1) {
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error("Failed to generate a unique order number after retries");
}

import { z } from "zod";
import { addressRegex } from "./address";
import type { Address } from "viem";

export const ensRegex = /^.{3,}\.[a-zA-Z]{2,}$/;
export const ensSchema = z
  .string()
  .trim()
  .refine((val) => ensRegex.test(val), { message: "Invalid ens name" })
  .transform((val) => val as `${string}.eth`);

export type TEnsName = z.infer<typeof ensSchema>;

export const ensOrAddressSchema = z
  .string()
  .trim()
  .refine((val) => ensRegex.test(val) || addressRegex.test(val) || val === "", {
    message: "Invalid ENS name or ethereum address",
  })
  .transform((val) => val as `${string}.eth` | Address | "");

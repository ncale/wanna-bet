import { z } from "zod";
import type { Address } from "viem";

/** Token schemas & types */

export const ContractNameEnum = z.enum(["BetFactory"]);
export type ContractName = z.infer<typeof ContractNameEnum>;
export type Contract = {
  name: ContractName;
  address: Address;
};

export const TokenNameEnum = z.enum(["USDC", "WETH", "rETH", "JFF"]);
export type TokenName = z.infer<typeof TokenNameEnum>;
export type TokenContract = {
  name: TokenName;
  address: Address;
  decimals: number;
};

/** General schemas & types */

export const addressRegex = /^0x[a-fA-F0-9]{40}$/;
export const addressSchema = z
  .string()
  .trim()
  .refine((val) => addressRegex.test(val), { message: "Invalid ethereum address" })
  .transform((val) => val as Address);

export const ensRegex = /^.{3,}\.eth$/;
export const ensSchema = z
  .string()
  .trim()
  .refine((val) => ensRegex.test(val), { message: "Invalid ens name" })
  .transform((val) => val as `${string}.eth`);

export const ensOrAddressSchema = z
  .string()
  .trim()
  .refine((val) => ensRegex.test(val) || addressRegex.test(val) || val === "", {
    message: "Invalid ENS name or ethereum address",
  })
  .transform((val) => val as `${string}.eth` | Address | "");

/** Form schemas & types */

export const createBetFormSchema = z.object({
  participant: ensOrAddressSchema,
  participantAddress: addressSchema,
  amount: z.coerce.number().positive(),
  tokenName: TokenNameEnum,
  message: z.string(),
  validForDays: z.coerce.number().positive().lte(21),
  judge: ensOrAddressSchema,
  judgeAddress: addressSchema,
});

export type TCreateBetFormSchema = z.infer<typeof createBetFormSchema>;

export const createBetFormattedFormSchema = z.object({
  creator: addressSchema,
  participant: addressSchema,
  amount: z.bigint().positive(),
  token: addressSchema,
  message: z.string(),
  judge: addressSchema,
  validFor: z.bigint().positive(),
});

export type TCreateBetFormattedFormSchema = z.infer<typeof createBetFormattedFormSchema>;

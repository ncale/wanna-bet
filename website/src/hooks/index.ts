import { config } from "@/app/providers";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { useQuery } from "@tanstack/react-query";
import { fetchEns } from "@/lib";
import { Address } from "viem";

/** Custom React Hook to fetch ENS data */
export function useFetchEns(nameOrAddress: `${string}.eth` | Address, enabled: boolean = true) {
  return useQuery({
    queryKey: ["ensData", { nameOrAddress }],
    queryFn: () => fetchEns(nameOrAddress),
    enabled,
  });
}

/** Listens to page resizing and manages a page width state variable */
export const useMediaQuery = (query: string) => {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = matchMedia(query);
    result.addEventListener("change", onChange);
    setValue(result.matches);

    return () => result.removeEventListener("change", onChange);
  }, [query]);

  return value;
};

/**
 * useWriteContract wrapper that includes isConfirming and isConfirmed booleans
 * for block confirmation
 */
export const useWriteContractWithConfirmation = () => {
  const { data: hash, ...writeOptions } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });
  return {
    data: hash,
    ...writeOptions,
    isConfirming,
    isConfirmed,
  };
};

/**
 * Hook that executes two sequential write contract calls, the second only
 * after the first is confirmed on a block
 */
export function useSequentialWriteContracts() {
  const [status, setStatus] = useState<sequentialTxnsStatus>("idle");

  const executeTxns = async (writeVars1: any, writeVars2: any) => {
    try {
      setStatus("submitting-1");
      const hash1 = await writeContract(config, writeVars1);
      setStatus("confirming-1");
      await waitForTransactionReceipt(config, { hash: hash1 });
      setStatus("submitting-2");
      const hash2 = await writeContract(config, writeVars2);
      setStatus("confirming-2");
      await waitForTransactionReceipt(config, { hash: hash2 });
      setStatus("completed");
    } catch (error) {
      setStatus("error");
      console.error("Transaction failed:", error);
    }
  };

  const isPending =
    status === "submitting-1" || status === "submitting-2" || status === "confirming-1" || status === "confirming-2";
  const isSuccess = status === "completed";

  return { executeTxns, status, isPending, isSuccess };
}

type sequentialTxnsStatus =
  | "idle"
  | "submitting-1"
  | "confirming-1"
  | "submitting-2"
  | "confirming-2"
  | "completed"
  | "error";

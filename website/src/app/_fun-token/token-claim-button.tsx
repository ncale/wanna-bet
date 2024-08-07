"use client";

// Hooks
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

// Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Contract Imports
import { WhitelistedFunToken } from "@/abis/WhitelistedFunToken";
import { baseContracts } from "@/lib";
import type { Address } from "viem";

const WHITELISTED_ROLE = "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49";

export function TokenClaimButton() {
  const { ready, authenticated } = usePrivy();
  const { address, connector } = useAccount();
  const { data: isWhitelisted, isLoading } = useReadContract({
    address: baseContracts.getAddressFromName("JFF"),
    abi: WhitelistedFunToken,
    functionName: "hasRole",
    args: [WHITELISTED_ROLE, address!],
    query: { enabled: !!address && !connector?.name.startsWith("Privy") },
  });

  if (!ready || !authenticated || !address || connector?.name.startsWith("Privy")) return <></>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" disabled={isLoading}>
          Claim JFF Tokens
        </Button>
      </DialogTrigger>
      {isWhitelisted ? <WhitelistedDialog address={address} /> : <NotWhitelistedDialog />}
    </Dialog>
  );
}

function WhitelistedDialog({ address }: { address: Address }) {
  const { writeContract } = useWriteContract();
  const { data: lastMintTime } = useReadContract({
    abi: WhitelistedFunToken,
    address: baseContracts.getAddressFromName("JFF"),
    functionName: "lastMintTime",
    args: [address],
  });

  const timeLeft = Math.round(Number(lastMintTime) + 86400 - Date.now() / 1000);
  const inCooldown = timeLeft >= 0;

  const handleClaim = () => {
    writeContract({
      abi: WhitelistedFunToken,
      address: baseContracts.getAddressFromName("JFF"),
      functionName: "mint",
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Congrats! {inCooldown ? "You have claimed your daily amount" : "You are on the whitelist for the JFF token."}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm text-muted-foreground">
        {inCooldown ? (
          <p>Come back tomorrow to claim 100 more.</p>
        ) : (
          <p>JFF (i.e. &quot;Just for fun&quot;) tokens can be used on WannaBet to try the app out without risk.</p>
        )}
      </div>
      <DialogFooter>
        <Button className="w-full" disabled={inCooldown} onClick={handleClaim}>
          {inCooldown ? <CountdownButtonText lastMintTime={Number(lastMintTime)} /> : "Claim"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function CountdownButtonText({ lastMintTime }: { lastMintTime: number }) {
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const intervalId = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(intervalId);
  }, []);
  const timeLeft = Math.round(lastMintTime + 86400 - Date.now() / 1000);
  return <>{`Cooling down... Come back in ${timeLeft} seconds`}</>;
}

function NotWhitelistedDialog() {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>You aren&apos;t on the whitelist for JFF</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>JFF (i.e. &quot;Just for fun&quot;) tokens can be used on WannaBet to try the app out without risk.</p>
        <p>To get added, join our telegram group and ask @limes_eth</p>
      </div>
      <DialogFooter>
        <Button className="w-full" asChild>
          <a href="https://t.me/wannabettt" target="_blank">
            Join Telegram Group
          </a>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

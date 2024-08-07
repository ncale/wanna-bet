"use client";

// Types
import type { FormattedBet } from "@/services/api/types";
// Constants
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
// Hooks
import { useMutation } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";
// Components
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// Wallet Functions
import { acceptBet, declineBet, retrieveTokens, settleBet } from "@/lib/wallet-functions";

export function TransactionButtons({ bet }: { bet: FormattedBet }) {
  const account = useAccount();

  const isCreator = account.address?.toLowerCase() === bet.creator,
    isParticipant = account.address?.toLowerCase() === bet.participant,
    isJudge = account.address?.toLowerCase() === bet.judge;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-1 *:flex-1">
        {account.chainId === 8453 ? (
          <Tooltip>
            <TooltipTrigger className="flex gap-1 *:flex-1">
              <div className="flex gap-1 *:flex-1">
                {bet.status === "expired" && <CreatorActions isCreator={isCreator} bet={bet} />}
                {bet.status === "pending" && <ParticipantActions isParticipant={isParticipant} bet={bet} />}
                {bet.status === "accepted" && <JudgeActions isJudge={isJudge} bet={bet} />}
                {bet.status === "declined" && <>...</>}
                {bet.status === "settled" && <>...</>}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {bet.status === "expired" && !isCreator && "Only creator can retrieve funds"}
              {bet.status === "pending" && !isParticipant && "Waiting on participant to accept the bet"}
              {bet.status === "accepted" && !isJudge && <p>Waiting on judge to settle the bet</p>}
            </TooltipContent>
          </Tooltip>
        ) : (
          "Wrong chain"
        )}
      </div>
    </div>
  );
}

function CreatorActions({ isCreator, bet }: { isCreator: boolean; bet: FormattedBet }) {
  const { mutate, isPending } = useMutation({
    mutationFn: () => retrieveTokens(bet.contractAddress),
  });

  const { data: contractBalance } = useReadContract({
    address: bet.token,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [bet.contractAddress],
  });

  return Number(contractBalance) > 0 ? (
    <Button variant="default" size="sm" disabled={isPending || !isCreator} onClick={() => mutate()}>
      Retrieve funds
    </Button>
  ) : (
    <Button variant="secondary" size="sm" disabled>
      Funds retrieved
    </Button>
  );
}

function ParticipantActions({ isParticipant, bet }: { isParticipant: boolean; bet: FormattedBet }) {
  const { mutate: mutateAccept, isPending: isPendingAccept } = useMutation({
    mutationFn: () => acceptBet(bet.contractAddress, bet.token, BigInt(bet.bigintAmount)),
  });
  const { mutate: mutateDecline, isPending: isPendingDecline } = useMutation({
    mutationFn: () => declineBet(bet.contractAddress),
  });

  const isPending = isPendingAccept || isPendingDecline;

  return (
    <>
      <Button variant="default" size="sm" disabled={isPending || !isParticipant} onClick={() => mutateAccept()}>
        Accept
      </Button>
      <Button variant="secondary" size="sm" disabled={isPending || !isParticipant} onClick={() => mutateDecline()}>
        Decline
      </Button>
    </>
  );
}

function JudgeActions({ isJudge, bet }: { isJudge: boolean; bet: FormattedBet }) {
  const { mutate: mutateSettleForCreator, isPending: isPendingCreator } = useMutation({
    mutationFn: () => settleBet(bet.contractAddress, bet.creator),
  });
  const { mutate: mutateSettleForParticipant, isPending: isPendingParticipant } = useMutation({
    mutationFn: () => settleBet(bet.contractAddress, bet.participant),
  });
  const { mutate: mutateSettleTie, isPending: isPendingTie } = useMutation({
    mutationFn: () => settleBet(bet.contractAddress, "0x0000000000000000000000000000000000000000"),
  });

  const isPending = isPendingCreator || isPendingParticipant || isPendingTie;

  return (
    <>
      <Button variant="default" size="sm" disabled={isPending || !isJudge} onClick={() => mutateSettleForCreator()}>
        {bet.creatorAlias}
      </Button>
      <Button variant="default" size="sm" disabled={isPending || !isJudge} onClick={() => mutateSettleForParticipant()}>
        {bet.participantAlias}
      </Button>
      <Button variant="secondary" size="sm" disabled={isPending || !isJudge} onClick={() => mutateSettleTie()}>
        Tie
      </Button>
    </>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  type FormattedBet,
  type FormattedBets,
  getRecentFormattedBets,
  getUserFormattedBets,
} from "@/services/services";
import { LoadingSpinner } from "./ui/spinner";
import { useAccount } from "wagmi";
import { CustomConnectButtonSecondary } from "./rainbow/custom-connect-button";

export function BetListCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Card className="max-h-[512px] w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">{children}</CardContent>
    </Card>
  );
}

export function RecentBetList({
  currentView,
  setBetFn,
}: {
  currentView: FormattedBet | "create" | undefined;
  setBetFn: (bet: FormattedBet) => void;
}) {
  const { isPending, error, isSuccess, data } = useQuery({
    queryKey: ["recentBetData"],
    queryFn: () => getRecentFormattedBets(5),
  });
  if (isPending) return <LoadingSpinner />;
  if (error) return "An error has occurred: " + error;
  if (isSuccess)
    return (
      <BetList data={data} currentView={currentView} setBetFn={setBetFn} />
    );
}

export function MyBetList({
  currentView,
  setBetFn,
}: {
  currentView: FormattedBet | "create" | undefined;
  setBetFn: (bet: FormattedBet) => void;
}) {
  const account = useAccount();
  const { isPending, error, isSuccess, data } = useQuery({
    queryKey: ["myBetData"],
    queryFn: () => getUserFormattedBets(account.address!, 5),
    enabled: account.isConnected,
  });
  if (account.isDisconnected) return <CustomConnectButtonSecondary />;
  if (isPending) return <LoadingSpinner />;
  if (error) return "An error has occurred: " + error;
  if (isSuccess)
    return (
      <BetList data={data} currentView={currentView} setBetFn={setBetFn} />
    );
}

function BetList({
  data,
  currentView,
  setBetFn,
}: {
  data: FormattedBets;
  currentView: FormattedBet | "create" | undefined;
  setBetFn: (bet: FormattedBet) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">bet</TableHead>
          <TableHead>amount</TableHead>
          <TableHead>participants</TableHead>
          <TableHead className="text-center">active?</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.items.map((bet, i) => (
          <TableRow
            key={i}
            onClick={() => setBetFn(bet)}
            data-current-bet={
              typeof currentView === "object" && bet.betId === currentView.betId
            }
            className="cursor-pointer data-[current-bet=true]:bg-muted"
          >
            <TableCell className="text-center">{bet.betId}</TableCell>
            <TableCell>{bet.amount} USDC</TableCell>
            <TableCell>
              {bet.creatorAlias}
              <span className="text-muted-foreground"> vs </span>
              {bet.participantAlias}
            </TableCell>
            <TableCell className="text-center">
              {bet.status === "pending" || bet.status === "accepted" ? (
                <span className="text-green-700">✓</span>
              ) : (
                <span className="text-red-700">𐄂</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

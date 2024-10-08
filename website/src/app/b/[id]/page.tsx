// Data Fetching
import { apiService } from "@/services/api/service";
// Types
import type { FormattedBet } from "@/services/api/types";
// Components
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BetDetails } from "./bet-details";

// export async function generateStaticParams() {
//   const mostRecentBetId = await apiService.getMostRecentBetId(0);
//   return Array.from({ length: mostRecentBetId }, (_, index) => ({
//     id: (index + 1).toString(),
//   }));
// }

export default async function BetPage({ params }: { params: { id: number } }) {
  const data = await apiService.getFormattedBetFromId(params.id, 15);
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full space-y-2 md:px-8">
        <BackButton />
        <BetDetailsCard currentBet={data} />
      </div>
    </main>
  );
}

function BetDetailsCard({ currentBet }: { currentBet: FormattedBet | undefined }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{currentBet ? `Bet #${currentBet.betId}` : "Select a bet"}</CardTitle>
        <CardDescription>
          {currentBet ? (
            <a href={`https://base.blockscout.com/address/${currentBet.contractAddress}`} target="_blank">
              See on Blockscout
            </a>
          ) : (
            ""
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">{currentBet && <BetDetails bet={currentBet} />}</CardContent>
    </Card>
  );
}

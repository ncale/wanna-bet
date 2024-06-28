import { type FormattedBet } from "@/services/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { BetListCard, MyBetList, RecentBetList } from "./bet-list-card";
import { CustomConnectButton } from "./rainbow/custom-connect-button";
import { BetDetailsCard } from "./bet-details-card";
import { CreateBetCard } from "./create-bet-card";

export function ExplorerComponent({
  currentView,
  setViewFn,
}: {
  currentView: FormattedBet | "create" | undefined;
  setViewFn: (view: FormattedBet | "create") => void;
}) {
  return (
    <Tabs defaultValue="recent" className="w-full max-w-md space-y-2">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my">Mine</TabsTrigger>
        </TabsList>
        <Button variant="ghost" onClick={() => setViewFn("create")}>
          + Create New
        </Button>
      </div>
      <TabsContent value="recent">
        <BetListCard title="Recent bets">
          <RecentBetList currentView={currentView} setBetFn={setViewFn} />
        </BetListCard>
      </TabsContent>
      <TabsContent value="my">
        <BetListCard title="My bets">
          <MyBetList currentView={currentView} setBetFn={setViewFn} />
        </BetListCard>
      </TabsContent>
    </Tabs>
  );
}

export function ViewComponent({
  currentView,
}: {
  currentView: FormattedBet | "create" | undefined;
}) {
  return (
    <div className="w-full max-w-md space-y-2">
      <div className="hidden lg:flex lg:justify-end">
        <CustomConnectButton />
      </div>
      {currentView === "create" ? (
        <CreateBetCard />
      ) : (
        <BetDetailsCard currentBet={currentView} />
      )}
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateBetForm } from "@/components/create-bet-form";
import { BackButton } from "@/components/back-button";

export default function CreatePage() {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full max-w-md space-y-2">
        <BackButton />
        <CreateBetCard />
      </div>
    </main>
  );
}

export function CreateBetCard() {
  return (
    <Card className="w-full" id="create">
      <CardHeader>
        <CardTitle className="text-lg">Start a new bet</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CreateBetForm />
      </CardContent>
    </Card>
  );
}

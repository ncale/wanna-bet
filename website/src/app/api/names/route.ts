import { nameStoneService } from "@/services/namestone";
import { NextRequest, NextResponse } from "next/server";
import { Address } from "viem";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export async function POST(req: NextRequest) {
  try {
    // validate body
    const body = await req.json();
    const validatedBody = bodySchema.parse(body);
    // send to namestone
    const res = await nameStoneService.setName(
      validatedBody.name,
      validatedBody.address as Address,
    );
    // return
    return NextResponse.json({ message: "Name set successfully", data: res }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 },
      );
    }
    NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

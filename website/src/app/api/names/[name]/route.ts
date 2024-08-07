import { nameStoneService } from "@/services/namestone";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const nameSchema = z
  .string()
  .min(1)
  .max(18)
  .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are allowed");

export async function GET(req: NextRequest, { params }: { params: { name: string } }) {
  try {
    // validate
    const validatedName = nameSchema.parse(params.name);
    // send to service
    const res = await nameStoneService.searchName(validatedName, 1);
    const nameFound = res[0].name === validatedName;
    // 404 if no item found
    if (!nameFound) return NextResponse.json({ message: "Name not found" }, { status: 404 });
    // return
    return NextResponse.json(
      { message: "Name fetched successfully", validatedName },
      { status: 200 },
    );
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

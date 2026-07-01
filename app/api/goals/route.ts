import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const goals = await prisma.goal.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ goals });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, targetValue, targetDate, currentValue } = body;

  if (!type || typeof targetValue !== "number") {
    return NextResponse.json(
      { error: "Champs requis: type (string), targetValue (number)." },
      { status: 400 }
    );
  }

  const goal = await prisma.goal.create({
    data: {
      type,
      targetValue,
      targetDate: targetDate ? new Date(targetDate) : null,
      currentValue: typeof currentValue === "number" ? currentValue : 0,
    },
  });

  return NextResponse.json({ goal }, { status: 201 });
}

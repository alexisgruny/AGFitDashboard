import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id invalide." }, { status: 400 });
  }

  const body = await request.json();
  const { type, targetValue, targetDate, currentValue } = body;

  const goal = await prisma.goal.update({
    where: { id },
    data: {
      ...(type !== undefined ? { type } : {}),
      ...(typeof targetValue === "number" ? { targetValue } : {}),
      ...(targetDate !== undefined ? { targetDate: targetDate ? new Date(targetDate) : null } : {}),
      ...(typeof currentValue === "number" ? { currentValue } : {}),
    },
  });

  return NextResponse.json({ goal });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Id invalide." }, { status: 400 });
  }

  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

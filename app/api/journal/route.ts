// create something using post

import { analyze } from "@/utils/ai";
import { getUserByClerkId } from "@/utils/auth";
import { prisma } from "@/utils/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const POST = async () => {
	// get user id
	const user = await getUserByClerkId();
	const entry = await prisma.journalEntry.create({
		data: {
			userId: user.id,
			content: "Write about your day!",
		},
	});

	const analysis = await analyze(entry.content);
	await prisma.analysis.create({
		data: {
			entryId: entry.id,
			...analysis,
		},
	});

	// revalidate cache - > clean it get it again
	revalidatePath("/journal");

	return NextResponse.json({ data: entry });
};

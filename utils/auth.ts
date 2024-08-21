// clerk idwith the user in our database and then use that user id to get the journal entries

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./db";

export const getUserByClerkId = async () => {
	const { userId } = await auth();

	const user = await prisma.user.findUniqueOrThrow({
		where: {
			clerkId: userId,
		},
	});

	return user;
};

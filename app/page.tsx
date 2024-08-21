import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
	const { userId } = await auth();
	let href = userId ? "/journal" : "/new-user";

	return (
		<div className="w-screen h-screen bg-black flex justify-center items-center text-white">
			<div className="mx-auto w-full max-w-[600px]">
				<h1 className="text-6xl mb-4">Mnemosyne</h1>
				<p className="text-2xl text-white/60 mb-4">
					Turn Moments into Monuments
				</p>
				<div>
					<Link href={href}>
						<Button className="bg-fuchsia-800 hover:bg-fuchsia-300">
							Get Started
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}

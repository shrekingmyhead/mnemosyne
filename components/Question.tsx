"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { askQuestion } from "@/utils/api";

const Question = () => {
	const [value, setValue] = useState("");
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState();

	const onChange = (e) => {
		setValue(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		// prevents form from reloading the page
		setLoading(true);

		const answer = await askQuestion(value);

		setResponse(answer);
		setValue("");
		setLoading(false);
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<input
					disabled={loading}
					onChange={onChange}
					value={value}
					type="text"
					placeholder="Ask a question"
					className="border border-black/20 px-4 py-2 text-lg rounded-lg"
				/>
				<Button
					disabled={loading}
					type="submit"
					className="text-lg mx-2"
				>
					Ask
				</Button>
			</form>
			{loading && <div>...loading</div>}
			{response && <div>{response}</div>}
		</div>
	);
};

export default Question;

import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import {
	RunnableSequence,
	RunnablePassthrough,
} from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { JinaEmbeddings } from "@langchain/community/embeddings/jina";
// import { formatDocumentsAsString } from "langchain/util/document";
const model = new ChatGroq({
	apiKey: process.env.GROQ_API_KEY,
	temperature: 0,
});

const embeddings = new JinaEmbeddings({
	apiKey: process.env.JINA_API_KEY,
	model: "jina-embeddings-v2-base-en",
});

const pinecone = new PineconeClient();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);

const parser = StructuredOutputParser.fromZodSchema(
	z.object({
		mood: z
			.string()
			.describe("the mood of the person who wrote the journal entry."),
		summary: z.string().describe("quick summary of the entire entry."),
		subject: z.string().describe("the subject of the journal entry."),
		negative: z
			.boolean()
			.describe(
				"is the journal entry negative(i.e. does it contain negative emotions?)."
			),
		color: z
			.string()
			.describe(
				"a hexadecimal color representing the mood of the entry. Example: #0101fe for blue representing happiness."
			),
	})
);

const getPrompt = async (content) => {
	const chain = RunnableSequence.from([
		ChatPromptTemplate.fromTemplate(
			"Analyze the following journal entry. Follow the instructions and format your response to match the format instructions, no matter what! \n{format_instructions}\n{entry}"
		),
		model,
		parser,
	]);
	const input = await chain.invoke({
		format_instructions: parser.getFormatInstructions(),
		entry: content,
	});

	return input;
};

export const analyze = async (content) => {
	const result = await getPrompt(content);

	try {
		const resultString =
			typeof result === "object" ? JSON.stringify(result) : result;
		return parser.parse(resultString);
	} catch (e) {
		console.log(e);
	}
};

export const qa = async (question, entries) => {
	const docs = entries.map((entry) => {
		return new Document({
			pageContent: entry.content,
			metadata: {
				id: entry.id,
				createdAt: entry.createdAt,
			},
		});
	});

	const embeddingsArray = await Promise.all(
		docs.map(async (doc) => {
			const response = await embeddings.embedDocuments([doc.pageContent]);
			return {
				...doc,
				embedding: response[0],
			};
		})
	);

	const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
		pineconeIndex,
		maxConcurrency: 5,
	});

	await vectorStore.addDocuments(embeddingsArray);

	const retriever = vectorStore.asRetriever({
		searchType: "mmr", // Leave blank for standard similarity search
		k: 1,
	});
	const relavantDocs = await retriever.invoke(question);

	const declarativeRagChain = RunnableSequence.from([
		{
			context: relavantDocs,
		},
		model,
		parser,
	]);
	const res = await declarativeRagChain.invoke({
		question: question,
	});

	return res;
};

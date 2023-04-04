import { Document } from 'langchain/document'

// Function to convert a question text and answer text with a timestamp into a Document

export const qAndAToDoc = (
  user: string,
  question: string,
  answer: string,
  timestamp: number
): Document => {
  // First generate a timestamp formatted as a human readable date
  const date = new Date(timestamp)

  // Create a document with the question and answer text
  const doc = new Document({
    pageContent: `
    DATE: ${date.toDateString()} at ${date.toLocaleTimeString()}
    USER: ${user}:
    ${question}

    ASSISTANT:
    ${answer}
    `,
    metadata: {
      source: `${user} conversation at ${date.toDateString()} : ${date.toLocaleTimeString()}`,
    },
  })

  return doc
}

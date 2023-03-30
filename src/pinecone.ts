// eslint-disable-next-line import/no-extraneous-dependencies
import { PineconeClient } from '@pinecone-database/pinecone'
import type { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings'
import { PineconeStore } from 'langchain/vectorstores'

if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
  throw new Error('Pinecone environment or api key vars missing')
}

// Initialize the Pinecone Client ---------------------------------------------------------------
async function initPinecone() {
  try {
    const pinecone = new PineconeClient()

    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT ?? '',
      apiKey: process.env.PINECONE_API_KEY ?? '',
    })

    return pinecone
  } catch (error) {
    console.log('error', error)
    throw new Error('Failed to initialize Pinecone Client')
  }
}

export const pinecone = await initPinecone()

// Function to add a document to a pinecone index ------------------------------------------------
export const addDocumentToIndex = async (
  doc: Document,
  pineconeIndexName: string,
  pineconeNamespace: string
) => {
  try {
    // Generate the embeddings
    const embeddings = new OpenAIEmbeddings()
    const index = pinecone.Index(pineconeIndexName)

    // Embed the PDF documents
    await PineconeStore.fromDocuments([doc], embeddings, {
      pineconeIndex: index,
      namespace: pineconeNamespace,
      textKey: 'text',
    })
  } catch (error) {
    console.log('error', error)
    throw new Error('Failed to ingest your data')
  }
}

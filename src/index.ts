import * as fs from 'fs'
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { OpenAIEmbeddings } from 'langchain/embeddings'
import { OpenAIChat } from 'langchain/llms'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PineconeStore } from 'langchain/vectorstores'
import { pinecone } from 'pinecone.js'
// eslint-disable-next-line import/no-extraneous-dependencies
import prompts from 'prompts'
// import { HNSWLib } from 'langchain/vectorstores'


export const run = async () => {
  // check for pinecone env vars
  if (!process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_API_KEY) {
    throw new Error('Pinecone environment or api key vars missing')
  }

  /* Initialize the LLM to use to answer the question */
  const model = new OpenAIChat({
    modelName: 'gpt-3.5-turbo',
  })

  /* Load in the file we want to do question answering over */
  // const text = fs.readFileSync('data/state_of_the_union.txt', 'utf8')

  /* Split the text into chunks */
  // const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 })
  // const docs = await textSplitter.createDocuments([text])

  /* Create the vectorstore */
  // const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings())

  /* Create vectorstore from pinecone index */
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX)
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace: 'demostuff' }
  )

  /* Create the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever()
  )

  
  while (true) {
    /* Ask it a question */
    // prompt command line for input question
    const userRes = await prompts({
      type: 'text',
      name: 'question',
      message: 'Type a question:',
    })

    console.log(userRes.question)

    // const question = 'What was the poem about?'
    // const res = await chain.call({ userRes.question, chat_history: [] })
    // const res = await chain.call({ question, chat_history: [] })
    // console.log(res)
  }




  // /* Ask it a follow up question */
  // const chatHistory = question + res.text
  // const followUpRes = await chain.call({
  //   question: 'Was that nice?',
  //   chat_history: chatHistory,
  // })
  // console.log(followUpRes)
}

run()

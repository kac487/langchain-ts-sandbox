
import { ConversationalRetrievalQAChain } from 'langchain/chains'
import { OpenAIEmbeddings } from 'langchain/embeddings'
import { OpenAIChat } from 'langchain/llms'
import { PineconeStore } from 'langchain/vectorstores'
import { addDocumentToIndex, pinecone } from 'pinecone.js'
// eslint-disable-next-line import/no-extraneous-dependencies
import prompts from 'prompts'
// import prompts from 'prompts'
import { custom_qa_template, custom_question_generator_template } from 'llmprompts.js'
import { qAndAToDoc } from 'utils.js'


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

  /* Ask who the user is */
  const userNameRes = await prompts({
    type: 'text',
    name: 'question',
    message: 'Type your first name:',
    onState: (state) => {
      if (state.aborted) {
        process.nextTick(() => {
          process.exit(0)
        })
      }
    },
  })

  const user = userNameRes.question

  /* ================================== PINECONE =================================== */
  /* Create vectorstore from pinecone index */
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX)
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex, namespace: process.env.PINECONE_NAMESPACE }
  )

  /* ================================== QA-CHAIN =================================== */

  /* Create the chain */
  const chain = ConversationalRetrievalQAChain.fromLLM(
    model,
    vectorStore.asRetriever(),
    {
      questionGeneratorTemplate: custom_question_generator_template,
      qaTemplate: custom_qa_template,
    }
  )

  /* ==================================== CHAT ===================================== */

  // Initialize chat history array
  const chatHistory = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    /* Ask it a question */
    // prompt command line for input question
    const userRes = await prompts({
      type: 'text',
      name: 'question',
      message: 'Prompt Input:',
      onState: (state) => {
        if (state.aborted) {
          process.nextTick(() => {
            process.exit(0)
          })
        }
      },
    })

    chatHistory.push(userRes.question)

    // const question = 'What was the poem about?'
    const res = await chain.call({
      question: userRes.question,
      chat_history: chatHistory,
    })

    // Print the answer and style it with green text and bold font
    console.log('\x1b[32m%s\x1b[0m', res.text)

    chatHistory.push(res.text)

    // TODO: update the pinecone index with the latest q and a
    const chatLogUpdateDoc = qAndAToDoc(
      user,
      userRes.question,
      res.text,
      Date.now()
    )
    addDocumentToIndex(
      chatLogUpdateDoc,
      process.env.PINECONE_INDEX,
      process.env.PINECONE_NAMESPACE
    )
  }
}

run()

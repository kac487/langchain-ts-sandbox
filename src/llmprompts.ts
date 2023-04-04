export const custom_question_generator_template = `
Given the following conversation and a follow up input, rephrase the follow up input to be a standalone question or statement.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question or statement:`

export const custom_qa_template = `
Use the following pieces of context to reply to the question or statement at the end. If you don't know the answer, just say that you don't know, don't try to make up an answer.

{context}

Question or Statement: {question}
Helpful Reply:`

// eslint-disable-next-line import/no-extraneous-dependencies
import axios from 'axios'
import dotenv from 'dotenv'
import { URLSearchParams } from 'url'

dotenv.config()

const queryUrl =
  'https://demoindex-e6ac07a.svc.us-central1-gcp.pinecone.io/query'

const deleteUrl =
  'https://demoindex-e6ac07a.svc.us-central1-gcp.pinecone.io/vectors/delete'

const payload = {
  vector: new Array(1536).fill(0),
  topK: 50,
  includeMetadata: true,
  includeValues: true,
  namespace: 'test',
}

const headers = {
  'Api-Key': process.env.PINECONE_API_KEY,
  'Content-Type': 'application/json',
}

axios
  .post(queryUrl, payload, { headers, timeout: 60000 })
  .then((response) => {
    console.log(response.data)

    const existingIds = response.data.matches.map((m: { id: string }) => m.id)

    
    const deleteParams = new URLSearchParams({
      namespace: 'test',
      ids: existingIds,
    })

    console.log("DELETE PARAMS: ", deleteParams)
    
    axios
      .delete(deleteUrl, {
        headers: { 'Api-Key': headers['Api-Key'] },
        params: deleteParams,
        timeout: 60000,
      })
      .then((deleteResponse) => {
        console.log(deleteResponse.data)
        console.log("DELETED")
      })
      .catch((deleteError) => {
        console.error(deleteError.message)
      })
  })
  .catch((error) => {
    console.error(error.message)
  })

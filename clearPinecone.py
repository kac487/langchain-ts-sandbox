import requests
from dotenv import load_dotenv
import os
load_dotenv()

query_url = "https://demoindex-e6ac07a.svc.us-central1-gcp.pinecone.io/query"

payload = {
    "vector": [0] * 1536,
    "topK": 50,
    "includeMetadata": True,
    "includeValues": True,
    "namespace": "test"
}
headers = {
    "Api-Key": os.environ['PINECONE_API_KEY'],
    "Content-Type": "application/json"
}

response = requests.request(
    "POST", query_url, json=payload, headers=headers, timeout=60)

print(response.text)

existing_ids = [m['id'] for m in response.json()['matches']]

delete_url = "https://demoindex-e6ac07a.svc.us-central1-gcp.pinecone.io/vectors/delete"

response = requests.request("DELETE", delete_url,
                            headers={'Api-Key': headers['Api-Key']},
                            params={"namespace": "test",
                                    "ids": existing_ids},
                            timeout=60
                            )

print(response.text)

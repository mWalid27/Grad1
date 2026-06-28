from fastapi import FastAPI
from pydantic import BaseModel

from backend.rag_engine import process_query

app = FastAPI()

class SearchRequest(BaseModel):
    query: str

@app.post("/search")
def search(request: SearchRequest):

    return process_query(request.query)
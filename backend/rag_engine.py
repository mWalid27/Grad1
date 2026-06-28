import json
import os
import functools
from langchain_core.documents import Document
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from dotenv import load_dotenv
# from groq import Groq
load_dotenv()

# Define the path of the file
directory = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
file_path = os.path.join(directory, "data", "sampled_properties.jsonl")

# Load the data
def load_data():
    properties = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = json.loads(line)
            properties.append(line)
    return properties

# Joining all the json property in one text and split the text
def create_property_document(properties):
    documents = []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
    )
    
    for i, prop in enumerate(properties, 1):
        prop_id = i
        
        # Store the ORIGINAL description
        original_description = prop.get('description', '')
        
        rich_description = f"""Source: {prop.get('source', '')}
                Type: {prop.get('type','')}
                Bedrooms: {prop.get('bedrooms_count', '')}
                Bathrooms: {prop.get('bathrooms', '')}
                Area: {prop.get('size_sqm', '')}
                Price: {prop.get('price', '')}
                Location: {prop.get('location', '')}
                Features: {prop.get('features', '')}
                Description: {original_description}"""
        
        chunks = text_splitter.split_text(rich_description)
        
        for chunk_num, chunk_text in enumerate(chunks):
            doc = Document(
                page_content=chunk_text,
                metadata={
                    "id": prop_id,
                    "chunk_id": chunk_num,
                    "source": prop.get("source", ""),
                    "Type": prop.get("type", ""),
                    "Bedrooms": prop.get("bedrooms_count", ""),
                    "bathrooms": prop.get("bathrooms", ""),
                    "Area": prop.get("size_sqm", ""),
                    "Price": prop.get("price", ""),
                    "Location": prop.get("location", ""),
                    "photo_url": prop.get("photos_url", []),
                    "total_chunks": len(chunks),
                    "original_description": original_description
                }
            )
            documents.append(doc)
    
    return documents

## @st.cache_resource

def setup_vector_store():
    documents = create_property_document(properties=load_data())
    
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Create Vector store
    vector_store = FAISS.from_documents(documents, embeddings)
    return vector_store


import functools

@functools.lru_cache
def get_vector_store():
    return setup_vector_store()

VECTOR_STORE = get_vector_store()



def search_properties(query, vector_store, top_k=3, similarity_threshold=1.5):
    """Search for properties with similarity threshold"""
    # Get chunks WITH scores
    chunks_with_scores = vector_store.similarity_search_with_score(query, k=10)
    
    # Filter by similarity score
    filtered_chunks = []
    for chunk, score in chunks_with_scores:

        score = float(score)

        if score < similarity_threshold:
            filtered_chunks.append((chunk, score))
    
    if not filtered_chunks:
        return []  # No good matches found
    
    # Group by property ID to remove duplicates
    unique_properties = {}
    for chunk, score in filtered_chunks:
        prop_id = chunk.metadata["id"]
        if prop_id not in unique_properties:
            unique_properties[prop_id] = {
                "id": prop_id,
                "description": chunk.metadata.get("original_description", ""),
                "photos_url": chunk.metadata.get("photo_url", []),
                "type": chunk.metadata.get("Type", ""),
                "bedrooms": chunk.metadata.get("Bedrooms", ""),
                "bathrooms": chunk.metadata.get("bathrooms", ""),
                "area": chunk.metadata.get("Area", ""),
                "price": chunk.metadata.get("Price", ""),
                "location": chunk.metadata.get("Location", ""),
                "source": chunk.metadata.get("source", ""),
                "similarity_score": float(score)  # Store the score for debugging
            }
    
    # Return top unique properties
    return list(unique_properties.values())[:top_k]




# Generating a response using the llm model
def generate_property_summary(properties, user_query):
    """Use Groq LLM to generate a nice summary of properties"""
    if not properties:
        return "No properties found matching your criteria."
    
    # Prepare context for LLM
    context = ""
    for i, prop in enumerate(properties, 1):
        context += f"""
        Property {i}:
        - Type: {prop.get('type', 'N/A')}
        - Price: {prop.get('price', 'N/A')}
        - Location: {prop.get('location', 'N/A')}
        - Bedrooms: {prop.get('bedrooms', 'N/A')}
        - Bathrooms: {prop.get('bathrooms', 'N/A')}
        - Area: {prop.get('area', 'N/A')}
        - Description: {prop.get('description', '')[:200]}...
        """
    # Create prompt
    prompt = f"""
User query:
{user_query}

Available properties:
{context}

Instructions:
- Only use the information provided above.
- Do NOT assume missing data.
- If information is missing, say so.
- Compare properties clearly.
- Highlight trade-offs (price vs location vs size).
- Keep answer under 250 words.
"""
    messages = [
    SystemMessage(
        content="""
You are a professional UK real estate assistant.
Only use the provided property data.
Do NOT invent information.
Be concise, structured, and helpful.
"""
    ),
    HumanMessage(content=prompt)
]
    
    
    # Call Groq LLM
    try:
        # Get API key from environment or Streamlit secrets
        groq_api_key = os.getenv("GROQ_API_KEY")
        # groq_api_key = "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"
        if not groq_api_key:
            return "AI insights not available (API key missing). Showing properties directly."
        
        llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=groq_api_key,
    temperature=0.3)

        response = llm.invoke(messages)
        return response.content
    except Exception as e:
            return f"LLM not available. Showing {len(properties)} properties directly."
    


def process_query(query):


    results = search_properties(
        query,
        vector_store= VECTOR_STORE,
        top_k=3,
        similarity_threshold=0.8
    )

    summary = generate_property_summary(
        results,
        query
    )

    return {
        "summary": summary,
        "properties": results
    }

import os
import getpass
from typing import List, Dict, Any, Annotated, Literal, Sequence, TypedDict
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import requests
import logging

from langchain import hub
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain.tools.retriever import create_retriever_tool

from langgraph.graph import END, StateGraph, START
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph.message import add_messages
from dotenv import load_dotenv
from typing import Optional


from pymongo import MongoClient

import uvicorn
from fastapi.middleware.cors import CORSMiddleware





load_dotenv()  # take environment variables from .env.
# Set up environment variables
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
ATLAS_CONNECTION_STRING = os.getenv("ATLAS_CONNECTION_STRING")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_TRACING"] = "true"


# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB Atlas
client = MongoClient(ATLAS_CONNECTION_STRING)
db_name = "langchain_db"
collection_name = "sarvam_ncert"
atlas_collection = client[db_name][collection_name]
vector_search_index = "vector_index"

# Set up retriever
retriever = MongoDBAtlasVectorSearch(
    embedding=OpenAIEmbeddings(),
    collection=atlas_collection,
    index_name=vector_search_index,
    relevance_score_fn="cosine",
).as_retriever()

# Create retriever tool
retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_blog_posts",
    "Search and return information about the Sound chapter of NCERT textbook.",
)
tools = [retriever_tool]

# Define AgentState
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

# Define nodes
def agent(state: AgentState) -> Dict[str, List[BaseMessage]]:
    messages = state["messages"]
    model = ChatOpenAI(temperature=0, model="gpt-4-turbo-preview")
    model = model.bind_tools(tools)
    response = model.invoke(messages)
    return {"messages": [response]}

def grade_documents(state: AgentState) -> Literal["generate", "rewrite"]:
    messages = state["messages"]
    question = messages[0].content
    docs = messages[-1].content

    prompt = PromptTemplate(
        template="""You are a grader assessing relevance of a retrieved document to a user question.
        Here is the retrieved document: {context}
        Here is the user question: {question}
        If the document contains keyword(s) or semantic meaning related to the user question, grade it as relevant.
        Give a binary score 'yes' or 'no' score to indicate whether the document is relevant to the question.""",
        input_variables=["context", "question"],
    )

    llm = ChatOpenAI(temperature=0, model="gpt-4-0125-preview")
    chain = prompt | llm | StrOutputParser()
    
    result = chain.invoke({"question": question, "context": docs})
    
    return "generate" if result.strip().lower() == "yes" else "rewrite"

def rewrite(state: AgentState) -> Dict[str, List[BaseMessage]]:
    messages = state["messages"]
    question = messages[0].content

    prompt = PromptTemplate(
        template="""Look at the input and try to reason about the underlying semantic intent / meaning.
        Here is the initial question: {question}
        Formulate an improved question:""",
        input_variables=["question"],
    )

    model = ChatOpenAI(temperature=0, model="gpt-4-0125-preview")
    chain = prompt | model | StrOutputParser()
    response = chain.invoke({"question": question})
    
    return {"messages": [HumanMessage(content=response)]}

def generate(state: AgentState) -> Dict[str, List[str]]:
    messages = state["messages"]
    question = messages[0].content
    docs = messages[-1].content

    prompt = hub.pull("rlm/rag-prompt")
    llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
    rag_chain = prompt | llm | StrOutputParser()

    response = rag_chain.invoke({"context": docs, "question": question})
    return {"messages": [response]}

# Set up the workflow graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", agent)
retrieve = ToolNode(tools)
workflow.add_node("retrieve", retrieve)
workflow.add_node("rewrite", rewrite)
workflow.add_node("generate", generate)

workflow.add_edge(START, "agent")
workflow.add_conditional_edges(
    "agent",
    tools_condition,
    {
        "tools": "retrieve",
        END: END,
    },
)
workflow.add_conditional_edges(
    "retrieve",
    grade_documents,
    {
        "generate": "generate",
        "rewrite": "rewrite",
    },
)
workflow.add_edge("generate", END)
workflow.add_edge("rewrite", "agent")

graph = workflow.compile()

# FastAPI models
class Query(BaseModel):
    question: str

class Response(BaseModel):
    answer: str
    # audio_base64: Optional[str] = None


@app.post("/query", response_model=Response)
async def process_query(query: Query):
    try:
        inputs = {
            "messages": [HumanMessage(content=query.question)]
        }
        result = graph.invoke(inputs)
        
        # Extract the final answer from the result
        final_message = result["messages"][-1]
        answer = final_message.content if isinstance(final_message, BaseMessage) else str(final_message)
        
        return Response(answer=answer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



    # describe the 10th question in the exercise.answer it
    # please explain me 11.1 activity in detail

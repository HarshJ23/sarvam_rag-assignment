import os
import getpass
from typing import List, Union, Dict, Any, Annotated, Literal, Sequence, TypedDict, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import requests
import logging
import json
import base64

from langchain import hub
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain.tools.retriever import create_retriever_tool
from langchain.chains import LLMChain
from langchain_openai import OpenAI

from langgraph.graph import END, StateGraph, START
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.graph.message import add_messages
from dotenv import load_dotenv

from pymongo import MongoClient
from serpapi import GoogleSearch

import uvicorn
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()


os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
ATLAS_CONNECTION_STRING = os.getenv("ATLAS_CONNECTION_STRING")
os.environ["LANGSMITH_API_KEY"] = os.getenv("LANGSMITH_API_KEY")
os.environ["LANGSMITH_TRACING"] = "true"
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SERPAPI_API_KEY = os.getenv("SERPAPI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#  MongoDB Atlas connection
client = MongoClient(ATLAS_CONNECTION_STRING)
db_name = "langchain_db"
collection_name = "sarvam_ncert"
atlas_collection = client[db_name][collection_name]
vector_search_index = "vector_index"

#  retriever
retriever = MongoDBAtlasVectorSearch(
    embedding=OpenAIEmbeddings(),
    collection=atlas_collection,
    index_name=vector_search_index,
    relevance_score_fn="cosine",
).as_retriever()

# retriever-mongo
retriever_tool = create_retriever_tool(
    retriever,
    "retrieve_blog_posts",
    "Search and return information about the Sound chapter of NCERT textbook.",
)
tools = [retriever_tool]

class VideoInfo(BaseModel):
    title: str
    link: str
    thumbnail: str

# class Response(BaseModel):
#     answer: str
#     audio_base64: Optional[str] = None
#     suggested_video: Optional[VideoInfo] = None

# AgentState
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]


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
    llm = ChatOpenAI(model_name="gpt-4", temperature=0)
    rag_chain = prompt | llm | StrOutputParser()

    response = rag_chain.invoke({"context": docs, "question": question})
    return {"messages": [response]}

#workflow graph
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


class Query(BaseModel):
    question: str

class VideoInfo(BaseModel):
    title: str
    link: str
    thumbnail: str    

class Response(BaseModel):
    answer: str
    audio_base64: Optional[str] = None
    suggested_video: Optional[Dict[str, str]] = None

def generate_audio(text: str) -> Optional[str]:
    url = "https://api.sarvam.ai/text-to-speech"
    payload = {
        "inputs": [text],
        "target_language_code": "hi-IN",
        "speaker": "meera",
        "pitch": 0,
        "pace": 1.65,
        "loudness": 1.5,
        "speech_sample_rate": 8000,
        "enable_preprocessing": True,
        "model": "bulbul:v1"
    }
    headers = {
        "Content-Type": "application/json",
        "api-subscription-key": SARVAM_API_KEY
    }

    try:
        logging.info("Sending request to Sarvam AI TTS API")
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        
        response_data = response.json()
        if "audios" in response_data and len(response_data["audios"]) > 0:
            return response_data["audios"][0]
        else:
            logging.warning("No audio data found in the response")
            return None
    except requests.exceptions.RequestException as e:
        logging.error(f"Error calling Sarvam AI TTS API: {str(e)}")
        return None

def extract_key_topics(text: str) -> Optional[str]:
    llm = OpenAI(temperature=0)
    prompt = PromptTemplate(
        input_variables=["text"],
        template="""
        Analyze the following text and determine if it's related to the sound chapter from NCERT textbooks.
        If it is related to sound, extract 3-5 key topics from the text, separated by commas.
        If it's not related to sound, return 'Not related to sound chapter'.

        Text: {text}

        Output:
        """
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run(text).strip()
    
    if result == 'Not related to sound chapter':
        return None
    return result


def search_youtube_video(query: str) -> Optional[Dict[str, str]]:
    try:
        params = {
            "engine": "youtube",
            "search_query": query,
            "api_key": SERPAPI_API_KEY
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        
        if "video_results" in results and len(results["video_results"]) > 0:
            video = results["video_results"][0]
            return {
                "title": video["title"],
                "link": video["link"],
                "thumbnail": video["thumbnail"]["static"]  
            }
    except Exception as e:
        logging.error(f"Error searching YouTube: {str(e)}")
    
    return None


@app.post("/query", response_model=Response)
async def process_query(query: Query):
    try:
        inputs = {
            "messages": [HumanMessage(content=query.question)]
        }
        result = graph.invoke(inputs)
        
        final_message = result["messages"][-1]
        answer = final_message.content if isinstance(final_message, BaseMessage) else str(final_message)
        
        audio_base64 = generate_audio(answer)
        
        key_topics = extract_key_topics(answer)
        suggested_video = None
        if key_topics:
            suggested_video = search_youtube_video(f"NCERT Sound {key_topics}")
        
        # response with the suggested video
        return Response(answer=answer, audio_base64=audio_base64, suggested_video=suggested_video)
    except Exception as e:
        logging.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
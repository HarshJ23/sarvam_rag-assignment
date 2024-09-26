# NCERT RAG System with AI Agent and Voice Integration

## Introduction

This project implements a Retrieval-Augmented Generation (RAG) system with an AI agent and voice integration capabilities. It's designed to work with NCERT PDF text data, providing intelligent responses to user queries. The system consists of a backend built with FastAPI and a frontend next.js application.

## Features

1. **RAG System**
   - Utilizes a vector database to store and retrieve NCERT text data
   - FastAPI endpoint for querying the RAG system
   - Next.JS-based frontend for user interaction

2. **AI Agent**
   - Intelligent decision-making to determine when to use the vector database
   - Additional tool/action integration - retriever tool and  YT search tool.

3. **Voice Integration**
   - Text-to-Speech functionality using Sarvam AI's API
   - Audio playback of AI responses in the frontend

## Technologies Used

- Backend:
  - FastAPI
  - LangChain
  - Langgraph
  - MongoDB  (as vector store.)
  - OpenAI GPT-4
  - Sarvam AI TTS API

- Frontend:
  - Next.js 
  - Tailwind CSS 

## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/HarshJ23/agentic_rag_langraph
   cd agentic_rag
   ```

2. Set up the backend:
   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ATLAS_CONNECTION_STRING=your_mongodb_atlas_connection_string
   LANGSMITH_API_KEY=your_langsmith_api_key
   SARVAM_API_KEY=your_sarvam_api_key
   SERPAPI_API_KEY = your_serp_key
   ```

4. Set up the frontend:
   ```
   cd ../frontend
   npm install
   ```

## Running the Application

1. Start the backend server:
   ```
   cd backend
   uvicorn main:app --reload or python main.py
   ```

2. In a new terminal, start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000` (or the port specified by your React setup).

## Usage

1. Enter your query in the input field at the bottom of the page.
2. Press Enter or click the Send button to submit your query.
3. The AI will process your query, potentially using the RAG system when necessary.
4. The response will be displayed in the chat interface.
5. If audio is available, a play button will appear next to the response. Click it to hear the AI's response.




## API Endpoints

- `POST /query`: Send a user query and receive an AI response
  - Request body: `{ "question": "Your question here" }`
  - Response: `{ "answer": "AI response", "audio_base64": "Base64 encoded audio (if available)" , "suggested_video" :  {"title": "",link": "","thumbnail": ""} }`
  - 

## LLM Usage

This project utilizes OpenAI's GPT-4 model for natural language processing and generation. The LLM is used in conjunction with the RAG system to provide context-aware responses based on the NCERT dataset.






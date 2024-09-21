# FastAPI Agentic RAG Project

This project implements an Agentic Retrieval-Augmented Generation (RAG) system using FastAPI, LangChain, and MongoDB Atlas. It provides an API endpoint for question-answering based on a specific knowledge base.

## Features

- Agentic RAG system for intelligent information retrieval and response generation
- FastAPI endpoint for easy integration
- MongoDB Atlas integration for efficient vector search
- OpenAI's GPT models for natural language processing

## Prerequisites

- Python 3.8+
- MongoDB Atlas account
- OpenAI API key

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/fastapi-agentic-rag.git
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

## Configuration

1. Create a `.env` file in the project root and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   MONGODB_ATLAS_CONNECTION_STRING=your_mongodb_atlas_connection_string

   ```

2. Update the `db_name`, `collection_name`, and `vector_search_index` variables in the main script if necessary.

## Usage

1. Start the FastAPI server:
   ```
   uvicorn app:app --reload
   ```

2. The API will be available at `http://localhost:8000`. You can use the `/query` endpoint to ask questions:
   ```
   curl -X POST "http://localhost:8000/query" -H "Content-Type: application/json" -d '{"question": "What is the speed of sound in solids?"}'
   ```

3. You can also use the interactive SwaggerUI at `http://localhost:8000/docs` to test the API.

## Project Structure

- `main.py`: The main FastAPI application file containing the Agentic RAG implementation and API endpoint.
- `requirements.txt`: List of Python dependencies.
- `.gitignore`: Specifies intentionally untracked files to ignore.
- `README.md`: This file, containing project documentation.

## How It Works

1. The user sends a question to the `/query` endpoint.
2. The system uses an agent to decide whether to retrieve information or not.
3. If retrieval is needed, it uses MongoDB Atlas to find relevant documents.
4. The retrieved documents are graded for relevance.
5. Based on the grading, the system either generates an answer or rewrites the query for another retrieval attempt.
6. The final answer is returned to the user.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
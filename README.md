# Dockerized AnythingLLM Chatbot with Weaviate

A simple chatbot application using AnythingLLM, Ollama (llama2), and Weaviate for vector storage. The application features a room-based chat system where users can create and manage multiple chat rooms.

## Features

- Multiple chat rooms support
- Persistent chat history per room
- Clean and intuitive user interface
- Real-time chat with AI assistant
- Local storage for room and message persistence

## Prerequisites

- Docker and Docker Compose
- Node.js and npm
- Git

## First Time Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Set up environment files:

   ```bash
   # Copy example environment files
   cp .env.example .env
   cp .env.anythingllm.example .env.anythingllm
   ```

3. Start the Docker services:

   ```bash
   docker-compose up -d
   ```

4. Configure AnythingLLM:

   - Access http://localhost:3001
   - Add Base URL: `http://ollama:11434/v1`
   - Select model: `llama2`

5. Configure Vector Database:

   - Go to Vector Database settings in AnythingLLM
   - Set Weaviate URL to: `http://weaviate:8080` (not localhost)
   - Set the Weaviate API Key to match the value in your `.env.anythingllm` file (even though authentication is disabled, the values must match)

6. Start the local server:

   ```bash
   npm run dev
   ```

7. Access the application:
   - Open http://localhost:3002 in your browser
   - Start chatting!

## Using the Application

### Room Management

1. Creating a Room:

   - Enter a room name in the input field
   - Click "Create Room" or press Enter
   - You'll be automatically taken to the new chat room

2. Switching Rooms:

   - Click on any room in the room list to switch to it
   - Use the "Back to Rooms" button to return to the room selection screen
   - Each room maintains its own chat history

3. Chat Features:
   - Type your message and press Enter or click Send
   - Messages are saved automatically
   - Chat history persists across page reloads
   - Each room has its own independent conversation

## Regular Usage

After the initial setup, your workflow will be:

1. Start the services (if not already running):

   ```bash
   docker-compose up -d
   ```

2. Start the local server:

   ```bash
   npm run dev
   ```

3. Access the application at http://localhost:3002

## Stopping the Application

1. Stop the local server:

   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. Stop the Docker services (optional):
   ```bash
   docker-compose down
   ```

## Important Notes

- The Docker services are configured with `restart: unless-stopped`, so they'll automatically restart if your system reboots
- Your AnythingLLM and Weaviate configurations are persisted in Docker volumes
- You don't need to reconfigure AnythingLLM or Weaviate settings every time you start the services
- The local server (port 3002) needs to be started manually each time you want to use the application
- Authentication is disabled for both AnythingLLM and Weaviate for simplicity, but the API key values must match between AnythingLLM and `.env.anythingllm`
- Environment files (`.env` and `.env.anythingllm`) are not tracked in git - use the example files as templates
- The following folders contain local data and are created automatically by Docker - they are not tracked in git:
  - `ollama/`: Contains downloaded model files
  - `storage/`: Contains AnythingLLM's local storage
  - `weaviate_data/`: Contains Weaviate's vector database data
  - `anythingllm/`: Contains AnythingLLM's configuration and settings
  - Browser's localStorage: Contains chat rooms and messages

## Troubleshooting

If you encounter any issues:

1. Check if all services are running:

   ```bash
   docker-compose ps
   ```

2. Check service logs:

   ```bash
   docker-compose logs
   ```

3. Ensure all environment variables are correctly set in your `.env` and `.env.anythingllm` files

4. Make sure ports 3001, 3002, and 8080 are available on your system

5. If you experience issues with rooms or messages:
   - Clear your browser's localStorage
   - Refresh the page
   - Create new rooms as needed

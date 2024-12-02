# Draxit - A Dixit-Inspired Web Game

A real-time multiplayer web game inspired by the original Dixit board game, with a creative twist where players draw the cards themselves. Join rooms, become the storyteller, draw, and guess in this engaging and artistic game.

## Game Overview

- **Join Rooms**: Players can join game rooms to play with friends or other online players.
- **Random Storyteller**: In each round, a random player becomes the storyteller who types a word or phrase.
- **Drawing Phase**: Other players draw an image representing the word provided by the storyteller.
- **Guessing Phase**: Players guess which drawing matches the storyteller's word.
- **Scoring**: Points are awarded based on correct guesses and how well the drawings represent the word. (Unfinished)

## Key Features

- **Real-Time Multiplayer**: Play with multiple players in real-time.
- **Interactive Drawing Canvas**: Integrated drawing tools for players to create their artwork.
- **Randomized Roles**: Automatic selection of the storyteller each round.

## Technologies Used

### Frontend

- **[React.js](https://reactjs.org/)**: JavaScript library for building user interfaces.
- **[Socket.io Client](https://socket.io/)**: Enables real-time, bidirectional communication between web clients and servers.

### Backend

- **[Node.js](https://nodejs.org/)**: JavaScript runtime for server-side development.
- **[Express.js](https://expressjs.com/)**: Web framework for Node.js.
- **[Socket.io](https://socket.io/)**: Real-time communication library.
- **[MongoDB](https://www.mongodb.com/)**: NoSQL database for storing game data.

### Deployment

- **[Docker Compose](https://docs.docker.com/compose/)**: Orchestrate multi-container Docker applications.

## Getting Started

### Prerequisites

- **Node.js** and **npm** installed on your machine.
- **MongoDB** installed and running locally or accessible via connection string.

### Run Locally

1. **Clone the repository**:

   ```bash
   git clone https://github.com/MajorTom3K1M/draxit.git
   cd draxit
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:

   Create a `.env` file in the root directory with the following content:

   ```env
   PORT=2000
   NODE_ENV=development
   MONGODB=mongodb://localhost:27017/draxit
   ```

   - Ensure MongoDB is running and accessible at the provided `MONGODB` URI.

4. **Start the Application**:

   ```bash
   npm start
   ```

5. **Access the Game**:

   Open your browser and navigate to `http://localhost:2000` to start playing.

### Run with Docker Compose

1. **Clone the repository**:

   ```bash
   git clone https://github.com/MajorTom3K1M/draxit.git
   cd draxit
   ```

2. **Edit the `docker-compose.yml`** (if necessary):

   - Adjust any configuration as needed for your environment.

3. **Start the Application with Docker Compose**:

   ```bash
   docker-compose up
   ```

4. **Access the Game**:

   Open your browser and navigate to `http://localhost:2000` to start playing.
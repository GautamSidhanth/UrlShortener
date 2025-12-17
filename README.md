# URL Shortener

![MESSAGED](https://img.shields.io/badge/Status-Active-success)
![MESSAGED](https://img.shields.io/badge/License-ISC-blue)
![MESSAGED](https://img.shields.io/badge/Docker-Enabled-blue)

A high-performance, distributed URL shortener built with a modern tech stack. Designed for scalability and reliability, leveraging **Zookeeper** for distributed coordination, **Redis** for caching, and **MongoDB** for persistent storage.

## 🚀 Features

- **Shorten URLs**: Convert long URLs into compact, shareable links.
- **High Performance**: Uses Redis caching to serve frequently accessed URLs instantly.
- **Distributed System**: Zookeeper integration for managing distributed components (e.g., ID generation coordination).
- **Expiration**: Links automatically expire after 10 minutes (configurable).
- **Containerized**: Fully Dockerized setup for easy deployment.

## 🛠 Tech Stack

### Frontend

- **React** (Vite): Fast and modern UI library.
- **Material UI (MUI)**: Professional and responsive design components.
- **Redux Toolkit**: State management.
- **TypeScript**: Type-safe code base.

### Backend

- **Node.js & Fastify**: High-performance web framework.
- **TypeScript**: Strictly typed backend code.

### Infrastructure & Database

- **MongoDB**: Persistent data storage for URLs.
- **Redis**: In-memory caching for blazingly fast redirects.
- **Zookeeper**: Coordination service for distributed systems.
- **Docker & Docker Compose**: Orchestrates the entire stack.
- **Nginx**: Reverse proxy (configured in docker-compose).

## 🏗 Architecture

The system is designed to handle high loads:

1.  **Client** requests a short URL.
2.  **Server** checks **Redis** cache first.
    - If found, returns immediately.
3.  If not in cache, **Server** queries **MongoDB**.
4.  **Zookeeper** is used to ensure consistency across distributed server instances.

## 🏁 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### Installation & Run

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd url-shortener
    ```

2.  **Set up Environment Variables**
    Modify the `.env` file in the root directory if needed. The default `docker-compose.yml` uses these variables.

3.  **Start the Application**
    Run the entire stack using Docker Compose:

    ```bash
    docker-compose up --build
    ```

4.  **Access the App**
    - **Frontend**: `http://localhost:5173` (or configured port)
    - **Backend API**: `http://localhost:3000` (or configured port)

## 📡 API Endpoints

| Method | Endpoint         | Description                                              |
| :----- | :--------------- | :------------------------------------------------------- |
| `POST` | `/api/urls`      | Create a new short URL. Body: `{ "originalUrl": "..." }` |
| `GET`  | `/api/urls`      | Retrieve all shortened URLs.                             |
| `GET`  | `/api/urls/:key` | Redirect to the original URL (or return details).        |
| `GET`  | `/api/health`    | Check service health (Mongo, Redis, Zookeeper status).   |

## 📂 Project Structure

```
├── client/              # React frontend (Vite)
├── server/              # Node.js Fastify backend
├── nginx/               # Nginx configuration
├── docker-compose.yml   # Docker orchestration
└── README.md            # This file
```

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the [ISC License](LICENSE).

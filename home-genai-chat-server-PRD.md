# Product Requirements Document (PRD): Custom GenAI Chat Web Application

## 1. Product Overview
### 1.1 Product Name
CustomChatAI

### 1.2 Product Description
CustomChatAI is a self-hosted, Docker Compose-based web application delivering a generative AI-powered chat interface, styled after platforms like chatgpt.com or grok.com. It provides a user-friendly frontend for interacting with AI models running on a remote VM (no GPU, 24 CPUs, 16GB RAM) via Docker Model Runner or compatible backends (e.g., Ollama). The application emphasizes privacy, extensibility, and seamless integration with external web apps through API endpoints and embeddable widgets.

Key enhancements over the base repo (https://github.com/timothystewart6/techno-boto-chat):
- User authentication with admin roles and per-user chat history.
- Secure API endpoints for embedding chat functionality into other applications (e.g., via iframes, JavaScript widgets, or direct API calls).
- Optimized for CPU-only hardware using quantized models.
- Built and deployed exclusively using Docker Compose for consistent, reproducible setups.

The app will be accessible via a browser (e.g., http://your-vm-ip:3000) and provide an OpenAI-compatible API (e.g., http://your-vm-ip:11434/v1/chat/completions) for external integrations. Docker Compose ensures all components (web app, database, model runner) are orchestrated as a single, portable deployment.

### 1.3 Target Audience
- Developers/organizations needing a private, self-hosted AI chat solution.
- Users embedding AI chat into web apps (e.g., customer support, internal tools).
- Admins managing multi-user environments with oversight requirements.

### 1.4 Business Goals
- Deliver a cost-effective, GPU-free AI chat platform with full data ownership.
- Enable seamless embedding into external apps via API or widgets.
- Achieve high usability with a modern, intuitive UI akin to leading AI platforms.
- Ensure scalability for up to 100 concurrent users on the specified VM.

### 1.5 Success Metrics
- Deployment time: <30 minutes using Docker Compose.
- Response latency: <5 seconds for chat completions on CPU (e.g., Llama 3 8B quantized).
- User satisfaction: 90%+ positive feedback on UI/UX (via optional in-app surveys).
- API usage: Support 10+ embedding integrations without performance degradation.

## 2. Features and Requirements
### 2.1 Core Features
#### 2.1.1 Chat Interface
- **UI Design**: Emulates chatgpt.com/grok.com – full-screen chat window, input bar, message bubbles (user/AI differentiated by avatars/colors), scrolling history, loading indicators.
- **Themes**: Dark/light mode toggle (inherited from base repo).
- **Markdown Support**: Render responses with formatting, code blocks, and syntax highlighting (using react-markdown).
- **Reasoning Mode**: Optional "think step-by-step" display for compatible models (collapsible section).
- **Model Switching**: Dropdown to select available models from the backend (queried via Docker Model Runner API).

#### 2.1.2 User Authentication
- **Providers**: Email/password, Google OAuth, GitHub OAuth (via NextAuth.js).
- **Registration/Login**: Secure signup with email verification; JWT/cookie-based sessions.
- **Roles**:
  - Standard User: Access personal chats, view/edit history.
  - Admin User: Standard features + user management (view/delete users, monitor chats), system configuration (e.g., model defaults).
- **Security**: Password hashing (bcrypt), rate limiting, CSRF protection. No telemetry.

#### 2.1.3 Chat History Management
- **Per-User Storage**: Store chats in a PostgreSQL database (containerized via Docker Compose), tied to user ID. Each chat includes title (auto-generated or user-edited), messages, timestamps, and model used.
- **UI Elements**: Sidebar for chat history (searchable, deletable list). New chat button.
- **Persistence**: Retain history across sessions; optional export (JSON/CSV).
- **Limits**: Cap at 100 chats per user (configurable); auto-prune old chats if storage exceeds thresholds.

#### 2.1.4 API Endpoints for Embedding
- **OpenAI-Compatible API**: Expose `/api/v1/chat/completions` for programmatic access (OpenAI spec-compliant).
- **Authentication**: API keys per user (generated in dashboard); admin keys for elevated access.
- **Embedding Options**:
  - **Iframe Embedding**: `<iframe src="/embed/chat?userKey=abc&theme=dark"></iframe>` – Mini chat window.
  - **JavaScript Widget**: Script for dynamic embedding (e.g., chat bubble popup).
  - **Direct API Calls**: POST requests with streaming support (SSE for real-time typing).
- **Rate Limiting**: 100 requests/min per key; configurable.
- **Use Cases**: Embed in e-commerce sites, internal dashboards, etc.

#### 2.1.5 Backend Integration
- **Model Runner**: Connect to Docker Model Runner (default: `http://model-runner.docker.internal/engines/v1`).
- **Fallbacks**: Support Ollama, llama.cpp, or OpenAI (configurable via env vars in Docker Compose).
- **Model Management**: Auto-detect models; admin UI to pull new models via backend API.

### 2.2 Non-Functional Requirements
#### 2.2.1 Performance
- **Hardware Compatibility**: Optimized for CPU-only; use quantized models (e.g., 4-bit, ~4-6GB RAM for Llama 3 8B).
- **Scalability**: Handle 50 concurrent chats with <10% CPU spike (leverage 24 CPUs).
- **Latency**: <3s initial response; streaming for longer generations.

#### 2.2.2 Security and Privacy
- **Data Handling**: Local storage only; no external APIs unless configured.
- **Compliance**: GDPR-friendly (data export/delete); audit logs for admins.
- **Vulnerabilities**: HTTPS (via Docker Compose Nginx proxy); input sanitization.

#### 2.2.3 Reliability
- **Uptime**: Docker Compose auto-restart; health checks for all services.
- **Error Handling**: Graceful fallbacks; notification system for errors.

#### 2.2.4 Accessibility
- **WCAG Compliance**: ARIA labels, keyboard navigation, high-contrast themes.
- **Mobile Responsiveness**: Tailwind CSS for full support.

### 2.3 Technical Stack
- **Frontend/Backend**: Next.js 15+ (App Router, Server Components).
- **Language**: TypeScript.
- **Styling**: Tailwind CSS.
- **Database**: PostgreSQL (containerized).
- **Auth**: NextAuth.js.
- **API Client**: OpenAI SDK.
- **Testing**: Jest, ESLint, Средство форматирования кода.
- **Deployment**: Docker Compose (mandatory for build and deployment).

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Framework | Next.js 15 | Server-side rendering, API routes, Docker-friendly. |
| Database | PostgreSQL | Relational, scalable, Dockerized. |
| Auth | NextAuth.js | Seamless Next.js integration. |
| AI Backend | Docker Model Runner | CPU-friendly, OpenAI-compatible. |
| Styling | Tailwind CSS | Rapid, responsive design. |

## 3. User Stories
- As a user, I want to sign up/login to access personalized chats.
- As a user, I want to view/edit my chat history in a sidebar.
- As an admin, I want to manage users and system settings.
- As a developer, I want API keys to embed the chat into my app.
- As a user, I want to switch themes and models seamlessly.

## 4. Design and UX
- **Wireframes**: (To be designed in Figma) – Login screen, chat dashboard with sidebar, admin user table.
- **Branding**: Modern, neutral (blues/greys); customizable via CSS vars.
- **Interactions**: Real-time typing indicators, auto-scroll, message editing.

## 5. Development Plan
### 5.1 Phases
1. **Setup (1-2 weeks)**: Fork base repo; configure Docker Compose with PostgreSQL, Next.js app, and Docker Model Runner.
2. **Core Chat (2 weeks)**: Build UI with history sidebar; integrate with database.
3. **Auth & Roles (1 week)**: Implement NextAuth.js with user/admin logic.
4. **API Embedding (1-2 weeks)**: Develop API endpoints; test iframe/widget integrations.
5. **Testing/Polish (1 week)**: Unit tests, performance optimization, documentation.
6. **Deployment**: Finalize Docker Compose setup; deploy to VM.

### 5.2 Dependencies
- Base Repo: Fork https://github.com/timothystewart6/techno-boto-chat.
- Libraries: prisma (ORM), openai (client), react-markdown.
- Docker Images: node (for Next.js), postgres, ollama (as Docker Model Runner fallback).

### 5.3 Docker Compose Configuration
The app must be built and deployed using a single `docker-compose.yml` orchestrating:
- **Next.js Service**: Runs the web app (port 3000).
- **PostgreSQL Service**: Stores user data and chat history (port 5432).
- **Model Runner Service**: Runs AI models (port 11434 or custom).
- **Nginx (Optional)**: Reverse proxy for HTTPS (port 443).
Example (simplified):
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/customchatai
      - LLM_API_BASE_URL=http://model-runner:11434/engines/v1
      - NEXTAUTH_SECRET=your-secret
    depends_on:
      - db
      - model-runner
  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=customchatai
    volumes:
      - db-data:/var/lib/postgresql/data
  model-runner:
    image: ollama/ollama
    ports:
      - "11434:11434"
    volumes:
      - model-data:/root/.ollama
volumes:
  db-data:
  model-data:
```

### 5.4 Risks
- **RAM Constraints**: Mitigate with quantized models (4-bit) and chat limits.
- **Docker Networking**: Ensure proper service discovery (e.g., `model-runner` alias).
- **Security**: Audit auth and API endpoints for vulnerabilities.

## 6. Deployment and Maintenance
- **Build Process**: Use Docker Compose for local dev (`docker compose up --build`) and production deployment.
- **Deployment Steps**:
  1. Clone repo on VM.
  2. Configure `.env` and `docker-compose.yml`.
  3. Run `docker compose up -d` to build and deploy.
  4. Access at `http://your-vm-ip:3000`; API at `http://your-vm-ip:3000/api/v1`.
- **Maintenance**:
  - Update images: `docker compose pull`.
  - Monitor: Add health checks in Compose; use `docker compose logs`.
  - Backups: Volume mounts for database and model data.
- **Networking**: Open ports 3000 (web), 11434 (API), 5432 (db, optional). Use Nginx for HTTPS in production.

## 7. Budget and Timeline
- **Effort**: 6-8 weeks for a solo developer (Next.js experience assumed).
- **Costs**: Free (open-source); VM hosting as provided.
- **Next Steps**: Review PRD; fork repo and prototype Docker Compose setup.

This PRD ensures the app is built and deployed using Docker Compose, aligning with the specified requirements. For code implementation or further details, please specify!
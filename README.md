# CustomChatAI

> **Note:** This project was inspired by and built upon concepts from [techno-boto-chat](https://github.com/timothystewart6/techno-boto-chat) by Timothy Stewart. While this implementation is a complete rewrite with different architecture, features, and technologies, credit goes to the original project for inspiration.

A fully self-hosted, production-ready generative AI chat platform with OpenAI-compatible API. Built with Next.js 15, TypeScript, PostgreSQL, and Ollama for complete data privacy and control.

## 🎯 What is CustomChatAI?

CustomChatAI is a **self-hosted alternative to ChatGPT** that runs entirely on your infrastructure. It provides:

- **Complete Privacy**: All data stays on your servers - no external API calls for chat processing
- **OpenAI-Compatible API**: Drop-in replacement for OpenAI's API with your own models
- **Multi-User Platform**: Full authentication, user management, and admin controls
- **Production Ready**: Docker Compose deployment with auto-generated secrets and health checks
- **Model Flexibility**: Run any Ollama-supported model (Llama, Mistral, Phi, etc.)
- **Developer API**: REST API with rate limiting, API key management, and comprehensive documentation

Perfect for organizations that need AI chat capabilities while maintaining data sovereignty, or developers who want to build AI-powered applications with their own infrastructure.

## ✨ Key Features

### Core Functionality
- 🔐 **User Authentication**: Email/password with optional Google/GitHub OAuth
- 💬 **Modern Chat Interface**: ChatGPT-like UI with markdown rendering and syntax highlighting
- 📚 **Chat History**: Persistent per-user chat storage with search and export (JSON/CSV)
- 🎨 **Dark/Light Themes**: System-aware theme toggle with persistence
- 🎯 **Model Selection**: Switch between any Ollama models in real-time
- 🔄 **Real-time Streaming**: Server-sent events for smooth response streaming

### API & Integration
- ⚡ **OpenAI-Compatible API**: `/api/v1/chat/completions` endpoint with streaming support
- 📖 **Interactive API Documentation**: Full API docs at `/docs/api` with code examples
- 🔑 **API Key Management**: Generate, manage, and revoke API keys per user
- 🚦 **Rate Limiting**: Configurable request throttling with header feedback
- 🌐 **Embedding Options**: iFrame and JavaScript widget for integration
- 🔌 **Webhook Support**: Event notifications for chat completions

### Administration
- 👥 **Admin Dashboard**: User management, model management, and system monitoring
- 📊 **Usage Analytics**: Track API usage, chat metrics, and user activity
- 🔧 **Model Management**: Download, list, and delete AI models via web UI with progress tracking
- 🛡️ **Role-Based Access**: ADMIN and USER roles with granular permissions
- 💾 **Database Management**: PostgreSQL with automatic migrations

### DevOps & Deployment
- 🐳 **Docker Compose**: Single-command deployment with health checks
- 🔒 **Auto-Generated Secrets**: Cryptographically secure secrets on startup
- 📈 **Horizontal Scaling**: Stateless design ready for load balancers
- 🏥 **Health Endpoints**: `/api/health` for monitoring and orchestration
- 🔄 **Zero-Downtime Updates**: Graceful shutdowns and rolling updates

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- **Minimum 8GB RAM** (16GB+ recommended for larger models)
- **20GB+ free disk space** for model storage
- **x86_64 or ARM64** CPU architecture supported

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd home-chat-server
   ```

2. **Start the application** (Zero configuration required!)
   ```bash
   docker compose up -d
   ```

   **That's it!** All secrets (NEXTAUTH_SECRET, etc.) are auto-generated at startup.

   **Optional:** To customize settings:
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings (all optional!)
   docker compose up -d
   ```

3. **Access the application**
   - Web UI: http://localhost:3000
   - API Docs: http://localhost:3000/docs/api
   - API Endpoint: http://localhost:3000/api/v1/chat/completions
   - Ollama Direct: http://localhost:11434

4. **Create your first user**
   - Navigate to http://localhost:3000
   - Click "Sign up"
   - First registered user is automatically promoted to ADMIN

5. **Download your first AI model**
   - Log in as admin
   - Navigate to Admin Dashboard → Model Management
   - Download a model (e.g., `llama3.2:3b` or `mistral:7b`)
   - Wait for download to complete (progress bar shows status)

6. **Start chatting!**
   - Go to Dashboard
   - Select your downloaded model from the dropdown
   - Start a conversation

## 🏗️ Architecture

The application consists of three containerized services:

```
┌─────────────────────────────────────────────────────────┐
│  Nginx Reverse Proxy (Optional)                        │
│  - HTTPS/TLS termination                                │
│  - Load balancing for horizontal scaling                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Next.js App Container (Port 3000)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ - Web Interface (React/TypeScript)              │   │
│  │ - API Routes (OpenAI-compatible)                │   │
│  │ - Authentication (NextAuth.js)                  │   │
│  │ - API Key Management                            │   │
│  │ - Rate Limiting                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────┐
│ PostgreSQL (5432)    │    │ Ollama Runner (11434)    │
│ - User accounts      │    │ - AI model execution     │
│ - Chat history       │    │ - Model storage          │
│ - API keys           │    │ - Inference engine       │
│ - Persistent storage │    │ - GPU/CPU support        │
└──────────────────────┘    └──────────────────────────┘
```

### Service Details

1. **Next.js App** (Port 3000)
   - Full-stack web application
   - API routes for OpenAI compatibility
   - Server-side rendering for optimal performance
   - Built with Next.js 15, TypeScript, Tailwind CSS

2. **PostgreSQL** (Port 5432)
   - Relational database for all structured data
   - Prisma ORM with automatic migrations
   - User accounts, chats, messages, API keys

3. **Ollama** (Port 11434)
   - AI model runtime engine
   - Supports CPU and GPU inference
   - Manages model downloads and versioning

## 📖 Usage

### Web Interface

1. **Sign in** or create an account at http://localhost:3000
2. **Download a model** (Admin Dashboard → Model Management)
3. **Start a chat** from the dashboard
4. **Select an AI model** from the dropdown menu
5. **Type your message** and press Send or Enter

### API Documentation

Full interactive API documentation is available at:
- http://localhost:3000/docs/api

The documentation includes:
- Authentication guide
- Endpoint specifications
- Request/response examples (curl, Python, Node.js)
- Rate limiting information
- Error codes and troubleshooting

### API Key Management

1. Navigate to Dashboard → **API Keys** (or `/dashboard/keys`)
2. Click **"Create New API Key"**
3. Give it a descriptive name
4. **Copy the key immediately** (it won't be shown again!)
5. Use the key in your `Authorization: Bearer YOUR_KEY` header

### API Examples

#### Chat Completion (Non-Streaming)

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is Docker?"}
    ]
  }'
```

#### Chat Completion (Streaming)

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [{"role": "user", "content": "Tell me a story"}],
    "stream": true
  }'
```

#### List Available Models

```bash
curl -X GET http://localhost:3000/api/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

#### Python Example (OpenAI Library)

```python
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="http://localhost:3000/api/v1"
)

response = client.chat.completions.create(
    model="llama3.2:3b",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)
```

### Embedding Options

#### 1. iFrame Embedding

```html
<iframe
  src="http://localhost:3000/embed/chat?userKey=YOUR_API_KEY&theme=dark"
  width="400"
  height="600"
  frameborder="0"
  allow="clipboard-write">
</iframe>
```

#### 2. JavaScript Widget

```html
<script
  src="http://localhost:3000/widget.js"
  data-customchatai-key="YOUR_API_KEY"
  data-customchatai-theme="dark"
  data-customchatai-position="bottom-right">
</script>
```

## 👨‍💼 Admin Features

Admins have access to additional functionality:

### User Management (`/admin`)
- View all registered users
- Promote/demote admin privileges
- Delete user accounts (cannot delete self)
- Monitor user activity

### Model Management (`/admin/models`)
- **Download models** with real-time progress tracking
- **List installed models** with size and metadata
- **Delete models** to free up disk space
- Model information (size, last modified, etc.)

### Promote User to Admin

```bash
# Via Docker Compose
docker compose exec -T db psql -U chatuser -d customchatai << SQL
UPDATE users SET role = 'ADMIN' WHERE email = 'user@example.com';
SELECT email, role FROM users WHERE email = 'user@example.com';
SQL
```

Or use the provided script:
```bash
chmod +x /tmp/admin-script.sh
/tmp/admin-script.sh user@example.com
```

## 🤖 Model Management

### Download Models via Web UI

1. Log in as **ADMIN**
2. Navigate to **Admin Dashboard** → **Model Management**
3. Enter model name (e.g., `llama3.2:3b`, `mistral:7b`, `phi3:latest`)
4. Click **"Download Model"**
5. Watch the real-time progress bar
6. Model is ready to use once download completes

### Command Line Model Management

```bash
# Pull/download a model
docker compose exec model-runner ollama pull llama3.2:3b

# List all installed models
docker compose exec model-runner ollama list

# Remove a model
docker compose exec model-runner ollama rm mistral:7b

# Show model information
docker compose exec model-runner ollama show llama3.2:3b
```

### Recommended Models by Use Case

| Model | Size | RAM | Use Case |
|-------|------|-----|----------|
| `llama3.2:3b` | 2.0 GB | 4 GB | Fast responses, general chat |
| `phi3:latest` | 2.2 GB | 4 GB | Efficient, coding tasks |
| `mistral:7b` | 4.4 GB | 8 GB | Balanced quality/speed |
| `llama3.1:8b` | 4.7 GB | 8 GB | High quality, general purpose |
| `llama3.1:70b` | 40 GB | 48 GB | Best quality, slow inference |

## ⚙️ Configuration

### Environment Variables

All environment variables are **optional** with sensible defaults:

| Variable | Description | Default | Auto-Generated |
|----------|-------------|---------|----------------|
| `NEXTAUTH_SECRET` | NextAuth.js encryption key | Random 32-byte | ✅ Yes |
| `NEXTAUTH_URL` | Application base URL | `http://localhost:3000` | ✅ Yes |
| `DATABASE_URL` | PostgreSQL connection string | Auto-constructed | ✅ Yes |
| `POSTGRES_USER` | Database username | `chatuser` | No |
| `POSTGRES_PASSWORD` | Database password | `chatpass` | No |
| `POSTGRES_DB` | Database name | `customchatai` | No |
| `LLM_API_BASE_URL` | Ollama API endpoint | `http://model-runner:11434/v1` | ✅ Yes |
| `RATE_LIMIT_REQUESTS` | Max requests per window | `100` | ✅ Yes |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | `60000` (1 min) | ✅ Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Empty (disabled) | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Empty (disabled) | No |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Empty (disabled) | No |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Empty (disabled) | No |

### Customization

Create a `.env` file to override defaults:

```bash
# Database
POSTGRES_PASSWORD=your-secure-password

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-secret

# Rate Limiting
RATE_LIMIT_REQUESTS=1000
RATE_LIMIT_WINDOW=60000

# Production URL
NEXTAUTH_URL=https://your-domain.com

# Persist NEXTAUTH_SECRET across restarts (recommended for production)
NEXTAUTH_SECRET=your-generated-secret-here
```

### Generate Persistent NEXTAUTH_SECRET

```bash
# Generate and save to .env
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
docker compose restart app
```

**Note:** Without a persistent `NEXTAUTH_SECRET`, user sessions are invalidated on container restart.

## 🔒 Security

### Auto-Generated Security

CustomChatAI automatically handles security on startup:

- ✅ **NEXTAUTH_SECRET**: 32-byte cryptographically random secret
- ✅ **Session Tokens**: Secure JWT with auto-rotation
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **API Keys**: User-generated UUIDs with hashing

### Production Security Checklist

- ✅ Auto-generated secrets (handled automatically!)
- [ ] Set strong `POSTGRES_PASSWORD` in `.env`
- [ ] Deploy behind HTTPS reverse proxy (Nginx/Caddy)
- [ ] Persist `NEXTAUTH_SECRET` in `.env` for session continuity
- [ ] Enable rate limiting (enabled by default)
- [ ] Regularly update Docker images: `docker compose pull`
- [ ] Rotate API keys periodically
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly (see Backup section)

### HTTPS Setup (Production)

Add Nginx reverse proxy with SSL:

```yaml
# Add to docker-compose.yml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf
    - /etc/letsencrypt:/etc/letsencrypt
  depends_on:
    - app
```

## 💾 Backup and Restore

### Backup Database

```bash
# Backup to SQL file
docker compose exec -T db pg_dump -U chatuser customchatai > backup-$(date +%Y%m%d).sql

# Backup with compression
docker compose exec -T db pg_dump -U chatuser customchatai | gzip > backup-$(date +%Y%m%d).sql.gz
```

### Restore Database

```bash
# Restore from SQL file
cat backup-20241021.sql | docker compose exec -T db psql -U chatuser customchatai

# Restore from compressed backup
gunzip -c backup-20241021.sql.gz | docker compose exec -T db psql -U chatuser customchatai
```

### Automated Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/home-chat-server && docker compose exec -T db pg_dump -U chatuser customchatai | gzip > backups/backup-$(date +\%Y\%m\%d).sql.gz
```

## 🐛 Troubleshooting

### App Won't Start

```bash
# Check all services
docker compose ps

# View app logs
docker compose logs app

# View database logs
docker compose logs db

# View Ollama logs
docker compose logs model-runner

# Restart all services
docker compose restart
```

### No Models Available

```bash
# Check installed models
docker compose exec model-runner ollama list

# Download a model
docker compose exec model-runner ollama pull llama3.2:3b

# Verify model downloaded
docker compose exec model-runner ollama list
```

### Chat Returns "Model Not Found"

The default model in the code might not be installed. Either:

1. **Download the default model**: `llama3.2:3b`
2. **Or change default in code**: Edit `app/api/chat/message/route.ts` and `app/api/v1/chat/completions/route.ts`

### Session Expired After Restart

This is expected if `NEXTAUTH_SECRET` is auto-generated (default behavior).

**Fix**: Add a persistent secret to `.env`:
```bash
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
docker compose restart app
```

Then clear browser cookies for localhost:3000.

### Database Connection Errors

```bash
# Check database is running
docker compose ps db

# Check database logs
docker compose logs db

# Verify connection
docker compose exec db psql -U chatuser -d customchatai -c "SELECT 1;"
```

### Rate Limit Exceeded

If you hit rate limits during testing:

1. **Increase limits** in `.env`:
   ```bash
   RATE_LIMIT_REQUESTS=1000
   RATE_LIMIT_WINDOW=60000
   ```

2. **Or disable temporarily** by commenting out rate limit checks in API routes

### Ollama Out of Memory

Reduce model size or increase available RAM:

```bash
# Use smaller models
docker compose exec model-runner ollama pull llama3.2:3b

# Increase Docker memory limit
# Edit Docker Desktop → Settings → Resources → Memory
```

## 🔧 Development

### Local Development (Without Docker)

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with local settings

# Start database only
docker compose up db -d

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Access at: http://localhost:3000

### Database Schema Updates

```bash
# Create a migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ destroys data)
npx prisma migrate reset
```

### Building

```bash
# Build for production
npm run build

# Start production server
npm start

# Build Docker image
docker compose build app
```

## 📊 Performance Optimization

### CPU-Only Inference

For production deployments without GPU:

1. **Use quantized models** (4-bit or 8-bit variants)
   ```bash
   docker compose exec model-runner ollama pull llama3.2:3b-q4_0
   ```

2. **Limit concurrent requests** via rate limiting
   ```bash
   RATE_LIMIT_REQUESTS=10
   RATE_LIMIT_WINDOW=60000
   ```

3. **Adjust Ollama settings** in `docker-compose.yml`:
   ```yaml
   model-runner:
     environment:
       - OLLAMA_NUM_PARALLEL=1
       - OLLAMA_MAX_LOADED_MODELS=1
   ```

4. **Monitor resource usage**
   ```bash
   docker stats
   ```

### GPU Acceleration (NVIDIA)

Uncomment GPU sections in `docker-compose.yml`:

```yaml
model-runner:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: all
            capabilities: [gpu]
```

Requires:
- NVIDIA GPU
- nvidia-docker2 installed
- NVIDIA Container Toolkit

### Horizontal Scaling

CustomChatAI is stateless and can be scaled horizontally:

```yaml
# docker-compose.yml
app:
  deploy:
    replicas: 3
  # ... rest of config
```

Add load balancer (Nginx, Traefik, etc.) in front of app replicas.

## 🤝 Contributing

Contributions are welcome! Please:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (TypeScript, ESLint)
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

## 📄 License

This project is open source and available under the **MIT License**.

See [LICENSE](LICENSE) file for details.

## 🙏 Credits and Attribution

### Inspiration

This project was inspired by [techno-boto-chat](https://github.com/timothystewart6/techno-boto-chat) by **Timothy Stewart**, which demonstrated the concept of a self-hosted AI chat interface. While CustomChatAI is a complete rewrite with different architecture, significantly expanded features, and modern technologies, the original project provided valuable inspiration for the core concept.

**Key differences from the original:**
- Complete rewrite in Next.js 15 with TypeScript (vs. original stack)
- Production-ready with Docker Compose orchestration
- OpenAI-compatible REST API with comprehensive documentation
- Multi-user platform with authentication and RBAC
- Admin dashboard with model management
- API key system with rate limiting
- Real-time model download progress tracking
- Auto-generated secrets for zero-config deployment
- PostgreSQL database with Prisma ORM
- Horizontal scaling support

### Technology Stack

Built with these excellent open-source projects:

- **[Next.js 15](https://nextjs.org/)** - React framework for production
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication for Next.js
- **[PostgreSQL](https://www.postgresql.org/)** - Open source relational database
- **[Ollama](https://ollama.ai/)** - Run large language models locally
- **[Docker](https://www.docker.com/)** - Containerization platform
- **[React Markdown](https://github.com/remarkjs/react-markdown)** - Markdown renderer
- **[React Syntax Highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)** - Code syntax highlighting

### Community

Special thanks to the open-source community for building the tools that made this project possible.

## 📮 Support

For issues, questions, or feature requests:

1. **Check the documentation** above
2. **Review [Troubleshooting](#-troubleshooting)** section
3. **Search existing issues** on GitHub
4. **Open a new issue** with details:
   - Steps to reproduce
   - Expected vs actual behavior
   - Docker logs (`docker compose logs`)
   - Environment details

## 🗺️ Roadmap

Future enhancements under consideration:

- [ ] **Multi-language support** (i18n)
- [ ] **Voice input/output** (speech-to-text, text-to-speech)
- [ ] **Image generation** (Stable Diffusion integration)
- [ ] **Conversation branching** (explore multiple response paths)
- [ ] **Advanced analytics** (usage metrics, cost tracking)
- [ ] **Custom model fine-tuning** (web-based training interface)
- [ ] **Mobile apps** (React Native for iOS/Android)
- [ ] **Plugin system** (extensibility for custom features)
- [ ] **Team workspaces** (shared chats and collaboration)
- [ ] **Chat folders/organization** (better chat management)
- [ ] **Export formats** (PDF, Markdown, HTML)
- [ ] **Prompt templates** (reusable prompt library)

---

**Built with ❤️ for the self-hosted AI community**

*Questions? Issues? Contributions? We'd love to hear from you!*

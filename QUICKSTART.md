# CustomChatAI - Quick Start Guide

Get CustomChatAI up and running in minutes!

## 🚀 Quick Setup (3 minutes)

### 1. Start the Application

**No configuration needed!** All secrets are auto-generated.

```bash
# Just start it - that's it!
docker compose up -d
```

**Optional:** If you want custom values, create a `.env` file:

```bash
# Only if you want to customize (completely optional!)
cp .env.example .env
nano .env  # Set NEXTAUTH_SECRET, POSTGRES_PASSWORD, etc.
```

### 2. Wait for Services to Start

```bash
# Check if services are running
docker compose ps

# View startup logs
docker compose logs -f app
```

You'll see messages like:
```
Starting CustomChatAI...
Generating NEXTAUTH_SECRET...
Environment configured:
  - NEXTAUTH_SECRET: [hidden - 44 chars]
Running database migrations...
Starting Next.js server...
```

### 3. Pull an AI Model

```bash
# Pull the default Llama 3 model (4-8GB download)
docker exec customchatai-model-runner ollama pull llama3

# Or pull a smaller model for faster testing
docker exec customchatai-model-runner ollama pull llama3:8b-instruct-q4_0
```

### 4. Access the Application

1. Open http://localhost:3000 in your browser
2. Click "Sign up" to create your account
3. **Important**: The first user is automatically made an admin!
4. Start chatting!

## ✅ Verify Installation

Check that all services are healthy:

```bash
# Check app health
curl http://localhost:3000/api/health

# Check Ollama
curl http://localhost:11434/api/version

# Check database
docker exec customchatai-db psql -U chatuser -d customchatai -c "\dt"
```

## 🎯 Next Steps

### Generate API Key

1. Sign in to http://localhost:3000
2. Click "🔑 API Keys" in the sidebar
3. Click "Create New Key"
4. Copy the key (you won't see it again!)

### Test the API

```bash
# Replace YOUR_API_KEY with your actual key
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Embed in Your Website

#### Option 1: Iframe
```html
<iframe
  src="http://localhost:3000/embed/chat?userKey=YOUR_API_KEY&theme=dark"
  width="400"
  height="600">
</iframe>
```

#### Option 2: JavaScript Widget
```html
<script
  src="http://localhost:3000/widget.js"
  data-customchatai-key="YOUR_API_KEY"
  data-customchatai-theme="dark">
</script>
```

## 🔐 Security Notes

### Auto-Generated Secrets

The application automatically generates:
- **NEXTAUTH_SECRET**: A cryptographically secure random string (base64, 32 bytes)
- **Database Password**: Auto-set to default (can be customized via env var)

**For production:**
1. Set `POSTGRES_PASSWORD` in environment or `.env`
2. Optionally set `NEXTAUTH_SECRET` (or let it auto-generate on each restart)
3. Use HTTPS (configure Nginx reverse proxy)

**To persist NEXTAUTH_SECRET across restarts:**
```bash
# Generate once and save
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env
docker compose restart app
```

## 🔧 Common Commands

### Managing Models

```bash
# List installed models
docker exec customchatai-model-runner ollama list

# Pull a new model
docker exec customchatai-model-runner ollama pull mistral

# Remove a model
docker exec customchatai-model-runner ollama rm codellama
```

### Application Management

```bash
# Stop all services
docker compose down

# Restart services
docker compose restart

# View logs
docker compose logs -f

# Rebuild after code changes
docker compose up -d --build
```

### Database Operations

```bash
# Backup database
docker exec customchatai-db pg_dump -U chatuser customchatai > backup.sql

# Restore database
cat backup.sql | docker exec -i customchatai-db psql -U chatuser customchatai

# Access database console
docker exec -it customchatai-db psql -U chatuser -d customchatai
```

## ⚠️ Troubleshooting

### App won't start
```bash
# Check logs
docker compose logs app

# Common issue: Database not ready
# Solution: Wait 30 seconds and restart
docker compose restart app
```

### No models available
```bash
# Pull at least one model
docker exec customchatai-model-runner ollama pull llama3
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# For example, change "3000:3000" to "3001:3000"
nano docker-compose.yml
docker compose up -d
```

### Database connection error
```bash
# Verify database is running
docker compose ps db

# Check database logs
docker compose logs db

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

## 📊 Performance Tips

### For CPU-only Servers

1. **Use quantized models** (4-bit or 8-bit)
   ```bash
   docker exec customchatai-model-runner ollama pull llama3:8b-instruct-q4_0
   ```

2. **Limit concurrent users** in rate limiting
   - Edit `.env` and set `RATE_LIMIT_REQUESTS=50`

3. **Monitor resources**
   ```bash
   docker stats
   ```

### For Better Response Times

1. **Use smaller models for testing**
   - llama3:8b-instruct-q4_0 (fast, good quality)
   - phi:latest (very fast, decent quality)

2. **Keep models loaded**
   - Models stay in memory after first use
   - Pre-warm by sending a test request

## 🎨 Customization

### Change Theme Colors

Edit `tailwind.config.ts` to customize colors, then rebuild:
```bash
docker compose up -d --build app
```

### Configure OAuth

1. **Google OAuth**
   - Get credentials from https://console.cloud.google.com
   - Add to `.env`:
     ```
     GOOGLE_CLIENT_ID=your-client-id
     GOOGLE_CLIENT_SECRET=your-client-secret
     ```

2. **GitHub OAuth**
   - Get credentials from https://github.com/settings/developers
   - Add to `.env`:
     ```
     GITHUB_CLIENT_ID=your-client-id
     GITHUB_CLIENT_SECRET=your-client-secret
     ```

3. Restart the app:
   ```bash
   docker compose restart app
   ```

## 📱 Mobile Access

The app is fully responsive! Access from mobile:

1. Find your server IP: `ip addr show` or `ifconfig`
2. Open http://YOUR_SERVER_IP:3000 on mobile
3. For HTTPS, set up Nginx reverse proxy (see README.md)

## 🔒 Security Checklist

Before going to production:

- [ ] Change `NEXTAUTH_SECRET` to a strong random value
- [ ] Change database password in docker-compose.yml and .env
- [ ] Set up HTTPS (Nginx reverse proxy)
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Regular backups
- [ ] Keep Docker images updated

## 📚 Learn More

- Full documentation: See README.md
- Admin dashboard: http://localhost:3000/admin
- API documentation: See README.md
- Ollama docs: https://ollama.ai/docs

## 🆘 Need Help?

1. Check logs: `docker compose logs -f`
2. Verify health: `curl http://localhost:3000/api/health`
3. Review PRD: `home-genai-chat-server-PRD.md`
4. Check troubleshooting section above

---

Enjoy your self-hosted AI chat! 🎉

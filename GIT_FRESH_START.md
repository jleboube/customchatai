# Git Fresh Start Instructions

This document contains the commands to clear all git history and prepare the repository for pushing to a new remote.

## Step 1: Remove Existing Git History

```bash
# Remove the existing .git directory (this deletes all git history)
rm -rf .git

# Verify git history is gone
ls -la .git
# Should show: "No such file or directory"
```

## Step 2: Initialize New Git Repository

```bash
# Initialize a new git repository
git init

# Set your git user info (if not already set globally)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Optional: Set default branch name to 'main' (recommended)
git branch -M main
```

## Step 3: Stage All Files

```bash
# Add all files to staging area (respects .gitignore)
git add .

# Verify what will be committed
git status
```

## Step 4: Create Initial Commit

```bash
# Create the first commit
git commit -m "Initial commit: CustomChatAI - Self-hosted AI chat platform

- Complete Next.js 15 application with TypeScript
- OpenAI-compatible API with full documentation
- Multi-user authentication and admin dashboard
- Docker Compose orchestration for easy deployment
- PostgreSQL database with Prisma ORM
- Ollama integration for AI model execution
- API key management with rate limiting
- Real-time model download progress tracking
- Auto-generated security secrets

Inspired by techno-boto-chat by Timothy Stewart
https://github.com/timothystewart6/techno-boto-chat"
```

## Step 5: Create New GitHub Repository

**Option A: Via GitHub Web Interface**

1. Go to https://github.com/new
2. Create a new repository (e.g., `customchatai`)
3. **DO NOT** initialize with README, .gitignore, or license (you already have these)
4. Copy the repository URL

**Option B: Via GitHub CLI**

```bash
# Create new repo via GitHub CLI (if installed)
gh repo create customchatai --public --source=. --remote=origin

# Or for private repo
gh repo create customchatai --private --source=. --remote=origin
```

## Step 6: Link to Remote and Push

**If you created via Web Interface (Option A):**

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/customchatai.git

# Verify remote was added
git remote -v

# Push to GitHub (first push)
git push -u origin main
```

**If you created via GitHub CLI (Option B):**

```bash
# Remote is already added, just push
git push -u origin main
```

## Step 7: Verify Push

```bash
# Verify your commit was pushed
git log --oneline

# Check remote status
git remote show origin
```

## Complete Command Sequence (Copy-Paste)

Here's the complete sequence for quick copy-paste:

```bash
# 1. Remove old git history
rm -rf .git

# 2. Initialize new repository
git init
git branch -M main

# 3. Stage all files
git add .

# 4. Create initial commit
git commit -m "Initial commit: CustomChatAI - Self-hosted AI chat platform

- Complete Next.js 15 application with TypeScript
- OpenAI-compatible API with full documentation
- Multi-user authentication and admin dashboard
- Docker Compose orchestration for easy deployment
- PostgreSQL database with Prisma ORM
- Ollama integration for AI model execution
- API key management with rate limiting
- Real-time model download progress tracking
- Auto-generated security secrets

Inspired by techno-boto-chat by Timothy Stewart
https://github.com/timothystewart6/techno-boto-chat"

# 5. Add remote (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/customchatai.git

# 6. Push to GitHub
git push -u origin main
```

## Additional Git Configuration (Optional)

### Set Up .gitattributes

Create `.gitattributes` for consistent line endings:

```bash
cat > .gitattributes << 'EOF'
# Auto detect text files and normalize line endings to LF
* text=auto

# Force LF for shell scripts
*.sh text eol=lf

# Force LF for specific files
Dockerfile text eol=lf
docker-compose.yml text eol=lf

# Denote binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
EOF

# Add and commit .gitattributes
git add .gitattributes
git commit -m "Add .gitattributes for consistent line endings"
git push
```

### Set Up Branch Protection (Recommended for Teams)

Via GitHub web interface:
1. Go to repository Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews before merging
   - Require status checks to pass before merging
   - Include administrators (optional)

### Set Up GitHub Actions CI/CD (Optional)

Create `.github/workflows/docker-build.yml`:

```yaml
name: Docker Build and Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker images
        run: docker compose build

      - name: Start services
        run: docker compose up -d

      - name: Wait for app to be ready
        run: sleep 30

      - name: Check app health
        run: curl -f http://localhost:3000/api/health || exit 1

      - name: Show logs if failed
        if: failure()
        run: docker compose logs

      - name: Stop services
        run: docker compose down
```

## Troubleshooting

### "Permission denied" when removing .git

```bash
# Make sure you're in the right directory
pwd

# Should show: /Users/joeleboube/Development/home-chat-server

# Try with sudo if needed (be careful!)
sudo rm -rf .git
```

### "Remote origin already exists"

```bash
# Remove the existing remote
git remote remove origin

# Add it again
git remote add origin https://github.com/YOUR_USERNAME/customchatai.git
```

### "Failed to push some refs"

```bash
# If you accidentally initialized the GitHub repo with files, force push (⚠️ destructive)
git push -u origin main --force

# Or better: pull and merge first
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Large files preventing push

```bash
# Check for large files
find . -type f -size +50M

# If you have large models committed by mistake, use git-lfs or remove them
git rm --cached path/to/large/file
echo "path/to/large/file" >> .gitignore
git commit -m "Remove large file and add to .gitignore"
```

## Next Steps After Pushing

1. **Add topics to GitHub repo**: Settings → Topics
   - Suggested: `ai`, `chatbot`, `ollama`, `nextjs`, `docker`, `self-hosted`, `openai-api`, `llm`

2. **Enable GitHub Discussions**: Settings → Features → Discussions

3. **Add LICENSE file** if you haven't already:
   ```bash
   # MIT License example
   curl -o LICENSE https://raw.githubusercontent.com/licenses/license-templates/master/templates/mit.txt
   # Edit LICENSE with your name and year
   git add LICENSE
   git commit -m "Add MIT License"
   git push
   ```

4. **Create GitHub Release**:
   - Go to Releases → Create a new release
   - Tag: `v1.0.0`
   - Title: `CustomChatAI v1.0.0 - Initial Release`
   - Description: Copy key features from README

5. **Set Repository Description**:
   - Go to repository main page
   - Click gear icon next to "About"
   - Add: "Self-hosted AI chat platform with OpenAI-compatible API. Built with Next.js, PostgreSQL, and Ollama."
   - Add website: Your deployment URL (if applicable)

## Cleanup This File

Once you've successfully pushed to your new repository, you can delete this instruction file:

```bash
git rm GIT_FRESH_START.md
git commit -m "Remove git setup instructions"
git push
```

---

**Questions?** Check the main README.md for full documentation.

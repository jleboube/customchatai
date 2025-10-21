# Model Management Guide

## Overview

CustomChatAI now includes a **Model Management** feature in the Admin Dashboard that allows you to download, view, and manage AI models without using the command line.

## Accessing Model Management

### Option 1: Via Admin Dashboard
1. Log in as an admin user
2. Navigate to **Admin Dashboard** (click "Admin" in the sidebar or go to `/admin`)
3. Click the **"Manage Models"** button in the header

### Option 2: Direct URL
Navigate to: `http://localhost:3000/admin/models`

## Downloading Models

### Popular Pre-configured Models

The Model Management page shows a list of popular models you can download with one click:

| Model | Size | Description |
|-------|------|-------------|
| `llama3.2:3b` | 2GB | Fast, efficient model - **Recommended for testing** |
| `llama3.2` | 4.7GB | Balanced performance (8B parameters) |
| `llama3.1` | 4.7GB | Latest Llama model (8B parameters) |
| `mistral` | 4.1GB | High quality responses (7B parameters) |
| `codellama` | 3.8GB | Optimized for code generation |
| `phi3` | 2.3GB | Small but capable Microsoft model |

**To download:**
1. Click the **"Download"** button next to the model you want
2. Wait for the download to complete (this can take several minutes)
3. Refresh the page to see the newly installed model in the "Installed Models" table

### Custom Models

You can also download any model from the [Ollama Library](https://ollama.com/library):

1. Go to https://ollama.com/library
2. Find the model you want (e.g., `mistral:7b-instruct`, `codellama:13b`)
3. Copy the model name
4. Paste it into the **"Download Custom Model"** input field
5. Click **"Download"**

**Examples of custom model names:**
- `llama3.2:1b` - Smallest Llama 3.2 (1GB)
- `mistral:7b-instruct` - Instruction-tuned Mistral
- `codellama:13b` - Larger Code Llama
- `gemma:2b` - Google's Gemma small model

## Viewing Installed Models

The **"Installed Models"** table shows:
- **Name**: The model identifier
- **Size**: Disk space used by the model
- **Modified**: When the model was last updated
- **Actions**: Delete button to remove the model

## Deleting Models

To free up disk space, you can delete unused models:

1. Find the model in the "Installed Models" table
2. Click the **"Delete"** button
3. Confirm the deletion
4. The model will be removed from the system

**Note:** Deleting a model will make it unavailable for chat. Users won't be able to select it in the model dropdown.

## Using Downloaded Models

Once a model is downloaded:

1. Go to the **Dashboard** (main chat interface)
2. The model will appear in the **model selector dropdown** in the right sidebar
3. Select the model and start chatting

**If no models show up:**
- Refresh the page
- Check that at least one model is installed in Model Management
- Verify the Ollama container is running: `docker compose ps`

## Command Line Alternative

If you prefer using the command line, you can still manage models via Docker:

### List installed models:
```bash
docker compose exec model-runner ollama list
```

### Download a model:
```bash
docker compose exec model-runner ollama pull llama3.2:3b
```

### Delete a model:
```bash
docker compose exec model-runner ollama rm llama3.2:3b
```

## Troubleshooting

### "No models installed" message
**Cause:** No models have been downloaded yet
**Solution:** Download at least one model using the Model Management page

### Model download stuck or slow
**Cause:** Large model size or slow internet connection
**Solution:**
- Start with smaller models (llama3.2:3b, phi3)
- Check your internet connection
- Download may take 5-30 minutes depending on model size

### Models not showing in chat
**Cause:** Page needs to be refreshed
**Solution:**
- Refresh the dashboard page
- Wait a few seconds after download completes
- Check `/api/models` endpoint to verify models are available

### "Failed to pull model" error
**Cause:** Invalid model name or Ollama service issue
**Solution:**
- Verify model name at https://ollama.com/library
- Check Ollama container: `docker compose logs model-runner`
- Ensure model name includes tag (e.g., `llama3.2:3b` not just `llama3.2`)

## Model Storage

- **Location:** Models are stored in the Docker volume `home-chat-server_model-data`
- **Persistence:** Models remain installed across container restarts
- **Space:** Monitor disk space - large models can use 4-15GB each

To see disk usage:
```bash
docker system df -v | grep model-data
```

## Recommended Starting Models

For a new installation, we recommend downloading these models in order:

1. **llama3.2:3b** (2GB) - Fast and efficient, great for testing
2. **mistral** (4.1GB) - High quality general-purpose responses
3. **codellama** (3.8GB) - If you need code generation

This gives you ~10GB of models covering general chat and code.

## API Integration

Models installed via the UI are automatically available through the API:

```bash
curl http://localhost:3000/api/models
```

Response:
```json
{
  "models": ["llama3.2:3b", "mistral", "codellama"]
}
```

## Security

- Only **ADMIN** users can access Model Management
- Regular users can only select from available models
- Model downloads require admin authentication

---

**Last Updated:** 2025-10-21
**Version:** 1.0.0

# AI Copilot Setup and Usage Guide

## 🚀 Complete AI Copilot Implementation

This guide covers the full setup and usage of the HireIQ Pro AI Copilot with LangChain, Langfuse, and n8n workflow integration.

## 📋 Prerequisites

### Required Services & API Keys

1. **OpenAI API Key** (Required)
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create API key and note your organization ID
   - Ensure you have sufficient credits for GPT-4 usage

2. **Langfuse Account** (Required for AI Observability)
   - Sign up at [Langfuse Cloud](https://cloud.langfuse.com/)
   - Create a new project
   - Get your public and secret keys

3. **n8n Account** (Required for Workflow Automation)
   - Sign up at [n8n Cloud](https://app.n8n.cloud/) or self-host
   - Create a new workflow
   - Set up webhook endpoints
   - Get your API key

### Optional Integrations

4. **Slack Integration** (Optional)
   - Create a Slack app at [Slack API](https://api.slack.com/)
   - Install to your workspace
   - Get bot token

5. **LinkedIn Integration** (Optional)
   - Create LinkedIn app at [LinkedIn Developers](https://developer.linkedin.com/)
   - Get client ID and secret

## 🔧 Installation Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Edit .env file with your API keys
# (See detailed configuration below)
```

### 2. Environment Configuration

Edit your `.env` file with the following configuration:

```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-actual-openai-key-here
OPENAI_ORG_ID=org-your-organization-id

# LangFuse Configuration (REQUIRED)
LANGFUSE_SECRET_KEY=sk-lf-your-secret-key
LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key
LANGFUSE_HOST=https://cloud.langfuse.com

# n8n Workflow Integration (REQUIRED)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/hire-iq-automation
N8N_API_KEY=your-n8n-api-key
N8N_BASE_URL=https://app.n8n.cloud

# Optional configurations...
DEBUG=True
LOG_LEVEL=INFO
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.development.example .env.development

# Start development server
npm start
```

### 4. Start the Application

```bash
# Backend (Terminal 1)
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (Terminal 2)
cd frontend
npm start
```

## 🤖 AI Copilot Features

### 1. Intelligent Chat Interface

The AI Copilot provides context-aware responses for:

- **General Hiring Questions**: Get AI-powered insights on hiring best practices
- **Candidate Analysis**: Deep analysis of specific candidates with AI recommendations
- **Job Matching**: Intelligent matching between candidates and job requirements
- **Bias Detection**: Real-time bias analysis with actionable recommendations
- **Workflow Automation**: Trigger and monitor automated hiring workflows

### 2. Context-Aware Conversations

```typescript
// Frontend usage example
const sendMessage = async (query: string, context: string) => {
  const response = await fetch('/api/v1/ai-copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
      context: context, // 'general', 'candidate_analysis', 'job_matching', etc.
      candidate_id: selectedCandidate,
      job_id: selectedJob
    })
  });
  
  const data = await response.json();
  return data;
};
```

### 3. Workflow Automation

Trigger automated workflows with AI enhancement:

```python
# Backend workflow triggering
workflow_result = await ai_orchestrator.trigger_workflow_automation(
    workflow_type="candidate_screening",
    context={
        "candidate_id": 123,
        "resume_text": "...",
        "job_description": {...},
        "priority": "high"
    }
)
```

## 🔌 Integration Details

### LangChain Integration

The AI Copilot uses LangChain for:
- **Prompt Management**: Structured prompts for different hiring scenarios
- **Memory Management**: Conversation context and history
- **Chain Orchestration**: Complex AI workflows
- **Model Switching**: Easy switching between different AI models

```python
# Example LangChain usage
chain = LLMChain(
    llm=self.llm,
    prompt=self.bias_detection_template,
    memory=self.memory,
    callbacks=[self.langfuse_handler]
)
```

### Langfuse Observability

Comprehensive AI monitoring including:
- **Trace Logging**: All AI interactions are traced
- **Performance Metrics**: Response times, token usage, costs
- **Error Tracking**: Failed requests and debugging information
- **Usage Analytics**: Patterns and insights from AI usage

```python
# Automatic tracing
trace = self.langfuse.trace(
    name="candidate-analysis",
    metadata={"candidate_id": candidate_id}
)
```

### n8n Workflow Automation

Available automated workflows:
- **Candidate Screening**: AI-enhanced resume analysis and scoring
- **Interview Scheduling**: Smart scheduling with availability optimization
- **Reference Checking**: Automated reference request and tracking
- **Onboarding Preparation**: New hire setup automation

## 📱 Frontend Usage

### 1. AI Copilot Interface

Navigate to the AI Copilot page in the frontend:

1. **Select Context**: Choose the type of assistance needed
2. **Enter Query**: Type your question or request
3. **Review Response**: Get AI-powered insights and recommendations
4. **Follow Actions**: Implement suggested action items

### 2. Context Types

- **General**: General hiring questions and best practices
- **Candidate Analysis**: Specific candidate evaluation and insights
- **Job Matching**: Find best candidates for specific roles
- **Bias Detection**: Analyze text for potential bias
- **Workflow Automation**: Trigger and monitor automated processes

### 3. Smart Recommendations

The AI Copilot provides:
- **Actionable Items**: Specific next steps to take
- **Priority Levels**: High, medium, low priority recommendations
- **Confidence Scores**: AI confidence in recommendations
- **Bias Assessments**: Automatic bias checking

## 🔍 API Endpoints

### Core AI Copilot Endpoints

```
POST /api/v1/ai-copilot/chat
- Main chat interface for AI interactions

POST /api/v1/ai-copilot/analyze-resume-intelligence
- Advanced resume analysis with AI

POST /api/v1/ai-copilot/detect-bias
- Real-time bias detection

POST /api/v1/ai-copilot/predict-hiring-success
- Hiring success probability prediction

GET /api/v1/ai-copilot/smart-interview-questions/{candidate_id}
- AI-generated interview questions

GET /api/v1/ai-copilot/find-similar-candidates
- Semantic candidate matching

GET /api/v1/ai-copilot/ai-insights/dashboard
- AI system insights and metrics

POST /api/v1/ai-copilot/workflow-automation
- Trigger automated workflows

GET /api/v1/ai-copilot/workflow-insights
- Workflow automation insights
```

## 🛠️ Troubleshooting

### Common Issues

1. **OpenAI API Errors**
   - Check API key validity
   - Verify sufficient credits
   - Ensure correct organization ID

2. **Langfuse Connection Issues**
   - Verify public/secret keys
   - Check network connectivity
   - Confirm project configuration

3. **n8n Workflow Failures**
   - Validate webhook URL
   - Check API key permissions
   - Verify workflow is active

### Debug Mode

Enable debug mode for detailed logging:

```env
DEBUG=True
LOG_LEVEL=DEBUG
```

### Testing the Integration

```bash
# Test AI Copilot functionality
python -m pytest backend/tests/test_ai_copilot.py -v

# Test individual components
python backend/test_integrations.py
```

## 📊 Monitoring and Analytics

### Langfuse Dashboard

Monitor AI performance at: `https://cloud.langfuse.com/project/your-project`

Key metrics to watch:
- Response times
- Token usage and costs
- Error rates
- User satisfaction

### n8n Workflow Monitoring

Track automation success at: `https://app.n8n.cloud/workflow`

Monitor:
- Workflow execution success rates
- Processing times
- Error patterns
- Resource usage

## 🚀 Advanced Features

### 1. Custom Prompts

Modify prompts in `ai_orchestrator.py`:

```python
self.custom_prompt = PromptTemplate(
    input_variables=["context", "query"],
    template="Your custom prompt template here..."
)
```

### 2. Additional Models

Add support for other AI models:

```python
# Add Claude, Gemini, or other models
from langchain_anthropic import ChatAnthropic

self.claude_llm = ChatAnthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    model="claude-3-sonnet"
)
```

### 3. Vector Database Integration

Enable semantic search with ChromaDB:

```python
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

self.vectorstore = Chroma(
    embedding_function=OpenAIEmbeddings(),
    persist_directory="./chroma_db"
)
```

## 🔒 Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables
   - Rotate keys regularly

2. **Data Privacy**
   - Ensure compliance with data protection regulations
   - Implement data retention policies
   - Use encryption for sensitive data

3. **Access Control**
   - Implement proper authentication
   - Use role-based access control
   - Monitor API usage

## 📖 Additional Resources

- [LangChain Documentation](https://docs.langchain.com/)
- [Langfuse Documentation](https://langfuse.com/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review logs in debug mode
3. Test individual components
4. Check API service status pages
5. Review integration documentation

The AI Copilot is now fully functional with comprehensive LangChain, Langfuse, and n8n integration!

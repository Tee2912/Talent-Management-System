# HireIQ Pro - Smart Hiring System

A comprehensive, AI-powered system to ensure fairness and efficiency in the hiring process using machine learning bias detection, intelligent analytics, workflow automation, and role-based personalized dashboards.

## Project Structure

```
hireiq-pro/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Main application entry
│   │   ├── config.py       # Application configuration
│   │   ├── models/         # Pydantic models and schemas
│   │   ├── api/            # API endpoints for all features
│   │   ├── ai/             # AI orchestration and services
│   │   └── workflows/      # Automated workflow definitions
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── candidates.json     # Sample candidate data
│   ├── interviews.json     # Sample interview data
│   └── job_description_full.json     # Sample job description data
├── frontend/               # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Navigation.tsx
│   │   │   ├── PageTransition.tsx
│   │   │   └── personality/  # Personality assessment components
│   │   ├── pages/          
│   │   │   ├── DashboardPersonalized.tsx  # Role-based home page
│   │   │   ├── ConsolidatedAnalytics.tsx
│   │   │   ├── PersonalityEvaluation.tsx
│   │   │   ├── AICopilot.tsx
│   │   │   └── [other feature pages]
│   │   ├── constants/      # Application constants and mock data
│   │   └── theme.ts        # Material-UI theme configuration
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── data/                   # Sample data, datasets, and generation scripts
├── tests/                  # Test files for backend and frontend
├── docs/                   # Project documentation
└── docker-compose.yml      # Docker setup for multi-container deployment
```

## Features

### **🏠 Personalized Role-Based Dashboard**
- **Dynamic Home Page**: Main landing page with role-specific interfaces
- **Three User Roles**: HR Assistant, Hiring Manager, and Interviewer with tailored statistics and features
- **Company-Wide Metrics**: Comprehensive candidate pipeline tracking, hiring rates, bias scores, and position-based analytics
- **Interactive Role Switching**: Live demo capabilities to explore different user perspectives

### **📊 Consolidated Analytics Dashboard**
- **Unified Interface**: A single, comprehensive dashboard for all hiring analytics, from basic metrics to advanced predictive models
- **Real-time Metrics**: Live candidate funnel analysis, diversity metrics, and performance indicators
- **Predictive Analytics**: ML-powered insights for success rate predictions and interviewer performance analysis
- **Interactive Visualizations**: Chart.js and Recharts integration for dynamic data presentation

### **🤖 AI-Powered Intelligence**
- **Resume Analyzer**: Evaluate resumes against job descriptions using Azure OpenAI GPT-4o
- **AI Copilot**: Smart assistant for interview question generation, candidate summaries, and hiring guidance
- **Enhanced Personality Assessment**: Multi-dimensional psychological evaluations with Big Five traits, cognitive abilities, and emotional intelligence
- **Intelligent Chat**: AI-powered candidate interaction and automated preliminary screening

### **⚖️ Bias Detection & Fairness**
- **Real-time Bias Detection**: ML algorithms to detect and flag potential bias in hiring decisions
- **Fair Scoring System**: Transparent and configurable scoring for candidates across all stages
- **Demographic Analytics**: Comprehensive diversity tracking and reporting
- **Compliance Monitoring**: GDPR compliance and audit trail capabilities

### **🔄 Workflow Automation**
- **Interview Management**: Automated scheduling, feedback collection, and candidate progression
- **Calendar Integration**: Seamless calendar synchronization for interview scheduling
- **Email Notifications**: Automated communication workflows for candidates and team members
- **Custom Reports**: Executive summaries, detailed metrics, and performance trend analysis

## Technology Stack

**Backend:**
- Python 3.11
- FastAPI
- scikit-learn, pandas, NumPy
- LangChain, Langfuse for AI orchestration
- Uvicorn for serving

**Frontend:**
- React 18
- TypeScript
- Material-UI
- Chart.js for data visualization
- React Router for navigation

## Getting Started

### Prerequisites
- Python 3.11
- Node.js 16+
- Docker and Docker Compose (optional, for containerized setup)

### Installation

1.  **Backend Setup:**
    ```bash
    cd backend
    
    # Create and activate virtual environment
    python -m venv venv
    
    # Activate virtual environment
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    ```

2.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    ```

3.  **Environment Variables:**
    - Create a `.env` file in the `backend` directory.
    - Add necessary API keys and configurations (e.g., `AZURE_OPENAI_API_KEY`).

### Running the Application

1.  **Start the Backend:**
    ```bash
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    ```

2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm start
    ```

3.  **Access the Application:**
    - **Frontend Dashboard**: http://localhost:3000
    - **Backend API**: http://localhost:8000
    - **Interactive API Docs**: http://localhost:8000/docs
    - **Alternative API Docs**: http://localhost:8000/redoc

### Quick Demo & Usage

1.  **🏠 Explore the Role-Based Dashboard**
    - Open http://localhost:3000
    - Use the role selector to switch between HR Assistant, Hiring Manager, and Interviewer
    - Observe different statistics, features, and company-wide metrics

2.  **👥 Candidate Management**
    - Navigate to **Candidates** to view and manage candidate profiles
    - Use the **Resume Analyzer** to evaluate resumes against job descriptions
    - Explore **Candidate Chat** for AI-powered interactions

3.  **📊 Analytics & Insights**
    - Visit **Consolidated Analytics** for comprehensive hiring metrics
    - Check **Bias Detection** for fairness monitoring
    - Review **Interview Feedback** and performance analytics

4.  **🤖 AI-Powered Features**
    - Try the **AI Copilot** for intelligent hiring assistance
    - Use **Personality Evaluation** for comprehensive candidate assessment
    - Explore **Email Notifications** for automated communications

5.  **⚙️ Advanced Features**
    - Configure **Calendar Integration** for interview scheduling
    - Review **Settings** for system customization
    - Access detailed reports and executive summaries

## API Documentation

The comprehensive API documentation is automatically generated by FastAPI and includes:

- **Interactive Documentation**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative Documentation**: `http://localhost:8000/redoc` (ReDoc)

### Key API Endpoints

**Core Features:**
- `/api/v1/candidates` - Candidate management and CRUD operations
- `/api/v1/analytics` - Basic hiring analytics and metrics
- `/api/advanced-analytics` - Advanced predictive analytics
- `/api/v1/bias` - Bias detection and fairness monitoring

**AI-Powered Services:**
- `/api/v1/chat` - AI-powered candidate chat interactions
- `/api/personality` - Enhanced personality assessment APIs
- `/api/ai-copilot` - AI assistant and recommendation engine
- `/api/resume-analyzer` - Resume evaluation and scoring

**Workflow Management:**
- `/api/v1/interviews` - Interview scheduling and management
- `/api/v1/notifications` - Email and notification services
- `/api/calendar` - Calendar integration endpoints
- `/api/reports` - Executive reports and custom analytics

## Project Documentation

This project includes comprehensive documentation:

- **[API Testing Guide](API_TESTING_GUIDE.md)** - Complete API testing procedures
- **[Personality Assessment Guide](PERSONALITY_ASSESSMENT_GUIDE.md)** - Detailed personality evaluation features
- **[Quick Deployment Guide](QUICK_DEPLOYMENT_GUIDE.md)** - Rapid deployment instructions
- **[Smart Features Guide](SMART_FEATURES_GUIDE.md)** - Advanced AI features overview
- **[Technical Implementation Guide](TECHNICAL_IMPLEMENTATION_GUIDE.md)** - Detailed technical documentation

## Sample Data

The project includes comprehensive sample data for testing:

- **`candidates.json`** - Sample candidate profiles with diverse backgrounds
- **`interviews.json`** - Mock interview data and feedback
- **`job_description_full.json`** - Complete job descriptions for testing
- **`data/mock_hiring_data/`** - Additional datasets for analytics

## Architecture Highlights

### **Role-Based Architecture**
- **Personalized Dashboards**: Different interfaces for HR Assistants, Hiring Managers, and Interviewers
- **Permission-Based Features**: Role-specific statistics, suggestions, and feature access
- **Dynamic Navigation**: Contextual navigation based on user responsibilities

### **AI Integration**
- **LangChain Framework**: Modular AI workflows with prompt engineering
- **Langfuse Observability**: AI interaction monitoring and performance tracking
- **Multi-Model Support**: GPT-4o for analysis, specialized models for personality assessment

### **Real-Time Analytics**
- **Live Metrics**: Real-time candidate pipeline tracking
- **Predictive Models**: ML-powered success rate predictions
- **Interactive Visualizations**: Dynamic charts with drill-down capabilities

## Performance & Scalability

- **Async Architecture**: FastAPI with async/await for high-performance APIs
- **Efficient Frontend**: React with optimized re-rendering and component memoization
- **Containerized Deployment**: Docker setup for consistent environments
- **Modular Design**: Loosely coupled components for easy scaling

## Security & Compliance

- **Data Privacy**: GDPR-compliant data handling and storage
- **Secure Authentication**: JWT-based authentication with bcrypt hashing
- **CORS Protection**: Configured cross-origin request handling
- **Bias Monitoring**: Continuous fairness assessment and reporting

## Contributing

We welcome contributions! Please read our contributing guidelines and code of conduct before contributing.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Follow the existing code style and conventions
4. Write tests for new features
5. Submit a pull request with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support & Contact

For technical support, feature requests, or questions:
- Review the comprehensive documentation in the `/docs` folder
- Check the API documentation at `http://localhost:8000/docs`
- Refer to the troubleshooting guides in the project documentation

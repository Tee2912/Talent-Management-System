# Fair Hiring System

A comprehensive system to ensure fairness in the hiring process using machine learning bias detection and mitigation techniques.

## Project Structure

```
fair-hiring-system/
├── backend/                 # Python Flask/FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py         # Main application entry
│   │   ├── models/         # ML models for bias detection
│   │   ├── api/            # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── requirements.txt
│   └── config.py
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/
│   └── package.json
├── data/                   # Sample data and datasets
├── tests/                  # Test files
├── docs/                   # Documentation
└── docker-compose.yml      # Docker setup
```

## Features

- **Bias Detection**: ML algorithms to detect bias in hiring decisions
- **Fair Scoring**: Transparent scoring system for candidates
- **Resume Analyzer**: Analyze and evaluate resume based on job descriptions with Azure OpenAI GPT-4o 
- **Dashboard**: Real-time analytics and reporting
- **Audit Trail**: Complete tracking of hiring decisions
- **Compliance**: GDPR and equal opportunity compliance

## Technology Stack

**Backend:**
- Python 3.9+
- FastAPI/Flask
- scikit-learn
- pandas
- NumPy
- SQLAlchemy
- Azure OpenAI GPT-4o
- PyPDF2

**Frontend:**
- React 18
- TypeScript
- Material-UI
- Chart.js
- Axios

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### Installation

1. **Backend Setup:**
   ```bash
   cd backend
   # Create virtual environment (if not already done)
   python -m venv .venv

   # Activate virtual environment
   .venv\Scripts\activate  # Windows
   # or source .venv/bin/activate  # macOS/Linux
   
   # Install dependencies
   pip install -r requirements.txt
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```

3. **API Key Setup:**
   ```bash
   # Create and configure the .env file
   cp .env.example .env

   # Add your Azure OpenAI API Key in the .env file
   AZURE_OPENAI_API_KEY=<your-api-key-here>
   ```

### Running the Application

1. **Start the Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start the Frontend:**
   ```bash
   cd frontend
   npm start
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Quick Demo

1. Open http://localhost:3000 in your browser
2. Navigate to the Candidates page to add sample candidates
3. Score candidates using the interface
4. Run bias detection analysis from the Bias Detection page
5. View analytics and insights on the Dashboard
6. Upload resume or paste resume in text for analysis against job descriptions

### Sample Data

Use the sample data generator to create test data:
```bash
cd data
python generate_sample_data.py
```

This creates 100 sample candidates with realistic data and some bias patterns for testing.

## API Documentation

The API documentation will be available at `http://localhost:8000/docs` when the backend is running.

## Contributing

Please read our contributing guidelines and code of conduct before contributing.

## License

This project is licensed under the MIT License.

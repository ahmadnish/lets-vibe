// GitHub API integration

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createGitHubRepo(interpretation, artifacts, milestones) {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error("GITHUB_TOKEN not configured");
  }

  const repoName = slugify(interpretation.title);

  // Get authenticated user
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!userResponse.ok) {
    const error = await userResponse.text();
    throw new Error(`GitHub API error getting user: ${error}`);
  }

  const user = await userResponse.json();
  const owner = user.login;

  // Create repository
  const createRepoResponse = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: repoName,
      description: interpretation.objectives[0] || "AI-generated project",
      private: true,
      auto_init: true,
    }),
  });

  if (!createRepoResponse.ok) {
    const error = await createRepoResponse.text();
    throw new Error(`GitHub API error creating repo: ${error}`);
  }

  const repo = await createRepoResponse.json();

  // Wait a moment for repo initialization
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Prepare file contents with disclaimer
  const disclaimer =
    "> **Note**: This is an AI-generated zero-shot implementation scaffold. Ready to run with placeholder functionality.\n\n";

  const readmeContent = disclaimer + (artifacts.readme || "# Project\n\nNo README content generated.");
  const paperContent = disclaimer + (artifacts.paper_draft || "# Paper\n\nNo paper content generated.");
  
  console.log("GitHub: README content length:", readmeContent.length);
  console.log("GitHub: README preview:", readmeContent.substring(0, 300));

  // Generate comprehensive project structure
  const projectFiles = generateProjectStructure(
    interpretation,
    artifacts,
    milestones,
  );

  // Create files
  const files = [
    { path: "README.md", content: readmeContent },
    { path: "docs/paper.md", content: paperContent },
    { path: "docs/API.md", content: artifacts.api_documentation },
    { path: "docs/DEPLOYMENT.md", content: artifacts.deployment_guide },
    { path: "docs/TESTING.md", content: artifacts.testing_strategy },
    { path: "docs/ARCHITECTURE.md", content: artifacts.code_structure },
    ...projectFiles,
  ];

  for (const file of files) {
    try {
      const createFileResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/contents/${file.path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Add ${file.path}`,
            content: Buffer.from(file.content).toString("base64"),
          }),
        },
      );

      if (!createFileResponse.ok) {
        const error = await createFileResponse.text();
        console.error(`GitHub API error creating ${file.path}: ${error}`);
      }
    } catch (err) {
      console.error(`Error creating file ${file.path}:`, err);
    }
  }

  return repo.html_url;
}

function generateProjectStructure(interpretation, artifacts, milestones) {
  const disclaimer = '"""\nAI-generated zero-shot implementation scaffold.\nReady to run with placeholder functionality.\n"""\n\n';
  
  // Determine primary technology stack
  const isPython = interpretation.primary_technologies.some(tech => 
    tech.toLowerCase().includes('python') || 
    tech.toLowerCase().includes('django') || 
    tech.toLowerCase().includes('flask') ||
    tech.toLowerCase().includes('fastapi')
  );
  
  const isNode = interpretation.primary_technologies.some(tech => 
    tech.toLowerCase().includes('node') || 
    tech.toLowerCase().includes('javascript') || 
    tech.toLowerCase().includes('typescript') ||
    tech.toLowerCase().includes('express') ||
    tech.toLowerCase().includes('react')
  );

  const files = [];

  if (isPython) {
    // Python project structure
    files.push(
      { path: "requirements.txt", content: generateRequirementsTxt(interpretation) },
      { path: "setup.py", content: generateSetupPy(interpretation) },
      { path: "src/__init__.py", content: "" },
      { path: "src/main.py", content: generateMainPython(interpretation, artifacts, milestones) },
      { path: "src/core/__init__.py", content: "" },
      { path: "src/core/system.py", content: generateSystemPython(interpretation, artifacts) },
      { path: "src/api/__init__.py", content: "" },
      { path: "src/api/routes.py", content: generateApiRoutes(interpretation) },
      { path: "src/utils/__init__.py", content: "" },
      { path: "src/utils/helpers.py", content: generateHelpers() },
      { path: "tests/__init__.py", content: "" },
      { path: "tests/test_main.py", content: generateTests(interpretation) },
      { path: "config.py", content: generateConfig() },
      { path: ".env.example", content: generateEnvExample() },
      { path: "Dockerfile", content: generateDockerfile("python") },
      { path: "docker-compose.yml", content: generateDockerCompose(interpretation) }
    );
  } else if (isNode) {
    // Node.js project structure
    files.push(
      { path: "package.json", content: generatePackageJson(interpretation) },
      { path: "src/index.js", content: generateMainNode(interpretation, artifacts, milestones) },
      { path: "src/core/system.js", content: generateSystemNode(interpretation, artifacts) },
      { path: "src/api/routes.js", content: generateApiRoutesNode(interpretation) },
      { path: "src/utils/helpers.js", content: generateHelpersNode() },
      { path: "tests/main.test.js", content: generateTestsNode(interpretation) },
      { path: "config/config.js", content: generateConfigNode() },
      { path: ".env.example", content: generateEnvExample() },
      { path: "Dockerfile", content: generateDockerfile("node") },
      { path: "docker-compose.yml", content: generateDockerCompose(interpretation) }
    );
  } else {
    // Generic structure
    files.push(
      { path: "src/main.py", content: generateMainPython(interpretation, artifacts, milestones) },
      { path: "requirements.txt", content: generateRequirementsTxt(interpretation) }
    );
  }

  // Common files
  files.push(
    { path: ".gitignore", content: generateGitignore() },
    { path: "LICENSE", content: generateLicense() },
    { path: "CONTRIBUTING.md", content: generateContributing() },
    { path: ".github/workflows/ci.yml", content: generateGitHubActions(interpretation) }
  );

  return files;
}

function generateRequirementsTxt(interpretation) {
  const baseDeps = [
    "fastapi>=0.104.1",
    "uvicorn>=0.24.0",
    "pydantic>=2.5.0",
    "python-dotenv>=1.0.0",
    "requests>=2.31.0",
    "pytest>=7.4.0",
    "pytest-asyncio>=0.21.0"
  ];

  const mlDeps = interpretation.primary_technologies.some(tech => 
    tech.toLowerCase().includes('machine learning') || 
    tech.toLowerCase().includes('deep learning') ||
    tech.toLowerCase().includes('ai')
  ) ? [
    "numpy>=1.24.0",
    "pandas>=2.0.0",
    "scikit-learn>=1.3.0",
    "torch>=2.0.0",
    "transformers>=4.35.0"
  ] : [];

  const webDeps = interpretation.primary_technologies.some(tech => 
    tech.toLowerCase().includes('web') || 
    tech.toLowerCase().includes('api')
  ) ? [
    "sqlalchemy>=2.0.0",
    "alembic>=1.12.0",
    "redis>=5.0.0"
  ] : [];

  return [...baseDeps, ...mlDeps, ...webDeps].join("\n") + "\n";
}

function generateSetupPy(interpretation) {
  return `from setuptools import setup, find_packages

setup(
    name="${interpretation.title.toLowerCase().replace(/\s+/g, '-')}",
    version="0.1.0",
    description="${interpretation.description.split('.')[0]}",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        line.strip() 
        for line in open("requirements.txt").readlines() 
        if line.strip() and not line.startswith("#")
    ],
    entry_points={
        "console_scripts": [
            "${interpretation.title.toLowerCase().replace(/\s+/g, '-')}=src.main:main",
        ],
    },
)
`;
}

function generateMainPython(interpretation, artifacts, milestones) {
  return `#!/usr/bin/env python3
"""
${interpretation.title}
${interpretation.description}

This is an AI-generated zero-shot implementation scaffold.
Ready to run with placeholder functionality.
"""

import asyncio
import logging
from typing import Dict, Any, List
from src.core.system import ProjectSystem
from src.api.routes import create_app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def main():
    """Main entry point"""
    logger.info("Starting ${interpretation.title}")
    
    # Initialize system
    system = ProjectSystem()
    await system.initialize()
    
    # Start API server if applicable
    if system.config.get("enable_api", True):
        app = create_app(system)
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000)
    else:
        # Run as standalone application
        await system.run()

if __name__ == "__main__":
    asyncio.run(main())
`;
}

function generateSystemPython(interpretation, artifacts) {
  return `"""
Core system implementation for ${interpretation.title}
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

logger = logging.getLogger(__name__)

class ProjectSystem:
    """
    Main system class implementing the core functionality
    """
    
    def __init__(self):
        self.config = self._load_config()
        self.initialized = False
        self.components = {}
        
    def _load_config(self) -> Dict[str, Any]:
        """Load system configuration"""
        return {
            "name": "${interpretation.title}",
            "version": "0.1.0",
            "enable_api": True,
            "log_level": "INFO"
        }
    
    async def initialize(self):
        """Initialize all system components"""
        logger.info("Initializing system components...")
        
        # TODO: Initialize based on technical requirements
        ${interpretation.technical_requirements.slice(0, 3).map(req => `# - ${req}`).join('\n        ')}
        
        self.initialized = True
        logger.info("System initialization complete")
    
    async def run(self):
        """Main system execution loop"""
        if not self.initialized:
            await self.initialize()
            
        logger.info("System running...")
        
        # TODO: Implement main business logic
        # Objectives to implement:
        ${interpretation.objectives.slice(0, 3).map((obj, i) => `# ${i + 1}. ${obj}`).join('\n        ')}
        
        # Placeholder main loop
        while True:
            await self.process_cycle()
            await asyncio.sleep(1)
    
    async def process_cycle(self):
        """Single processing cycle"""
        # TODO: Implement processing logic
        pass
    
    async def process_request(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process external requests"""
        logger.info(f"Processing request: {request_data}")
        
        # TODO: Implement request processing
        return {
            "status": "success",
            "timestamp": datetime.now().isoformat(),
            "result": "placeholder_result",
            "request_id": request_data.get("id", "unknown")
        }
    
    def get_status(self) -> Dict[str, Any]:
        """Get system status"""
        return {
            "initialized": self.initialized,
            "components": list(self.components.keys()),
            "uptime": "placeholder",
            "version": self.config["version"]
        }
`;
}

function generateApiRoutes(interpretation) {
  return `"""
API routes for ${interpretation.title}
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class RequestModel(BaseModel):
    data: Dict[str, Any]
    options: Optional[Dict[str, Any]] = None

class ResponseModel(BaseModel):
    status: str
    result: Any
    timestamp: str

def create_app(system) -> FastAPI:
    """Create FastAPI application"""
    
    app = FastAPI(
        title="${interpretation.title}",
        description="${interpretation.description}",
        version="0.1.0"
    )
    
    @app.get("/")
    async def root():
        """Root endpoint"""
        return {"message": "Welcome to ${interpretation.title}"}
    
    @app.get("/health")
    async def health():
        """Health check endpoint"""
        return system.get_status()
    
    @app.post("/process", response_model=ResponseModel)
    async def process_request(request: RequestModel):
        """Main processing endpoint"""
        try:
            result = await system.process_request(request.dict())
            return ResponseModel(**result)
        except Exception as e:
            logger.error(f"Processing error: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    return app
`;
}

function generateHelpers() {
  return `"""
Utility functions and helpers
"""

import json
import logging
from typing import Any, Dict, List
from datetime import datetime

logger = logging.getLogger(__name__)

def load_json_file(filepath: str) -> Dict[str, Any]:
    """Load JSON file safely"""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON file {filepath}: {e}")
        return {}

def save_json_file(data: Dict[str, Any], filepath: str) -> bool:
    """Save data to JSON file"""
    try:
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        logger.error(f"Error saving JSON file {filepath}: {e}")
        return False

def format_timestamp(dt: datetime = None) -> str:
    """Format timestamp for logging"""
    if dt is None:
        dt = datetime.now()
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def validate_config(config: Dict[str, Any], required_keys: List[str]) -> bool:
    """Validate configuration has required keys"""
    missing = [key for key in required_keys if key not in config]
    if missing:
        logger.error(f"Missing required config keys: {missing}")
        return False
    return True
`;
}

function generateTests(interpretation) {
  return `"""
Test suite for ${interpretation.title}
"""

import pytest
import asyncio
from src.core.system import ProjectSystem

@pytest.fixture
async def system():
    """Create test system instance"""
    system = ProjectSystem()
    await system.initialize()
    return system

@pytest.mark.asyncio
async def test_system_initialization():
    """Test system initializes correctly"""
    system = ProjectSystem()
    assert not system.initialized
    
    await system.initialize()
    assert system.initialized

@pytest.mark.asyncio
async def test_process_request(system):
    """Test request processing"""
    test_data = {"test": "data", "id": "test_123"}
    result = await system.process_request(test_data)
    
    assert result["status"] == "success"
    assert result["request_id"] == "test_123"
    assert "timestamp" in result

def test_system_status(system):
    """Test system status reporting"""
    status = system.get_status()
    
    assert "initialized" in status
    assert "version" in status
    assert status["version"] == "0.1.0"
`;
}

function generateConfig() {
  return `"""
Configuration management
"""

import os
from typing import Dict, Any

def load_config() -> Dict[str, Any]:
    """Load configuration from environment and defaults"""
    return {
        "database_url": os.getenv("DATABASE_URL", "sqlite:///app.db"),
        "redis_url": os.getenv("REDIS_URL", "redis://localhost:6379"),
        "api_key": os.getenv("API_KEY", ""),
        "debug": os.getenv("DEBUG", "false").lower() == "true",
        "log_level": os.getenv("LOG_LEVEL", "INFO"),
        "port": int(os.getenv("PORT", "8000")),
        "host": os.getenv("HOST", "0.0.0.0")
    }
`;
}

function generateEnvExample() {
  return `# Environment Configuration
# Copy this file to .env and update values

# Database
DATABASE_URL=sqlite:///app.db

# Redis (if needed)
REDIS_URL=redis://localhost:6379

# API Configuration
API_KEY=your_api_key_here
PORT=8000
HOST=0.0.0.0

# Logging
LOG_LEVEL=INFO
DEBUG=false

# External Services (update as needed)
OPENAI_API_KEY=your_openai_key_here
`;
}

function generateDockerfile(type) {
  if (type === "python") {
    return `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Run application
CMD ["python", "-m", "src.main"]
`;
  } else {
    return `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:3000/health || exit 1

# Run application
CMD ["node", "src/index.js"]
`;
  }
}

function generateDockerCompose(interpretation) {
  return `version: '3.8'

services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/appdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=appdb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
`;
}

function generateGitignore() {
  return `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
*.log
logs/

# Database
*.db
*.sqlite3

# OS
.DS_Store
Thumbs.db

# Node.js (if applicable)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Docker
.dockerignore
`;
}

function generateLicense() {
  return `MIT License

Copyright (c) ${new Date().getFullYear()} AI Generated Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function generateContributing() {
  return `# Contributing

Thank you for your interest in contributing to this project!

## Getting Started

1. Fork the repository
2. Clone your fork: \`git clone <your-fork-url>\`
3. Create a virtual environment: \`python -m venv venv\`
4. Activate it: \`source venv/bin/activate\` (Linux/Mac) or \`venv\\Scripts\\activate\` (Windows)
5. Install dependencies: \`pip install -r requirements.txt\`
6. Install development dependencies: \`pip install -r requirements-dev.txt\`

## Development Workflow

1. Create a feature branch: \`git checkout -b feature/your-feature\`
2. Make your changes
3. Run tests: \`pytest\`
4. Run linting: \`flake8 src/\`
5. Commit your changes: \`git commit -m "Add your feature"\`
6. Push to your fork: \`git push origin feature/your-feature\`
7. Create a Pull Request

## Code Style

- Follow PEP 8 for Python code
- Use type hints where appropriate
- Write docstrings for all functions and classes
- Keep functions small and focused
- Write tests for new functionality

## Testing

- Write unit tests for all new functionality
- Ensure all tests pass before submitting PR
- Aim for high test coverage
- Use meaningful test names and assertions

## Documentation

- Update README.md if adding new features
- Add docstrings to new functions and classes
- Update API documentation if applicable
`;
}

function generateGitHubActions(interpretation) {
  const projectName = interpretation.title.toLowerCase().replace(/\s+/g, '-');
  return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.8, 3.9, "3.10", "3.11"]

    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python \${{ matrix.python-version }}
      uses: actions/setup-python@v4
      with:
        python-version: \${{ matrix.python-version }}
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        pip install pytest pytest-cov flake8
    
    - name: Lint with flake8
      run: |
        flake8 src/ --count --select=E9,F63,F7,F82 --show-source --statistics
        flake8 src/ --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics
    
    - name: Test with pytest
      run: |
        pytest --cov=src --cov-report=xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.xml

  docker:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: docker build -t ${projectName}:latest .
    
    - name: Test Docker image
      run: |
        docker run --rm -d --name test-container -p 8000:8000 ${projectName}:latest
        sleep 10
        curl -f http://localhost:8000/health || exit 1
        docker stop test-container
`;
}

// Node.js specific generators (simplified versions)
function generatePackageJson(interpretation) {
  return JSON.stringify({
    "name": interpretation.title.toLowerCase().replace(/\s+/g, '-'),
    "version": "0.1.0",
    "description": interpretation.description.split('.')[0],
    "main": "src/index.js",
    "scripts": {
      "start": "node src/index.js",
      "dev": "nodemon src/index.js",
      "test": "jest",
      "lint": "eslint src/"
    },
    "dependencies": {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "helmet": "^7.1.0",
      "dotenv": "^16.3.1"
    },
    "devDependencies": {
      "nodemon": "^3.0.1",
      "jest": "^29.7.0",
      "eslint": "^8.52.0"
    },
    "engines": {
      "node": ">=16.0.0"
    }
  }, null, 2);
}

function generateMainNode(interpretation, artifacts, milestones) {
  return `/**
 * ${interpretation.title}
 * ${interpretation.description}
 * 
 * AI-generated zero-shot implementation scaffold.
 * Ready to run with placeholder functionality.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { ProjectSystem } = require('./core/system');
const routes = require('./api/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize system
const system = new ProjectSystem();

// Routes
app.use('/api', routes(system));

// Health check
app.get('/health', (req, res) => {
  res.json(system.getStatus());
});

// Start server
async function start() {
  try {
    await system.initialize();
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
`;
}

function generateSystemNode(interpretation, artifacts) {
  return `/**
 * Core system implementation for ${interpretation.title}
 */

class ProjectSystem {
  constructor() {
    this.config = this.loadConfig();
    this.initialized = false;
    this.components = {};
  }

  loadConfig() {
    return {
      name: "${interpretation.title}",
      version: "0.1.0",
      enableApi: true,
      logLevel: "INFO"
    };
  }

  async initialize() {
    console.log('Initializing system components...');
    
    // TODO: Initialize based on technical requirements
    ${interpretation.technical_requirements.slice(0, 3).map(req => `// - ${req}`).join('\n    ')}
    
    this.initialized = true;
    console.log('System initialization complete');
  }

  async processRequest(requestData) {
    console.log('Processing request:', requestData);
    
    // TODO: Implement request processing
    return {
      status: 'success',
      timestamp: new Date().toISOString(),
      result: 'placeholder_result',
      requestId: requestData.id || 'unknown'
    };
  }

  getStatus() {
    return {
      initialized: this.initialized,
      components: Object.keys(this.components),
      uptime: 'placeholder',
      version: this.config.version
    };
  }
}

module.exports = { ProjectSystem };
`;
}

function generateApiRoutesNode(interpretation) {
  return `/**
 * API routes for ${interpretation.title}
 */

const express = require('express');

function createRoutes(system) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json({ message: 'Welcome to ${interpretation.title}' });
  });

  router.post('/process', async (req, res) => {
    try {
      const result = await system.processRequest(req.body);
      res.json(result);
    } catch (error) {
      console.error('Processing error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createRoutes;
`;
}

function generateHelpersNode() {
  return `/**
 * Utility functions and helpers
 */

const fs = require('fs').promises;

async function loadJsonFile(filepath) {
  try {
    const data = await fs.readFile(filepath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(\`Error loading JSON file \${filepath}:\`, error);
    return {};
  }
}

async function saveJsonFile(data, filepath) {
  try {
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(\`Error saving JSON file \${filepath}:\`, error);
    return false;
  }
}

function formatTimestamp(date = new Date()) {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

module.exports = {
  loadJsonFile,
  saveJsonFile,
  formatTimestamp
};
`;
}

function generateTestsNode(interpretation) {
  return `/**
 * Test suite for ${interpretation.title}
 */

const { ProjectSystem } = require('../src/core/system');

describe('ProjectSystem', () => {
  let system;

  beforeEach(async () => {
    system = new ProjectSystem();
    await system.initialize();
  });

  test('should initialize correctly', () => {
    expect(system.initialized).toBe(true);
  });

  test('should process requests', async () => {
    const testData = { test: 'data', id: 'test_123' };
    const result = await system.processRequest(testData);
    
    expect(result.status).toBe('success');
    expect(result.requestId).toBe('test_123');
    expect(result.timestamp).toBeDefined();
  });

  test('should return system status', () => {
    const status = system.getStatus();
    
    expect(status.initialized).toBeDefined();
    expect(status.version).toBe('0.1.0');
  });
});
`;
}

function generateConfigNode() {
  return `/**
 * Configuration management
 */

function loadConfig() {
  return {
    databaseUrl: process.env.DATABASE_URL || 'sqlite://app.db',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    apiKey: process.env.API_KEY || '',
    debug: process.env.DEBUG === 'true',
    logLevel: process.env.LOG_LEVEL || 'INFO',
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || '0.0.0.0'
  };
}

module.exports = { loadConfig };
`;
}

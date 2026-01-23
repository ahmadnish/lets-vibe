# Vibe - AI Project Generator

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)

> Transform your project ideas into comprehensive, production-ready implementations with AI-powered project generation, team coordination, and automated artifact creation.

## 🚀 Overview

Vibe is an intelligent project generator that takes your ideas and transforms them into fully-structured, production-ready projects. Using advanced AI, it creates comprehensive project plans, assigns tasks to team members based on their expertise, and generates all necessary artifacts including code scaffolds, documentation, scientific papers, and deployment configurations.

### ✨ Key Features

- **🧠 Intelligent Project Interpretation**: AI analyzes your project idea and creates detailed specifications
- **👥 Smart Team Coordination**: Automatically assigns tasks based on team member expertise
- **📋 Comprehensive Planning**: Generates milestones, timelines, and parallel work optimization
- **🏗️ Production-Ready Scaffolds**: Creates complete project structures with best practices
- **📚 Auto-Documentation**: Generates README, API docs, deployment guides, and testing strategies
- **📄 Scientific Papers**: Creates publication-ready academic papers
- **🐙 GitHub Integration**: Automatically creates repositories with full project structure
- **📝 Notion Integration**: Sets up project workspaces and documentation

## 🏗️ Architecture

This is a monorepo containing:

- **`apps/web/`** - React Router web application with AI project generation
- **`apps/mobile/`** - React Native mobile application (Expo)

### Tech Stack

**Web Application:**
- **Frontend**: React 18, React Router 7, TypeScript
- **Styling**: Tailwind CSS, Chakra UI, Emotion
- **State Management**: Zustand, TanStack Query
- **AI Integration**: OpenAI GPT-4, Custom LLM utilities
- **External APIs**: GitHub API, Notion API
- **Build Tools**: Vite, Babel

**Mobile Application:**
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Authentication**: Custom auth system
- **Cross-Platform**: iOS, Android, Web

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- OpenAI API key
- GitHub Personal Access Token (optional)
- Notion API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/vibe-ai-project-generator.git
   cd vibe-ai-project-generator/anything
   ```

2. **Install dependencies**
   ```bash
   # Web application
   cd apps/web
   npm install
   
   # Mobile application (optional)
   cd ../mobile
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp apps/web/.env.example apps/web/.env
   ```

4. **Configure environment variables**
   ```env
   # Required
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional integrations
   GITHUB_TOKEN=your_github_token_here
   NOTION_API_KEY=your_notion_api_key_here
   ```

5. **Start development server**
   ```bash
   cd apps/web
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:4000`

## 💡 Usage

### Basic Project Generation

1. **Enter Your Idea**: Describe your project concept in the main input field
2. **Add Team Members**: Specify contributors and their expertise areas
3. **Special Instructions**: Add any specific requirements or preferences
4. **Generate**: Watch as AI creates your comprehensive project plan

### Advanced Features

#### Custom Expertise
- Use autocomplete suggestions for common expertise areas
- Add custom expertise by typing and pressing Enter
- Mix predefined and custom expertise for precise team matching

#### Special Instructions
Provide specific guidance such as:
- "Give more backend tasks to John"
- "Focus on 6-month timeline"
- "Prioritize mobile development"
- "Use Python and FastAPI for backend"

#### Real-time Progress
Watch the AI agent work through each step:
- Project interpretation and analysis
- Task and milestone generation
- Team assignment optimization
- Artifact creation (code, docs, papers)
- GitHub repository setup
- Notion workspace creation

## 🔧 API Reference

### Project Generation Endpoint

```typescript
POST /api/generate-project

// Request
{
  "project_idea": "Build an AI-powered medical imaging analysis tool",
  "special_instructions": "Focus on HIPAA compliance and real-time processing",
  "contributors": [
    {
      "name": "Dr. Sarah Chen",
      "expertise": ["Medical Imaging", "Deep Learning", "Python"]
    },
    {
      "name": "Alex Rodriguez", 
      "expertise": ["Backend Systems", "API Development", "Security"]
    }
  ]
}

// Response
{
  "title": "AI-Powered Medical Imaging Analysis Platform",
  "objectives": [...],
  "milestones": [...],
  "assignments": [...],
  "github_url": "https://github.com/user/repo",
  "notion_url": "https://notion.so/workspace/page",
  "paper_content": "# Research Paper...",
  "readme_content": "# Project README..."
}
```

## 🏭 Generated Artifacts

Each project generation creates:

### 📁 Project Structure
- Complete directory structure based on technology stack
- Configuration files (Docker, CI/CD, package management)
- Environment setup and dependencies

### 📚 Documentation
- **README.md**: Comprehensive project documentation
- **API.md**: Complete API documentation with examples
- **DEPLOYMENT.md**: Step-by-step deployment instructions
- **TESTING.md**: Testing strategies and frameworks
- **ARCHITECTURE.md**: System design and implementation guide

### 🔬 Scientific Paper
- Publication-ready academic paper
- Abstract, methodology, implementation details
- Expected results and evaluation criteria
- Proper citations and formatting

### 💻 Code Scaffolds
- **Python Projects**: FastAPI, pytest, Docker, CI/CD
- **Node.js Projects**: Express, Jest, ESLint, Docker
- **Ready-to-run**: Placeholder functionality with proper structure
- **Best Practices**: Type hints, error handling, logging

## 🚀 Deployment

### Web Application

#### Development
```bash
cd apps/web
npm run dev
```

#### Production
```bash
cd apps/web
npm run build
npm start
```

#### Docker
```bash
docker build -t vibe-web .
docker run -p 4000:4000 vibe-web
```

### Mobile Application

#### Development
```bash
cd apps/mobile
npm start
```

#### Build
```bash
# iOS
npm run ios

# Android  
npm run android

# Web
npm run web
```

## 🧪 Testing

```bash
# Web application tests
cd apps/web
npm test

# Mobile application tests
cd apps/mobile
npm test

# Type checking
npm run typecheck
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style

- Use TypeScript for type safety
- Follow React best practices
- Write comprehensive tests
- Document new features
- Use conventional commits

## 📊 Performance

- **Generation Time**: 30-60 seconds for complete project
- **Parallel Processing**: Optimized for team collaboration
- **Scalability**: Handles teams of 2-20 members
- **Artifact Quality**: Production-ready code and documentation

## 🔒 Security

- API keys stored securely in environment variables
- GitHub tokens with minimal required permissions
- No sensitive data stored in generated repositories
- CORS protection and input validation

## 🛣️ Roadmap

- [ ] **Multi-language Support**: Support for more programming languages
- [ ] **Template System**: Custom project templates
- [ ] **Team Analytics**: Project progress tracking and analytics
- [ ] **Integration Hub**: More third-party integrations (Jira, Slack, etc.)
- [ ] **AI Model Options**: Support for different AI models
- [ ] **Collaborative Editing**: Real-time project plan editing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- React Router team for the excellent framework
- Expo team for React Native tooling
- All contributors and beta testers

## 📞 Support

- **Documentation**: [docs.vibe-ai.com](https://docs.vibe-ai.com)
- **Issues**: [GitHub Issues](https://github.com/your-username/vibe-ai-project-generator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/vibe-ai-project-generator/discussions)
- **Email**: support@vibe-ai.com

---

**Made with ❤️ by the Vibe team**

*Transform ideas into reality with AI-powered project generation.*
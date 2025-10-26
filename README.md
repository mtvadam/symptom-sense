# SymptomSense - AI-Powered Medical Diagnostic Assistant

A two-page Angular MVP application for AI medical diagnostic chat interactions. Built with Angular 20 using standalone components and following best practices.

## Features

### Landing Page
- Medical disclaimer and privacy notice
- Clean, professional medical theme
- Responsive design
- Call-to-action button to start consultation

### Chat Interface
- **Text Messaging**: Type and send messages to the AI assistant
- **Voice Input**: Speech-to-text using Web Speech API
- **Image Upload**: Upload medical images (JPG/PNG, max 10MB)
- **Real-time Chat**: Bidirectional communication with AI
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages with auto-dismiss
- **Session Management**: 30-minute timeout with automatic session ID generation
- **Responsive Design**: Works on mobile, tablet, and desktop

## Technology Stack

- **Angular 20** (Latest version with standalone components)
- **TypeScript** (Strict mode)
- **RxJS** (Reactive programming)
- **Web Speech API** (Voice input)
- **HttpClient** (API communication)
- **Docker** (Containerization for easy deployment)
- **Nginx** (Production web server)

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── error-message/    # Error display component
│   │   ├── loading/           # Loading indicator
│   │   └── message/           # Message bubble component
│   ├── pages/
│   │   ├── landing/           # Landing page with disclaimers
│   │   └── chat/              # Main chat interface
│   ├── services/
│   │   ├── chat.service.ts    # API communication
│   │   ├── voice.service.ts   # Speech recognition
│   │   └── session.service.ts # Session management
│   ├── models/
│   │   ├── message.model.ts
│   │   ├── chat-request.model.ts
│   │   └── chat-response.model.ts
│   ├── constants/
│   │   └── app.constants.ts   # App-wide constants
│   ├── app.ts                 # Root component
│   ├── app.config.ts          # App configuration
│   └── app.routes.ts          # Route definitions
├── styles.css                 # Global styles
└── main.ts                    # Bootstrap file
```

## Installation & Quick Start

### 🚀 Automatic Setup (Recommended)

The easiest way to run the project - just one command:

```bash
# Clone the repository
git clone https://github.com/mirzaa5/symptom-sense.git
cd symptom-sense

# Start the application (automatically uses Docker)
npm start
```

The application will:
- ✅ Detect your operating system (Windows/Mac/Linux)
- ✅ Check if Docker is available
- ✅ Automatically start Docker containers if Docker is installed
- ✅ Fall back to local Node.js if Docker is not available
- ✅ Open at `http://localhost:4200`

**That's it!** No manual configuration needed.

### 📋 Available Commands

```bash
# Start with Docker (default)
npm start

# Start without Docker (uses local Node.js)
npm run start:local

# Direct Angular CLI (no scripts)
npm run start:direct

# Production Docker build
npm run build:docker

# Stop Docker containers
npm run stop:docker

# Traditional build
npm run build
```

### Option 1: Docker (Recommended - No Local Node.js Required)

**Prerequisites:** Docker Desktop

The project automatically uses Docker when you run `npm start`. Docker containers will be created and started automatically.

📖 **See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker instructions**

### Option 2: Local Development (Without Docker)

**Prerequisites:** Node.js 18+ and npm

```bash
# Install dependencies (only needed once)
npm install

# Start without Docker
npm run start:local
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## API Integration

The application expects a backend API endpoint at `/api/chat` that accepts POST requests:

### Request Format
```json
{
  "message": "string",
  "image": "string | null",  // base64 encoded image
  "session_id": "string"
}
```

### Response Format
```json
{
  "response": "string",
  "status": "string"
}
```

## Key Features Implementation

### 1. Voice Input
Uses the Web Speech API for speech-to-text conversion. The microphone button will only appear if the browser supports speech recognition.

### 2. Image Upload
- Validates file type (JPG/PNG only)
- Validates file size (max 10MB)
- Shows preview before sending
- Converts to base64 for API transmission

### 3. Session Management
- Generates unique UUID for each session
- 30-minute inactivity timeout
- Session ID sent with every API request

### 4. Error Handling
- Network errors
- File validation errors
- API errors
- Auto-dismiss after 5 seconds
- Manual dismiss option

### 5. Loading States
- Visual spinner during API calls
- Input fields disabled during loading
- "AI is thinking..." message

## Responsive Design

The application is fully responsive with breakpoints at:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Voice input**: Chrome, Safari (requires Web Speech API support)

## Color Palette

- Primary Blue: `#2563EB`
- User Message Background: `#DBEAFE`
- AI Message Background: `#F3F4F6`
- Page Background: `#F9FAFB`
- Text: `#111827`
- Error: `#EF4444`

## Angular Best Practices

This project follows Angular best practices:

- ✅ Standalone components (no NgModules)
- ✅ Lazy loaded routes
- ✅ TypeScript strict mode
- ✅ Reactive programming with RxJS
- ✅ Proper subscription management
- ✅ Service-based architecture
- ✅ Separation of concerns
- ✅ Async pipe in templates
- ✅ OnPush change detection where applicable
- ✅ Interface definitions for all models
- ✅ Constants for magic values

## Testing

Run unit tests:

```bash
npm test
```

## Deployment

### Docker Deployment (Recommended)

```bash
# Build and run production container
docker-compose up -d --build

# Deploy to container registry
docker build -t symptom-sense .
docker tag symptom-sense your-registry/symptom-sense:latest
docker push your-registry/symptom-sense:latest
```

### Static Hosting

The application can be deployed to any static hosting service:

1. Build the production version: `npm run build`
2. Deploy the contents of `dist/symptom-sense/browser` to your hosting service

Popular options:
- Netlify
- Vercel
- Firebase Hosting
- AWS S3 + CloudFront
- Azure Static Web Apps
- Docker containers (Kubernetes, AWS ECS, Azure Container Instances)

## Future Enhancements

Potential improvements for future versions:
- Chat history persistence
- User authentication
- Multi-language support
- Export chat transcript
- Dark mode theme
- Progressive Web App (PWA)
- More detailed analytics

## License

This project is built as an MVP demonstration application.

## Support

For issues or questions, please refer to the Angular documentation:
- [Angular Documentation](https://angular.dev)
- [Angular CLI](https://angular.dev/tools/cli)

---

**Note**: This is a medical-adjacent application. Always ensure proper disclaimers and compliance with relevant healthcare regulations (HIPAA, GDPR, etc.) before deploying to production.

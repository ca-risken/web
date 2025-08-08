# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Install dependencies
yarn install
# or
make install

# Run development server (http://localhost:8080)
yarn serve
# or
make run  # includes clean, install, fmt, lint steps

# Build for production
yarn build
yarn build-prd  # production mode

# Linting and formatting
yarn lint  # ESLint check
yarn prettier --write src  # Format code
yarn prettier --check src  # Check formatting
make fmt  # Format all source files
make lint  # Check formatting and lint

# Docker operations
make build  # Build Docker image
make push-image  # Push to registry
```

### Development Server Configuration
- Local dev server runs on port 8080
- API proxy configured to redirect `/api/v1` to `http://localhost:8000`
- Proxy automatically adds authentication headers for local development

## Architecture Overview

### Technology Stack
- **Frontend Framework**: Vue 3 with Composition API
- **UI Library**: Vuetify 3
- **Build Tool**: Vite
- **State Management**: Vuex 4 with persistence
- **Routing**: Vue Router 4
- **HTTP Client**: Axios with custom instances
- **i18n**: vue-i18n for Japanese/English support

### Project Structure
```
src/
├── component/       # Reusable Vue components
│   ├── dialog/     # Dialog components (finding details, triage, etc.)
│   ├── widget/     # UI widgets (charts, chat, tables)
│   └── layout/     # Layout wrapper components
├── mixin/          # API mixins for data fetching
│   └── api/        # Service-specific API modules
├── view/           # Route view components
│   ├── finding/    # Security finding views
│   ├── aws/        # AWS-specific views
│   ├── azure/      # Azure-specific views
│   ├── google/     # GCP-specific views
│   └── iam/        # Identity and access management
├── router/         # Vue Router configuration
└── store/          # Vuex store modules
```

### Key Architectural Patterns

#### Multi-Project Architecture
- Application supports multiple projects/tenants
- Project context stored in Vuex and persisted to localStorage
- Router guards enforce project_id query parameter on all routes
- Project switching handled via query parameter changes

#### API Communication Pattern
- All API calls go through axios instances with configured timeouts
- API mixins (`src/mixin/api/`) encapsulate service-specific logic
- Long-running operations use custom axios instance with 120s timeout
- Error handling redirects to home on API failures

#### State Management
- Vuex store persisted to localStorage (key: 'risken')
- Core state includes: user, project, interval, locale, findingHistory
- State mutations follow naming convention: `updateX`, `storeX`

#### Component Communication
- Dialog components use v-model pattern for open/close state
- Event emission for parent-child communication
- Props drilling minimized through Vuex store

### Security Context
RISKEN is a security monitoring platform that analyzes:
- Cloud infrastructure (AWS, Azure, GCP)
- Source code repositories (GitHub)
- Web applications (port scanning, WordPress scanning)
- OSINT data sources

The platform provides:
- Finding management with severity scoring
- Alert rules and notifications
- Attack flow analysis
- AI-powered chat for security analysis

### AI Chat Integration
- AI chat widget available globally via floating action button
- Supports contextual information for security analysis
- Chat history maintained during session
- Long polling timeout configured for AI responses (120s)

## Important Implementation Notes

### Authentication
- Authentication handled via OIDC headers in production
- Local development uses mock authentication headers via Vite proxy
- User context stored in Vuex and checked on route navigation

### Finding Management
- Findings have multiple states: active, pending, excluded
- Severity scores range 0.0-10.0
- Supports tagging and categorization
- Batch operations available for triage

### Data Source Integration
- Each cloud provider has dedicated data source configuration
- Status tracking for data source health
- Asynchronous scanning with progress indicators

### Internationalization
- Messages stored in `src/i18n/message/`
- Language preference persisted in store.locale
- Default language determined by browser settings
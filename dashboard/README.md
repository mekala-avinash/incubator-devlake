# DevLake Custom Dashboard

A modern, responsive dashboard built with Next.js for Apache DevLake metrics visualization and management.

## Features

- 🎨 **Material You Design** - Modern design system with light/dark theme support
- 📊 **Real-time Metrics** - Live dashboard with auto-refresh capabilities  
- 🔧 **Tool-specific Views** - Dedicated pages for Jenkins, GitHub, Kubernetes, etc.
- 🚨 **Alert Management** - Comprehensive alert history and filtering
- 📈 **Custom Reports** - Generate and export custom metrics reports
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ⚡ **Fast Performance** - Built with Next.js App Router and React Query

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with Material You theming
- **Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **State Management**: Zustand + React Query
- **TypeScript**: Full type safety
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn package manager
- Running DevLake instance

### Installation

1. Clone the repository and navigate to the dashboard:
```bash
cd /app/dashboard
```

2. Install dependencies:
```bash
yarn install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local`:
```env
DEVLAKE_ENDPOINT=http://localhost:8080
GRAFANA_ENDPOINT=http://localhost:3002
```

5. Start the development server:
```bash
yarn dev
```

The dashboard will be available at `http://localhost:3001`

### Production Build

```bash
yarn build
yarn start
```

## Project Structure

```
dashboard/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main dashboard pages
│   │   ├── [tool]/        # Tool-specific pages
│   │   └── page.tsx       # Overview dashboard
│   ├── alerts/            # Alert management
│   ├── reports/           # Custom reports
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── charts/           # Chart components
│   ├── layout/           # Layout components
│   └── providers/        # React providers
├── lib/                  # Utility functions
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── types/               # TypeScript definitions
│   └── metrics.ts       # Metrics type definitions
└── public/              # Static assets
```

## Key Components

### Dashboard Layout
- **Sidebar Navigation** - Tool navigation with collapsible menu
- **Header** - Time range picker, notifications, theme toggle
- **Main Content** - Responsive content area

### Chart Components
- **TimeSeriesCard** - Line charts with time-based data
- **MetricCard** - KPI cards with trend indicators  
- **FilterBar** - Multi-select filtering interface

### Pages
- **Dashboard Overview** - System-wide KPIs and recent activity
- **Tool Pages** - Specific metrics for Jenkins, GitHub, etc.
- **Alerts** - Alert history with filtering and search
- **Reports** - Custom report generation and export

## API Integration

The dashboard integrates with DevLake's REST API:

- **Overview Metrics**: `/api/metrics/overview`
- **Tool Metrics**: `/api/metrics/tools/{tool}`
- **Alerts**: `/api/metrics/alerts`
- **Export**: `/api/metrics/export`

Real-time updates are handled through:
- React Query for caching and background refetch
- WebSocket connections for live data (planned)

## Theming

The dashboard uses Material You design tokens:

- **Primary Colors**: Configurable brand colors
- **Surface Colors**: Background and container colors
- **State Colors**: Success, warning, error indicators
- **Dark Mode**: Automatic system preference detection

Colors are defined in `globals.css` and can be customized via CSS variables.

## Development

### Adding New Components

1. Create component in appropriate directory
2. Export from `index.ts` if needed
3. Add TypeScript types
4. Include in Storybook (if applicable)

### Adding New Pages

1. Create page in `app/` directory
2. Add route to navigation in `sidebar.tsx`
3. Implement layout if needed
4. Add API integration

### Customizing Themes

1. Update CSS variables in `globals.css`
2. Modify Tailwind config if needed
3. Test in both light and dark modes

## Deployment

The dashboard can be deployed as:

1. **Standalone Application** - Deploy to Vercel, Netlify, etc.
2. **Docker Container** - Use provided Dockerfile
3. **Static Export** - Generate static files with `next export`

### Environment Variables

Required for production:

```env
DEVLAKE_ENDPOINT=https://your-devlake-instance.com
GRAFANA_ENDPOINT=https://your-grafana-instance.com
NEXT_PUBLIC_APP_NAME=Your Dashboard Name
```

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Include tests for new functionality
4. Update documentation as needed

## License

Licensed under the Apache License, Version 2.0 - same as Apache DevLake.
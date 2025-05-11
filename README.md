# Function Finder Frontend

A modern web application for finding and managing events/functions. Built with Vue 3, TypeScript, and Pinia.

## Features

- View all events with their details (name, description, date, dress code)
- Filter events by country and city
- View and add comments to events
- Modern, responsive UI
- Type-safe codebase with TypeScript
- State management with Pinia
- Comprehensive test coverage

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd function-finder-frontend
```

2. Install dependencies:
```bash
npm install
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Testing

To run the tests:

```bash
npm test
```

To run tests with coverage:

```bash
npm run test:coverage
```

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── api/           # API service layer
├── components/    # Vue components
├── stores/        # Pinia stores
├── tests/         # Test files
├── types/         # TypeScript type definitions
└── views/         # Page components
```

## API Integration

The frontend expects the following API endpoints:

- `GET /events` - List all events
- `GET /events/Details/{id}` - Get event details
- `POST /events/{id}/comments` - Add a comment to an event
- `GET /countries` - List all countries
- `GET /cities` - List cities (filtered by country)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

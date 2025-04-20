# PlexPay

A modern financial management application built with React, Express, and PostgreSQL. PlexPay provides a comprehensive solution for managing financial data, generating reports, and analyzing financial metrics.

## 🚀 Features

- Modern, responsive UI built with React and TailwindCSS
- Real-time data updates with WebSocket support
- Secure authentication system
- Financial data visualization with Recharts
- PDF report generation
- Excel data export/import
- Type-safe development with TypeScript
- Modern UI components with Shadcn/Radix UI

## 🛠️ Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn UI (Radix UI components)
- React Query
- Wouter
- Recharts
- React Hook Form
- Zod for validation

### Backend

- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- Passport.js
- WebSocket (ws)
- Express Session

### Development Tools

- TypeScript
- ESLint
- PostCSS
- Drizzle Kit
- Vite

## 📋 Prerequisites

- Node.js 20 or higher
- npm or yarn
- PostgreSQL database (Neon)
- Docker (optional, for containerized deployment)

## 🚀 Getting Started

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone [repository-url]
   cd PlexPay
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:

   ```
   DATABASE_URL=your_database_url
   ```

4. **Run database migrations**

   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Production Build

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🐳 Docker Deployment

### Build the Docker Image

```bash
docker build -t financepro .
```

### Run the Container

```bash
docker run -p 3000:3000 --env-file .env financepro
```

## 📦 Project Structure

```
PlexPay/
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared types and utilities
├── drizzle.config.ts # Database configuration
├── package.json      # Project dependencies
└── tsconfig.json     # TypeScript configuration
```

## 🔒 Security Considerations

- HTTPS is required for production deployment
- Environment variables for sensitive data
- Secure session management
- CORS policies implementation
- Rate limiting implementation

## 📈 Performance Optimization

- Code splitting with Vite
- Production-ready builds
- Optimized Docker images
- Efficient database queries with Drizzle ORM

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, please open an issue in the repository or contact the maintainers.

---

Built with ❤️ using modern web technologies

# ReEvent

A full-stack event management application built with Next.js (frontend) and NestJS (backend).

## Features

- User authentication and authorization
- Activity/Event management
- Attendee management
- Real-time chat
- Profile management

## Tech Stack

### Frontend
- Next.js 15
- React 18
- Material-UI (MUI)
- Redux Toolkit for state management
- NextAuth for authentication
- Axios for API calls
- Formik for forms

### Backend
- NestJS
- TypeScript
- Sequelize ORM
- PostgreSQL database
- JWT authentication
- Passport strategies

### DevOps
- Docker Compose for local database setup
- Sequelize CLI for migrations

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for local database)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reevent-2
   ```

2. **Install dependencies**

   For the client:
   ```bash
   cd client
   npm install
   ```

   For the server:
   ```bash
   cd ../server
   npm install
   ```

3. **Set up the database**

   Start PostgreSQL using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**

   From the server directory:
   ```bash
   npx sequelize-cli db:migrate
   ```

5. **Configure environment variables**

   Create `.env` files in both `client` and `server` directories as needed. Refer to the respective package.json or source code for required variables.

## Running the Application

1. **Start the backend server**

   From the server directory:
   ```bash
   npm run start:dev
   ```

2. **Start the frontend client**

   From the client directory:
   ```bash
   npm run dev
   ```

3. **Access the application**

   Open your browser and navigate to `http://localhost:3000` for the frontend.

   The backend API will be available at `http://localhost:3001` (or as configured).

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Server
- `npm run start:dev` - Start development server with watch mode
- `npm run start:prod` - Start production server
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Project Structure

```
reevent-2/
├── client/          # Next.js frontend application
│   ├── src/
│   │   ├── app/     # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── store/   # Redux store and slices
│   │   └── ...
│   └── package.json
├── server/          # NestJS backend application
│   ├── src/
│   │   ├── modules/ # Feature modules (activities, accounts, chat)
│   │   ├── auth/    # Authentication logic
│   │   └── ...
│   ├── sequelize/   # Database migrations and models
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and unlicensed.
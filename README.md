# Auth-Micro-Service

Welcome to the Auth Micro service backend project! This app allows users to sign up, log in, and engage in conversations with an AI chatbot.Frontend Repos are here: [web](https://github.com/Muhammad-Abdullah012/auth-micro-service-frontend.git) [mobile](https://github.com/Muhammad-Abdullah012/auth-micro-service-mobile.git)

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)

- [Contributing](#contributing)
- [License](#license)

## Features

1. **User Signup:** New users can create an account by providing their email and password.
2. **User Login:** Registered users can log in securely to access the app.
3. **Chat with AI:** Once logged in, users can initiate conversations with an AI chatbot, providing an interactive and engaging experience.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Postgres DB](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Muhammad-Abdullah012/auth-micro-service.git
   ```
2. Navigate to project directory:
   ```bash
   cd auth-micro-service
   ```
3. Install dependencies:
   ```bash
   pnpm i
   ```
4. Copy env file and copy contents from `env.example` file and fill values. 
5. Run development server:
    ```bash
    pnpm dev
    # Sometime nodemon app crashes, in that case, build and run using node. (Note: Hot reload not supported with below command. You have to re-run these on every code change to take effect.) 
    pnpm build
    NODE_ENV=development node dist/server.js
    ```
## Using Docker
```bash
docker-compose up -d
# or
sudo docker-compose up -d
```


## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve this project.

## License

This project is licensed under the MIT License. Feel free to use, modify, and distribute the code as per the terms of the license.
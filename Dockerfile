FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install

# Copy frontend
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
RUN cd frontend && npm run build

# Create data directory
RUN mkdir -p /app/data

# Move built frontend to backend public folder
RUN mkdir -p /app/backend/public && \
    cp -r /app/frontend/dist/* /app/backend/public/

WORKDIR /app/backend

EXPOSE 3000

CMD ["node", "src/server.js"]

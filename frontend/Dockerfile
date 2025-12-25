# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package trước để tận dụng Docker Layer Caching
COPY package*.json ./

# Cài dependencies
# Dùng 'npm ci' nếu muốn cài chính xác version trong lock file, nhưng dev thì 'npm i' cho lẹ
RUN npm install

# Copy toàn bộ code vào
COPY . .

# Tắt telemetry của Next.js cho đỡ rác log
ENV NEXT_TELEMETRY_DISABLED 1

# Mở port 3000 (Port mặc định của Next.js)
EXPOSE 3000

# Chạy lệnh dev
CMD ["npm", "run", "dev"]
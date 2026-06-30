# node-server/Dockerfile
FROM node:20

# Tạo thư mục app
WORKDIR /app
ENV NODE_ENV=docker

# Copy package files và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .
COPY .env.docker .env.docker
# Mở port nếu cần (ví dụ 8081)
EXPOSE 8081

# Chạy server
CMD ["npm", "start"]

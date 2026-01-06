FROM node:20-slim
 
WORKDIR /app
 
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
&& rm -rf /var/lib/apt/lists/*
 
COPY package*.json ./
RUN npm install
 
# 👇 Copy Prisma schema BEFORE generate
COPY prisma ./prisma
 
# 👇 Generate Prisma Client
RUN npx prisma generate
 
# 👇 Now copy rest of the app
COPY . .
 
# 👇 Build TypeScript
RUN npm run build
 
EXPOSE 3000
CMD ["node", "dist/server.js"]

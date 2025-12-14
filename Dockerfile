FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY tsconfig.json ./
COPY server/ ./server/
COPY widget/ ./widget/

RUN npm install
RUN npm run build:widget

EXPOSE 5000

CMD ["npx", "tsx", "server/index.ts"]

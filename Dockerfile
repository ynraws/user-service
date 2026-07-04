FROM node:20-alpine
WORKDIR /app
RUN apk update && apk upgrade --no-cache
RUN npm install -g npm@latest
COPY package*.json .
RUN npm install --omit=dev
COPY src ./src
EXPOSE 4001
CMD ["node", "src/index.js"]

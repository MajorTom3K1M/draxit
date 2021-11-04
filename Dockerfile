FROM node:15
ENV NODE_ENV=production
WORKDIR /app
COPY package.json .
RUN npm install --force
COPY . ./
CMD ["node", "server.js"]

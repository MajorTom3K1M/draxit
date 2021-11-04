FROM node:15
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
COPY package.json .
RUN npm install --force
RUN npm install --save-dev webpack-cli@3.1.2
COPY . ./
CMD ["npm", "run", "start:dev"]

FROM node:15
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app
COPY package.json .
RUN npm install --force
COPY . ./
CMD ["npm", "start"]

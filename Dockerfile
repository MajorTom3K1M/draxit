FROM node:15
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY package.json /app
RUN npm install --force
EXPOSE $PORT
COPY . /app
CMD ["npm", "start"]

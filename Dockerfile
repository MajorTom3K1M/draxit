FROM node:15
ENV NODE_ENV=production
ENV PORT=3000
ENV MONGODB=mongodb://206.189.45.136:27017/draxit
WORKDIR /app
COPY package.json /app
RUN npm install --force
EXPOSE $PORT
COPY . /app
CMD ["npm", "start"]

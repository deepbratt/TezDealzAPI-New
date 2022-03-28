FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

COPY .npmrc ./

RUN npm install

COPY . .

EXPOSE 3004

CMD [ "npm", "start" ]
FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3003

CMD ["sh", "-c", "npx sequelize-cli db:migrate && npm start"]

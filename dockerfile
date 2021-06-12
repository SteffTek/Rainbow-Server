FROM node:14

WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY . /app/

EXPOSE 8892

CMD ["npm", "start"]

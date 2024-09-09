FROM node:20
RUN npm install pm2 -g
WORKDIR /usr/src/app
EXPOSE 3000 4000
COPY . .
RUN npm install
ENTRYPOINT ["sh", "-c", "pm2 start ecosystem.config.cjs && sleep infinity"]

FROM node:20.11.1
RUN npm install pm2 -g
WORKDIR /usr/src/app
EXPOSE 8080 3000 4000
COPY . .
RUN npm prune
RUN npm install
ENTRYPOINT ["sh", "-c", "pm2 start ecosystem.config.cjs && sleep infinity"]

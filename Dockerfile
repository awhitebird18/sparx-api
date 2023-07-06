# ! Important
# Since we rely in our code to environment variables for e.g. db connection
# this can only be run successfully with docker-compose file

# Specify node version and choose image
# also name our image as development (can be anything)
FROM node:18 AS development

FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "npm", "run", "start:dev" ]
# Use an argument to switch between environments
ARG NODE_ENV=development

# Set default environment
FROM node:18 as development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY /.env /app/.env
RUN npm run build
CMD [ "npm", "run", "start:dev" ]

# Use the production base image
FROM node:18-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=development /app/dist ./dist
COPY /.env.prod /app/.env
COPY /cert.pem /app/cert.pem
COPY /key.pem /app/key.pem
CMD ["npm", "run", "start:prod"]

# Use the argument to switch between the two
FROM ${NODE_ENV} as final
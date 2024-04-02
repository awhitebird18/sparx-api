# Use an argument to switch between environments
ARG NODE_ENV=development

# Set default environment
FROM node:18 as development
ENV TZ=America/New_York
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD [ "npm", "run", "start:dev-docker" ]

# Use the production base image
FROM node:18-alpine as production
ENV TZ=America/New_York
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=development /app/dist ./dist
CMD ["npm", "run", "start:prod"]

# Use the argument to switch between the two
FROM ${NODE_ENV} as final
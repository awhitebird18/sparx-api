# Use an argument to switch between environments
ARG NODE_ENV=development

# Set default environment
FROM node:18 as development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY ./cert.pem /app/cert.pem
COPY ./key.pem /app/key.pem
COPY ./.env /app/.env
COPY ./.env.prod /app/.env.prod
RUN npm run build
CMD [ "npm", "run", "start:dev" ]

# Use the production base image
FROM node:18-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=development /app/dist ./dist
COPY --from=development /app/cert.pem /app/cert.pem
COPY --from=development /app/key.pem /app/key.pem
COPY --from=development /app/.env /app/.env
COPY --from=development /app/.env.prod /app/.env.prod
CMD ["npm", "run", "start:prod"]

# Use the argument to switch between the two
FROM ${NODE_ENV} as final

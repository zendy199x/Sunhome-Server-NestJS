# ---- Builder Stage ----
FROM node:18-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /home/node

# Install Node.js and npm as root temporarily
USER root
RUN apk add --no-cache nodejs npm

USER node

COPY package*.json ./

COPY --chown=node:node . .

# Run npm install before building to ensure Nest dependencies are installed
RUN npm install

# Build the Nest application
RUN npm run build \
  && npm prune --production

# ---- Production Stage ----
FROM node:18-alpine

ENV NODE_ENV production

USER root
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/package*.json ./
COPY --from=builder --chown=node:node /home/node/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/dist/ ./dist/

USER node

CMD ["node", "dist/src/main.js"]

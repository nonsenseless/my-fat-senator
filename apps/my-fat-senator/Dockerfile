# base node image
FROM node:18-bullseye-slim as base
RUN npm install -g pnpm@9.1.4

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml nx.json ./
COPY packages/shared-ui/package.json packages/shared-ui/package.json
COPY apps/my-fat-senator/package.json apps/my-fat-senator/package.json

RUN pnpm install --prod=false

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp
COPY --from=deps /myapp/node_modules /myapp/node_modules
COPY --from=deps /myapp/apps/my-fat-senator/node_modules /myapp/apps/my-fat-senator/node_modules
COPY --from=deps /myapp/packages/shared-ui/node_modules /myapp/shared-ui//node_modules
# RUN pnpm prune --prod

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
COPY package.json pnpm-lock.yaml .npmrc pnpm-workspace.yaml nx.json tsconfig.json ./

ADD apps/my-fat-senator/ apps/my-fat-senator/
ADD packages/shared-ui packages/shared-ui

ENV DATABASE_URL=file:/data/sqlite.db
RUN npx nx run my-fat-senator:setup
RUN npx nx run shared-ui:build
RUN npx nx run my-fat-senator:build

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules

COPY --from=build /myapp/ /myapp/

ENTRYPOINT [ "apps/my-fat-senator/start.sh" ]

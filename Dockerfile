# base node image
FROM node:18-bullseye-slim as base

# set for base and all layer that inherit from it
ENV NODE_ENV production

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl sqlite3

# Install all node_modules, including dev dependencies
FROM base as deps

WORKDIR /myapp

ADD package.json package-lock.json ./
ADD packages/my-fat-senator/package.json packages/my-fat-senator/

RUN npm install --include=dev

# Setup production node_modules
FROM base as production-deps

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules
ADD package.json package-lock.json .npmrc ./
ADD packages/my-fat-senator/package.json packages/my-fat-senator/
RUN npm prune --omit=dev --include-workspace-root

# Build the app
FROM base as build

WORKDIR /myapp

COPY --from=deps /myapp/node_modules /myapp/node_modules

ADD packages/my-fat-senator/prisma packages/my-fat-senator/prisma
RUN npx prisma generate --schema ./packages/my-fat-senator/prisma/schema.prisma

ADD . .
RUN npm run build --workspace=my-fat-senator

# Finally, build the production image with minimal footprint
FROM base

ENV DATABASE_URL=file:/data/sqlite.db
ENV PORT="8080"
ENV NODE_ENV="production"

# add shortcut for connecting to database CLI
RUN echo "#!/bin/sh\nset -x\nsqlite3 \$DATABASE_URL" > /usr/local/bin/database-cli && chmod +x /usr/local/bin/database-cli

WORKDIR /myapp

COPY --from=production-deps /myapp/node_modules /myapp/node_modules
COPY --from=build /myapp/node_modules/.prisma /myapp/node_modules/.prisma

COPY --from=build /myapp/package.json /myapp/package.json
COPY --from=build /myapp/packages/my-fat-senator/build /myapp/packages/my-fat-senator/build
COPY --from=build /myapp/packages/my-fat-senator/public /myapp/packages/my-fat-senator/public
COPY --from=build /myapp/packages/my-fat-senator/package.json /myapp/packages/my-fat-senator/package.json
COPY --from=build /myapp/packages/my-fat-senator/start.sh /myapp/packages/my-fat-senator/start.sh
COPY --from=build /myapp/packages/my-fat-senator/prisma /myapp/packages/my-fat-senator/prisma

ENTRYPOINT [ "./packages/my-fat-senator/start.sh" ]

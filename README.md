# My Fat Senator Monorepo

## Log
20240825: Moved prisma to lib so workspaces can access the database without going through the my-fat-senator project. From the dependency perspective, this makes sense, but we may have regrets.

20240906: Setup basic import of vote record sans ballots.
20240913: Reformatted project as a monorepo with typescript support
20240914: Moved entity creation to services. Setup ballot processing. Schema does not currently support legislators changing district. Also realized the xml schema is cleaner than json _if only I had looked at the xml files at all_.

## Workspace commands
### Add a new workspace project
```
npm init -w ./packages/a
```

### Install a dependency to a workspace project
```
npm install abbrev -w a
```

### Consume a workspace
```
// ./workspace-a/index.js
module.exports = 'a'

// ./lib/index.js
const moduleA = require('workspace-a')
console.log(moduleA) // -> a
```
### Running commands in context of a workspace
```
npm run test --workspace=a

npm run test --workspaces --if-present
```

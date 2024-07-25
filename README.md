# My Fat Senator Monorepo

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

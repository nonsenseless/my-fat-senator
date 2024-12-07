# My Fat Senator Monorepo

## Log
20240825: Moved prisma to lib so workspaces can access the database without going through the my-fat-senator project. From the dependency perspective, this makes sense, but we may have regrets.

20240906: Setup basic import of vote record sans ballots.
20240913: Reformatted project as a monorepo with typescript support
20240914: Moved entity creation to services. Setup ballot processing. Schema does not currently support legislators changing district. Also realized the xml schema is cleaner than json _if only I had looked at the xml files at all_.
20240926: Decided to just call prisma directly in vote type loader. It's not clear what value is added by wrapping basic prisma calls since you have to import all your dependencies into the module where you're using the service anyway. Also I don't want to stop and set up DI just yet. 
20241006: I decided it didn't make sense to add CRUD screens to this app.
20241201: Back from vacation, returning a date from the server serializes it to a string and it doesn't automatically unserialize so will have to implement a workaround. Tailwind also continues to exist as an antipattern.
20241207: I don't want this whole log to be complaining about the ecosystem but now I'm digging into prisma more and the LIKE operator is only supported on postgres and TypedSQL let's you compile SQL to typesafe queries but doesn't support optional parameters. For any significant system, I'd prefer to use a data mapper closer to Petapoco.
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

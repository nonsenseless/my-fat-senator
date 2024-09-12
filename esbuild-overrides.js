const esbuild = require('esbuild');
const Module = require('module');

function manualExternalsPlugin() {
  return {
    name: 'manual-externals-overide',
    setup(build) {
      build.onResolve(
        {
          filter: /@my-fat-senator\/lib/,
        },
        (args) => {
          return {
            external: false,
            namespace: args.path,
          };
        },
      );
    },
  };
}

const originalRequire = Module.prototype.require;
const originalBuild = esbuild.build;

function build(options) {
  if (options.platform === 'node') {
    const { plugins } = options;
    const externalPlugin = plugins.find(
      (plugin) => plugin.name === 'manual-externals',
    );
    const localPlugins = plugins.filter(
      (plugin) => plugin.name !== 'manual-externals',
    );
    localPlugins.push(manualExternalsPlugin());
    localPlugins.push(externalPlugin);
    return originalBuild({
      ...options,
      plugins: localPlugins,
    });
  }
  return originalBuild({
    ...options,
  });
}

Module.prototype.require = function (id) {
  // when remix requires esbuild, it will get our modified build function from above
  if (id === 'esbuild') {
    return { ...esbuild, build };
  }
  return originalRequire.apply(this, arguments);
};
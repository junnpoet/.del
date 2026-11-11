const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Support symlinked node_modules across git worktrees
const localNodeModules = path.resolve(projectRoot, "node_modules");
if (fs.existsSync(localNodeModules)) {
  const realNodeModules = fs.realpathSync(localNodeModules);
  if (realNodeModules !== localNodeModules) {
    config.watchFolders = [projectRoot, realNodeModules];
    config.resolver.nodeModulesPaths = [localNodeModules, realNodeModules];
  }
}

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && moduleName === "react-native-maps") {
    return {
      filePath: path.resolve(__dirname, "src/components/mocks/react-native-maps.web.tsx"),
      type: "sourceFile",
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./src/global.css" });

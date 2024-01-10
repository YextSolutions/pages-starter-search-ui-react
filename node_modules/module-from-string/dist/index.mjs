import { Module, createRequire } from "module";
import vm, { runInNewContext, createContext } from "vm";
import { nanoid } from "nanoid";
import { dirname, resolve, isAbsolute, sep } from "path";
import { pathToFileURL, fileURLToPath, URL } from "url";
import { transform, transformSync } from "esbuild";
import { nanoid as nanoid$1 } from "nanoid/async";
const isInESModuleScope = () => {
  try {
    return module === void 0;
  } catch {
    return true;
  }
};
const isVMModuleAvailable = () => vm.Module !== void 0;
const FILE_URL_PROTOCOL = "file:";
const isFileURL = (value) => value.startsWith(FILE_URL_PROTOCOL);
const ensureFileURL = (value) => isFileURL(value) ? value : pathToFileURL(value).toString();
const ensurePath = (value) => isFileURL(value) ? fileURLToPath(value) : value;
const internalFunctionNames = [
  "getCallerDirname",
  "requireFromString",
  "importFromStringSync",
  "importFromString",
  "processTicksAndRejections"
];
const getCallerDirname = () => {
  var _a;
  const __prepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_err, stackTraces) => stackTraces;
  const callSites = new Error().stack.filter((callSite) => {
    const functionName = callSite.getFunctionName();
    return functionName === null || !internalFunctionNames.includes(functionName);
  });
  Error.prepareStackTrace = __prepareStackTrace;
  const caller = callSites[0];
  const callerFilename = (_a = caller.getFileName()) != null ? _a : process.argv[1];
  return dirname(ensurePath(callerFilename));
};
const ensureTrailingSeparator = (dirname2) => {
  const separator = isFileURL(dirname2) ? "/" : sep;
  return dirname2.endsWith(separator) ? dirname2 : `${dirname2}${separator}`;
};
const getModuleFilename = (dirname2, filename) => {
  if (isInESModuleScope()) {
    if (isFileURL(filename)) {
      return filename;
    } else {
      const validatedDirname = ensureTrailingSeparator(dirname2);
      return new URL(filename, ensureFileURL(validatedDirname)).toString();
    }
  } else {
    return resolve(ensurePath(dirname2), ensurePath(filename));
  }
};
const forEachPropertyKey = (context, callbackfn) => {
  Object.getOwnPropertyNames(context).forEach(callbackfn);
  Object.getOwnPropertySymbols(context).forEach(callbackfn);
};
const shallowMergeContext = (target, source) => {
  forEachPropertyKey(source, (propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      ...Object.getOwnPropertyDescriptor(source, propertyKey)
    });
  });
  return target;
};
const __GLOBAL__ = global;
const getCurrentGlobal = () => {
  const currentGlobal = shallowMergeContext({}, __GLOBAL__);
  delete currentGlobal.global;
  delete currentGlobal.globalThis;
  return currentGlobal;
};
const createGlobalObject = (globals, useCurrentGlobal) => {
  const globalObject = useCurrentGlobal ? getCurrentGlobal() : Object.defineProperty({}, Symbol.toStringTag, {
    ...Object.getOwnPropertyDescriptor(__GLOBAL__, Symbol.toStringTag)
  });
  forEachPropertyKey(globals, (propertyKey) => {
    if (propertyKey in __GLOBAL__) {
      Object.defineProperty(globalObject, propertyKey, {
        ...Object.getOwnPropertyDescriptor(__GLOBAL__, propertyKey),
        value: globals[propertyKey]
      });
    } else {
      Object.defineProperty(globalObject, propertyKey, {
        ...Object.getOwnPropertyDescriptor(globals, propertyKey)
      });
    }
  });
  return globalObject;
};
const createContextObject = (moduleContext, globalObject) => {
  const contextObject = shallowMergeContext(moduleContext, globalObject);
  if (!("global" in contextObject)) {
    contextObject.global = contextObject;
  }
  return contextObject;
};
const resolveModuleSpecifier = (specifier, dirname2) => {
  if (isFileURL(specifier)) {
    return specifier;
  }
  return specifier.startsWith(".") || isAbsolute(specifier) ? resolve(ensurePath(dirname2), specifier) : specifier;
};
const requireFromString = (code, {
  filename = `${nanoid()}.js`,
  dirname: dirname2 = getCallerDirname(),
  globals = {},
  useCurrentGlobal = false
} = {}) => {
  var _a;
  const moduleFilename = ensurePath(getModuleFilename(dirname2, filename));
  const mainModule = isInESModuleScope() ? void 0 : require.main;
  const contextModule = new Module(moduleFilename, mainModule);
  contextModule.require = createRequire(moduleFilename);
  contextModule.filename = moduleFilename;
  contextModule.paths = (_a = mainModule == null ? void 0 : mainModule.paths) != null ? _a : [];
  const globalObject = createGlobalObject(globals, useCurrentGlobal);
  const contextObject = createContextObject(
    {
      exports: contextModule.exports,
      require: contextModule.require,
      module: contextModule,
      __filename: contextModule.filename,
      __dirname: contextModule.path
    },
    globalObject
  );
  runInNewContext(code, contextObject, {
    filename: moduleFilename,
    async importModuleDynamically(specifier) {
      return await import(resolveModuleSpecifier(specifier, contextModule.path));
    }
  });
  contextModule.loaded = true;
  return contextModule.exports;
};
const createRequireFromString = (options) => (code, additionalOptions) => requireFromString(code, {
  ...options,
  ...additionalOptions
});
const USE_STRICT = '"use strict";';
const IMPORT_META_URL_SHIM = 'var import_meta_url = require("url").pathToFileURL(__filename).toString();';
const IMPORT_META_RESOLVE_SHIM = `function import_meta_resolve() {
  throw new Error(
    \`'import.meta.resolve' is not supported
Use asynchronous function 'importFromString' and enable '--experimental-vm-modules' CLI option.
Or use 'transformOptions' to include a polyfill. See https://github.com/evanw/esbuild/issues/1492#issuecomment-893144483 as an example.\`
  );
}`;
const getCommonJS = (transformOptions) => {
  var _a;
  return {
    ...transformOptions,
    banner: `${USE_STRICT}
${IMPORT_META_URL_SHIM}
${IMPORT_META_RESOLVE_SHIM}
${(_a = transformOptions == null ? void 0 : transformOptions.banner) != null ? _a : ""}`,
    define: {
      "import.meta.url": "import_meta_url",
      "import.meta.resolve": "import_meta_resolve",
      ...transformOptions == null ? void 0 : transformOptions.define
    },
    format: "cjs"
  };
};
const ERR_REQUIRE_ESM = "ERR_REQUIRE_ESM";
const IMPORTS = "__INTERNAL_IMPORTS_FROM_STRING";
const importFromString = async (code, { transformOptions, ...options } = {}) => {
  if (!isVMModuleAvailable()) {
    const { code: transformedCode2 } = await transform(code, getCommonJS(transformOptions));
    try {
      return requireFromString(transformedCode2, options);
    } catch (error) {
      if (error != null && error.code === ERR_REQUIRE_ESM) {
        throw new Error(
          `'import' statement of ES modules is not supported
Enable '--experimental-vm-modules' CLI option or replace it with dynamic 'import()' expression.`
        );
      }
      throw error;
    }
  }
  let transformedCode;
  if (transformOptions !== void 0) {
    ({ code: transformedCode } = await transform(code, {
      format: "esm",
      ...transformOptions
    }));
  }
  const {
    filename = `${await nanoid$1()}.js`,
    dirname: dirname2 = getCallerDirname(),
    globals = {},
    useCurrentGlobal = false
  } = options;
  const moduleFilename = getModuleFilename(dirname2, filename);
  const moduleFileURLString = ensureFileURL(moduleFilename);
  const globalObject = createGlobalObject(globals, useCurrentGlobal);
  const contextObject = createContextObject(
    {
      __dirname: ensurePath(dirname2),
      __filename: ensurePath(moduleFilename)
    },
    globalObject
  );
  contextObject[IMPORTS] = {};
  const context = createContext(contextObject);
  const vmModule = new vm.SourceTextModule(transformedCode != null ? transformedCode : code, {
    identifier: moduleFileURLString,
    context,
    initializeImportMeta(meta) {
      meta.url = moduleFileURLString;
    },
    async importModuleDynamically(specifier) {
      return await import(resolveModuleSpecifier(specifier, dirname2));
    }
  });
  const linker = async (specifier) => {
    const resolvedSpecifier = resolveModuleSpecifier(specifier, dirname2);
    const targetModule = await import(resolvedSpecifier);
    context[IMPORTS][specifier] = targetModule;
    const stringifiedSpecifier = JSON.stringify(specifier);
    const exportedNames = Object.keys(targetModule);
    const targetModuleContent = `${exportedNames.includes("default") ? `export default ${IMPORTS}[${stringifiedSpecifier}].default;
` : ""}export const { ${exportedNames.filter((exportedName) => exportedName !== "default").join(", ")} } = ${IMPORTS}[${stringifiedSpecifier}];`;
    return new vm.SourceTextModule(targetModuleContent, {
      identifier: resolvedSpecifier,
      context
    });
  };
  await vmModule.link(linker);
  await vmModule.evaluate();
  return vmModule.namespace;
};
const createImportFromString = (options) => async (code, additionalOptions) => await importFromString(code, {
  ...options,
  ...additionalOptions
});
const importFromStringSync = (code, { transformOptions, ...options } = {}) => {
  const { code: transformedCode } = transformSync(code, getCommonJS(transformOptions));
  try {
    return requireFromString(transformedCode, options);
  } catch (error) {
    if (error != null && error.code === ERR_REQUIRE_ESM) {
      throw new Error(
        `'import' statement of ES modules is not supported
Use asynchronous function 'importFromString' instead or replace it with dynamic 'import()' expression.`
      );
    }
    throw error;
  }
};
const createImportFromStringSync = (options) => (code, additionalOptions) => importFromStringSync(code, {
  ...options,
  ...additionalOptions
});
export { createImportFromString, createImportFromStringSync, createRequireFromString, importFromString, importFromStringSync, requireFromString };

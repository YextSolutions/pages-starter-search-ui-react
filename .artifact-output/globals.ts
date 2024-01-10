/**
 * Certain globals are not supported on the platform and will throw an error if used (i.e.
 * addEventListener). Here, we mimic that behaviour by overriding all unsupported global
 * objects/functions with an empty object/function that throws an error. This file is meant to stay
 * in sync with the platform's globals.ts file:
 * src/yext/platform/plugins/host-runner/worker/globals.ts
 */

/** An alias for the global object type. */
export type GlobalType = typeof globalThis;

/**
 * Overrides a set of global properties.
 *
 * All properties on the object that match global properties are assigned to the global object
 */
export type GlobalOverride =
    & { [P in keyof GlobalType]?: GlobalType[P] }
    & { activate?(): void };

/**
 * Manages the global environment for a plugin worker. Meant to simulate the limitations of
 * the platform's plugin worker
 */
export class PluginGlobalEnvironment {
  #initialValues: GlobalType;
  #initialProperties: PropertyDescriptorMap;

  /**
     * Initializes a new plugin global environment.
     */
  constructor() {
    // Capture initial global values (as properties, since evaluating some may throw)
    this.#initialValues = {} as GlobalType;
    this.#initialProperties = Object.getOwnPropertyDescriptors(globalThis);
    Object.defineProperties(this.#initialValues, this.#initialProperties);
  }

  /**
     * Applies method/value overrides to all configured globals
     */
  activate() {
    for (const key in restrictedGlobals) {
      this.#defineGlobal(key, restrictedGlobals[key]);
    }
  }

  /**
     * Defines a global property. Metadata not present in the provided PropertyDescriptor is
     * inherited from the original definition of the property.
     *
     * @param key The key
     * @param prop The property descriptor
     */
  #defineGlobal(key: string, prop: PropertyDescriptor) {
    const orig = this.#initialProperties[key as string];
    const full = {
      configurable: orig?.configurable,
      enumerable: orig?.enumerable,
      ...prop,
    };
    if (Object.hasOwn(prop, 'value') && !Object.hasOwn(prop, 'writable')) {
      full.writable = orig?.writable;
    }
    Object.defineProperty(globalThis, key, full);
  }
}

// A global property map which restricts features according to globalConfig. This stores the
// function/value which should override the default global value/function
const restrictedGlobals: PropertyDescriptorMap = {};

// Specifies which globals to allow and deny by default.
const globalConfig: { [K in keyof GlobalType]: boolean } = {
  // Global accessors
  self: true,
  globalThis: true,

  // Restricted features
  WebAssembly: false,
  eval: false,
  queueMicrotask: false,

  // Start of platform overrides ---------------------------------------------
  // Marked false on platform but not locally. The platform applies custom override to
  // mimic default JS behaviour for each of these globals. We don't need to do that here since
  // the default implementations work fine locally

  fetch: true,
  setTimeout: true,
  setInterval: true,
  clearInterval: true,
  clearTimeout: true,

  // For EventTypes, the platform applies a custom override to redirect event handler messages
  // to a custom event target that is reset for each activation, and ignores any messages
  // posted to the worker owner. Platform's implementation can be found here:
  // gocode/src/yext/platform/plugins/host-runner/worker/events.ts
  addEventListener: true,
  removeEventListener: true,
  dispatchEvent: true,

  // End of platform overrides -----------------------------------------------

  // Marked false on platform but not locally. Needed for local generation to work
  Deno: true,

  // Worker properties
  name: true,
  location: true,
  navigator: false,

  // Worker events/life-cycle control
  close: false,
  onerror: false,
  postMessage: false,
  onmessage: false,
  onmessageerror: false,
  reportError: false,
  onunhandledrejection: false,

  // Cache API
  //
  // By default, these would leak data between plugins (we would need to pass a unique --location
  // domain for each runner to isolate them). Even if isolated, just using these implies file i/o
  // to some temporary directory; disable that for now.
  caches: false,
  CacheStorage: false,
  Cache: false,

  // Primitive functions/properties
  parseInt: true,
  parseFloat: true,
  isNaN: true,
  isFinite: true,
  decodeURI: true,
  decodeURIComponent: true,
  encodeURI: true,
  encodeURIComponent: true,
  escape: true,
  unescape: true,
  atob: true,
  btoa: true,
  undefined: true,
  console: true,
  performance: true,
  crypto: true,
  NaN: true,
  Infinity: true,
  structuredClone: true,

  // Global types
  Symbol: true,
  Object: true,
  Function: true,
  String: true,
  Number: true,
  Boolean: true,
  Math: true,
  Date: true,
  RegExp: true,
  Error: true,
  EvalError: true,
  RangeError: true,
  ReferenceError: true,
  SyntaxError: true,
  TypeError: true,
  URIError: true,
  JSON: true,
  Array: true,
  Promise: true,
  ArrayBuffer: true,
  DataView: true,
  Int8Array: true,
  Uint8Array: true,
  Uint8ClampedArray: true,
  Int16Array: true,
  Uint16Array: true,
  Int32Array: true,
  Uint32Array: true,
  Float32Array: true,
  Float64Array: true,
  Intl: true,
  Map: true,
  WeakMap: true,
  Set: true,
  WeakSet: true,
  Proxy: true,
  Reflect: true,
  SharedArrayBuffer: true,
  Atomics: true,
  BigInt: true,
  BigInt64Array: true,
  BigUint64Array: true,
  AggregateError: true,
  WeakRef: true,
  FinalizationRegistry: true,
  AbortSignal: true,
  FileReader: true,
  ReadableStreamBYOBReader: true,
  ReadableStreamDefaultReader: true,
  ReadableStreamDefaultController: true,
  ReadableByteStreamController: true,
  ReadableStream: true,
  WritableStream: true,
  WritableStreamDefaultWriter: true,
  TransformStream: true,
  SubtleCrypto: true,
  CryptoKey: true,
  CryptoKeyPair: true,
  FormData: true,
  TextDecoder: true,
  TextEncoder: true,
  TextDecoderStream: true,
  TextEncoderStream: true,
  CountQueuingStrategy: true,
  ByteLengthQueuingStrategy: true,
  WritableStreamDefaultController: true,
  TransformStreamDefaultController: true,
  WorkerGlobalScope: true,
  WorkerNavigator: true,
  WorkerLocation: true,
  DedicatedWorkerGlobalScope: true,
  ErrorEvent: true,
  PromiseRejectionEvent: true,
  Worker: true,
  Performance: true,
  PerformanceEntry: true,
  PerformanceMark: true,
  PerformanceMeasure: true,
  CustomEvent: true,
  Headers: true,
  Request: true,
  Response: true,
  DOMException: true,
  Event: true,
  EventTarget: true,
  ProgressEvent: true,
  AbortController: true,
  Blob: true,
  File: true,
  ReadableStreamBYOBRequest: true,
  MessageEvent: true,
  MessageChannel: true,
  MessagePort: true,
  CompressionStream: true,
  DecompressionStream: true,
  CloseEvent: true,
  WebSocket: true,
  Crypto: true,
  URLSearchParams: true,
  URL: true,
  URLPattern: true,
};

// Populate restrictedGlobals with the functions/values which should override their native
// implementations.
for (const key in globalConfig) {
  const globalKey = key as keyof GlobalType;
  // if the global is not referenced in the current environment, skip it
  if (!(globalKey in globalThis)) {
    continue;
  }

  // if the global is not allowed, override it with a function/value which throws an error
  if (!globalConfig[globalKey]) {
    if (globalThis[globalKey] instanceof Function) {
      restrictedGlobals[key] = {get: () => () => unsupported(key)};
    } else {
      restrictedGlobals[key] = {value: undefined};
    }
  }
}

// Throws an error indicating a global is unsupported.
function unsupported(key: string) {
  throw new Error(`${key} is not supported`);
}

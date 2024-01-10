/// <reference types="node" />
import { Context } from 'vm';
import { TransformOptions } from 'esbuild';

interface Options {
    filename?: string | undefined;
    dirname?: string | undefined;
    globals?: Context | undefined;
    useCurrentGlobal?: boolean | undefined;
}
declare const requireFromString: (code: string, { filename, dirname, globals, useCurrentGlobal }?: Options | undefined) => any;
declare const createRequireFromString: (options?: Options | undefined) => typeof requireFromString;

interface ImportOptions extends Options {
    transformOptions?: TransformOptions | undefined;
}
declare const importFromString: (code: string, { transformOptions, ...options }?: ImportOptions | undefined) => Promise<any>;
declare const createImportFromString: (options?: ImportOptions | undefined) => typeof importFromString;
declare const importFromStringSync: (code: string, { transformOptions, ...options }?: ImportOptions | undefined) => any;
declare const createImportFromStringSync: (options?: ImportOptions | undefined) => typeof importFromStringSync;

export { ImportOptions, Options, createImportFromString, createImportFromStringSync, createRequireFromString, importFromString, importFromStringSync, requireFromString };

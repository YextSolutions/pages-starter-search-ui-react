# esm-module-paths

ESM modules don't allow to use [`__dirname`](https://nodejs.org/docs/latest/api/modules.html#modules_dirname) and [`__filename`](https://nodejs.org/docs/latest/api/modules.html#modules_filename) do determine a `.js` file's location.
Instead, you need to copy/paste [multiple lines and expressions](https://stackoverflow.com/a/50052194) each time to achieve the same.

This package makes this a bit easier.

## Usage

Imagine a file in `./your/path/index.js`

```js
import { getModulePaths } from "esm-module-paths";

const { __dirname, __filename } = getModulePaths();

console.log(__dirname); // /your/path
console.log(__filename); // /your/path/index.js
```

For convenience reasons, the library also exports `__filename` and `__dirname` as functions, which can be used independently.

```js
import { __filename, __dirname } from "esm-module-paths";

console.log(__dirname()); // /your/path
console.log(__filename()); // /your/path/index.js
```

Since `__dirname` and `__filename` being functions may be confusing to some, especially since those used to be variables, this package also exports aliased, more descriptive versions of each function.

```js
import { getFileName, getDirName } from "esm-module-paths";

console.log(getDirName()); // /your/path
console.log(getFileName()); // /your/path/index.js
```

## Installation

```sh
npm install esm-module-paths
```

or

```sh
yarn add esm-module-paths
```

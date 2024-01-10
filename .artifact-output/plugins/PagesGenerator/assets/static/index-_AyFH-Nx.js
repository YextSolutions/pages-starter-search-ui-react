import{r as m}from"./index-b6fS6yC-.js";var _={exports:{}},o={};/** @license React v17.0.2
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var u=m,i=60103;o.Fragment=60107;if(typeof Symbol=="function"&&Symbol.for){var l=Symbol.for;i=l("react.element"),o.Fragment=l("react.fragment")}var y=u.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,v=Object.prototype.hasOwnProperty,x={key:!0,ref:!0,__self:!0,__source:!0};function a(t,r,f){var e,n={},s=null,p=null;f!==void 0&&(s=""+f),r.key!==void 0&&(s=""+r.key),r.ref!==void 0&&(p=r.ref);for(e in r)v.call(r,e)&&!x.hasOwnProperty(e)&&(n[e]=r[e]);if(t&&t.defaultProps)for(e in r=t.defaultProps,r)n[e]===void 0&&(n[e]=r[e]);return{$$typeof:i,type:t,key:s,ref:p,props:n,_owner:y.current}}o.jsx=a;o.jsxs=a;_.exports=o;var d=_.exports;export{d as j};

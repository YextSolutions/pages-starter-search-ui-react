import {serve} from 'https://deno.land/std@0.125.0/http/server.ts';
import {PluginGlobalEnvironment} from './globals.ts';

let dynamicImports = new Map<string, any>();
let pathToPluginInfo = new Map<string, any>();

enum EventType {
    Event_UNKNOWN_EVENT,
    Event_ON_URL_CHANGE,
    Event_ON_PAGE_GENERATE,
    Event_API,
}

const requiredUploadPluginInfoParams: string[] = [
  'pathToPluginInfo',
];

const requiredParamsPerPlugin: string[] = [
  'functionFilePath',
  'functionName',
  'eventType',
];

const eventTypeSpecificParams = new Map<EventType, string[]>([
  // keep this in sync with gocode/src/yext/publish/sitesplugins/pkg/onpagegenerate/onurlchange/arguments.go
  [EventType.Event_ON_PAGE_GENERATE, [
    'feature',
    'streamOutput',
    'site',
  ]],
  // keep this in sync with gocode/src/yext/publish/sitesplugins/pkg/pluginarguments/onurlchange/arguments.go
  [EventType.Event_ON_URL_CHANGE, [
    'url',
    'entityId',
    'locale',
    'feature',
    'path',
    'domains',
    'site',
  ]],
  // keep this in sync with gocode/src/yext/consumerweb/serving/pkg/plugin/plugin.go#PluginRequestJson
  [EventType.Event_API, [
    'userAgent',
    'headers',
    'method',
    'body',
    'site',
    'queryParams',
    'pathParams',
    'referrer',
    'referrerPolicy',
    'url',
    'cache',
  ]],
  [EventType.Event_UNKNOWN_EVENT, []],
]);

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname == '/status') {
    return returnResponse(JSON.stringify({status: 'Healthy'}), 200);
  } else if (url.pathname == '/uploadPluginInfo' && req.body) {
    const body = await req.text();
    let jsonBody = JSON.parse(body);

    let err = validateParams(jsonBody, requiredUploadPluginInfoParams);
    if (err.error !== undefined) {
      return returnResponse(JSON.stringify(err), 400);
    }

    for (const [path, pluginInfo] of Object.entries(jsonBody.pathToPluginInfo)) {
      let err = validateParams(pluginInfo, requiredParamsPerPlugin);
      if (err.error !== undefined) {
        return returnResponse(JSON.stringify(err), 400);
      }
      pathToPluginInfo.set(path, pluginInfo);
    }
    return returnResponse(JSON.stringify({status: 'Uploaded plugin info'}), 200);
  } else if (url.pathname == '/uploadEnvironmentVariables' && req.body) {
    const body = await req.text();
    let jsonBody = JSON.parse(body);

    for (const [key, value] of Object.entries(jsonBody)) {
      globalThis[key] = value;
    }
    return returnResponse(JSON.stringify({status: 'Uploaded environment variables'}), 200);
  }

  let jsonBody = {};
  if (req.body) {
    const body = await req.text();
    jsonBody = JSON.parse(body);
  }

  // decodeURI to allow proper {{var}} matching later on
  const plugin = pathToPluginInfo.get(decodeURI(url.pathname));
  if (plugin === undefined) {
    return returnResponse(JSON.stringify({error: 'No plugin found for path'}), 400);
  }

  const eventTypeParams = eventTypeSpecificParams.get(plugin.eventType);
  if (eventTypeParams === undefined) {
    return returnResponse(JSON.stringify({error: 'Unsupported event type'}), 400);
  }

  let err = validateParams(jsonBody, eventTypeParams);
  if (err.error !== undefined) {
    return returnResponse(JSON.stringify(err), 400);
  }

  try {
    if (!dynamicImports.has(plugin.functionFilePath)) {
      const functionFile = await import(plugin.functionFilePath);
      dynamicImports.set(String(plugin.functionFilePath), functionFile);
    }
  } catch (err) {
    console.log(err);
    return returnResponse(JSON.stringify({error: `Couldn't import function file`}), 400);
  }

  // override globals to mimic platform behavior
  try {
    let pluginGlobalEnv = new PluginGlobalEnvironment();
    pluginGlobalEnv.activate();
  } catch (err) {
    return returnResponse(JSON.stringify({error: `Error applying global overrides: ${err}`}), 400);
  }

  const mod = dynamicImports.get(plugin.functionFilePath);
  if (mod !== undefined) {
    try {
      let res = await mod[String(plugin.functionName)](jsonBody);
      return returnResponse(JSON.stringify(res), 200);
    } catch (err) {
      console.log(err);
      return returnResponse(JSON.stringify({error: `Error running plugin`}), 400);
    }
  }
  return returnResponse(JSON.stringify({error: 'Unable to import mod.ts file'}), 400);
}

function validateParams(jsonBody: any, params: string[]): any {
  for (let i = 0; i < params.length; i++) {
    if (jsonBody[params[i]] === undefined) {
      return {error: `Request body is missing: ${params[i]}`};
    }
  }
  return {};
}

function returnResponse(body: string, status: number): Response {
  return new Response(body, {
    status: status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

serve(handler, {port: 4243});

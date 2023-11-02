/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
	const url = new URL(request.url);
    const keyname = url.pathname.substring(url.pathname.lastIndexOf("/") + 1).toLowerCase(); //Parse the path from request URL
    if (keyname == "secure") { //If path is '/secure', serve the HTML message
        const { EMAIL, TIMESTAMP, COUNTRY } = getUserInfo(request);
        const countryFlagURL = `https://tunnel.rohanphadke.com/secure/${COUNTRY}`; //Redirect to country flag URL
        const countryFlagHTML = `<a href="${countryFlagURL}">${COUNTRY}</a>`;
        const responseBody = `${EMAIL} authenticated at ${TIMESTAMP} from ${countryFlagHTML}`;
        return new Response(responseBody, {
          status: 200,
          headers: {
            "Content-Type": "text/html"
        }
      })
    }
      else {
        const filename = keyname + ".png"; //Append '.png' to filename due to format of image files stored in R2
        const object = await env.MY_BUCKET.get(filename);
        if (object === null) {
          return new Response("Object Not Found", { status: 404 });
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        return new Response(object.body, {
		  status: 200,
          headers
        });
    };   
}
}

function getUserInfo(request) {
  const EMAIL = request.headers.get('Cf-Access-Authenticated-User-Email'); //Collect User email from request header
  const currentDate = new Date();
  const TIMESTAMP = currentDate.getTime(); //Get current timestamp
  const COUNTRY = request.headers.get('Cf-Ipcountry'); //Collect user country from request header

  return { EMAIL, TIMESTAMP, COUNTRY };
	}

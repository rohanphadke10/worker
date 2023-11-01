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
    const key = url.pathname.slice(1);
    const keyname = key.substring(key.lastIndexOf('/') + 1).toLowerCase();
    if (keyname != 'secure') {
      //const keyname = key.toLowerCase();
      //return new Response (keyname)
      const filename = keyname + '.png'
      //return new Response (filename)
      const object = await env.MY_BUCKET.get(filename);
	  const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);

        return new Response(object.body, {
          headers,
        });
      if (object === null) {
        return new Response('Object Not Found', { status: 404 });
    }}
    else {
      const { EMAIL, TIMESTAMP, COUNTRY } = getUserInfo(request);
      const countryFlagURL = `https://tunnel.rohanphadke.com/secure/${COUNTRY}`;
      const countryFlagHTML = `<a href="${countryFlagURL}">${COUNTRY}</a>`;
      const responseBody = `${EMAIL} authenticated at ${TIMESTAMP} from ${countryFlagHTML}`;

      return new Response(responseBody, {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
  }
  //} else {
    // Implement a redirect or return an unauthorized response
    //return new Response('Unauthorized', { status: 401 });
  //}
}
}
// Implement your authentication logic here
//function checkAuthentication(request) {
  // You need to implement your authentication logic here
  // Return true if the user is authenticated, otherwise return false.
  // You may use request headers or cookies to check the user's authentication status.
  //return true; // Replace with your authentication logic
//}

// Implement a function to get user information (EMAIL, TIMESTAMP, COUNTRY) based on the request
function getUserInfo(request) {
  const EMAIL = request.headers.get('Cf-Access-Authenticated-User-Email');
  const currentDate = new Date();
  const TIMESTAMP = currentDate.getTime();
  const COUNTRY = request.headers.get('Cf-Ipcountry');

  return { EMAIL, TIMESTAMP, COUNTRY };
	}

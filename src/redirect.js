import Router from "next/router";

const redirect = (context, target) => {
  const res = context && (context.ctx || context).res;
  if (res) {
    // server
    // 303: "See other"
    res.writeHead(303, { Location: target });
    res.end();
  } else {
    // In the browser, we just pretend like this never even happened ;)
    Router.replace(target).catch(console.log);
  }
};
export default redirect;

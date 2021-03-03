import cookie from "cookie";

export function getToken(ctx) {
  const str =
    (ctx?.ctx || ctx)?.req?.headers?.cookie ||
    (process.browser && document.cookie);
  return str && cookie.parse(str)?.token;
}

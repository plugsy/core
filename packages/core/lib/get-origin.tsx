import type { IncomingMessage } from "http";

export const getOrigin = (req?: IncomingMessage) => {
  let host = req?.headers ? req.headers.host : window.location.host;

  if (
    req &&
    req.headers["x-forwarded-host"] &&
    typeof req.headers["x-forwarded-host"] === "string"
  ) {
    host = req.headers["x-forwarded-host"];
  }
  const protocol = req?.headers.referer?.split("://")?.[0] ?? "http";
  return `${protocol}://${host}`;
};

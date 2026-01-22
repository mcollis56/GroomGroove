import { createProxyMiddleware } from 'next/proxy';

const matcher = (req) => {
  if (req.nextUrl.pathname === '/logo.png') return false;
  return true;
};

export default createProxyMiddleware(matcher);

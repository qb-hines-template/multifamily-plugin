const getBearerToken = (authorization?: string) => {
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(/\s+/);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

export default (policyContext: { request: { header: { authorization?: string } } }) => {
  const configuredToken = process.env.ADMIN_ACCESS_TOKEN;

  if (!configuredToken) {
    return false;
  }

  const token = getBearerToken(policyContext.request.header.authorization);

  return token === configuredToken;
};

const environment = {
  auth: {
    identityPoolId: process.env.NEXT_CLIENT_IDENTITY_POOL_ID,
    region: process.env.NEXT_CLIENT_REGION,
    userPoolId: process.env.NEXT_CLIENT_USER_POOL_ID,
    userPoolWebClientId: process.env.NEXT_CLIENT_USER_POOL_CLIENT_ID,
  },
} as const;

export default environment;

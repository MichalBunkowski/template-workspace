/* eslint-disable @typescript-eslint/no-var-requires */
const withEnv = require('next-env');
const withPlugins = require('next-compose-plugins');
const dotenvLoad = require('dotenv-load');

dotenvLoad();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '../../.next',
};

module.exports = withPlugins(
  [
    [
      withEnv,
      {
        serverPrefix: 'NEXT_SERVER_',
        staticPrefix: 'NEXT_STATIC_',
        clientPrefix: 'NEXT_CLIENT_',
      },
    ],
  ],
  nextConfig
);

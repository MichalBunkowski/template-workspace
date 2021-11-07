#!/usr/bin/env node

import { App } from '@aws-cdk/core';

import { PipelineStack } from '../lib/stacks/pipeline.stack';

import 'source-map-support/register';

const app = new App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new PipelineStack(app, 'PipelineStack', {
  env,
});

app.synth();

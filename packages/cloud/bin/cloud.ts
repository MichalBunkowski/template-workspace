#!/usr/bin/env node

import { App } from '@aws-cdk/core';

import { AppStack } from '../lib/stacks/app.stack';
import { PipelineStack } from '../lib/stacks/pipeline.stack';
import { EnvironmentName } from '../lib/types/enums/environment-name';

import 'source-map-support/register';

const app = new App();

new AppStack(app, 'AppStack', {
  envName: EnvironmentName.Develop,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const pipeline = new App();

new PipelineStack(pipeline, 'PipelineStack', {
  envName: EnvironmentName.Develop,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

pipeline.synth();

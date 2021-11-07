#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';

import { AppStack } from '../lib/stacks/app-stack';
import { EnvironmentName } from '../lib/types/enums/environment-name';

import 'source-map-support/register';

const app = new cdk.App();

new AppStack(app, 'AppStack', {
  envName: EnvironmentName.Develop,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();

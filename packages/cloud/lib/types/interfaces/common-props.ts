import * as cdk from '@aws-cdk/core';

import { EnvironmentName } from '../enums/environment-name';

export interface CommonProps extends cdk.StackProps {
  envName: EnvironmentName;
}

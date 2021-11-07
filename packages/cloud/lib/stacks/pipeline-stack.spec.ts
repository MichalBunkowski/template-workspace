import * as cdk from '@aws-cdk/core';

import { EnvironmentName } from '../types/enums/environment-name';
import { PipelineStack } from './pipeline.stack';

describe('PipelineStack', () => {
  it('should match snapshot', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new PipelineStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toMatchSnapshot();
  });
});

import * as cdk from '@aws-cdk/core';

import { AppStack } from './app.stack';

describe('AppStack', () => {
  it('should match snapshot', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AppStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toMatchSnapshot();
  });
});

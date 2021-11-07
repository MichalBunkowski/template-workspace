import * as cdk from '@aws-cdk/core';

describe('AppStack', () => {
  it('should match snapshot', () => {
    const app = new cdk.App();
    app.synth();

    expect({}).toMatchSnapshot();
  });
});

import { Construct, SecretValue, Stack } from '@aws-cdk/core';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from '@aws-cdk/pipelines';

import { CommonProps } from '../types/interfaces/common-props';

type PipelineProps = CommonProps;

export class PipelineStack extends Stack {
  public readonly pipeline: CodePipeline;

  constructor(scope: Construct, id: string, props?: PipelineProps) {
    super(scope, id);

    /**
     *  githubSecret
     *  Purpose: Access to Github repository
     * */
    const githubToken = SecretValue.secretsManager('github_token');

    this.pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CdkAppPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(
          'MichalBunkowski/template-workspace',
          'main',
          { authentication: githubToken }
        ),
        commands: ['yarn bootstrap', 'yarn synth'],
      }),
    });
  }
}

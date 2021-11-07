import { Construct, SecretValue, Stack } from '@aws-cdk/core';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from '@aws-cdk/pipelines';

import { AppStackStage } from '../stages/app-stack.stage';
import { CommonProps } from '../types/interfaces/common-props';

type PipelineProps = CommonProps;

export class PipelineStack extends Stack {
  public readonly pipeline: CodePipeline;

  constructor(scope: Construct, id: string, props?: PipelineProps) {
    super(scope, id, props);

    /**
     *  githubSecret
     *  Purpose: Access to Github repository
     * */
    const githubToken = SecretValue.secretsManager('github_token');

    /**
     *  amplifyTriggerMain
     *  Purpose: Trigger amplify build
     * */
    const amplifyTriggerMain = SecretValue.secretsManager(
      'amplify_trigger_main'
    );

    const githubRepository = CodePipelineSource.gitHub(
      'MichalBunkowski/template-workspace',
      'main',
      { authentication: githubToken }
    );

    this.pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CdkAppPipeline',
      synth: new ShellStep('Synth', {
        input: githubRepository,
        commands: ['yarn bootstrap', 'yarn synth'],
        primaryOutputDirectory: 'packages/cloud/cdk.out',
      }),
    });

    this.pipeline.addStage(new AppStackStage(this, 'PreProd', props), {
      post: [
        new ShellStep('TriggerAmplifyMain', {
          commands: [
            `curl -X POST -d {} "${amplifyTriggerMain.toString()}" -H "Content-Type:application/json"`,
          ],
        }),
      ],
    });
  }
}

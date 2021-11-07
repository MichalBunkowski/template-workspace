import { Construct, Stage, StageProps } from '@aws-cdk/core';

import { AppStack } from '../stacks/app.stack';
import { CommonProps } from '../types/interfaces/common-props';

type AppStackStageProps = CommonProps & StageProps;

/**
 * Deployable unit of web service app
 */
export class AppStackStage extends Stage {
  public readonly stack: AppStack;

  constructor(scope: Construct, id: string, props: AppStackStageProps) {
    super(scope, id, props);

    this.stack = new AppStack(this, 'AppStack', props);
  }
}

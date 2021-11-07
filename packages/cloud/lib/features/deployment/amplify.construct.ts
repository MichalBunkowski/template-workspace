import { App, GitHubSourceCodeProvider } from '@aws-cdk/aws-amplify';
import { Role } from '@aws-cdk/aws-iam';
import { Construct, SecretValue } from '@aws-cdk/core';

import { CommonProps } from '../../types/interfaces/common-props';
import generateResourceName from '../../utils/generate-resource-name.utils';
import { CognitoConstruct } from '../auth/cognito.construct';

interface AmplifyConstructProps extends CommonProps {
  cognito: CognitoConstruct;
  serviceRole: Role;
  githubToken: SecretValue;
}

export class AmplifyConstruct extends Construct {
  private readonly app: App;
  constructor(scope: Construct, id: string, props: AmplifyConstructProps) {
    super(scope, id);

    const { serviceRole, githubToken, cognito } = props;

    this.app = new App(this, generateResourceName('AmplifyApp', props), {
      role: serviceRole,
      sourceCodeProvider: new GitHubSourceCodeProvider({
        owner: 'MichalBunkowski',
        repository: 'template-workspace',
        oauthToken: githubToken,
      }),
      autoBranchDeletion: true,
      environmentVariables: {
        _LIVE_UPDATES:
          '[{"pkg":"next-version","type":"internal","version":"latest"}]',
        AMPLIFY_MONOREPO_APP_ROOT: 'packages/web',
        AMPLIFY_DIFF_DEPLOY: 'false',
        NEXT_CLIENT_REGION: props.env?.region ?? 'eu-west-1',
        NEXT_CLIENT_IDENTITY_POOL_ID: cognito.identityPool.ref,
        NEXT_CLIENT_USER_POOL_ID: cognito.userPool.userPoolId,
        NEXT_CLIENT_USER_POOL_CLIENT_ID:
          cognito.userPoolClient.userPoolClientId,
      },
    });

    this.app.addBranch('main', { autoBuild: false });
  }
}

import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Construct, SecretValue, Stack } from '@aws-cdk/core';

import { CognitoConstruct } from '../features/auth/cognito.construct';
import { AmplifyConstruct } from '../features/deployment/amplify.construct';
import { PipelineConstruct } from '../features/deployment/pipeline.construct';
import { CommonProps } from '../types/interfaces/common-props';
import generateResourceName from '../utils/generate-resource-name.utils';

type AppStackProps = CommonProps;

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // Authentication
    /**
     *  CognitoConstruct
     *  Purpose: Authentication of users and confirming identity
     * */
    const cognito = new CognitoConstruct(
      this,
      generateResourceName('Auth', props),
      {
        ...props,
      }
    );

    // Deployment
    /**
     *  amplifyServiceRole
     *  Purpose: Allows amplify app to create and deploy backend resources
     * */
    const amplifyServiceRole = new Role(
      this,
      generateResourceName('AmplifyBackendDeployment', props),
      {
        assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify'),
        ],
      }
    );

    /**
     *  githubSecret
     *  Purpose: Access to Github repository
     * */
    const githubToken = SecretValue.secretsManager('github_token');

    /**
     *  PipelineConstruct
     *  Purpose: Deployment of CDK App
     * */
    new PipelineConstruct(this, generateResourceName('Pipeline', props), {
      githubToken,
      ...props,
    });

    /**
     *  AmplifyConstruct
     *  Purpose: Deployment of application
     * */
    new AmplifyConstruct(this, generateResourceName('Amplify', props), {
      serviceRole: amplifyServiceRole,
      githubToken: githubToken,
      cognito,
      ...props,
    });
  }
}

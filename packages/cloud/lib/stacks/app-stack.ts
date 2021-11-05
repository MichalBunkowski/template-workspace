import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

import { CognitoConstruct } from '../features/auth/cognito.construct';
import { AmplifyConstruct } from '../features/deployment/amplify.construct';
import { CommonProps } from '../types/interfaces/common-props';
import generateResourceName from '../utils/generate-resource-name.utils';

type AppStackProps = CommonProps;

export class AppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: AppStackProps) {
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
    const amplifyServiceRole = new iam.Role(
      this,
      generateResourceName('AmplifyBackendDeployment', props),
      {
        assumedBy: new iam.ServicePrincipal('amplify.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'AdministratorAccess-Amplify'
          ),
        ],
      }
    );

    /**
     *  githubSecret
     *  Purpose: Access to Github repository
     * */
    const githubToken = cdk.SecretValue.secretsManager('github_token');

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

import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import { Construct, SecretValue, Stack } from '@aws-cdk/core';

import { CognitoConstruct } from '../features/auth/cognito.construct';
import { AmplifyConstruct } from '../features/deployment/amplify.construct';
import { CommonProps } from '../types/interfaces/common-props';

type AppStackProps = CommonProps;

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: AppStackProps) {
    super(scope, id, props);

    // Authentication
    /**
     *  CognitoConstruct
     *  Purpose: Authentication of users and confirming identity
     * */
    const cognito = new CognitoConstruct(this, 'Auth', {
      ...props,
    });

    // Deployment
    /**
     *  amplifyServiceRole
     *  Purpose: Allows amplify app to create and deploy backend resources
     * */
    const amplifyServiceRole = new Role(this, 'AmplifyBackendDeployment', {
      assumedBy: new ServicePrincipal('amplify.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess-Amplify'),
      ],
    });

    /**
     *  githubSecret
     *  Purpose: Access to Github repository
     * */
    const githubToken = SecretValue.secretsManager('github_token');

    /**
     *  AmplifyConstruct
     *  Purpose: Deployment of application
     * */
    new AmplifyConstruct(this, 'Amplify', {
      serviceRole: amplifyServiceRole,
      githubToken: githubToken,
      cognito,
      ...props,
    });
  }
}

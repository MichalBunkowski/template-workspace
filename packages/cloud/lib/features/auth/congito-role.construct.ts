import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';

import { CommonProps } from '../../types/interfaces/common-props';
import generateResourceName from '../../utils/generate-resource-name.utils';

interface CognitoRoleProps extends CommonProps {
  identityPool: cognito.CfnIdentityPool;
}

export class CognitoRoleConstruct extends cdk.Construct {
  private readonly role: iam.Role;

  constructor(scope: cdk.Construct, id: string, props: CognitoRoleProps) {
    super(scope, id);

    const { identityPool } = props;

    this.role = new iam.Role(this, generateResourceName('AuthRole', props), {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
    });

    this.role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'mobileanalytics:PutEvents',
          'cognito-sync:*',
          'cognito-identity:*',
        ],
        resources: ['*'],
      })
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      generateResourceName('AuthIdentityPoolAttachment', props),
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: this.role.roleArn },
      }
    );
  }
}

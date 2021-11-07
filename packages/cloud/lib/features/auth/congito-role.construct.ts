import {
  CfnIdentityPool,
  CfnIdentityPoolRoleAttachment,
} from '@aws-cdk/aws-cognito';
import {
  Effect,
  FederatedPrincipal,
  PolicyStatement,
  Role,
} from '@aws-cdk/aws-iam';
import { Construct } from '@aws-cdk/core';

import { CommonProps } from '../../types/interfaces/common-props';

interface CognitoRoleProps extends CommonProps {
  identityPool: CfnIdentityPool;
}

export class CognitoRoleConstruct extends Construct {
  private readonly role: Role;

  constructor(scope: Construct, id: string, props: CognitoRoleProps) {
    super(scope, id);

    const { identityPool } = props;

    this.role = new Role(this, 'AuthRole', {
      assumedBy: new FederatedPrincipal(
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
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'mobileanalytics:PutEvents',
          'cognito-sync:*',
          'cognito-identity:*',
        ],
        resources: ['*'],
      })
    );

    new CfnIdentityPoolRoleAttachment(this, 'AuthIdentityPoolAttachment', {
      identityPoolId: identityPool.ref,
      roles: { authenticated: this.role.roleArn },
    });
  }
}

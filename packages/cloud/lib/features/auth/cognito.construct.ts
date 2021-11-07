import {
  AccountRecovery,
  CfnIdentityPool,
  UserPool,
  UserPoolClient,
  UserPoolDomain,
} from '@aws-cdk/aws-cognito';
import { CfnOutput, Construct, Duration } from '@aws-cdk/core';

import { CommonProps } from '../../types/interfaces/common-props';
import { CognitoRoleConstruct } from './congito-role.construct';

type CognitoConstructProps = CommonProps;

export class CognitoConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;
  public readonly identityPool: CfnIdentityPool;
  public readonly authRole: CognitoRoleConstruct;

  constructor(scope: Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    this.userPool = new UserPool(this, 'AuthUserPool', {
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      signInAliases: { email: true, username: true },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireSymbols: true,
        requireLowercase: true,
        requireUppercase: true,
        tempPasswordValidity: Duration.days(1),
      },
      standardAttributes: {
        email: {
          mutable: false,
          required: true,
        },
      },
    });

    this.userPoolClient = new UserPoolClient(this, 'AuthUserPoolClient', {
      userPool: this.userPool,
      generateSecret: false,
    });

    this.identityPool = new CfnIdentityPool(this, 'AuthIdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    this.userPoolDomain = new UserPoolDomain(this, 'UserPoolDomain', {
      cognitoDomain: {
        domainPrefix: `home-assistance`,
      },
      userPool: this.userPool,
    });

    this.authRole = new CognitoRoleConstruct(this, 'AuthRoleConstruct', {
      ...props,
      identityPool: this.identityPool,
    });

    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
    });

    new CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
    });

    new CfnOutput(this, 'CognitoUserPoolDomainExport', {
      value: this.userPoolDomain.baseUrl().replace('https://', ''),
    });
  }
}

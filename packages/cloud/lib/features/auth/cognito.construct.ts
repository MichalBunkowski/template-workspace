import * as cognito from '@aws-cdk/aws-cognito';
import * as cdk from '@aws-cdk/core';

import { CommonProps } from '../../types/interfaces/common-props';
import generateResourceName from '../../utils/generate-resource-name.utils';
import { CognitoRoleConstruct } from './congito-role.construct';

type CognitoConstructProps = CommonProps;

export class CognitoConstruct extends cdk.Construct {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly userPoolDomain: cognito.UserPoolDomain;
  public readonly identityPool: cognito.CfnIdentityPool;
  public readonly authRole: CognitoRoleConstruct;

  constructor(scope: cdk.Construct, id: string, props: CognitoConstructProps) {
    super(scope, id);

    this.userPool = new cognito.UserPool(
      this,
      generateResourceName('AuthUserPool', props),
      {
        accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
        selfSignUpEnabled: true,
        autoVerify: { email: true },
        signInAliases: { email: true, username: true },
        passwordPolicy: {
          minLength: 8,
          requireDigits: true,
          requireSymbols: true,
          requireLowercase: true,
          requireUppercase: true,
          tempPasswordValidity: cdk.Duration.days(1),
        },
        standardAttributes: {
          email: {
            mutable: false,
            required: true,
          },
        },
      }
    );

    this.userPoolClient = new cognito.UserPoolClient(
      this,
      generateResourceName('AuthUserPoolClient', props),
      { userPool: this.userPool, generateSecret: false }
    );

    this.identityPool = new cognito.CfnIdentityPool(
      this,
      generateResourceName('AuthIdentityPool', props),
      {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: this.userPoolClient.userPoolClientId,
            providerName: this.userPool.userPoolProviderName,
          },
        ],
      }
    );

    this.userPoolDomain = new cognito.UserPoolDomain(
      this,
      generateResourceName('UserPoolDomain', props),
      {
        cognitoDomain: {
          domainPrefix: `${props.envName}-home-assistance`,
        },
        userPool: this.userPool,
      }
    );

    this.authRole = new CognitoRoleConstruct(
      this,
      generateResourceName('AuthRoleConstruct', props),
      {
        ...props,
        identityPool: this.identityPool,
      }
    );

    new cdk.CfnOutput(this, generateResourceName('UserPoolId', props), {
      value: this.userPool.userPoolId,
    });

    new cdk.CfnOutput(this, generateResourceName('UserPoolClientId', props), {
      value: this.userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, generateResourceName('IdentityPoolId', props), {
      value: this.identityPool.ref,
    });

    new cdk.CfnOutput(
      this,
      generateResourceName('CognitoUserPoolDomainExport', props),
      {
        value: this.userPoolDomain.baseUrl().replace('https://', ''),
      }
    );
  }
}

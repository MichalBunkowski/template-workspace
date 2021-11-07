#!/usr/bin/env node

const yargs = require('yargs');
const { spawnSync, execSync } = require('child_process');

const baseCommand = 'cdk destroy --force';

const args = yargs
  .option('stack', {
    alias: 's',
    type: 'string',
    default: 'AppStack',
    description: 'Stack to be deleted',
  })
  .option('env', {
    alias: 'e',
    type: 'string',
    default: 'deve',
    description: 'Environment value passed to stack during creation',
  })
  .option('profile', {
    alias: 'p',
    type: 'string',
    description: 'Aws profile to use, not necessary',
  }).argv;

const stack = args.stack;
const env = args.env;
const profile = args.profile;

if (!stack || !env) {
  console.log('\x1b[31m', '❌ Missing arguments!', '\x1b[0m');
  process.exit(1);
}

(() => {
  console.log(`┏━━━ 🧨 DESTROY: ${process.env.PWD} ━━━━━━━━━━━━━━━━━━━`);

  const destroyStackCommand = profile
    ? `${baseCommand} ${stack} --profile ${profile}`
    : `${baseCommand} ${stack}`;

  spawnSync(destroyStackCommand, {
    shell: true,
    stdio: 'inherit',
  });

  console.log('\x1b[34m', '\n🚀 Resources:');

  const listS3BucketsCommand = profile
    ? `aws s3 ls --profile ${profile}`
    : 'aws s3 ls';
  const S3Buckets = execSync(listS3BucketsCommand)
    .toString()
    .split(/\r?\n/)
    .filter((x) => x.includes(env))
    .map((x) => `s3://${x.split(' ')[2]}`);

  if (S3Buckets.length > 0) {
    console.log('\x1b[34m', '🪣 Removing S3 buckets', '\x1b[0m');
    console.log(JSON.stringify(S3Buckets, null, 2), '\n');

    spawnSync(
      S3Buckets.map((x) =>
        profile
          ? `aws s3 rb ${x} --force --profile ${profile}`
          : `aws s3 rb ${x} --force`
      ).join(' && '),
      {
        shell: true,
        stdio: 'ignore',
      }
    );
  } else {
    console.log('\x1b[33m', `No S3 bucket found for stack ${stack}\n`);
  }
  const describeLogGroupsCommand = profile
    ? `aws logs describe-log-groups --profile ${profile}`
    : 'aws logs describe-log-groups';
  const logGroups = JSON.parse(execSync(describeLogGroupsCommand).toString())
    .logGroups.map((x) => x.logGroupName)
    .filter((x) => x.includes(stack));

  if (logGroups.length > 0) {
    console.log('\x1b[34m', '📝 Removing log groups', '\x1b[0m');
    console.log(JSON.stringify(logGroups, null, 2), '\n');

    spawnSync(
      logGroups
        .map((x) =>
          profile
            ? `aws logs delete-log-group --log-group-name ${x} --profile ${profile}`
            : `aws logs delete-log-group --log-group-name ${x}`
        )
        .join(' && '),
      {
        shell: true,
        stdio: 'ignore',
      }
    );
  } else {
    console.log('\x1b[33m', `No logs found for stack ${stack}\n`);
  }

  const listTablesCommand = profile
    ? `aws dynamodb list-tables --profile ${profile}`
    : 'aws dynamodb list-tables';
  const socotraPolicyTables = JSON.parse(
    execSync(listTablesCommand).toString()
  ).TableNames.filter((tableName) => tableName.includes(env));

  if (socotraPolicyTables.length > 0) {
    console.log('\x1b[34m', '💽 Removing DynamoDB Tables', '\x1b[0m');
    console.log(JSON.stringify(socotraPolicyTables, null, 2), '\n');

    spawnSync(
      socotraPolicyTables
        .map((tableName) =>
          profile
            ? `aws dynamodb delete-table --table-name ${tableName} --profile ${profile}`
            : `aws dynamodb delete-table --table-name ${tableName}`
        )
        .join(' && '),
      {
        shell: true,
        stdio: 'ignore',
      }
    );
  } else {
    console.log('\x1b[33m', `No DynamoDB Tables found for stack ${stack}\n`);
  }

  const listUserPoolsCommand = profile
    ? `aws cognito-idp list-user-pools --max-results 60 --profile ${profile}`
    : 'aws cognito-idp list-user-pools --max-results 60';
  const userPools = JSON.parse(execSync(listUserPoolsCommand).toString())
    .UserPools.filter((x) => x.Name?.includes(env))
    .map((x) => x.Id);

  if (userPools.length > 0) {
    console.log('\x1b[34m', '👥 Removing user pools', '\x1b[0m');
    console.log(JSON.stringify(userPools, null, 2), '\n');

    spawnSync(
      userPools
        .map((x) =>
          profile
            ? `aws cognito-idp delete-user-pool --user-pool-id ${x} --profile ${profile}`
            : `aws cognito-idp delete-user-pool --user-pool-id ${x}`
        )
        .join(' && '),
      {
        shell: true,
        stdio: 'ignore',
      }
    );
  } else {
    console.log('\x1b[33m', `No user pools found for stack ${stack}\n`);
  }

  const listElasticDomainNamesCommand = profile
    ? `aws es list-domain-names --profile ${profile}`
    : 'aws es list-domain-names';
  const elasticSearchDomains = JSON.parse(
    execSync(listElasticDomainNamesCommand).toString()
  )
    .DomainNames?.map((x) => x.DomainName)
    .filter((x) => x.includes(env));

  if (elasticSearchDomains.length > 0) {
    console.log('\x1b[34m', '👀 Removing ElasticSearch domains', '\x1b[0m');
    console.log(JSON.stringify(elasticSearchDomains, null, 2), '\n');

    spawnSync(
      elasticSearchDomains
        .map((x) =>
          profile
            ? `aws es delete-elasticsearch-domain --domain-name ${x} --profile ${profile}`
            : `aws es delete-elasticsearch-domain --domain-name ${x}`
        )
        .join(' && '),
      {
        shell: true,
        stdio: 'ignore',
      }
    );
  } else {
    console.log(
      '\x1b[33m',
      `No ElasticSearch domains found for stack ${stack}\n`
    );
  }

  console.log('\x1b[0m');
})();

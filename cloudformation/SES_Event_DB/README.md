# Amazon SES email events' DB

## Description

This solution is relevant for anyone planning to or already sending emails using Amazon SES. It enables you to store email events in Amazon S3 and perform SQL queries using Amazon Athena.

## Solution

![ses-event-db-architecture](https://github.com/aws-samples/communication-developer-services-reference-architectures/blob/master/cloudformation/SES_Event_DB/email-event-db-architecture.PNG)

The solution presented in this repository, utilizes AWS CloudFormation to deploy an Amazon Kinesis Firehose, an Amazon S3 bucket, an AWS Glue database and an Amazon Athena table for streaming, storing and querying email engagement events respectively.

Some information regarding the AWS services used in the solution:
- **Amazon Kinesis Data Firehose** is an extract, transform, and load (ETL) service that reliably captures, transforms, and delivers streaming data to data lakes, data stores, and analytics services. 
- **Amazon S3** provides object storage through a web service interface.
- **AWS Glue** is a serverless data integration service that makes it easier to discover, prepare, move, and integrate data from multiple sources for analytics, machine learning (ML), and application development.
- **Amazon Athena** is a serverless, interactive analytics service that provides a simplified and flexible way to analyze petabytes of data where it lives.

The solution creates one table with all email events and one Amazon Athena view, which contains the latest timestamp per enagement event per **message_id**. This view and can be used to check the latest email status and whether it has been send, delivered, opened, clicked, bounced or generated a complaint.

## Prerequisites

1. Access to Amazon SES, AWS CloudShell and IAM policies assigned to your AWS user that allow you to deploy an AWS CloudFormation templates, manage Amazon Athena, Amazon S3, Amazon Kinesis Firehose and AWS Glue resources.
2. Verify at least one email address for testing purposes. Read [Creating and verifying identities in Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html) for more information.

## Implementation

1. Navigate to the AWS CloudShell in the AWS region you want to deploy the solution. If AWS CloudShell isn't available in the AWS region you want to use, then use the [AWS CLI locally](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Execute the command below to copy the AWS CloudFormation template in the local storage:

```
wget https://github.com/aws-samples/communication-developer-services-reference-architectures/blob/master/cloudformation/SES_Event_DB/ses-events-db.yaml
```
3. The Amazon S3 bucket name needs to be unique, thus the commands below will create a unique name using a static string, your AWS account Id and a random five characters string.

```
# Get the AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)

# Generate a random ID (lowercase, at least 5 characters)
RANDOM_ID=$(LC_CTYPE=C tr -dc 'a-z0-9' < /dev/urandom | fold -w 5 | head -n 1)

# Ensure RANDOM_ID is at least 8 characters
while [ ${#RANDOM_ID} -lt 5 ]; do
  RANDOM_ID="${RANDOM_ID}$(LC_CTYPE=C tr -dc 'a-z0-9' < /dev/urandom | fold -w 1 | head -n 1)"
done

# Create an S3 bucket with a unique name (lowercase)
BUCKET_NAME="ses-db-${ACCOUNT_ID}-${RANDOM_ID}"
echo "S3 Bucket name: ${BUCKET_NAME}"

# The Amazon SES configuration set name
CONFIGRUATION_NAME="event-db-config"
echo "SES Configuration set name: ${CONFIGRUATION_NAME}"
```

4. To deploy the AWS CloudFormation stack execute the AWS CLI command [deploy](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/deploy/) below. This AWS CloudFormation template includes two parameters:
- **EventAthenaDatabaseName:** The name of the AWS Glue database that will be created as part of this solution.
- **CreateBucketName:** The Amazon S3 bucket, where all email events will be stored.
- **NewConfigurationSet:** If you want to use an existing SES configuration set, type "NO", otherwise type "YES" to create a new SES configuration set. The AWS CLI command below is populated with the value "YES", which will create a new SES configuration set.
- **ConfigurationSetName:** This is the configuration set name that will be either created or updated, depending the value you have set under **NewConfigurationSet**. The AWS CLI command below is populated with the configuration set name "event-db-config".

:warning: **Note:** The AWS CloudFormation template deployment time should be between 4 - 6 minutes.

```
aws cloudformation deploy \
--template-file "ses-events-db.yaml" \
--stack-name SES-Email-Database \
--parameter-overrides EventAthenaDatabaseName="ses_event_db" CreateBucketName="${BUCKET_NAME}" NewConfigurationSet="YES" ConfigurationSetName=${CONFIGRUATION_NAME}\
--capabilities CAPABILITY_NAMED_IAM \
--output table
```

5. To test the solution, send 4 - 5 emails using the AWS CLI command below. Make sure you update the email address under **from-email-address** field with an email address that you have verified in Amazon SES. Wait 2 minutes and navigate to the Amazon Athena console, where you can preview the table and Athena under the database with name **ses_event**. 

```
aws sesv2 send-email \
--from-email-address "your-email@example.com" \
--destination '{"ToAddresses":["success@simulator.amazonses.com"]}' \
--content "{\"Simple\": {\"Subject\": {\"Data\": \"Hello world\"}, \"Body\": {\"Html\": {\"Data\": \"<h1>This is SES</h1>\"}}}}" \
--configuration-set-name CONFIGRUATION_NAME

```


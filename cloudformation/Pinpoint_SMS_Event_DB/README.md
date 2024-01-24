# Amazon Pinpoint SMS events' DB

## Description

This solution is relevant for anyone planning to use or using [Amazon Pinpoint's SMS and Voice v2 API](https://docs.aws.amazon.com/pinpoint/latest/apireference_smsvoicev2/Welcome.html) to send SMS. It enables you to store SMS events in Amazon S3 and perform SQL queries using Amazon Athena.

## Solution

![sms-event-db-architecture](https://github.com/aws-samples/communication-developer-services-reference-architectures/blob/master/cloudformation/Pinpoint_SMS_Event_DB/SMS-event-db-architecture.PNG)

The solution presented in this repository, utilizes AWS CloudFormation to deploy an Amazon Kinesis Firehose, an Amazon S3 bucket, an AWS Glue database and an Amazon Athena table for streaming, storing and querying SMS engagement events respectively.

Some information regarding the AWS services used in the solution:
- **Amazon Kinesis Data Firehose** is an extract, transform, and load (ETL) service that reliably captures, transforms, and delivers streaming data to data lakes, data stores, and analytics services. 
- **Amazon S3** provides object storage through a web service interface.
- **AWS Glue** is a serverless data integration service that makes it easier to discover, prepare, move, and integrate data from multiple sources for analytics, machine learning (ML), and application development.
- **Amazon Athena** is a serverless, interactive analytics service that provides a simplified and flexible way to analyze petabytes of data where it lives.

The solution creates one table with all SMS events and one Amazon Athena view, which contains only the latest event per **message_id** and can be used to check the SMS delivery status.

## Prerequisites

1. Access to Amazon Pinpoint, AWS CloudShell and IAM policies assigned to your AWS user that allow you to deploy an AWS CloudFormation templates, manage Amazon Athena, Amazon S3, Amazon Kinesis Firehose and AWS Glue resources.
2. An Amazon Pinpoint SMS [configuration set](https://docs.aws.amazon.com/sms-voice/latest/userguide/configuration-sets.html).

## Implementation

1. Navigate to the AWS CloudShell in the AWS region you want to deploy the solution. If AWS CloudShell isn't available in the AWS region you want to use, then use the [AWS CLI locally](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).
2. Execute the command below to copy the AWS CloudFormation template in the local storage:

```
wget https://github.com/aws-samples/communication-developer-services-reference-architectures/blob/master/cloudformation/Pinpoint_SMS_Event_DB/SMS-events-database.yaml
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
BUCKET_NAME="sms-db-${ACCOUNT_ID}-${RANDOM_ID}"
echo "S3 Bucket name: ${BUCKET_NAME}"
```

4. To deploy the AWS CloudFormation stack execute the AWS CLI command [deploy](https://docs.aws.amazon.com/cli/latest/reference/cloudformation/deploy/) below. This AWS CloudFormation template includes two parameters:
- **EventAthenaDatabaseName:** The name of the AWS Glue database that will be created as part of this solution.
- **CreateBucketName:** The Amazon S3 bucket, where all SMS events will be stored.

::alert[The AWS CloudFormation template deployment time should is between 4 - 6 minutes.]{header="Note"}

```
aws cloudformation deploy \
--template-file "SMS-events-database.yaml" \
--stack-name Pinpoint-SMS-Database \
--parameter-overrides EventAthenaDatabaseName="sms_event_db" CreateBucketName="${BUCKET_NAME}" \
--capabilities CAPABILITY_NAMED_IAM \
--output table
```

5. The AWS CloudFormation deployed has two outputs: the Amazon Kinesis Firehose ARN and Amazon Kinesis Firehose IAM role ARN. Copy the **OutputValue** for both **KinesisFirehose** and **PinpointSMSFirehoseRole** as they will be needed to create an SMS event destination and send a test SMS respectively. Execute the command below in AWS CloudShell to obtain the Amazon Kinesis Firehose ARN and Amazon Kinesis Firehose IAM role ARN. 

```
aws cloudformation describe-stacks --stack-name Pinpoint-SMS-Database --query "Stacks[].Outputs"
```

You can use the `jq` tool to parse the JSON output and extract the values of each `OutputValue`. Here's how you can save the values into variables using a Bash script:

```
# Run the AWS CLI command and store the JSON output in a variable
STACK_OUTPUTS=$(aws cloudformation describe-stacks --stack-name Pinpoint-SMS-Database --query "Stacks[].Outputs")

# Use jq to extract the OutputValue for each key
KINESIS_FIREHOSE_ARN=$(echo "$STACK_OUTPUTS" | jq -r '.[0][] | select(.OutputKey == "KinesisFirehose") | .OutputValue')
KINESIS_IAM_ROLE_ARN=$(echo "$STACK_OUTPUTS" | jq -r '.[0][] | select(.OutputKey == "PinpointSMSFirehoseRole") | .OutputValue')

# Print the values or use them as needed
echo "Kinesis Firehose Arn: $KINESIS_FIREHOSE_ARN"
echo "Kinesis Firehose IAM Role Arn: $KINESIS_IAM_ROLE_ARN"
```

6. Create a new event destination that will stream all SMS events to the Amazon S3 bucket created by the solution. Before executing the AWS CLI command below, make sure you have replaced the placeholders for **CONFIG_NAME** with the name of the configuration set you will be using to send SMS.

```
aws pinpoint-sms-voice-v2 create-event-destination \
--configuration-set-name CONFIG_NAME \
--event-destination-name "SMSallEventDB" \
--matching-event-types TEXT_ALL \
--kinesis-firehose-destination IamRoleArn="${KINESIS_IAM_ROLE_ARN}",DeliveryStreamArn="${KINESIS_FIREHOSE_ARN}"
```

8. Send 4 - 5 SMS, wait 2 minutes and navigate to the Amazon Athena console, where you can preview the table and Athena under the database with name **sms_event_db**.

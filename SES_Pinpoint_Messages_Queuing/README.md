# aws-email-queuing

## Description

Amazon SES and Amazon Pinpoint API operations for sending messages, don't have a queuing mechanism. If your application exceeds the allocated throughput limits, then the API will return a throttling error message **Maximum sending rate exceeded**. This means that queuing messages should take place before calling the Amazon Pinpoint or SES API.

## Architecture

![architecture](https://github.com/Pioank/aws-email-queuing/blob/main/images/ArchDiagram.PNG)

The solution, utilizes Amazon SQS for queuing, Amazon Lambda for consuming the SQS messages and Amazon CloudWatch for monitoring.

For testing purposes, this solution creates an AWS Lambda function (publisher), which is invoked every minute by an EventBridge rule. The **publisher** writes X messages to SQS with each message being an email. You can change the number of messages sent when deploying the solution. By default the EventBridge rule is **DISABLED** and you will need to enable it by navigating to the **EventBridge > Rules > TriggerSQSPublishMessagesLambda**.

The **publisher** sends dummy emails via the SES API and uses the simulator email address success@simulator.amazonses.com. For more information regarding SES simulator visit this [link](https://docs.aws.amazon.com/ses/latest/dg/send-an-email-from-console.html).

The above resources allow you to test, monitor and configure your email sending throughput before integrating with your application.

## Mechanics

Both Amazon Pinpoint and Amazon SES have a **Maximum rate per limit**, which is also known as throughput or emails send per second. When you start sending emails, your SES / Pinpoint account is in Sandbox allowing you to send only one email per second. Follow the links below to get out of the Sandbox and increase sending limits [SES](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html) & [Pinpoint](https://docs.aws.amazon.com/pinpoint/latest/userguide/channels-email-setup-production-access.html).

Sending an email via API or SDK using SES / Pinpoint takes approximately 90 - 120 ms. This depends on the AWS region and you can monitor it from the CloudWatch dashboard once you start sending. Considering that an API call takes on average 100 ms, an AWS Lambda function can send roughly 9 emails per second (you should always factor the possiblity that some API calls might take longer).

To reach e.g. 20 emails per second, you would need more than one AWS Lambda function to process the SQS messages. To achieve that you can increase the AWS Lambda reserved concurrency to 2. This will result to an estimated throughput of 18 emails per second.

In case the SES or Pinpoint API returns a throttling error, the AWS Lambda will write that message back to the SQS. If any other error is returned, the message will be placed to a Dead Letter Queue (DLQ), which is deployed as part of this solution.

![architecture](https://github.com/Pioank/aws-email-queuing/blob/main/images/queuing-logic.PNG)

## CloudWatch-Dashboard

Monitoring is important and helpful for configuring properly the SQS batch and AWS Lambda concurrency so that you can achieve the maximum throughput.

![architecture](https://github.com/Pioank/aws-email-queuing/blob/main/images/CloudWatch-Dashboard-Metrics.PNG)

This solution deploys an Amazon CloudWatch dashboard from where you can monitor:
- Number of messages written to the SQS
- Number of emails send & delivered (SES)
- Number of messages processed by Lambda (send & throttled) **CUSTOM METRIC**
- SES throttling errors **CUSTOM METRIC**
- Email throughput (average number of SES message deliveries against your SES throughput - provided when deploying the solution)
- Number of visible SQS messages
- Duration (ms) - AWS Lambda for sending messages
- SES API response time (ms) - AWS Lambda for sending messages **CUSTOM METRIC**
- Concurrent executions average - AWS Lambda for sending messages
- Errors - AWS Lambda for sending messages

## Deployment

**IMPORTANT**: 
- This solution by default uses SES API to send emails. To use Amazon Pinpoint, you will need to amend the code in the AWS Lambda function **sqs_message_poller > lambda_function** and un-comment the function that sends the message via Pinpoint. Furthermore the CloudWatch dashboard email metrics are for SES, thus the respective changes will need to be done there as well.
- The AWS Lambda function **sqs_message_poller > lambda_function** has **sleep** function in case your SES / Pinpoint account is in Sandbox and the sending throughput is 1. To avoid receiving constant throttling erros, the **sleep** function keeps the AWS Lambda function running up to 1 second e.g. 1 SES / Pinpoint send email API call is 100 ms so the **sleep** function is 800 - 900 ms.To use the sleep funtion you will need to un-comment it.

**IMPLEMENTATION:**
- Create an S3 bucket and upload the two zip files in the folder [aws-lambda-code](https://github.com/Pioank/aws-email-queuing/tree/main/aws-lambda-code)
- Navigate to the AWS CloudFormation console and deploy the stack using existing resources [YAML template attached](https://github.com/Pioank/aws-email-queuing/blob/main/SES-Pinpoint-Messages-Queuing.yaml)
- Fill the fields as per the instructions below:
  - Sub **DashboardName:** Provide a name for the CloudWatch dashboard that will be created
  - Sub **EmailFrom:** The email address that you will use to send emails for testing purposes. This email address will be used from the solution to start sending messages, thus it needs to be verified first
  - Sub **EmailThroughput:** This is your SES or Pinpoint email sending throughput. If your account is in sandbox your email sending throughput is 1
  - Sub **LambdaCodeS3BucketName:** The name of the S3 bucket that you created in step 1
  - Sub **NoOfMessagesSQS:** The number of messages the AWS Lambda publisher will write to the SQS every minute. This is for testing purposes allowing you to monitor how SQS and AWS Lambda poller behaves based on the volume of emails and respective configuration (Lambda reserved concurrency, SQS batch size etc.)
  - Sub **ReservedLambdaConcurrency:** Considering that the average SES / Pinpoint API call to send an email is 90 - 120 ms, an AWS Lambda function should be able to send 9 emails per second. If your throughput is higher than 9 - 10 then the Lambda reserved concurrency should be > 1
  - Sub **SQSBatchSize:** This specifies how many messages an SQS batch includes. An AWS Lambda function processes one batch per invokation
- Once the CloudFormation stack has been deployed, navigate to the EventBridge console and enable the Rule **TriggerSQSPublishMessagesLambda**
- Navigate to the CloudWatch dashboards, select the dashboard you created and monitor the metrics




# Amazon Pinpoint custom channel in journeys for email attachments

Amazon Pinpoint currently doesn't support attachments when sending emails via Campaigns or Journeys. Customers have to use the Amazon SES SendRawMessage API operation to include attachments, which lacks other features such as customer segmentation and scheduling. 

Email attachments are key to many use cases, some of them are:
- Monthly bills (specific to the recipient)
- New terms & conditions (same for all)
- Contracts (specific to the recipient)
- Booking confirmation (specific to the recipient)
- e-Tickets (specific to the recipient)

The solution in this repository enables marketers to design and schedule Amazon Pinpoint journeys with attachments or pre-signed URLs without the support of technical resources.

## High Level Architecture

This is the solution utilizes Amazon Pinpoint custom channel (AWS Lambda function) to support email attachments for Pinpoint Journeys. The AWS Lambda function calls Pinpoint & SES API operation for sending emails. The attached file is stored in an S3 bucket and can be either attached to the email send or accessed via an Amazon S3 pre-signed URL.

Marketers can specify the email template, friendly sender name, sender address, attachment and attachment type using Pinpoint custom channel's **Custom data** input field. Data inserted in that field will be accessible by the AWS Lambda function, which will process accordingly. 

The diagrams below outline the solution's features and possible scenarios:

![attachment-scenarios](https://github.com/Pioank/pinpoint-custom-channel-attachment/blob/main/assets/attachment-scenarios.PNG)

![architecture](https://github.com/Pioank/pinpoint-custom-channel-attachment/blob/main/assets/architecture-nn.PNG)

**Note:** Amazon Pinpoint custom channel processes endpoints in batches of 50 per AWS Lambda invokation.

**Attahced files mechanism:** 
- **Attachment per recipient:** Each recipient (endpoint) receives a different file e.g. monthly bill specific to them. The files stored in S3 should have the following naming convention **prefix_endpointid.file** e.g. OctoberBill_111.pdf. The file prefix can be specified in the AWS Lambda **Custom data** when building a journey. The AWS Lambda function builds the S3 object key (file name) by concatenating the **file prefix**, **endpoint id** and **file type**. To select this method, specify **ONEPER** in the Pinpoint journey **Custom data** field.
- **Attachment per journey** The attachment file name should be the same as the Pinpoint journey **Custom data** file prefix, the AWS Lambda will concatenate the file prefix and file type to form the S3 object key. To select this method, specify **ONEALL** in the Pinpoint journey **Custom data**.

**Pre-signed S3 link:** This solution uses the **Substitution** component of the Amazon Pinpoint SendMessages API operation to dynamically populate the message template with the S3 pre-signed URL that is passed as a parameter in the request body. Marketers can choose where to place the link in the email template by simply placing **{URL}** in the Amazon Pinpoint HTML template as part of the **href** tag as displayed here: **<a href="{URL}">Download the file</a>**. The solution uses **{URL}** but this can be changed in the code depending the requirements.

**Sending mechanism for file attachments:**
- **Attachment per recipient**: To attach and send one file per recipient the solution calls the Amazon S3 GetObject API operation per endpoint id to obtain the S3 object and the Amazon SES SendRawEmail API operation to send the email with the attachment. To follow that approach specify **ONEPER** in the Pinpoint journey **Custom data**.
- **Attachment per journey**: To attach the same file for all the recipients the solution calls only once per AWS Lambda invokation the Amazon S3 GetObject API operation, creates a list of all the endpoints (max 50) and then calls the Amazon SES SendRawEmail API operation once to send the email with the attachment.To follow that approach specify **ONEALL** in the Pinpoint journey **Custom data**.

## Considerations

1. **Events' attribution:** Engagement events from the emails sent won't be attributed automatically back to the journey. These events can still be accessed and analysed if streamed using Amazon Kinesis Firehose. To reconsile the events back to the journey, the solution includes the journey id as trace_id when sent via the SendMessage Pinpoint API operation and as a tag **JourneyId** when sent via SES SendRawEmail.
3. **No email personalization when attaching a file:** Emails with attached files sent via the SES SendRawEmail API operation won't support message helpers for personalisation. The message template is expected to not have any user or endpoint attributes.
4. **Custom data**: The order and spelling of the AWS Lambda **Custom data** field are key for this solution to function as expected. Each variable is expected to be in the a specific place and some of them need to be spelled as per the instructions in this GitHub repository e.g. NO, ONEPER, ONEALL and NA. If a Pinpoint journey gets published with the wrong **Custom data** then the emails might not be send and it will need to get duplicated and published again.

## Solution implementation

### Prerequisites

To deploy this solution, you must have the following:

- An [AWS account](https://signin.aws.amazon.com/signin?redirect_uri=https%3A%2F%2Fportal.aws.amazon.com%2Fbilling%2Fsignup%2Fresume&client_id=signup)
- The AWS CLI on your local machine. For more information see [Installing the AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) guide.
- The SAM CLI on your local machine. For more information, see [Install the SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) in the AWS Serverless Application Model Developer guide.
- The latest version of Boto3. For more information see [Installation](https://boto3.amazonaws.com/v1/documentation/api/latest/guide/quickstart.html) in the Boto3 Documentation. 
- An S3 bucket to store the attachments.
- A Pinpoint Project with the email channel enabled.
- At least one email endpoint.

### Deploy the solution

#### Step 1: Deploy the SAM application

Clone the repository to your local machine, navigate there and execute the command below on your SAM CLI:

```sh
sam deploy --stack-name pinpoint-email-attachments --guided
```

**SAM input parameters' description:**
1. **AWS region:** The region you want to deploy this solution
2. **PinpointAppId:** The Amazon Pinpoint project or application id
3. **AttachmentsBucketName:** The Amazon S3 bucket that you will store the email attachments (it doesn't need to be public)
4. **S3URLExpiration**: The number of seconds that the Amazon S3 URL will be accessible
5. **FileType:** refers to the file type of the attachments. That can be changed later in the AWS Lambda code or extend the solution to have it as **Custom data** input parameter for your marketers.

```sh
Configuring SAM deploy
======================

        Looking for config file [samconfig.toml] :  Found
        Reading default arguments  :  Success

        Setting default arguments for 'sam deploy'
        =========================================
        Stack Name [pinpoint-custom-channel-attachments]:
        AWS Region [us-east-1]:
        Parameter PinpointAppId []: pinpoint-project-id
        Parameter AttachmentsBucketName []: s3-bucket-name
        Parameter S3URLExpiration []:3600
        Parameter FileType []: .pdf
        #Shows you resources changes to be deployed and require a 'Y' to initiate deploy
        Confirm changes before deploy [Y/n]:
        #SAM needs permission to be able to create roles to connect to the resources in your template
        Allow SAM CLI IAM role creation [Y/n]:
        #Preserves the state of previously provisioned resources when an operation fails
        Disable rollback [Y/n]:
        Save arguments to configuration file [Y/n]:
        SAM configuration file [samconfig.toml]:
        SAM configuration environment [default]:

        Looking for resources needed for deployment:
         Managed S3 bucket: aws-sam-cli-managed-default-samclisourcebucket-17iz89qh57gk7
         A different default S3 bucket can be set in samconfig.toml

```

#### Step 2: Add AWS Lambda resource base policy

To allow Amazon Pinpoint to invoke the AWS Lambda function, you will need to add an AWS Lambda resource base policy.

From the command below, replace the placeholder values for:
- **function-name** with the AWS Lambda function name from the SAM deployment output
- **principal** with the AWS region that your AWS Lambda function has been deployed
- **source-arn** with the AWS region and AWS account id
- **source-account** with the AWS account id

For Windows PowerShell use the command below:
```sh
aws lambda add-permission \
--function-name myFunction \ 
--statement-id sid0 \
--action lambda:InvokeFunction \
--principal pinpoint.us-east-1.amazonaws.com \
--source-arn arn:aws:mobiletargeting:us-east-1:111122223333:apps/*
--source-account 111122223333
```

## Testing

### Step 1
Upload the file or files to the S3 bucket specified when you deployed the solution.

### Step 2
Download the email HTML templates below and create them in Pinpoint:
- [EmailAttachedFile.html](https://github.com/Pioank/pinpoint-custom-channel-attachment/blob/main/email_templates/EmailAttachedFile.html)
- [EmailNoAttachment.html](https://github.com/Pioank/pinpoint-custom-channel-attachment/blob/main/email_templates/EmailNoAttachment.html)
- [EmailS3URL.html](https://github.com/Pioank/pinpoint-custom-channel-attachment/blob/main/email_templates/EmailS3URL.html)

### Step 3
Create an Amazon Pinpoint journey and select **Custom channel** as the first activity. Choose the AWS Lambda function that got deployed as part of this solution.

![pinpoint-journey](https://github.com/Pioank/pinpoint-custom-channel-attachment/blob/main/assets/pinpoint-journey.png)

Under the **Custom data** field enter the data based on the use case you want to test.

**See an example below:** FriendlySenderName,EmailTemplateName,example@example.com,ONEPER,Oct-Statement,URL

1. **FriendlySenderName:** type the Friendly sender name and if you don't want to use one type "NA".
2. **EmailTemplateName:** this is the Amazon Pinpoint's email template name that you want to use.
3. **example@example.com:** this is the Pinpoint verified sending identity that will send the emails.
4. **ONEPER**: this takes 3 values, **ONEALL** this will use one file for all recipients, **ONEPER** this will use one file per recipient (FilePrefix_EndpointId) and **NO** which indicates that no files will be attached.
5. **Oct-Statement**: this is the S3 file name prefix that will be concatenated with the endpoint id in case you choose **ONEPER**. If you choose **ONEALL** it will search for the file with the exact name you typed.
6. **URL**: this field takes two values **URL** to generate an S3 pre-signed URL and **FILE** to attach the file to the email.

**Note:** If you want your email to contain an S3 pre-signed URL you will need to add it in advance to your email template. Use the string {URL} in the Amazon Pinpoint HTML template as part of the **href** tag as displayed here: **<a href="{URL}">Download the file</a>**

### Step 4
Publish the journey and check your inbox

## Cost

The cost displayed below is only for AWS Lambda and doesn't include the cost per email, Amazon S3 or the Amazon Pinpoint's monthly targeted audience cost.

![solution-cost](https://github.com/Pioank/pinpoint-custom-channel-attachment/blob/main/assets/custom-channel-cost-usd-nn.PNG)

## Next steps

At the moment this solution cannot render the email template when sending via Amazon SES SendRawEmail API operation. The next step is to develop a parsing mechanism to do this.

## Cleanup

To delete the solution, run the following command in the AWS CLI (compatible for both Linux & Windows PowerShell).

```sh
sam delete
```

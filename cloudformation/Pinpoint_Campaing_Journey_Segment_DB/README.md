# Amazon Pinpoint Campaings/Journeys/Segments DB
Amazon Pinpoint [event streaming capability](https://docs.aws.amazon.com/pinpoint/latest/developerguide/event-streams.html), utilizes [Amazon Kinesis Firehose or Data Streams](https://aws.amazon.com/kinesis/) to stream the raw customer engagement events to an AWS service for further processing or storage. Amazon Pinpoint customers can use these data points to create custom dashboards using a [Amazon QuickSight](https://aws.amazon.com/quicksight/) or a 3rd party business intelligence tool. 

The Amazon Pinpoint streamed events include the Campaign, Journey and Segment Ids but they don't include their names making it challenging for users to identify them when building a custom report.

### Solution & Architecture
This solution deploys a series of AWS services using [AWS CloudFormation](https://aws.amazon.com/cloudformation/) creating two [Amazon DynamoDB tables](https://aws.amazon.com/dynamodb/), one stores the mapping between Campaign/Journey Ids and their names while the second one stores the mapping between Segment Ids and their names. To query the Amazon DynamoDB data with [Amazon Athena](https://aws.amazon.com/athena/), you can use [this connector](https://docs.aws.amazon.com/athena/latest/ug/connectors-dynamodb.html).

**Note**: The solution currently supports only dynamic segments. Imported segment names won't show in the segment table.

[AWS CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-user-guide.html) logs are used to process Amazon Pinpoint management events regarding Campaigns, Journeys and Segments. These events include Campaigns/Journeys/Segments created/deleted or updated in 5 minutes intervals (fixed interval from AWS CloudTrail). 

**Note**: You can create up to five trails per AWS Region A trail that logs activity from all Regions counts as one trail per Region. Read more on [Create multiple trails](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/create-multiple-trails.html).

The AWS CloudTrail log files are process using [AWS Lambda](https://aws.amazon.com/lambda/), which gets the Campaign/Journey names using Amazon Pinpoint's respective API operations and accordingly creates or updates the respecitve items in Amazon DynamoDB. See below the Amazon DynamoDB tables' preview where **id** is the **Key** and refers to the Amazon Pinpoint Campaign, Journey or Segment Id:

**Campaigns & Journeys table:**
Fields:
1. **Id:** The Campaign/Journey Id.
2. **Deleted:** False if it still exists and True if it has been deleted.
3. **Event_name:** If it's not an event based Campaign/Journey the value will be **null**.
4. **Name:** The Campaign/Journey name.
5. **Segment_id:** The segment_id used for this Campaign/Journey. A Campaign always has a segment whereas a journey might have **null**.
6. **Type:** It's either **campaign** or **journey**.

![dynamodb_campaignjourney](https://github.com/Pioank/pinpoint-campaign-journey-db/blob/main/Assets/DynamoDB-Campaign-Journey.PNG)

**Segments table:**
Fields:
1. **Id:** The segment Id.
2. **Deleted:** False if it still exists and True if it has been deleted.
3. **Name:** The segment name.

![dynamodb_segments](https://github.com/Pioank/pinpoint-campaign-journey-db/blob/main/Assets/DynamoDB-Segments.PNG)

Upon deployment of the AWS CloudFormation template, a custom resource (AWS Lambda) performs the following two actions:
1. Creates Amazon DynamoDB items for all existing Amazon Pinpoint Campaigns, Journeys and Segments.
2. Creates an Amazon S3 event notification so upon creation of a AWS CloudTrail log file, an AWS Lambda function gets invoked for processing.

![architecture_outbound](https://github.com/Pioank/pinpoint-campaign-journey-db/blob/main/Assets/Architecture-Diagram.PNG)

### Solution logic
1. Journeys whose state is **DRAFT** aren't being created in the Amazon DynamoDB table.
2. If a Campaign, Journey or Segment gets created and deleted in under 5 minutes, it won't show on the Amazon DynamoDB tables. This is because AWS CloudTrail generates logs in 5 minute intervals and the AWS Lambda cannot perform the respective GET API operation to the Amazon Pinpoint resource that got deleted.
3. When deleting a Campaign, Journey or Segment, the Amazon DynamoDB items gets updated to reflect the new status under the attribute **Deleted**.
4. AWS CloudTrail logs are stored in an Amazon S3 bucket and they are automatically deleted after 1 day. You can change this by configuring the bucket's [lifecycle](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html).

### Prerequisites
1) [AWS account](https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/).
2) An Amazon Pinpoint project – [How to create an Amazon Pinpoint project](https://catalog.workshops.aws/amazon-pinpoint-customer-experience/en-US/prerequisites/create-a-project).
3) Deploy using AWS CloudFormation the [digital user engagement events database](https://github.com/awslabs/digital-user-engagement-events-database).
4) Deploy using AWS CloudFormation the [Amazon Athena data source connector](https://docs.aws.amazon.com/athena/latest/ug/connect-to-a-data-source-lambda-deploying.html) for [Amazon DynamoDB](https://docs.aws.amazon.com/athena/latest/ug/connectors-dynamodb.html). You can skip this step if you already have an Amazon DynamoDB - Amazon Atehna data source connector.

### Implementation
1. Download the [AWS CloudFormation template](https://github.com/Pioank/pinpoint-campaign-journey-db/blob/main/CF-PinpointCampaignJourneyDB.yaml) and navigate to the AWS CloudFormation console in the AWS region you want to deploy the solution.
2. Select **Create stack and With new resources**. Choose **Template is ready** as **Prerequisite – Prepare template** and **Upload a template file** as **Specify template**. Upload the template downloaded in **step 1**.
3. Fill the **AWS CloudFormation parameters**. For **PinpointProjectId** copy and paste your Amazon Pinpoint's project Id.
4. Once the AWS CloudFormation stack has been successfully deployed, navigate to Amazon Athena, for **Data source** select the data source connector created for Amazon DynamoDB (see Prerequisites step 4). From there select the table with name structure **<StackName>-<pinpointcampjourdb>-<randomId>** and perform any queries you want using Amazon Athena's query editor. **Note:** If you don't have any pre-existing Amazon Pinpoint Campaigns/Journeys in your Amazon Pinpoint project, first create some and wait for 5 - 10 minutes otherwise the Amazon Athena table will be empty.

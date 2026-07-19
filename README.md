# CDS Reference Architectures

Index of communication and messaging reference architectures from the AWS Communication Developer Services (CDS) team, focused on **AWS End User Messaging** and **Amazon SES**. Amazon Pinpoint patterns are kept for reference but archived.

The catalog below links every End User Messaging, SES, and (legacy) Pinpoint sample the CDS team publishes, whether it lives in its own `aws-samples` repo, elsewhere public, or in this repo's original monorepo source.

- Original monorepo source (CloudFormation templates, Lambda code, examples) and the detailed write-ups with architecture diagrams are preserved under [`legacy/`](legacy/) (see [`legacy/LEGACY_README.md`](legacy/LEGACY_README.md)). Entries for those patterns link straight to their write-up.

<!-- AUTOGEN:START - do not edit below; edit catalog.yml instead -->
**84 reference architectures** &bull; 32 mainline &bull; 52 archived

> **Filter:** use your browser find (`Ctrl/Cmd-F`) on a tag like `genai` or `whatsapp`, or jump to a section below. Every tag in the catalog is listed in the [Tag index](#tag-index).

### Contents

- [AWS End User Messaging](#aws-end-user-messaging) (18)
- [Amazon Simple Email Service (SES)](#amazon-simple-email-service-ses) (14)
- [Multi-channel / Combined](#multi-channel--combined) (1)
- [Amazon Pinpoint (Archived)](#amazon-pinpoint-archived) (51)
- [Tag index](#tag-index)
- [Add a new entry](#add-a-new-entry)

## AWS End User Messaging

WhatsApp, SMS, push and social messaging built on AWS End User Messaging. These are the actively maintained, recommended patterns.

| Sample | Tags | Description |
|--------|------|-------------|
| [Bulk SMS and Scheduling](https://github.com/aws-samples/sample-bulk-sms-and-scheduling) | `sms` `bulk` `scheduling` | Send and schedule bulk SMS with AWS End User Messaging |
| [Chat Orchestrator for Generative AI Conversations](https://github.com/aws-samples/sample-chat-orchestrator-for-generative-ai-conversations) | `genai` `chat` `multichannel` `agents` `bedrock` | Route conversations across channels to generative AI agents and Q&A bots (the communications hub) |
| [Conversational Commerce with OpenClaw and EUM](https://github.com/aws-samples/sample-conversational-commerce-openclaw-eum) | `whatsapp` `genai` `agents` `bedrock` `commerce` `openclaw` | Multi-channel conversational commerce on WhatsApp with AI agents (Bedrock AgentCore and OpenClaw) and a web storefront |
| [End User Messaging Social Automation](https://github.com/aws-samples/aws-end-user-messaging-social-automation) | `social` `whatsapp` `automation` | Automate AWS End User Messaging Social (WhatsApp) provisioning and workflows |
| [Engagement Database and Analytics](https://github.com/aws-samples/Engagement-Database-And-Analytics-Sample-For-End-User-Messaging-And-SES) | `analytics` `data-lake` `database` | Capture End User Messaging and SES engagement events into a queryable database for analytics |
| [Global SMS Planning Sheet](legacy/examples/Global%20SMS%20Planning%20Sheet-Public.xlsx) | `sms` `global` `planning` `reference` | A worksheet for planning global SMS rollouts across countries and use cases |
| [Multi-channel Messaging API with Templates](https://github.com/aws-samples/sample-multichannel-messaging-api-with-template) | `api` `multichannel` `templates` `sms` `email` | A templated multi-channel messaging API sending SMS and email through EUM and SES |
| [Notify Advanced Countries List](legacy/examples/notify-advanced-countries.csv) | `sms` `global` `reference` | Reference list of countries with advanced SMS notification requirements |
| [Omni-channel Fallback Messaging](https://github.com/aws-samples/omnichannel-fallback-messaging) | `multichannel` `sms` `fallback` `email` `whatsapp` | Fall back across channels (WhatsApp, SMS, email) when a message is not delivered |
| [Omni-channel Fallback Messaging with LINE](https://github.com/aws-samples/sample-omnichannel-fallback-messaging-with-line) | `multichannel` `sms` `fallback` `line` | Add LINE Messenger to the omni-channel fallback solution |
| [REST Frontend for End User Messaging](https://github.com/aws-samples/sample-rest-frontend-for-end-user-messaging) | `api` `rest` `frontend` | A REST API frontend for sending messages through AWS End User Messaging |
| [SMS 10DLC Registration Automation](https://github.com/aws-samples/sample-sms-10dlc-registration-automation) | `sms` `10dlc` `registration` `automation` | Automate 10DLC brand and campaign registration for SMS |
| [SNS SMS Detailed Monitoring Dashboard](https://github.com/aws-samples/amazon-sns-sms-detailed-monitoring-dashboard) | `sms` `monitoring` `dashboard` `sns` | Build a detailed monitoring dashboard for SMS sent through Amazon SNS |
| [WhatsApp Auto-Reply](https://github.com/aws-samples/communication-developer-services-reference-architectures) | `whatsapp` `serverless` | Automatically respond to inbound WhatsApp messages using AWS End User Messaging Social |
| [WhatsApp Business with Amazon Connect Chat](https://github.com/aws-samples/sample-whatsapp-end-user-messaging-connect-chat) | `whatsapp` `amazon-connect` `chat` `cdk` | Integrate WhatsApp Business with Amazon Connect using AWS End User Messaging |
| [WhatsApp Integration with AWS End User Messaging and Amazon Bedrock](https://github.com/aws-samples/communication-developer-services-reference-architectures) | `whatsapp` `genai` `bedrock` | Power conversational WhatsApp experiences with generative AI through Amazon Bedrock |
| [WhatsApp Operational Analytics](https://github.com/aws-samples/sample-whatsapp-operational-analytics) | `whatsapp` `analytics` | Capture and analyze operational metrics for WhatsApp messaging on End User Messaging |
| [WhatsApp Voice-to-Voice Messaging](https://github.com/aws-samples/sample-whatsapp-voice-to-voice-messaging) | `whatsapp` `voice` `genai` | Build a voice-to-voice WhatsApp experience with AWS End User Messaging |

## Amazon Simple Email Service (SES)

Email sending, receiving, event processing and analytics with Amazon SES.

| Sample | Tags | Description |
|--------|------|-------------|
| [Amazon SES for MCP](https://github.com/aws-samples/sample-for-amazon-ses-mcp) | `mcp` `genai` `agents` | An MCP server that lets AI agents send email through Amazon SES |
| [GenAI Email Categorization with SES Mail Manager](https://github.com/aws-samples/sample-gen-ai-email-categorization-using-ses-mail-manager) | `mail-manager` `genai` `bedrock` `inbound` | Classify and organize inbound email using generative AI with SES Mail Manager |
| [Mass Email System](https://github.com/aws-samples/sample-mass-email-system) | `bulk` `serverless` `throughput` | A serverless mass email solution built on Amazon SES |
| [Pinpoint to SES Email Template Migrator](https://github.com/aws-samples/sample-amazon-pinpoint-to-ses-email-template-migrator) | `migration` `templates` `pinpoint` | Migrate email templates from Amazon Pinpoint to Amazon SES |
| [Priority Mailer CDK Solution](https://github.com/aws-samples/sample-priority-mailer-cdk-solution-using-amazon-ses) | `cdk` `priority` `throughput` | A CDK solution that sends email through Amazon SES with priority-based routing |
| [SES Auto Reply](legacy/LEGACY_README.md#ses-auto-reply) | `inbound` `templates` `serverless` | Send a templated automatic response for non-monitored inbound email addresses |
| [SES Bounce and Complaint Dashboard](https://github.com/aws-samples/amazon-ses-bounce-dashboard) | `bounces` `complaints` `dashboard` `reputation` | Retrieve bounces and complaints from Amazon SES and display them on a dashboard |
| [SES Campaign Manager](https://github.com/aws-samples/sample-amazon-ses-campaign-manager) | `campaigns` `bulk` `serverless` | Create and manage email campaigns on top of Amazon SES |
| [SES Email S3 Event Database](legacy/LEGACY_README.md#ses-email-s3-event-database) | `events` `data-lake` `athena` `s3` | Archive SES email events to S3 and query them with Amazon Athena |
| [SES Event Data Dashboard and Analysis](https://github.com/aws-samples/amazon-ses-event-data-dashboard-analysis) &nbsp;`archived` | `events` `analytics` `dashboard` | Analyze and visualize Amazon SES event data (repo archived on GitHub) |
| [SES Event Processing](legacy/LEGACY_README.md#ses-event-processing) | `events` `reputation` `bounces` `complaints` | Process bounces and complaints to protect your sending reputation |
| [SES Load Testing and Message Queuing](https://github.com/aws-samples/load-testing-sample-amazon-ses) | `load-testing` `queuing` `throughput` | Queue bulk email while managing errors and testing sending throughput |
| [SES VDM Stat Export](legacy/LEGACY_README.md#ses-vdm-stat-export) | `vdm` `analytics` `billing` | Export monthly Virtual Deliverability Manager data for validation and billing |
| [Two-Way Email to SMS with SES](https://github.com/aws-samples/two-way-email-to-sms-with-ses) | `mail-manager` `sms` `inbound` `two-way` | Bridge email and SMS in both directions using Amazon SES |

## Multi-channel / Combined

Patterns that combine more than one channel or chain several references together.

| Sample | Tags | Description |
|--------|------|-------------|
| [Simple CMS or Static Website Host](legacy/LEGACY_README.md#simple-cms-or-static-website-host) | `cloudfront` `s3` `hosting` `images` | Host images and attachments from an S3 bucket behind Amazon CloudFront |

## Amazon Pinpoint (Archived)

Amazon Pinpoint patterns retained for reference. Pinpoint is on a deprecation path; prefer AWS End User Messaging and SES for new work. These entries are kept so existing links and historical references do not break.

| Sample | Tags | Description |
|--------|------|-------------|
| [Add / Remove from Segments via Event Activity](legacy/LEGACY_README.md#add--remove-from-segments-via-event-activity) &nbsp;`archived` | `segments` `events` `automation` | Update endpoint attributes from engagement events for dynamic segmentation |
| [Amazon Pinpoint Email Attachments with Custom Channel](legacy/LEGACY_README.md#amazon-pinpoint-email-attachments-with-custom-channel) &nbsp;`archived` | `custom-channel` `attachments` `journeys` | Support attachments in journeys through a custom channel Lambda |
| [Amazon Pinpoint WhatsApp Channel](https://github.com/aws-samples/amazon-pinpoint-whatsapp) &nbsp;`archived` | `whatsapp` `custom-channel` | Send WhatsApp messages through Amazon Pinpoint with a custom channel (use End User Messaging for new work) |
| [Amazon S3 Triggered Endpoint Imports](legacy/LEGACY_README.md#amazon-s3-triggered-endpoint-imports) &nbsp;`archived` | `s3` `imports` `endpoints` | Trigger batch endpoint imports automatically when files arrive in S3 |
| [Automatic Amazon Pinpoint Campaign Creation](legacy/LEGACY_README.md#automatic-amazon-pinpoint-campaign-creation) &nbsp;`archived` | `campaigns` `sns` `automation` | Programmatically create and execute campaigns with SNS notifications |
| [Automatic Phone Number Validate](legacy/LEGACY_README.md#automatic-phone-number-validate) &nbsp;`archived` | `phone-validate` `endpoints` | Validate phone numbers and enrich endpoint attributes automatically |
| [Custom Channel (Connect, WhatsApp, social, anything)](legacy/LEGACY_README.md#connect-or-facebook-whatsapp-twitter-anything-as-a-pinpoint-campaign-channel) &nbsp;`archived` | `custom-channel` `connect` `lambda` | Add a custom outbound channel through Lambda for calls, social and more |
| [Digital User Engagement Events Dashboard](legacy/LEGACY_README.md#digital-user-engagement-events-dashboard) &nbsp;`archived` | `quicksight` `dashboard` `analytics` | Build QuickSight dashboards from Pinpoint and SES event data |
| [External Amazon Pinpoint Campaign Templates](legacy/LEGACY_README.md#external-amazon-pinpoint-campaign-templates) &nbsp;`archived` | `campaigns` `templates` `lambda` | Fetch HTML and subject lines from external systems at send time |
| [Federated Segmentation with Amazon Athena](legacy/LEGACY_README.md#federated-segmentation-with-amazon-athena) &nbsp;`archived` | `segments` `athena` `data-lake` | Build advanced segments with Athena queries against external data lakes |
| [Multi-language Notifications with Amazon Translate and Pinpoint](https://github.com/aws-samples/multi-language-notification-with-amazon-translate-amazon-pinpoint) &nbsp;`archived` | `notifications` `multilingual` `translate` `serverless` | Build multilingual notifications with Amazon Translate and Amazon Pinpoint |
| [Multiple Accounts, Multiple Pinpoint Projects](https://github.com/aws-samples/multiple-accounts-multiple-amazon-pinpoint-projects) &nbsp;`archived` | `cdk` `multi-account` `architecture` | A CDK example for running Pinpoint across multiple accounts and projects |
| [Pinpoint Call Generator](https://github.com/aws-samples/amazon-pinpoint-call-generator) &nbsp;`archived` | `voice` `lambda` | Trigger outbound voice phone calls with Amazon Pinpoint and Lambda |
| [Pinpoint Call Retry](https://github.com/aws-samples/amazon-pinpoint-call-retry) &nbsp;`archived` | `voice` `retry` | Retry failed outbound voice calls sent through Amazon Pinpoint |
| [Pinpoint Campaigns, Journeys, Segments DB](legacy/LEGACY_README.md#amazon-pinpoint-campaigns-journeys-segments-db) &nbsp;`archived` | `reporting` `dynamodb` | Map campaign, journey and segment IDs to names in DynamoDB for reporting |
| [Pinpoint Connect Callback Requestor](https://github.com/aws-samples/amazon-pinpoint-connect-callback-requestor) &nbsp;`archived` | `sms` `voice` `amazon-connect` `callback` | Put customers into an Amazon Connect phone callback queue from an inbound SMS request |
| [Pinpoint Connect Channel](https://github.com/aws-samples/amazon-pinpoint-connect-channel) &nbsp;`archived` | `custom-channel` `amazon-connect` `voice` | Custom Pinpoint channel that places outbound calls through Amazon Connect |
| [Pinpoint DynamoDB Channel](https://github.com/aws-samples/amazon-pinpoint-dynamodb-channel) &nbsp;`archived` | `custom-channel` `dynamodb` | Custom Pinpoint channel that writes message payloads to DynamoDB |
| [Pinpoint Event Processing](legacy/LEGACY_README.md#pinpoint-event-processing) &nbsp;`archived` | `events` `reputation` | Route engagement events to help maintain sending reputation |
| [Pinpoint Event Trigger Demo](https://github.com/aws-samples/amazon-pinpoint-event-trigger-demo) &nbsp;`archived` | `events` `endpoints` `demo` | Register endpoints and generate events to demonstrate Pinpoint event triggers |
| [Pinpoint Facebook Ads Channel](https://github.com/aws-samples/amazon-pinpoint-facebookads-channel) &nbsp;`archived` | `custom-channel` `facebook` `ads` | Custom Pinpoint channel that integrates with Facebook Ads |
| [Pinpoint Google Ads Channel](https://github.com/aws-samples/amazon-pinpoint-googleads-channel) &nbsp;`archived` | `custom-channel` `google-ads` `ads` | Custom Pinpoint channel that integrates with Google Ads |
| [Pinpoint IFTTT Channel](https://github.com/aws-samples/amazon-pinpoint-ifttt-channel) &nbsp;`archived` | `custom-channel` `ifttt` | Custom Pinpoint channel that triggers IFTTT applets |
| [Pinpoint Incident Notifications Mechanism](https://github.com/aws-samples/amazon-pinpoint-incident-notifications-mechanism) &nbsp;`archived` | `notifications` `incidents` `automation` | Send incident notifications to on-call staff through Amazon Pinpoint |
| [Pinpoint Interactive Multilingual SMS](https://github.com/aws-samples/amazon-pinpoint-interactive-sms-multilingual) &nbsp;`archived` | `sms` `two-way` `multilingual` | An interactive multilingual two-way SMS workflow for updating member information |
| [Pinpoint Journey Copying Mechanism](legacy/LEGACY_README.md#pinpoint-journey-copying-mechanism) &nbsp;`archived` | `journeys` `automation` | Copy journeys from one Amazon Pinpoint project to another |
| [Pinpoint LINE Messaging API Integration](https://github.com/aws-samples/amazon-pinpoint-integration-line-messaging-api) &nbsp;`archived` | `line` `custom-channel` | Integrate the LINE Messaging API with Amazon Pinpoint |
| [Pinpoint Manage Email Unsubscribes](https://github.com/aws-samples/amazon-pinpoint-manage-email-unsubscribes) &nbsp;`archived` | `email` `opt-out` `unsubscribe` | Manage email unsubscribe requests and opt-out state for Amazon Pinpoint |
| [Pinpoint Message Archiver](legacy/LEGACY_README.md#pinpoint-message-archiver) &nbsp;`archived` | `compliance` `archiving` | Re-render and store sent messages for compliance retention |
| [Pinpoint OTP with API Gateway](https://github.com/aws-samples/amazon-api-gateway-pinpoint-otp-demo) &nbsp;`archived` | `otp` `authentication` `api-gateway` `sms` | Authenticate users with Amazon Pinpoint one-time passwords behind API Gateway |
| [Pinpoint RDS Integration](https://github.com/aws-samples/amazon-pinpoint-rds-integration) &nbsp;`archived` | `rds` `opt-in` `channels` | Update opt-in status for Pinpoint channels from data in Amazon RDS |
| [Pinpoint Real-Time Campaign Optimization](https://github.com/aws-samples/amazon-pinpoint-realtime-campaign-optimization-example) &nbsp;`archived` | `campaigns` `optimization` `ml` | Example of optimizing Pinpoint campaigns in real time |
| [Pinpoint S3 Event Database](legacy/LEGACY_README.md#pinpoint-s3-event-database) &nbsp;`archived` | `events` `data-lake` `s3` | Stream Pinpoint events to S3 to build a data lake for analysis and ML |
| [Pinpoint Salesforce Channel](https://github.com/aws-samples/amazon-pinpoint-salesforce-channel) &nbsp;`archived` | `custom-channel` `salesforce` | Custom Pinpoint channel that integrates with Salesforce |
| [Pinpoint Segment and Campaign Automation](https://github.com/aws-samples/amazon-pinpoint-segment-campaign-automation) &nbsp;`archived` | `segments` `campaigns` `automation` | Automate segment and campaign creation in Amazon Pinpoint |
| [Pinpoint Shift Management Two-Way SMS](https://github.com/aws-samples/pinpoint-shift-management-2-way-sms) &nbsp;`archived` | `sms` `two-way` `scheduling` | A shift-management workflow driven by two-way SMS on Amazon Pinpoint |
| [Pinpoint Slack Channel](https://github.com/aws-samples/amazon-pinpoint-slack-channel) &nbsp;`archived` | `custom-channel` `slack` | Custom Pinpoint channel that sends messages to Slack |
| [Pinpoint SMS S3 Event Database](legacy/LEGACY_README.md#pinpoint-sms-s3-event-database) &nbsp;`archived` | `sms` `events` `kinesis-firehose` `s3` | Stream SMS engagement events to S3 through Kinesis Data Firehose |
| [Pinpoint Twitter Channel](https://github.com/aws-samples/amazon-pinpoint-twitter-channel) &nbsp;`archived` | `custom-channel` `twitter` `social` | Custom Pinpoint channel that sends messages through Twitter |
| [Pinpoint Two-Way SMS](https://github.com/aws-samples/pinpoint-two-way-sms) &nbsp;`archived` | `sms` `two-way` | Handle inbound and outbound two-way SMS with Amazon Pinpoint |
| [Pinpoint Two-Way SMS with Lex Bot](https://github.com/aws-samples/amazon-pinpoint-lex-bot) &nbsp;`archived` | `sms` `two-way` `lex` `chatbot` | Let customers have two-way SMS chats with an Amazon Lex bot through Pinpoint and Lambda |
| [Pinpoint Update Endpoint Channel](https://github.com/aws-samples/amazon-pinpoint-updateendpoint-channel) &nbsp;`archived` | `custom-channel` `endpoints` | Custom Pinpoint channel that updates endpoint attributes at send time |
| [Pinpoint URL Shortener](https://github.com/aws-samples/amazon-pinpoint-urlshortener) &nbsp;`archived` | `sms` `url-shortener` `links` | Shorten links in Pinpoint messages with a serverless URL shortener |
| [Pinpoint Voice Channel](https://github.com/aws-samples/amazon-pinpoint-voice-channel) &nbsp;`archived` | `voice` `custom-channel` | Send voice messages through an Amazon Pinpoint custom channel |
| [Pinpoint WeChat Channel](https://github.com/aws-samples/amazon-pinpoint-wechat-channel) &nbsp;`archived` | `custom-channel` `wechat` `social` | Custom Pinpoint channel that sends messages through WeChat |
| [Real-Time Notifications with Amazon Pinpoint](https://github.com/aws-samples/send-real-time-notification-using-amazon-pinpoint-samples) &nbsp;`archived` | `notifications` `push` `samples` | Send real-time notifications to endpoints with Amazon Pinpoint |
| [Self-Managed Opt Outs](legacy/LEGACY_README.md#self-managed-opt-outs) &nbsp;`archived` | `sms` `opt-out` `compliance` | Handle STOP keyword compliance while allowing transactional exceptions |
| [Send-Time Amazon Pinpoint Campaign Attributes](legacy/LEGACY_README.md#send-time-amazon-pinpoint-campaign-attributes) &nbsp;`archived` | `campaigns` `personalization` `lambda` | Retrieve personalized data at campaign execution through Lambda hooks |
| [Sending SMS Triggered by S3 File Drop](legacy/LEGACY_README.md#sending-sms-triggered-by-s3-file-drop) &nbsp;`archived` | `sms` `s3` `automation` | Trigger SMS sends from a CSV or JSON file uploaded to S3 |
| [SMS Retry for Failed Deliveries](legacy/LEGACY_README.md#sms-retry-for-failed-deliveries) &nbsp;`archived` | `sms` `retry` | Retry transactional SMS messages that fail to deliver |
| [Triggered Imports, Phone Validate, Campaign Create](legacy/LEGACY_README.md#triggered-imports-phone-validate-campaign-create) &nbsp;`archived` | `combined` `imports` `campaigns` `pipeline` | Chain three references into an end-to-end import and campaign pipeline |

## Tag index

Search (`Ctrl/Cmd-F`) any tag to find matching samples.

`10dlc` (1) `ads` (2) `agents` (3) `amazon-connect` (3) `analytics` (5) `api` (2) `api-gateway` (1) `architecture` (1) `archiving` (1) `athena` (2) `attachments` (1) `authentication` (1) `automation` (8) `bedrock` (4) `billing` (1) `bounces` (2) `bulk` (3) `callback` (1) `campaigns` (7) `cdk` (3) `channels` (1) `chat` (2) `chatbot` (1) `cloudfront` (1) `combined` (1) `commerce` (1) `complaints` (2) `compliance` (2) `connect` (1) `custom-channel` (15) `dashboard` (4) `data-lake` (4) `database` (1) `demo` (1) `dynamodb` (2) `email` (3) `endpoints` (4) `events` (8) `facebook` (1) `fallback` (2) `frontend` (1) `genai` (6) `global` (2) `google-ads` (1) `hosting` (1) `ifttt` (1) `images` (1) `imports` (2) `inbound` (3) `incidents` (1) `journeys` (2) `kinesis-firehose` (1) `lambda` (4) `lex` (1) `line` (2) `links` (1) `load-testing` (1) `mail-manager` (2) `mcp` (1) `migration` (1) `ml` (1) `monitoring` (1) `multi-account` (1) `multichannel` (4) `multilingual` (2) `notifications` (3) `openclaw` (1) `opt-in` (1) `opt-out` (2) `optimization` (1) `otp` (1) `personalization` (1) `phone-validate` (1) `pinpoint` (1) `pipeline` (1) `planning` (1) `priority` (1) `push` (1) `queuing` (1) `quicksight` (1) `rds` (1) `reference` (2) `registration` (1) `reporting` (1) `reputation` (3) `rest` (1) `retry` (2) `s3` (6) `salesforce` (1) `samples` (1) `scheduling` (2) `segments` (3) `serverless` (5) `slack` (1) `sms` (20) `sns` (2) `social` (3) `templates` (4) `throughput` (3) `translate` (1) `twitter` (1) `two-way` (5) `unsubscribe` (1) `url-shortener` (1) `vdm` (1) `voice` (6) `wechat` (1) `whatsapp` (9)

## Add a new entry

Open an issue with the sample's URL, its service, and a one-line description, and a maintainer adds it. Or add it yourself in [`catalog.yml`](catalog.yml) and open a pull request (do not edit the table above by hand, it is generated). See [CONTRIBUTING.md](CONTRIBUTING.md) for details. Works for anything public: an `aws-samples` repo, another GitHub org, a blog, or a workshop.

<!-- AUTOGEN:END -->

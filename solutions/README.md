# Amazon Pinpoint Solutions
Organizations today are in search of vetted solutions and architectural guidance to rapidly solve business challenges. Whether customers prefer off-the-shelf deployments, or customizable architectures, The Pinpoint and SES solutions below are architectures that can be deployed directly to an account using CloudFormation templates.  Each solution has gone through a Well-Architected and Security review.

## Table of Contents
* [Amazon SES Basics](#digital-user-engagement-events-database)

## Digital User Engagement Events Database

### Architecture
![Architecture](architectures/digital-user-engagement-events-database-architecture-diagram.b1f4423b5b7e11c22879e599ee5b085b29ea16e9.png)

### Overview
Customers want to stay connected to their favorite businesses and brands. They loyally follow the latest products, news, and promotions through a variety of online and offline channels. They expect businesses and brands to understand them uniquely and communicate to them with relevant and timely messaging. Rising to meet these expectations, modern data-driven marketers look to data to understand their customers to deliver the right message, on the right channel, at the right time. These marketers require messaging tools that can execute across multiple channels at scale and analytics tools to gain insights from customer engagement.

Amazon Simple Email Service (Amazon SES) and Amazon Pinpoint provide customers powerful tools to orchestrate and deliver communications using email, SMS, voice, and mobile push channels. In addition to providing rich dashboards showing aggregate engagement data, both Amazon SES and Amazon Pinpoint allow you to stream engagement events in real-time to Amazon Kinesis. These events include email sends, email opens, email clicks, email bounces, email spam complaints, SMS sends, SMS failures, SMS opt outs, and custom application events.

The Digital User Engagement Events Database solution is a reference implementation that automatically provisions and configures the AWS services necessary to start analyzing the real-time stream of engagement data from Amazon SES and Amazon Pinpoint using Amazon Athena. The deployed event database follows best practices and can be queried directly by data analysts or pulled into visualization tools like Amazon QuickSight to create custom dashboards.

### Documentation References
- [Implementation Guide](https://docs.aws.amazon.com/solutions/latest/digital-user-engagement-events-database/overview.html)
- [Deployment Guide](https://docs.aws.amazon.com/solutions/latest/digital-user-engagement-events-database/deployment.html)
- [Github Repo](https://github.com/awslabs/digital-user-engagement-events-database)
- [Solution Page](https://aws.amazon.com/solutions/implementations/digital-user-engagement-events-database/?did=sl_card&trk=sl_card)
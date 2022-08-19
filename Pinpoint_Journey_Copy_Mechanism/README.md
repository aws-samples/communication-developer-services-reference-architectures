# Automating the Amazon Pinpoint Journey copying

## Description

Amazon Pinpoint Campaigns, Journeys and Segments are Project specific resources and cannot be copied between Projects. This can become a blocker when Amazon Pinpoint is used from multiple teams who would like to share existing resources or when migrating between projects or AWS Regions. 

To achieve the above Amazon Pinpoint users need to re-create these assets in the new Amazon Pinpoint Project. This is a manual task that takes time and it is prone to human error.

## Solution

![solution_process](SampleCode/JourneyCopyMechanism/PinpointJourneyCopyProcess.png)

The solution presented in this repository, utilizes AWS CloudFormation that executes an AWS Lambda function upon deployment and copies the specified Journeys from one Amazon Pinpoint Project to another. The solution can also copy journeys between AWS regions and have them created either in an existing Amazon Pinpoint Project or a new one.

**Solution key features:**
1. Programmatically obtain existing Journeys
3. Cross AWS Region copying
4. Optional creation of new Amazon Pinpoint project to paste the Journeys if you don't have one
5. Optional deletion of all Journeys created when deleting the CloudFormation stack

**IMPROTANT**: 
- The solution will reset the **Starting** and **End** dates of the copied Journeys. This is done because these dates might be in the past, something that isn't allowed across both Campaigns and Journeys. 
- The **Status** of all newly created Journeys is updated to **DRAFT**, which means that they are not live and they need to be published.
- If the CloudFormation creates a new Pinpoint Project, that Project won't be deleted when deleting the CloudFormation stack

## Implementation

1. Navigate to the AWS CloudFormation console under the AWS Region that you want to paste the copied Journeys.
2. Create a Stack from **New Resources** and select the [AWS CloudFormation template](SampleCode/JourneyCopyMechanism/PinpointJourneyCopingMechanismCF.yaml) from this repository.
3. Fill the template parameters as shown below:
    1. **Stack name**: Provide a name for your AWS CloudFormation stack.
    2. **AWSRegionFrom**: Select from the list the AWS Region where you want to copy the existing Pinpoint journeys from.
    3. **PinpointProjectIdFrom**: Provide the Amazon Pinpoint Project Id for the project that hosts the Pinpoint journeys.
    4. **PinpointJourneyIds**: Type the Pinpoint Journey Ids that you want to copy separated by comma "," and no spaces.
    5. **PinpointProjectId**: Type the Pinpoint Project Id if you already have one where you want the Journeys to be pasted otherwise leave it empty.
    6. **NewPInpointProjectName**: If you don't have an existing Pinpoint Project then type a name to create one.
    7. **DeleteAll**: If Yes is selected then all Pinpoint Journeys will be deleted. Note that if you create a Pinpoint Project as part of this CloudFormation template, it won't be deleted. 
4. Create the Stack.

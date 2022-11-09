import os
import json
import boto3
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from botocore.exceptions import ClientError
pinpoint_client = boto3.client('pinpoint')
s3_client = boto3.client('s3')
ses_client = boto3.client('ses')
application_id = os.environ['PINPOINT_APP_ID']
s3_bucket_name = os.environ['BUCKET_NAME']
s3_expiration = os.environ['EXPIRATION']
filetype = os.environ['FILE_TYPE']

def lambda_handler(event, context):
    print(event)
    data = list(event['Data'].split(","))
    EmailTemplate = data[1]
    FriendlyName = str(data[0])
    endpoints = event['Endpoints']
    JourneyId = str(event['JourneyId'])
    
    if FriendlyName == "NA":
        SenderAddress = str(data[2])
    else:
        SenderAddress = FriendlyName + " <" + str(data[2]) + ">"
    
    Attachment = str(data[3])
    if Attachment == "NO": # Values NO, ONEPER, ONEALL 
        send_email(SenderAddress,EmailTemplate,endpoints,JourneyId)
    else:
        AttachmentPrefix = str(data[4]) # S3 file prefix
        AttachmentType = str(data[5])   # URL for S3 presigned URL or FILE for actual attachment
        if AttachmentType == "URL":
            send_email_s3URL(SenderAddress,EmailTemplate,s3_bucket_name,AttachmentPrefix,s3_expiration,filetype,endpoints,JourneyId,Attachment)
        else:
            send_email_attach(s3_bucket_name,AttachmentPrefix,endpoints,filetype,SenderAddress,EmailTemplate,JourneyId,Attachment)

# Email with no attachment    
def send_email(SenderAddress,EmailTemplate,endpoints,JourneyId):
    for endpoint in endpoints:
        try:
        	response = pinpoint_client.send_messages(
        		ApplicationId = application_id,
        		MessageRequest = {
        			'Endpoints': {
        				endpoint: {}
        			},
        			'MessageConfiguration': {
        				'EmailMessage': {
        				'FromAddress': SenderAddress
        				}
        			},
        			'TemplateConfiguration': {
        				'EmailTemplate': {
        					'Name': EmailTemplate,
        					'Version': 'latest'
        				}
        			},
        			'TraceId': JourneyId
        		}
        	)
        except ClientError as e:
            print(e.response['Error']['Message'])
        else:
            print("Email sent!")
            print(response)  

# Email with S3 presigned URL      	
def send_email_s3URL(SenderAddress,EmailTemplate,s3_bucket_name,AttachmentPrefix,s3_expiration,filetype,endpoints,JourneyId,Attachment):
    for endpoint in endpoints:
        if Attachment == "ONEPER":
            object_name = AttachmentPrefix + "_" + endpoint + filetype
        else:
            object_name = AttachmentPrefix + filetype
        s3_url = s3_client.generate_presigned_url('get_object',Params={'Bucket': s3_bucket_name,'Key': object_name},ExpiresIn=s3_expiration)
    
        try:
            response = pinpoint_client.send_messages(
               ApplicationId = application_id,
               MessageRequest = {
                   'Endpoints': {
                       endpoint: {'Substitutions': {"S3URL": [s3_url]}}
                   },
                   'MessageConfiguration': {
                       'EmailMessage': {
                           'FromAddress': SenderAddress
                       }
                   },
                   'TemplateConfiguration': {
                       'EmailTemplate': {
                           'Name': EmailTemplate,
                           'Version': 'latest'
                       }
                   },
                   'TraceId': JourneyId
               }
            )
        except ClientError as e:
            print(e.response['Error']['Message'])
        else:
            print("Email sent!")
            print(response)       
      
# Email with attachment logic        
def send_email_attach(s3_bucket_name,AttachmentPrefix,endpoints,filetype,SenderAddress,EmailTemplate,JourneyId,Attachment):
    HTMLTemplate = pinpoint_client.get_email_template(TemplateName=EmailTemplate)
    SUBJECT = HTMLTemplate['EmailTemplateResponse']['Subject']
    BODY_HTML = HTMLTemplate['EmailTemplateResponse']['HtmlPart']
    if Attachment == "ONEPER":
        key = AttachmentPrefix + "_" + endpoint + filetype
        for endpoint in endpoints:
            EndpointData = endpoints[endpoint]
            ToAddress =[EndpointData['Address']]
            s3_object = s3_client.get_object(Bucket=s3_bucket_name,Key=key)
            attachment = s3_object['Body'].read()
            sendraw(SUBJECT,BODY_HTML,SenderAddress,ToAddress,attachment,key,JourneyId)
    else:
        key = AttachmentPrefix + filetype
        ToAddress = []
        for endpoint in endpoints:
            EndpointData = endpoints[endpoint]
            ToAddress.append(EndpointData['Address'])
        s3_object = s3_client.get_object(Bucket=s3_bucket_name,Key=key)
        attachment = s3_object['Body'].read()        
        sendraw(SUBJECT,BODY_HTML,SenderAddress,ToAddress,attachment,key,JourneyId)
        
# Email with attachment action 
def sendraw(SUBJECT,BODY_HTML,SenderAddress,ToAddress,attachment,key,JourneyId):
        CHARSET = "utf-8"
        msg = MIMEMultipart('mixed')
        msg['Subject'] = SUBJECT 
        msg['From'] = SenderAddress 
        #msg['To'] = ToAddress
        msg_body = MIMEMultipart('alternative')
        htmlpart = MIMEText(BODY_HTML.encode(CHARSET), 'html', CHARSET)
        msg_body.attach(htmlpart)
        att = MIMEApplication(attachment)
        att.add_header('Content-Disposition','attachment',filename=key)
        TAGS = "JourneyId=" + JourneyId
        msg.add_header('X-SES-MESSAGE-TAGS', TAGS)
        msg.attach(msg_body)
        msg.attach(att)
        try:
            response = ses_client.send_raw_email(
                Source=SenderAddress,
                Destinations=ToAddress,
                RawMessage={
                    'Data':msg.as_string(),
                }
            )
        except ClientError as e:
            print(e.response['Error']['Message'])
        else:
            print("Email sent! Message ID: " + response['MessageId'])
            print(response)
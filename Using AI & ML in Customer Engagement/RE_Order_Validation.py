import boto3;
import json
import datetime
import time
dynamodb = boto3.resource('dynamodb')

fulfillment_state = 'Fulfilled'

def close(intent_request, session_attributes, fulfillment_state, message):
    intent_request['sessionState']['intent']['state'] = fulfillment_state
    return {
        'sessionState': {
            'sessionAttributes': session_attributes,
            'dialogAction': {
                'type': 'Close'
            },
            'intent': intent_request['sessionState']['intent']
        },
        'messages': [message],
        'sessionId': intent_request['sessionId'],
        'requestAttributes': intent_request['requestAttributes'] if 'requestAttributes' in intent_request else None
    }

def get_session_attributes(intent_request):
    sessionState = intent_request['sessionState']
    if 'sessionAttributes' in sessionState:
        return sessionState['sessionAttributes']

    return {}
    
def get_slots(intent_request):
    return intent_request['sessionState']['intent']['slots']

def get_slot(intent_request, slotName):
    slots = get_slots(intent_request)
    if slots is not None and slotName in slots and slots[slotName] is not None:
        return slots[slotName]['value']['originalValue']
    else:
        return None    


def ProcessSlot (intent_request):
    slot_nm = get_slot(intent_request,'OrderNumber')


def GetOrderStatus(intent_request):
  
    session_attributes = get_session_attributes(intent_request)
    # Let us get our slot values
    order_nr = get_slot(intent_request,'OrderNumber')
    
    print('Order Number is '+str(order_nr))
  
  
    table = dynamodb.Table("OrderStatus")
    response = table.get_item(Key={'Order_Num' : order_nr})
    print (response)
  
    text = 'Your Order was not found. Please check the order number.'  
    
    if 'Item' in response:
        Order_Num = response['Item']['Order_Num']  
        Delivery_Dt = response['Item']['Delivery_Dt']
        Order_Dt = response['Item']['Order_Dt']
        Shipping_Dt = response['Item']['Shipping_Dt']
        UserId = response['Item']['UserId']
    
    
        text = 'Your order '+ Order_Num + ' was shipped on ' +Shipping_Dt+ ' and is expected to be delivered to your address on ' +Delivery_Dt+ ' . Your order details have been emailed to you.'
    message =  {
            'contentType': 'PlainText',
            'content': text
        }
   
    SendMessage(UserId)
    
    return close(intent_request, session_attributes, fulfillment_state, message)


   # Method for sending PP logic to be included inside sendmessage method 
def SendMessage(UserId):
    
    
    

    applicationId = "9b21677b77f34d04b9e9aac5b9a27c11"
    #endpointid = "s5hz9/+ari7ee6wgtahju/fynii" 
    client = boto3.client('pinpoint')

    response = client.get_user_endpoints(
    ApplicationId = applicationId,
    UserId = UserId
    )
    
    #print(response)
    
    print(response['EndpointsResponse'] ['Item'] [1] ['Id']) 
    
    endpointid = response['EndpointsResponse'] ['Item'] [1] ['Id']

    print ('inside putevent')
    response = client.put_events(
            ApplicationId = applicationId,
            EventsRequest={
                'BatchItem': {
                    endpointid: {
                        'Endpoint': {
                        },
                        'Events':{
                            'OrderStatus': {
                                'EventType': 'OrderStatus', #the event name that will show in Pinpoint
                                'Timestamp': datetime.datetime.fromtimestamp(time.time()).isoformat()
                            }
                        }
                    }
                } 
            }
        )
    print(response)


def lambda_handler(event, context):
    print(event)
    response = dispatch(event)
    return response
    
def dispatch(intent_request):
    intent_name = intent_request['sessionState']['intent']['name']
    response = None
    # Dispatch to your bot's intent handlers
    if intent_name == 'OrderCheck':
        return GetOrderStatus(intent_request)
        #return ProcessSlot(intent_request)
    


    
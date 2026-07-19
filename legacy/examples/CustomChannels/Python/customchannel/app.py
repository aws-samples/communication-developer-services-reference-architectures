
# This function can be used within an Amazon Pinpoint Campaign or Amazon Pinpoint Journey.

def lambda_handler(event, context):

    # print the payload the Lambda was invoked with
    print(event)
    return "Hello World!"

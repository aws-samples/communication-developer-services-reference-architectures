import pytest

from customchannel import app

@pytest.fixture()
def pinpoint_event():
    """ Generates A Pinpoint Event"""

    return {
      "Message": {},
      "ApplicationId": "71b0f21869ac444eb0185d43539b97ea",
      "CampaignId": "54115c33de414441b604a71f59a2ccc3",
      "TreatmentId": "0",
      "ActivityId": "ecf06111556d4c1ca09b1b197469a61a",
      "ScheduledTime": "2020-04-19T00:33:24.609Z",
      "Endpoints": {
        "EndpointId-1234": {
          "ChannelType": "CUSTOM",
          "Address": "+14255555555",
          "EndpointStatus": "ACTIVE",
          "OptOut": "NONE",
          "Location": {
            "Country": "USA"
          },
          "Demographic": {
            "Make": "Apple",
            "Platform": "ios"
          },
          "EffectiveDate": "2020-04-03T22:23:23.597Z",
          "Attributes": {
            "FirstName": [
              "Test"
            ]
          },
          "User": {
            "UserId": "austin52789"
          },
          "CreationDate": "2020-04-03T22:23:23.597Z"
        }
      }
    }


def test_lambda_handler(pinpoint_event):

    return_value = app.lambda_handler(pinpoint_event, "")

    assert return_value == "Hello World!"

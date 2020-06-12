/*********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License Version 2.0 (the 'License'). You may not use this file except in compliance        *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/                                                                                   *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/
/**
 * @author rjlowe
 */
const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION
});

const pinpoint = new AWS.Pinpoint();


class Pinpoint {

  /**
     * @class Pinpoint
     * @constructor
     */
    constructor(options) {
        this.options = options;
        // Cache will exist for the lifetime of the current execution only
        this.cacheCampaignContent = {}
        this.cacheJourneyContent = {}

        this.getTemplateContentByType = {
          'EMAIL': (templateName) => this.getEmailTemplateContent(templateName),
          'SMS': (templateName) => this.getSMSTemplateContent(templateName),
          'PUSH': (templateName) => this.getPushTemplateContent(templateName),
          'VOICE': (templateName) => this.getVoiceTemplateContent(templateName)
        }

        this.messageConfigurationChannel = {
          'ADMMessage': 'PUSH',
          'APNSMessage': 'PUSH',
          'BaiduMessage': 'PUSH',
          'DefaultMessage': 'PUSH',
          'EmailMessage': 'EMAIL',
          'GCMMessage': 'PUSH',
          'SMSMessage': 'SMS'
        }
    }

  getContentParts(applicationId, options) {
    return this.determineTemplateOrCampaign(applicationId, options);
  }

  determineTemplateOrCampaign(applicationId, options) {
    return options.campaignId
      ? this.getCachedCampaignContent(applicationId, options.campaignId, options.treatmentId)
      : this.getCachedJourneyContent(applicationId, options.journeyId, options.journeyActivityId)
  }

  getCachedCampaignContent(applicationId, campaignId, treatmentId) {
    const cacheKey = applicationId + ' :: ' + campaignId + ' :: ' + treatmentId;
    if (this.cacheCampaignContent[cacheKey]) {
      return this.cacheCampaignContent[cacheKey];
    }

    return this.getCampaignContent(applicationId, campaignId, treatmentId)
      .then((result) => {
        this.cacheCampaignContent[cacheKey] = result;
        return result;
      });
  }

  getCampaignContent(applicationId, campaignId, treatmentId) {

    return pinpoint.getCampaign({
        ApplicationId: applicationId,
        CampaignId: campaignId
      }).promise()
        .then((response) => {
          this.options.logger.log({
              level: 'info',
              message: JSON.stringify(response.CampaignResponse)
          });
          return response.CampaignResponse;
        })
        // Get Treatment
        .then((campaign) => {
          const additionalTreatments = campaign.AdditionalTreatments;
          delete campaign.AdditionalTreatments;
          return treatmentId === '0'
            ? campaign
            : additionalTreatments.find(x => x.Id);
        })
        .then((treatment) => {
          return Promise.all([
            this.getCampaignTemplateContent(treatment),
            this.getInlineCampaignContent(treatment)
          ])
            .then((results) => {
              return results.flat();
            })

        })
        .then((content) => {
          this.options.logger.log({
              level: 'info',
              message: JSON.stringify(content)
          });
          return content;
        })
        .catch((error) =>  {
          this.options.logger.log({
              level: 'error',
              message: JSON.stringify(error.message)
          });
          return [];
        });
  }

  getCampaignTemplateContent(treatment) {
    if (!treatment || !treatment.hasOwnProperty('TemplateConfiguration')) return [];
    return Promise.all([
      treatment.TemplateConfiguration.hasOwnProperty('EmailTemplate') ? this.getTemplateContentByType['EMAIL'](treatment.TemplateConfiguration.EmailTemplate.Name) : Promise.resolve([]),
      treatment.TemplateConfiguration.hasOwnProperty('PushTemplate') ? this.getTemplateContentByType['PUSH'](treatment.TemplateConfiguration.PushTemplate.Name) : Promise.resolve([]),
      treatment.TemplateConfiguration.hasOwnProperty('SMSTemplate') ? this.getTemplateContentByType['SMS'](treatment.TemplateConfiguration.SMSTemplate.Name) : Promise.resolve([]),
      treatment.TemplateConfiguration.hasOwnProperty('VoiceTemplate') ? this.getTemplateContentByType['VOICE'](treatment.TemplateConfiguration.VoiceTemplate.Name) : Promise.resolve([])
    ])
    .then((results) => {
      return results.flat();
    })
  }

  getInlineCampaignContent(treatment) {

    return Promise.resolve(Object.keys(treatment.MessageConfiguration).filter(key => treatment.MessageConfiguration[key].Title || treatment.MessageConfiguration[key].Body)
      .reduce((content, key) => {

        const item = treatment.MessageConfiguration[key];
        const channel = this.messageConfigurationChannel[key];

        return [
          ...content,
          {pieceType: 'TITLE', html: item.Title, channel},
          {pieceType: 'BODY', html: item.Body, channel},
          {pieceType: 'HTML', html: item.HtmlBody, channel},
          {pieceType: 'RAWCONTENT', html: item.RawContent, channel}
        ];
      }, []));
  }

  getCachedJourneyContent(applicationId, journeyId, journeyActivityId) {
    const cacheKey = applicationId + ' :: ' + journeyId + ' :: ' + journeyActivityId;
    if (this.cacheJourneyContent[cacheKey]) {
      return this.cacheJourneyContent[cacheKey];
    }

    return this.getJourneyContent(applicationId, journeyId, journeyActivityId)
      .then((result) => {
        this.cacheJourneyContent[cacheKey] = result;
        return result;
      });
  }

  getJourneyContent(applicationId, journeyId, journeyActivityId) {
    return pinpoint.getJourney({
      ApplicationId: applicationId,
      JourneyId: journeyId,
    }).promise()
      // Get the Journey
      .then((response) => {
        this.options.logger.log({
            level: 'info',
            message: JSON.stringify(response.JourneyResponse)
        });
        return response.JourneyResponse;
      })
      // Get the Activity
      .then((journey) => {
        return journey.Activities[journeyActivityId];
      })
      // Get the Template
      .then((activity) => {
        const templateType = Object.keys(activity);
        const templateName = activity[templateType]['TemplateName'];
        return this.getTemplateContentByType[templateType](templateName);
      })
      .then((content) => {
          this.options.logger.log({
              level: 'info',
              message: JSON.stringify(content)
          });
          return content;
        })
      .catch((error) =>  {
        this.options.logger.log({
            level: 'error',
            message: JSON.stringify(error.message)
        });
        return [];
      });
  }

  getEmailTemplateContent(templateName) {
    if (!templateName) return [];
    return pinpoint.getEmailTemplate({
      TemplateName: templateName
    }).promise()
      .then((response) => {
        return response.EmailTemplateResponse;
      })
      .then((template) => {
        this.options.logger.log({
              level: 'info',
              message: JSON.stringify(template)
          });
        return this.getEmailContent(template);
      });
  }

  getEmailContent(email) {
    if (!email) return [];
    return [
      {pieceType: 'TITLE', html: email.Subject, defaultSubs: email.DefaultSubstitutions, channel: 'EMAIL'},
      {pieceType: 'HTML', html: email.HtmlPart, defaultSubs: email.DefaultSubstitutions, channel: 'EMAIL'},
      {pieceType: 'TEXT', html: email.TextPart, defaultSubs: email.DefaultSubstitutions, channel: 'EMAIL'}
    ];
  }

  getSMSTemplateContent(templateName) {
    if (!templateName) return [];
    return pinpoint.getSmsTemplate({
      TemplateName: templateName
    }).promise()
      .then((response) => {
        return response.SMSTemplateResponse;
      })
      .then((template) => {
        return this.getSMSContent(template);
      });
  }

  getSMSContent(sms) {
    if (!sms) return [];
    return [
      {pieceType: 'BODY', html: sms.Body, defaultSubs: sms.DefaultSubstitutions, channel: 'SMS'}
    ];
  }

  getPushTemplateContent(templateName) {
    if (!templateName) return [];
    return pinpoint.getPushTemplate({
      TemplateName: templateName
    }).promise()
      .then((response) => {
        return response.PushNotificationTemplateResponse;
      })
      .then((template) => {
        return this.getPushContent(template);
      });
  }

  getPushContent(push) {
    if (!push) return [];
    return Object.keys(push)
      .filter(key => key.Body)
      .reduce((total, key) => {
        return [
          ...total,
          {pieceType: 'BODY', html: push.Body, defaultSubs: push.DefaultSubstitutions, channel: 'PUSH'},
          {pieceType: 'RAWCONTENT', html: push.RawContent, defaultSubs: push.DefaultSubstitutions, channel: 'PUSH'},
          {pieceType: 'TITLE', html: push.Title, defaultSubs: push.DefaultSubstitutions, channel: 'PUSH'}
        ];
      }, []);
  }

  getVoiceTemplate(templateName) {
    if (!templateName) return [];
    return pinpoint.getVoiceTemplate({
      TemplateName: templateName
    }).promise()
      .then((response) => {
        return response.VoiceTemplateResponse;
      })
      .then((template) => {
        return [
          {pieceType: 'BODY', html: template.Body, defaultSubs: template.DefaultSubstitutions, channel: 'VOICE'}
        ];
      });
  }

}


module.exports = Pinpoint;

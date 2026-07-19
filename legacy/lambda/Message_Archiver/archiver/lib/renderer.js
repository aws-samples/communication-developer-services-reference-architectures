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
const promisedHandlebars = require('promised-handlebars');
const Q = require('q');
const Handlebars = promisedHandlebars(require('handlebars'), { Promise: Q.Promise });

class Renderer {

    /**
     * @class Renderer
     * @constructor
     */
    constructor(options) {
        this.options = {}
        this.options.logger = options.logger.child({module: 'lib/renderer.js'});
        this.cacheCompilers = {};
    }

    async render(content, endpoint, endpointId, config) {

      endpoint['Id'] = endpointId;
      endpoint['Address'] = 'XXXXXXXX';
      const key = `${config.campaignId}_${config.journeyId}`
      const compilers = this.getCompilers(key, content);

      const renderedContentPromises = compilers.map((compiler, i) => {

        const compileContext = Object.assign({}, endpoint, compiler.defaultSubs ? JSON.parse(compiler.defaultSubs) : {});

        this.options.logger.log({
            level: 'info',
            message: JSON.stringify(compileContext)
        });

        return compiler.pieceCompiler(compileContext)
          .then((html) => {
            return {pieceType: compiler.pieceType, html, channel: compiler.channel};
          });
      });

      return Promise.all(renderedContentPromises);

    }

    getCompilers(key, content) {

      if (!content) return [];

      if (this.cacheCompilers[key]) {
        return this.cacheCompilers[key];
      }

      // {pieceType: APNS.Title, html: 'blob', defaultSubs: '{json}'}

      const compilers = content.filter(piece => piece.html).map((piece, i) => {
        return {
            pieceType: piece.pieceType,
            pieceCompiler: Handlebars.compile(piece.html),
            defaultSubs: piece.defaultSubs,
            channel: piece.channel
          };
      });

      this.cacheCompilers[key] = compilers;

      return compilers;

    }

}

module.exports = Renderer;

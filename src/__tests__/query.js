/**
 *  Copyright (c) 2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { TrackSchema } from '../schema.js';
import { graphql } from 'graphql';

// 80+ char lines are useful in describe/it, so ignore in this file.
/*eslint-disable max-len */

describe('Tracks query tests',  () => {
  describe('Basic Queries', () => {
    it('Correctly returns', async () => {
      var query = `
        query HeroNameQuery {
          artists {
            artist
          }
        }
      `;
      var expected = {
        artists: [{
          artist: 'prince'
        }]
      };
      var result = await graphql(TrackSchema, query);
      expect(result).to.deep.equal({ data: expected });
    });
    it('Correctly returns', async () => {
      var query = `
        query HeroNameQuery {
          artists {
            artist
            image(size:"large"){
              url
            }
            albums {
              album
              image(size:"large"){
                url
              }
              tracks {
                title
              }
            }
          }
        }
      `;
      var expected = {
        artists: [{
          artist: 'prince'
        }]
      };
      var result = await graphql(TrackSchema, query);
      expect(result).to.deep.equal({ data: expected });
    });
  })
})

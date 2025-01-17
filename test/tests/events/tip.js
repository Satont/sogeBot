/* eslint-disable @typescript-eslint/no-var-requires */
/* global  */

const assert = require('assert');

require('../../general.js');

const { getRepository } = require('typeorm');
const { v4: uuidv4 } = require('uuid');

const { Event } = require('../../../dest/database/entity/event');
const { User } = require('../../../dest/database/entity/user');
const events = (require('../../../dest/events')).default;
const log = require('../../../dest/helpers/log');
const changelog = (require('../../../dest/helpers/user/changelog'));
const time = require('../../general.js').time;
const db = require('../../general.js').db;
const message = require('../../general.js').message;

describe('Events - tip event - @func3', () => {
  before(async () => {
    await db.cleanup();
    await message.prepare();
  });

  describe('#2219 - Give points on tip not working', function () {
    before(async function () {
      await getRepository(Event).save({
        id:          uuidv4(),
        name:        'tip',
        givenName:   'Tip alert',
        triggered:   {},
        definitions: {},
        filter:      '',
        isEnabled:   true,
        operations:  [{
          name:        'run-command',
          definitions: {
            isCommandQuiet: true,
            commandToRun:   '!points add $username (math.$amount*10)',
          },
        }],
      });

      for (const user of ['losslezos', 'rigneir', 'mikasa_hraje', 'foufhs']) {
        await getRepository(User).save({ userName: user, userId: String(Math.floor(Math.random() * 100000)) });
      }
    });

    for (const username of ['losslezos', 'rigneir', 'mikasa_hraje', 'foufhs']) {
      describe(username + ' tip event', () => {
        it('trigger tip event for 10 EUR - ' + username, async () => {
          log.tip(`${username}, amount: 10.00EUR, message: Ahoj jak je`);
          events.fire('tip', {
            userId: String(Math.floor(Math.random * 100000)), userName: username, amount: 10.00, message: 'Ahoj jak je', currency: 'EUR',
          });
        });

        it('wait 1s', async () => {
          await time.waitMs(1000);
        });

        it('we are not expecting any messages to be sent - quiet mode', async () => {
          assert.strict.equal(log.chatOut.callCount, 0);
        });

        it('user should have 100 points', async () => {
          await changelog.flush();
          const user = await getRepository(User).findOne({ userName: username });
          assert.strict.equal(user.points, 100);
        });
      });
    }
  });
});

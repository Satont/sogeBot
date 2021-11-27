/* eslint-disable import/order */
'use strict';

import _ from 'lodash';
import { getRepository } from 'typeorm';

import { ModerationPermit } from '../database/entity/moderation';
import { Settings } from '../database/entity/settings';
import { User, UserInterface } from '../database/entity/user';
import { command, default_permission, parser } from '../decorators';
import { onStreamEnd, onStreamStart } from '../decorators/on';
import { defaultPermissions } from '../helpers/permissions';
import System from './_interface';
import points from './points';
import { sendMessage } from '../helpers/commons/sendMessage';
import { isModerator, isOwner } from '../helpers/user';
import twitch from '../services/twitch'
import { variables } from '../watchers';
import { tmiEmitter } from '~/helpers/tmi';
import media from '~/overlays/media';

const greetings = [
  {
    username: 'sadisnamenya',
    message: 'Хляньте, 9см в чат зашёл PogChamp Ну привет s4tont',
    overlay: `type=image url=https://bot.rusty777.ml/gallery/5e13cfa5-a3ca-484d-a492-0e39c9aacf61 time=5000 x-offset=650 y-offset=200 align=center | type=audio url=https://bot.rusty777.ml/gallery/735b7126-c1e2-4596-b2f4-b87c7b535abf volume=50 | type=text text='Хляньте, 9см в чат зашёл PogChamp' time=5000 x-offset=650 y-offset=230 class=text`,
  },
  { username: 'rusty', message: 'Бахиня на месте CoolCat' },
  {
    username: 'pineapplevan',
    message: 'Всем встать, уважаемый человек в чат зашел! @vskroisya rustykF',
    overlay: `type=image url=https://bot.rusty777.ml/gallery/0db974d2-6648-45d9-a448-581eb2f16dfc time=6000 x-offset=650 y-offset=200 align=center | type=audio url=https://bot.rusty777.ml/gallery/1328fe2d-a054-4b3f-ae5d-3b600df4b6bb volume=50 | type=text text='Всем встать, уважаемый человек в чат зашел!' time=5000 x-offset=650 y-offset=230 class=text`,
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

class Rusty extends System {
  users: string[] = [];
  kaznYesVotes = 0;
  kaznNoVotes = 0;

  constructor() {
    super();
  }

  @command('!sayb')
  @default_permission(defaultPermissions.CASTERS)
  async sayB(msg: CommandOptions | string) {
    const message = typeof msg === 'string' ? msg : msg.parameters
    return twitch.tmi?.client.broadcaster?.say(variables.get('services.twitch.broadcasterUsername') as string, message)
  }

  async getOnlineUsers(): Promise<UserInterface[]> {
    return await getRepository(User).createQueryBuilder('user')
      .where('user.username != :botusername', { botusername: (variables.get('services.twitch.botUsername') as string).toLowerCase() })
      .andWhere('user.username != :broadcasterusername', { broadcasterusername: (variables.get('services.twitch.broadcasterUsername') as string).toLowerCase() })
      .andWhere('user.isOnline = :isOnline', { isOnline: true })
      .cache(true)
      .getMany();
  }

  @command('!smoke')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async smoke(opts: CommandOptions) {
    await sendMessage('/clear', opts.sender);
    await sendMessage(`${opts.sender.displayName} заюзал smoke of deceit PogChamp`, opts.sender);
  }

  @command('!gale')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async gale(opts: CommandOptions) {
    await sendMessage(`Веник смазал этот чатик гелем Kappa `, opts.sender);
    await sendMessage(`/slow 40`, opts.sender);
    await sleep(40 * 1000);
    await sendMessage(`/slowoff`, opts.sender);
  }

  /* @command('!www')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async emp(opts: CommandOptions) {
    const random: number = _.random(0, 5);
    const online = await this.getOnlineUsers();
    const users: UserInterface[] = _.sampleSize(online, random);
    if (random === 0) {
      await sendMessage(`${opts.sender.displayName} эта магия разочаровывает. Слишком маленький уровень WEX`, opts.sender);
      return;
    }
    await _.forEach(users, async function (o) {
      await getRepository(User).decrement({ userId: o.userId }, 'points', 50);
    });
    const givePts = random * 50;
    await getRepository(User).decrement({ userId: opts.sender.userId }, 'points', givePts);
    await sendMessage(`${opts.sender.displayName} экстрагирующий Мана Пульс! Ты успешно выжег ману ${_.join(
      users.map(o => o.username),
      ', '
    )} (${givePts}) rustykMLG `, opts.sender);
  } */

  @command('!hook')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async hook(opts: CommandOptions) {
    const online = await this.getOnlineUsers()
    const random = _.random(0, 35);
    if (random === 0) {
      await sendMessage(`${opts.sender.displayName} Способность rustykHook не изучена. Длина твоего rustykHook = 0. Ты обложался, друг LUL`, opts.sender);
    } else if (random <= 10) {
      const randomUser = _.sample(online);
      await sendMessage(`${opts.sender.displayName} длина твоего rustykHook  = ${random}см, коротенький но все же ты попал по  ${randomUser}`, opts.sender);
      tmiEmitter.emit('timeout', randomUser!.userName, 5, isModerator(randomUser!));
    } else if (random <= 25) {
      const users = _.sampleSize(online, 2);
      await sendMessage(`Мясника вызывали? rustykHook ${opts.sender.displayName} попал хуком длиной ${random}см сразу по двоим! ${_.join(users, ', ')} летают на его хуке!`, opts.sender);
      _.forEach(users, async (user) => {
        tmiEmitter.emit('timeout', user!.userName, 5, isModerator(user!));
      });
    } else if (random <= 34) {
      const users = _.sampleSize(online, 3);
      await sendMessage(`Кому свежих рёбрышек? ${opts.sender.displayName} вытянул своим ${random}-сантиметровым инструментом аж 3-их из чата! PogChamp PogChamp ${_.join(users, ', ')} желаю вам хорошо провести время rustykHook`, opts.sender);
      _.forEach(users, async (user) => {
        tmiEmitter.emit('timeout', user!.userName, 5, isModerator(user!));
      });
    } else if (random <= 35) {
      const users = _.sampleSize(online, 5);
      await sendMessage(`rustykHook Хы-хы-хы-хы, свежее мясо! Да этот пудж ${opts.sender.displayName} бешеный! Ты выхукал всю тиму! Твой 35-ти сантиметровый хук видно с другого конца карты! rustykPride Насадил на свой огромный хук ${_.join(users, ', ')}`, opts.sender);
      _.forEach(users, async (user) => {
        tmiEmitter.emit('timeout', user!.userName, 5, isModerator(user!));
      });
    }
  }

  @command('!buff')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async buff(opts: CommandOptions) {
    const array = [
      'Лич накинул на тебя ICE ARMOR!',
      'Заботливый Огр юзанул на тебя BLOODLUST!',
      'WEAWE от Даззла поможет тебе!',
      'Даже Бладсикер беспокоится о тебе, лови BLOODRAGE!',
      'Природа не всегда добра, но теперь ты под LIVING ARMOR!',
    ];
    await sendMessage(`${opts.sender.displayName} ${_.sample(array)} Можешь запостить 1 ссылку в чат`, opts.sender);
    await getRepository(ModerationPermit).insert({ userId: opts.sender.userId });
  }

  @command('!march')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async march(opts: CommandOptions) {
    await sendMessage(`Go my little friends! Go! March, March! March! March!`, opts.sender);
    await sendMessage('/emoteonly', opts.sender);
    await sleep(30 * 1000);
    await sendMessage(`/emoteonlyoff`, opts.sender);
  }

  @command('!echo')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async echo(opts: CommandOptions) {
    await sendMessage(`/subscribers`, opts.sender);
    await sendMessage(`${opts.sender.displayName} Echo slamma jamma! отличный врыв от ${opts.sender.displayName}`, opts.sender);
    await sleep(60 * 1000);
    await sendMessage('/subscribersoff', opts.sender);
  }

  @command('!kill')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async kill(opts: CommandOptions) {
    const p: string = _.toLower(_.replace(opts.parameters, '@', ''));
    const pu = await getRepository(User).findOne({ userName: p });

    if (!pu) {
      return;
    }
    if (isOwner(pu) || p === 'forgesplrit') {
      await sendMessage(`${opts.sender.displayName} невежество предопределило твой крах.`, opts.sender);
      tmiEmitter.emit('timeout', pu.userName, 30, isModerator(pu));
    } else {
      await sendMessage(`Я слышал писк? Должно быть наступил на что-то. ${pu.userName} изгнан в небытие на 30 секунд.`, opts.sender);
      tmiEmitter.emit('timeout', pu.userName, 30, isModerator(pu));
    }
  }

  @command('!zeus')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async zeus(opts: CommandOptions) {
    const online = await this.getOnlineUsers()
    _.forEach(online, async (user) => {
      tmiEmitter.emit('timeout', user.userName, 2, isModerator(user));
    });
    const aghanim = _.random(0, 1);
    if (aghanim === 0) {
      await sendMessage(`От гнева небес не скрыться! @${opts.sender.userName} прожал THUNDERGOD'S WRAITH! rustykZeusLUL`, opts.sender);
    } else {
      const random = _.sample(online);
      await sendMessage(`От гнева небес не скрыться! @${opts.sender.userName} прожал THUNDERGOD'S WRAITH! Да ты еще и с аганимом?! NIMBUS вырубает @${random} Дай Бог тебе по сусалам! rustykZeusLUL`, opts.sender);
      tmiEmitter.emit('timeout', random!.userName, 30, isModerator(random!));
    }
  }

 /*  @command('!call')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async call(opts: CommandOptions) {
    const array: string[] = [`NATURE'S CALL! Мы всего лишь глупые пеньки, но ты $sender определенно не бревно SSSsss`, `SPAWN SPIDERLINGS! $sender Ты не наша мама! Выводку нужна еда pastaThat DoritosChip Спасибо что пришел TPFufun И у тебя на носу павук.`, `SUMMON WOLVES! Ааауууууууууу!! Человек человеку волк. Добро пожаловать в стаю $sender!`, `CALL OF THE WILD! Ммм.. поймал твой запах $sender, теперь ты наша добыча!`, `DEMONIC CONVERSION! $sender ты зашел на затухающую орбиту и мы чувствуем пустоту внутри тебя. Позволь нам заполнить ее смертью. PurpleStar`, `SUMMON SPIRIT BEAR! Медведь. Водка. Балалайка. Ti ruski? RitzMitz`];
    const randomed = _.sample(array) as string;
    const result = _.replace(randomed, '$sender', opts.sender.username);
    await sendMessage(result, opts.sender);
  } */

  @command('!sniper')
  @default_permission(defaultPermissions.SUBSCRIBERS)
  async sniper(opts: CommandOptions) {
    await sendMessage(`/me ${opts.sender.userName} прицеливается..`, opts.sender);
    await sleep(1000);
    await sendMessage(`/me ${opts.sender.userName} передергивает затвор...`, opts.sender);
    await sleep(3000);
    this.sniperHelper(opts);
  }
  async sniperHelper(opts: CommandOptions) {
    const random = _.random(1, 6);
    const online = await this.getOnlineUsers()
    const sender = await getRepository(User).findOne({ userId: opts.sender.userId })

    switch (random) {
      case 1:
        await sendMessage(`${opts.sender.userName} ты промазал rustykRaki`, opts.sender);
        break;
      case 2:
        await sendMessage(`${opts.sender.userName} ты попал по ${_.sample(online)?.userName}, но не по голове rustykBebe`, opts.sender);
        break;
      case 3:
        const user = _.sample(online);
        await sendMessage(`${opts.sender.userName} убивает выстрелом в голову ${user?.userName} PogChamp rustykStreamSniper`, opts.sender);
        tmiEmitter.emit('timeout', user!.userName, 10, isModerator(user!));
        break;
      case 4:
        await sendMessage(`${opts.sender.userName} ты бы хоть обойму проверил, у тебя нет патронов Jebaited Пока ты тормозил тебя убили... MingLee `, opts.sender);
        tmiEmitter.emit('timeout', opts.sender.userName, 15, isModerator(sender!));
        break;
      case 5:
        const firstUser = _.sample(online);
        const secondUser = _.sample(online);
        await sendMessage( `${opts.sender.userName} убивает одним выстрелом сразу двоих  ${firstUser?.userName}, ${secondUser?.userName} PogChamp Пробил 2 каски из M200, ${opts.sender.userName} ты лучший снайпер этого чата! rustykTOP rustykStreamSniper rustykTOP`, opts.sender);

        [firstUser, secondUser].forEach(user => {
          tmiEmitter.emit('timeout', user!.userName, 20, isModerator(user!));
        });

        break;
      case 6:
        await sendMessage(`${opts.sender.userName} а какой вообще смысл если ты все равно умрешь от зоны? LUL`, opts.sender);
        tmiEmitter.emit('timeout', opts.sender.userName, 10, isModerator(sender!));
        await sendMessage(`/me ${opts.sender.userName} умер от зоны и потерял весь лут пока целился rustykRaki`, opts.sender);
        break;
    }
  }

  @command('!казнь')
  @default_permission(defaultPermissions.VIEWERS)
  async kazn(opts: CommandOptions) {
    const query = await getRepository(Settings).findOne({ name: 'kazn' });

    if (!query) {
      return;
    }

    const current: { runned: boolean; sender: string | null; target: string | null } = JSON.parse(query.value);

    if (current && current.runned === true) {
      return;
    }

    const target = await getRepository(User).findOne({ userName: _.toLower(_.replace(opts.parameters, '@', '')) });

    if (!target || isOwner(target)) {
      return;
    }

    await sendMessage(`/me @${opts.sender.userName} считает что @${target} нужно приговорить к таймауту на 100 с. Голосование за КАЗНЬ @${target.userName} напишите в чат "да" если @${target.userName}  недостоин находиться в чатике, напишите "нет" чтобы помиловать и спасти от казни.`, opts.sender);
    await sendMessage(`/me @${target.userName}  у тебя есть минута, пока чат присяжных принимает решение, ANY LAST WORD?`, opts.sender);

    query.value = JSON.stringify({ runned: true, target: target.userName, sender: opts.sender.userName });
    await getRepository(Settings).save(query);

    await sleep(60 * 1000);
    await this.verdict(opts);
  }

  async verdict(opts: CommandOptions) {
    const query = await getRepository(Settings).findOne({ name: 'kazn' });

    if (!query) {
      return;
    }

    const kazn = JSON.parse(query.value);
    const target = await getRepository(User).findOne({ userName: kazn.target });
    const sender = await getRepository(User).findOne({ userName: kazn.sender });

    if (!target || !sender) {
      return;
    }

    if (this.kaznYesVotes > this.kaznNoVotes) {
      await sendMessage(`/me @${kazn.target} чат постановил: ВИНОВЕН! Ты приговорен к СМЭРТИ на 100 сек. Твой палач @${kazn.sender}`, opts.sender);
      tmiEmitter.emit('timeout', target.userName, 100, isModerator(target!));
    } else {
      await sendMessage(`/me @${target.userName} чат постановил: НЕ ВИНОВЕН! Тебя пощадил милостивый чат, ты свободен! @${sender.userName} осужден за клевету и изгнан на 50 сек.`, opts.sender);
      tmiEmitter.emit('timeout', sender.userName, 50, isModerator(sender!));
    }
    await sendMessage(`/me Голосов за: ${this.kaznYesVotes}, против: ${this.kaznNoVotes}`, opts.sender);
    query.value = JSON.stringify({ runned: false, target: null, sender: null });
    await getRepository(Settings).save(query);
    this.kaznNoVotes = 0;
    this.kaznYesVotes = 0;
  }

  @parser({ fireAndForget: true })
  async kaznParser(opts: ParserOptions) {
    const query = await getRepository(Settings).findOne({ name: 'kazn' });
    if (!query) {
      return;
    }
    const current = JSON.parse(query.value);

    if (current.runned === false) {
      return;
    }

    if (opts.message.toLowerCase() === 'да' || opts.message.toLowerCase() === 'lf') {
      this.kaznYesVotes++;
    }
    if (opts.message.toLowerCase() === 'нет' || opts.message.toLowerCase() === 'ytn') {
      this.kaznNoVotes++;
    }
  }

  @parser({ fireAndForget: true })
  async mirrobot(opts: ParserOptions) {
    const message = opts.message;

    if (opts.sender?.userName === 'mirrobot' && message.includes('дал верный ответ')) {
      const winner = opts.message.split(' ')[0];
      await getRepository(User).increment({ userName: winner }, 'points', 100);
      await sendMessage(`@${winner} получает 100 mp за правильный ответ!`, opts.sender);
    }
  }

  @parser({ fireAndForget: true })
  async greetings(opts: ParserOptions) {
    const user = greetings.find(o => o.username === opts.sender?.userName);
    if (!opts.sender?.userName) return

    if (user && this.users.indexOf(opts.sender.userName) < 0) {

      this.users.push(opts.sender.userName);
      await sendMessage(user.message, opts.sender);
      if (user.overlay) {
        await media.overlay({
          command: 'alert',
          sender: opts.sender,
          parameters: user.overlay,
          createdAt: Date.now(),
          attr: { skip: false, quiet: false },
          emotesOffsets: new Map(),
          discord: undefined,
          isAction: false,
          isFirstTimeMessage: false
        });
      }
    }
  }

  @onStreamEnd()
  start() {
    console.log('Stream ended, users cleared');
    this.users = [];
  }

  @onStreamStart()
  end() {
    console.log('Stream started, users cleared');
    this.users = [];
  }

  @command('!распылить')
  @default_permission(defaultPermissions.VIEWERS)
  async spray(opts: CommandOptions) {
    let howMuch = parseInt(opts.parameters, 10);
    if (howMuch < 0 || howMuch === 0) {
      return sendMessage(`@${opts.sender.displayName} ага да проверяй`, opts.sender);
    }
    if (_.isNaN(howMuch)) {
      return;
    }

    const availablePoints = await points.getPointsOf(opts.sender.userId);
    if (availablePoints < howMuch) {
      return sendMessage(`@${opts.sender.displayName} недостаточно поинтов`, opts.sender);
    }
    await getRepository(User).increment({ userId: opts.sender.userId }, 'points', -Math.min(howMuch, availablePoints));
    const onlineUsers = await this.getOnlineUsers();

    if (howMuch <= 1000) {
      let i = 0;
      for (const item of onlineUsers) {
        if (i >= 3) {
          break;
        }
        let toUser;
        if (i === 2) {
          toUser = howMuch;
        } else {
          toUser = _.random(0, howMuch);
        }

        // _.remove(onlineUsers, o => o.id === item.id)

        await sendMessage(`@${item.userName} получает ${toUser} mp!`, opts.sender);
        await getRepository(User).increment({ userId: item.userId }, 'points', toUser);
        howMuch = howMuch - toUser;
        i++;
      }
    } else if (1000 < howMuch && howMuch <= 5000) {
      let i = 0;
      for (const item of onlineUsers) {
        if (i >= 5) {
          break;
        }
        let toUser;
        if (i === 4) {
          toUser = howMuch;
        } else {
          toUser = _.random(0, howMuch);
        }

        // _.remove(onlineUsers, o => o.id === item.id)

        await sendMessage(`@${item.userName} получает ${toUser} mp!`, opts.sender);
        await getRepository(User).increment({ userId: item.userId }, 'points', toUser);
        howMuch = howMuch - toUser;
        i++;
      }
    } else if (5000 < howMuch && howMuch <= 10000) {
      let i = 0;
      for (const item of onlineUsers) {
        if (i >= 7) {
          break;
        }
        let toUser;
        if (i === 6) {
          toUser = howMuch;
        } else {
          toUser = _.random(0, howMuch);
        }

        // _.remove(onlineUsers, o => o.id === item.id)

        await sendMessage(`@${item.userName} получает ${toUser} mp!`, opts.sender);
        await getRepository(User).increment({ userId: item.userId }, 'points', toUser);
        howMuch = howMuch - toUser;
        i++;
      }
    } else if (howMuch >= 20000) {
      let i = 0;
      for (const item of onlineUsers) {
        if (i >= 10) {
          break;
        }
        let toUser;
        if (i === 9) {
          toUser = howMuch;
        } else {
          toUser = _.random(0, howMuch);
        }

        // _.remove(onlineUsers, o => o.id === item.id)

        await sendMessage(`@${item.userName} получает ${toUser} mp!`, opts.sender);
        await getRepository(User).increment({ userId: item.userId }, 'points', toUser);
        howMuch = howMuch - toUser;
        i++;
      }
    }
  }

  @command('!luck')
  @default_permission(defaultPermissions.VIEWERS)
  async luck(opts: CommandOptions) {
    let userPoints;
    let bet = opts.parameters.split(' ')[0];
    if (bet === 'все' || bet === 'всё' || bet === 'all') {
      userPoints = await points.getPointsOf(opts.sender.userId);
      bet = userPoints.toString();
    } else if (isNaN(_.toNumber(bet))) {
      return await sendMessage(`${opts.sender.displayName} хм, уверен, что используешь команду правильно? !luck 50`, opts.sender);
    }
    if (_.toNumber(bet) < 50) {
      return await sendMessage(`${opts.sender.displayName} минимальное число - 50`, opts.sender);
    }

    userPoints = await points.getPointsOf(opts.sender.userId);

    if (userPoints < _.toNumber(bet)) {
      return await sendMessage(`${opts.sender.displayName} у тебя не хватает mp, минимальное число - 50`, opts.sender);
    }
    const rand = Math.floor(Math.random() * 100);

    await getRepository(User).decrement({ userId: opts.sender.userId }, 'points', _.toNumber(bet));

    if (rand >= 1 && rand <= 3) {
      await sendMessage(`${opts.sender.displayName}, кажется, запахло жареным! MULTICAST x5 с шансом 1% впервые в истории!!! PogChamp PogChamp PogChamp Поздравляю, теперь у тебя ${(_.toNumber(bet) * 5) + (userPoints - _.toNumber(bet))} mp!`, opts.sender);

      await getRepository(User).increment({ userId: opts.sender.userId }, 'points', _.toNumber(bet) * 5);
    } else if (rand >= 3 && rand <= 5) {
      await sendMessage(`${opts.sender.displayName} стоило бы это потушить rustykMlg MULTICAST x4 с вероятностью 3% дарует тебе ${_.toNumber(bet) * 4} mp! rustykAhegao`, opts.sender);
      await getRepository(User).increment({ userId: opts.sender.userId }, 'points', _.toNumber(bet) * 4);
    } else if (rand >= 5 && rand <= 7) {
      await sendMessage(`${opts.sender.displayName} шанс выпадения MULTICAST x3 = 5%! rustykAhegao Поздравляю, теперь у тебя ${(_.toNumber(bet) * 3) + (userPoints - _.toNumber(bet))} mp! :)`, opts.sender);
      await getRepository(User).increment({ userId: opts.sender.userId }, 'points', _.toNumber(bet) * 3);
    } else if (rand >= 7 && rand <= 20) {
      await sendMessage(`${opts.sender.displayName}, отличная новость: ты ничего не потерял! Плохие новости: ты ничего не выиграл rustykBebe `, opts.sender);
      await getRepository(User).increment({ userId: opts.sender.userId }, 'points', _.toNumber(bet));
    } else if (rand >= 20 && rand <= 30) {
      await sendMessage(`${opts.sender.displayName} поздравляю ты выиграл! Multicast x2! Теперь у тебя ${(_.toNumber(bet) * 2) + (userPoints - _.toNumber(bet))} mp`, opts.sender);
      await getRepository(User).increment({ userId: opts.sender.userId }, 'points', _.toNumber(bet) * 2);
    } else if (rand >= 30 && rand <= 100) {
      await sendMessage(`${opts.sender.displayName}, ты проиграл rustykSAD Теперь у тебя ${userPoints - _.toNumber(bet)} mp.`, opts.sender);
    }
  }
}

export default new Rusty();

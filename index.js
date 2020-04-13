const logging = require('logging');
const runner = require('runner');

const version = require('./package.json').version;
const gameVersion = '2.3.0';

const android = require('os').platform() === 'android';

const readline = require('readline');

let macros = {};

const scriptorRegex = /(#s.)([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)/g;

String.prototype.splice = function(idx, rem, str) { return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem)); };

logging.log(title());

if (android) {
  logging.log('`2Android Detected` - Some things have `Vchanged` to `Nimprove your experience` for `Dmobile` `0(see README.md for more details)`');
}

chooseMode();

function title() {
  return `\`Dｅｍｕ\`\`Nｍｕｄ\` \`0(\`\`Nhackmud\` \`Demulator\`\`0)\` \`Vv${version}\` \`0(based off \`\`Nhackmud\` \`Vv${gameVersion}\`\`0)\``;
}

async function chooseMode() {
  global.mode = undefined;
  global.mode_select = 0;

  const hackmudSelected = logging.rgb(0, 0, 0, logging.backRgb(131, 188, 242, 'hackmud (regular)'));
  const hackmudPlusSelected = logging.rgb(0, 0, 0, logging.backRgb(131, 188, 242, 'hackmud+ (modified, community edition)'));

  logging.log('\nSelect Mode:');
  logging.logNoNL(`${hackmudSelected}     ${logging.rgb(131, 188, 242, 'hackmud+ (modified, community edition)')}`);

  process.stdin.setRawMode(true);
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', async function (key) {
    if (global.mode !== undefined) { return; }

    if (key === '\u0003') {
      process.exit();

      return;
    }

    if (key === '\r') {
      if (global.mode_select === 0) {
        global.mode = 'hackmud';
      } else {
        global.mode = 'hackmud+';
      }

      process.stdin.setRawMode(false);

      logging.log('\n');

      intro();

      return;
    }

    if (key === '\u001b[D' || key === '\u001b[A') {
      if (global.mode_select === 1) {
        global.mode_select = 0;
      }
    }

    if (key === '\u001b[C' || key === '\u001b[B') {
      if (global.mode_select === 0) {
        global.mode_select = 1;
      }
    }

    if (global.mode_select === 0) {
      logging.logNoNL(`\r${hackmudSelected}     ${logging.rgb(131, 188, 242, 'hackmud+ (modified, community edition)')}`);
    } else {
      logging.logNoNL(`\rhackmud (regular)     ${hackmudPlusSelected}`);
    }
  });

  //setInterval(_ => 0, 3600000);
}

function intro() {
  logging.log(`\n\`0-terminal active-\`

\`0-authentication success-\`

:::TRUST COMMUNICATION::: \`5Larceny\`, \`Rlaundering\`, \`0theft of currency and information\`, \`1deception\`, \`Wbetrayal\`, and \`Jbackstabbing\` are all part of hackmud, and \`2strongly encouraged\`.

\`1Discrimination, discriminatory language, and personal abuse are not.\`
\`DViolators will be removed.\`
Direct enquiries to conduct@hackmud.\u200Bcom

Usage: \`0user\` \`V<username>\`
Your users: \`0emumud\` (1 / 2)
Retired users:  (0 / 5)
(emumud: you can use any user)
\n`);

  askUser();
}

function changeUser(user, oldUser) {
  if (!(/^[a-z_][a-z_0-9]*$/.test(user))) {
    logging.log(`${user} is an invalid name.
Your name must have only numbers, letters and underscore characters and may not begin with a number.\n`);

    return false;
  }

  if (user.length > 25) {
    if (global.mode !== 'hackmud+') {
      logging.log('username is more than 25 characters long\n');
    } else {
      logging.log(`${user} is an invalid name.
Your name must have only 25 or less characters.\n`);
    }

    return false;
  }

  global.user = user;

  if (!oldUser) {
    global.users = [user, 'emumud'];

    logging.log(`Active user is now \`0${user}\`\n`);
    questionStdin();
  } else {
    if (!global.users.includes(user)) {
      global.users.push(user);
    }
  }

  return `Active user is now \`0${user}\``;
}

function askUser(oldUser) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(logging.hackmudColor('1', ':', true) + logging.hackmudColor('0', 'user ', true), (user) => {
    if (!changeUser(user, oldUser)) {
      askUser(oldUser);

      return;
    }
  });
}

function questionStdin() {
  process.stdout.write(':');

  global.e_input = '';
  global.e_hist = [];
  global.e_index = 0;

  global.e_cursor = 0;

  process.stdin.on('keypress', function(chunk, key) {
    if (chunk === '\u0003') {
      runner.native.shutdown();

      return;
    }

    if (key.name === 'return') {
      if (global.e_hist[0] !== global.e_input) {
        global.e_hist.unshift(global.e_input);
      }

      processStdin(global.e_input);
      process.stdout.write(':');

      if (global.e_input === 'user') {
        process.stdout.write(logging.parse('user ', true));
        global.e_input = 'user ';
      } else {
        global.e_input = '';
      }

      global.e_cursor = 0;
      global.e_index = global.e_hist.length - 1;

      return;
    }

    if (key.name === 'backspace') {
      const index = global.e_input.length - global.e_cursor - 1;
      global.e_input = global.e_input.slice(0, index) + global.e_input.slice(index + 1);
    }

    if (key.name === 'up') {
      if (global.e_hist.length > 0) {
        if (global.e_index === global.e_hist.length - 1) {
          global.e_index = 0;
        } else {
          global.e_index++;
        }

        global.e_input = global.e_hist[global.e_index];
      }
    }

    if (key.name === 'down') {
      if (global.e_hist.length > 0) {
        if (global.e_index === 0) {
          global.e_index = global.e_hist.length - 1;
        } else {
          global.e_index--;
        }

        global.e_input = global.e_hist[global.e_index];
      }
    }

    if (key.name === 'left') {
      if (global.e_cursor !== global.e_input.length) {
        global.e_cursor++;
      }
    }

    if (key.name === 'right') {
      if (global.e_cursor !== 0) {
        global.e_cursor--;
      }
    }

    if (chunk !== undefined && chunk !== '' && chunk !== String.fromCharCode(127)) {
      global.e_input = global.e_input.splice(global.e_input.length - global.e_cursor, 0, chunk);
    }

    if (key.name === 'home') {
      global.e_cursor = global.e_input.length;
    }

    if (key.name === 'end') {
      global.e_cursor = 0;
    }

    if (global.android === true) {
      // For some reason, on Android / Termux, each character typed moves the input down, this moves the cursor up one row to stop this
      process.stdout.write('\033[1A');
    }

    process.stdout.write('\r\u001b[0K');
    process.stdout.write(':' + logging.parse(global.e_input, true));
    if (global.e_cursor !== 0) {
      process.stdout.write('\033[' + global.e_cursor + 'D');
    }
  });

  /*global.rl.question(':', (answer) => {
    processStdin(answer);
    questionStdin();
  });*/
}

function processStdin(input, macro = false) {
  if (!macro) {
    console.log('\033[1A\r' + `${logging.hackmudColor(1, '>>', true)}${logging.parse(input, true)}`);

    if (global.hardline.status() === true) { global.hardline.showTimer(); }
  }

  if (!macro && input[0] === '/') {
    if (input === '/') {
      const macroKeys = Object.keys(macros);

      for (let i = 0; i < macroKeys.length; i++) {
        logging.log(`${macroKeys[i]} = ${macros[macroKeys[i]]}\n`);
      }

      return;
    }

    input = input.substring(1);

    let equalSplit = input.split('=');

    if ((equalSplit.length === 1 && macros[equalSplit[0]] === undefined) || equalSplit[0][0] === ' ' || equalSplit.length > 2) {
      logging.log('Macro does not exist.\n');

      return;
    }

    if (equalSplit.length === 1) {
      const split = equalSplit[0].split(' ');
      const name = split.shift();

      let args = [];

      for (let i = 0; i < split.length; i++) {
        if (split[i] !== '') {
          args.push(split[i]);
        }
      }

      let toRun = macros[name];

      for (let i = 0; i < args.length; i++) {
        if (toRun.includes(`{${i}}`)) { // Initial check for performance
          const whereReplace = (toRun.match(/{{.+?}}/g)[0] || '').indexOf(`{${i}}`);

          if (whereReplace !== -1) { toRun = toRun.splice(whereReplace, 2 + args.toString().length, args[i]); }
        }
      }

      logging.log(toRun);

      processStdin(toRun, true);

      return;
    }

    // Remove extra whitespace / padding

    equalSplit[0] = equalSplit[0].replace(' ', '');

    while (equalSplit[1][0] === ' ') { equalSplit[1] = equalSplit[1].substr(1); }

    macros[equalSplit[0]] = equalSplit[1];

    logging.log(`Macro created: ${equalSplit[0]} = ${equalSplit[1]}\n`);

    return;
  }

  const split = input.split(' ');
  let script = split.shift();

  if (!(/[a-z]/.test(script[0]))) {
    logging.log(`\`D${script}\` is an invalid script name.\n`);

    return;
  }

  let args = split.join(' ');
  //args = args.replace("'", '"');

  let internalScript = !script.includes('.') && global.scripts[script] !== undefined;

  if (!internalScript) {
    args = args.replace(logging.keyValueRegex, '"$1": $2');

    try {
      if (args) {
        args = args.replace(scriptorRegex, (_, _scriptor, user, name) =>
          `{ "emumud_scriptor": true, "name": "${user}.${name}", "call": "global.runner.scriptor('${user}.${name}', ...arguments);" }`
        );

        args = JSON.parse(args);

        let argsKeys = Object.keys(args);

        for (let i = 0; i < argsKeys.length; i++) {
          if (args[argsKeys[i]].emumud_scriptor === true && typeof args[argsKeys[i]].name === 'string' && typeof args[argsKeys[i]].call === 'string') {
            const src = args[argsKeys[i]].call;

            args[argsKeys[i]].call = function () { return eval(src); };

            delete args[argsKeys[i]].emumud_scriptor;
          }
        }
      }
    } catch (err) {
      logging.log(':::TRUST COMMUNICATION:::\nYour command line has an error in it:');
      logging.log(`\`0${err.toString().split('\n')[0]}\`\n`);

      return;
    }

    if (args === '' || typeof args === 'string') {
      args = null;
    }
  }

  if (!script.includes('.') && !internalScript) {
    script = global.user + '.' + script;
  }

  /*if (args !== null) {
    let argsKeys = Object.keys(args);

    for (let i = 0; i < argsKeys.length; i++) {
      let a = args[argsKeys[i]];

      if (typeof a === 'string') {
        let matches = [...a.matchAll(scriptorRegex)][0];

        if (matches !== undefined) {
          let script = matches[2] + '.' + matches[3];

          args[argsKeys[i]] = {
            name: script,
            call: function () { global.transpiler.runScript(script, context, ...arguments); }
          };
        }
      }
    }
  }*/

  if (global.scripts[script] !== undefined) {
    const hasDebugLog = global.transpiler.hasDebugLogs(script);

    const run = runner.runScriptName(script, global.user, args);

    if (hasDebugLog === true) {
      logging.log();

      if (global.hardline.status() === true) { global.hardline.showTimer(); }

      return;
    }

    if (run !== undefined && (run.ok === false || run.ok === true) && onlyProperties(run, ['ok', 'msg'])) {
      logging.log(run.ok ? '`LSuccess`' : '`DFailure`');
      if (run.msg) {
        logging.log(run.msg);
      }

      logging.log();

      if (global.hardline.status() === true) { global.hardline.showTimer(); }

      return;
    }

    logging.log(run);

    if (global.hardline.status() === true) { global.hardline.showTimer(); }
  } else {
    logging.log(`:::TRUST COMMUNICATION::: PARSE ERROR ${script}: script doesn't exist`);
  }

  logging.log();

  if (global.hardline.status() === true) { global.hardline.showTimer(); }
}

function onlyProperties(object, properties) {
  for (let i in object) {
    if (!properties.includes(i)) {
      return false;
    }
  }

  return true;
}
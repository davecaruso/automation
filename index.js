const fs = require('fs');

if(!fs.existsSync('data')) fs.mkdirSync('data');

const client = require('./client');
const api = require('./api');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

fs.readdirSync('tasks').forEach((task) => require('./tasks/' + task))

client.on('message', msg => {
  // ignore other messages
  if (msg.author.bot || !(msg.content.startsWith('!') || msg.content.startsWith('#'))) return;
  // check if it uses the delete flag #, and force the ! symbol back
  let del = msg.content[0] === '#';
  msg.content = '!' + msg.content.substr(1);

  // find and run a hook
  let ran = false;
  api.hooks.forEach((hook) => {
    // a hook is simply a regex match
    const match = msg.content.match(hook.regex);
    if (match) {
      // call it in form (message, regexGroup1, regexGroup2, ...)
      hook.handler(msg, ...match.slice(1));
      ran = true;
    }
  });

  // delete message
  if (del && ran) msg.delete();
});

client.login(fs.readFileSync('./token').toString().match(/token="(.*?)"/)[1]);

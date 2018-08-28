const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require('fs');
const prefix = ".";
const Music = require('discord.js-musicbot-addon');
client.login(process.env.token);
const Music = require('discord.js-musicbot-addon');
const music = new Music(client, {
  prefix: ".", // Prefix for the commands.
  youtubeKey: 'AIzaSyApvbcgvYRGulf1I1Ffjfhr2K-S6TX0e9w',
  global: false,            // Non-server-specific queues.
  maxQueueSize: 50,        // Maximum queue size of 25.
  playCmd: 'play',        // Sets the name for the 'play' command.
  volumeCmd: 'vol',     // Sets the name for the 'volume' command.
  thumbnailType: 'high',
  leaveCmd: 'stop',      // Sets the name for the 'leave' command.
  anyoneCanSkip: true,
  disableLoop: false,
  searchCmd: 'search',
  requesterName: true,
  inlineEmbeds: false,	 
  queueCmd: 'queue',
  pauseCmd: 'pause',
  resumeCmd: 'resume',
  skipCmd: 'skip',
  loopCmd: 'loop',
  enableQueueStat: true,
});

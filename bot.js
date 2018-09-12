const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', function() {
client.user.setGame('nourbot.tk | =help')
console.log(`i am ready ${client.user.username}`);
});

//MAINTENANCE MUSIC
client.login(process.env.token)

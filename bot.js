const Discord = require('discord.js');
const client = new Discord.Client();


client.on('ready', function() {
client.user.setGame('Maintenance | صيانة')
client.user.setStatus('idle', 'Maintenance | صيانة') 
console.log(`i am ready ${client.user.username}`);
});

//MAINTENANCE
client.login(process.env.token)

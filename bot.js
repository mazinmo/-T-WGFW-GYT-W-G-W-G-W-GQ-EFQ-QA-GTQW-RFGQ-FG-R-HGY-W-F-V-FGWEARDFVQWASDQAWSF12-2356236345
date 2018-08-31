const Discord = require('discord.js');
const client = new Discord.Client();
const ytdl = require('ytdl-core');
const request = require('request');
const fs = require('fs');
const getYoutubeID = require('get-youtube-id');
const fetchVideoInfo = require('youtube-info');

const yt_api_key = "AIzaSyDeoIH0u1e72AtfpwSKKOSy3IPp2UHzqi4";
const prefix = '=';
client.on('ready', function() {
client.user.setGame('nourbot.tk | =help')
    console.log(`i am ready ${client.user.username}`);
});

client.on('message', message => {
const adminprefix = ".";
const developers = "348966352792584195";
    var argresult = message.content.split(` `).slice(1).join(' ');
      if (!developers.includes(message.author.id)) return;
      
      if (message.content.startsWith(adminprefix + 'ply')) {
        client.user.setGame(argresult);
        message.channel.send(`**Ok, playing..** **${argresult}!**`).then(message =>{message.delete(11000)});

    } else

      if (message.content === (adminprefix + "leave")) {
        message.guild.leave();

    } else

      if (message.content.startsWith(adminprefix + 'wt')) {
        client.user.setActivity(argresult, {type:'WATCHING'});
        message.channel.send(`**Ok, watching..** **${argresult}!**`).then(message =>{message.delete(11000)});

    } else

     if (message.content.startsWith(adminprefix + 'ls')) {
        client.user.setActivity(argresult , {type:'LISTENING'});
        message.channel.send(`**Ok, listening to..** **${argresult}!**`).then(message =>{message.delete(11000)});
    } else

     if (message.content.startsWith(adminprefix + 'st')) {
        client.user.setGame(argresult, "https://www.twitch.tv/idk");
        message.channel.send(`**Ok, Streaming..** **${argresult}!**`).then(message =>{message.delete(11000)});
    }

     if (message.content.startsWith(adminprefix + 's-name')) {
        client.user.setUsername(argresult).then
        message.channel.send(`**Changing my name to..** **${argresult}!** `).then(message =>{message.delete(11000)});

    } else

     if (message.content.startsWith(adminprefix + 's-avatar')) {
        client.user.setAvatar(argresult);
        message.channel.send(`**Changing my avatar to..** ${argresult}`).then(message =>{message.delete(11000)});

    } else

    if (message.content.startsWith(adminprefix + 's-status')) {
        client.user.setStatus(argresult)
        message.channel.send(`**Ok, status changed to..** **${argresult}!**`).then(message =>{message.delete(11000)});
    }

});

/*
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\
*/
var servers = [];
var queue = [];
var guilds = [];
var queueNames = [];
var isPlaying = false;
var dispatcher = null;
var voiceChannel = null;
var skipReq = 0;
var skippers = [];
var now_playing = [];
/*
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
\\\\\\\\\\\\\\\\\\\\\\\\V/////////////////////////
*/
client.on('ready', () => {});
var download = function(uri, filename, callback) {
    request.head(uri, function(err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

client.on('message', function(message) {
    const prefix = "Aa";
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(' ');
	let command = message.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if (command === `play`) {
        if (!message.member.voiceChannel) return message.channel.send('Join A voice Channel first, to play A cool music!!');
        if (args.length == 0) {
            let play_info = new Discord.RichEmbed()
                .setAuthor(client.user.username, client.user.avatarURL)
                .setFooter('Requested By :' + message.author.tag)
                .setDescription('Insert A song Name or YouTube URL!')
            message.channel.sendEmbed(play_info)
            return;
        }
        if (queue.length > 0 || isPlaying) {
            getID(args, function(id) {
                add_to_queue(id);
                fetchVideoInfo(id, function(err, videoInfo) {
                    if (err) throw new Error(err);
                    let play_info = new Discord.RichEmbed()
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .addField('Just Added to the queue...', `**
                          ${videoInfo.title}
                          **`)
                        .setColor("#414141")
                        .setFooter('Added By :' + message.author.tag)
                        .setThumbnail(videoInfo.thumbnailUrl)
                    message.channel.sendEmbed(play_info);
                    queueNames.push(videoInfo.title);
                    now_playing.push(videoInfo.title);

                });
            });
        }
        else {

            isPlaying = true;
            getID(args, function(id) {
                queue.push('placeholder');
                playMusic(id, message);
                fetchVideoInfo(id, function(err, videoInfo) {
                    if (err) throw new Error(err);
                    let play_info = new Discord.RichEmbed()
                        .setAuthor(client.user.username, client.user.avatarURL)
                        .addField('Now playing...', `**
                          ${videoInfo.title}
                          **`)
                        .setColor("#414141")
                        .addField(`Added By :`, message.author.username)
                        .setThumbnail(videoInfo.thumbnailUrl)
                    message.channel.sendEmbed(play_info)
                    message.channel.send(`**${videoInfo.title}** is the first song in the Queue!`)
                });
            });
        }
    }
    else if (command === `skip`) {
        if (!message.member.voiceChannel) return message.channel.send('Join A voice Channel, to run A music Commands!');
        if (!queue) return message.channel.send('There are no queue To skip!!')
        message.channel.send('Ok, skipped!').then(() => {
            skip_song(message);
            var server = server = servers[message.guild.id];
        });
    }
    else if (message.content.startsWith(prefix + 'vol')) {
        if (!message.member.voiceChannel) return message.channel.send('Join A voice Channel, to run A music Commands!');
        if (args > 100) return message.channel.send('My volume should Be from **0 To 100** Not more or less!')
        if (args < 1) return message.channel.send('My volume should Be from **0 To 100** Not more or less!')
        dispatcher.setVolume(1 * args / 50);
        message.channel.sendMessage(`Okey! My volume now is, **${dispatcher.volume*50}%**`);
    }
    else if (command === 'pause') {
        if (!message.member.voiceChannel) return message.channel.send('Join A voice Channel, to run A music Commands!');
        if (!queue) return message.channel.send('There are no queue to pause!!')
        message.channel.send('If you in insistent...').then(() => {
            dispatcher.pause();
        });
    }
    else if (command === 'resume') {
        if (!message.member.voiceChannel) return message.channel.send('Join A voice Channel, to run A music Commands!');
            if (!queue) return message.channel.send('There are no queue to resume!')
            message.channel.send('Well, resumed!').then(() => {
            dispatcher.resume();
        });
    }
    else if (command === `stop`) {
        if (!message.member.voiceChannel) return message.channel.send('Join A voice Channel, to run A music Commands!');
        if (!queue) return message.channel.send('There are no queue to stop!')
        message.channel.send('Stopped!');
        var server = server = servers[message.guild.id];
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
    }
    else if (command === 'join') {
        if (!message.member.voiceChannel) return message.channel.send("I can't find u in Any voice Channel!");
        message.member.voiceChannel.join().then(message.channel.send('Joined your voice channel!'));
    }
    else if (mess.startsWith(prefix + 'play')) {
        if (!message.member.voiceChannel) return message.channel.send('Join A voice Channel, to run A music Commands!');
        if (isPlaying == false) return message.channel.send('Wait, there are errors!');
        let playing_now_info = new Discord.RichEmbed()
            .setAuthor(client.user.username, client.user.avatarURL)
            .addField('Just Added to the queue...', `**
                  ${videoInfo.title}
                  **`)
            .setColor("#414141")
            .setFooter('Requested By : ' + message.author.tag)
            .setThumbnail(videoInfo.thumbnailUrl)
        //.setDescription('?')
        message.channel.sendEmbed(playing_now_info);
    }
});

function skip_song(message) {
    if (!message.member.voiceChannel) return message.channel.send('You should to be in A voice Channel!');
    dispatcher.end();
}

function playMusic(id, message) {
    voiceChannel = message.member.voiceChannel;


    voiceChannel.join().then(function(connectoin) {
        let stream = ytdl('https://www.youtube.com/watch?v=' + id, {
            filter: 'audioonly'
        });
        skipReq = 0;
        skippers = [];

        dispatcher = connectoin.playStream(stream);
        dispatcher.on('end', function() {
            skipReq = 0;
            skippers = [];
            queue.shift();
            queueNames.shift();
            if (queue.length === 0) {
                queue = [];
                queueNames = [];
                isPlaying = false;
            }
            else {
                setTimeout(function() {
                    playMusic(queue[0], message);
                }, 500);
            }
        });
    });
}

function getID(str, cb) {
    if (isYoutube(str)) {
        cb(getYoutubeID(str));
    }
    else {
        search_video(str, function(id) {
            cb(id);
        });
    }
}

function add_to_queue(strID) {
    if (isYoutube(strID)) {
        queue.push(getYoutubeID(strID));
    }
    else {
        queue.push(strID);
    }
}

function search_video(query, cb) {
    request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + yt_api_key, function(error, response, body) {
        var json = JSON.parse(body);
        cb(json.items[0].id.videoId);
    });
}


function isYoutube(str) {
    return str.toLowerCase().indexOf('youtube.com') > -1;
}

client.login(process.env.token)

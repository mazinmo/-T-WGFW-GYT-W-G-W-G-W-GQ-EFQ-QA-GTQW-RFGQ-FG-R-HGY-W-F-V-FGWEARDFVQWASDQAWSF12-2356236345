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
    const prefix = "=";
    const member = message.member;
    const mess = message.content.toLowerCase();
    const args = message.content.split(' ').slice(1).join(' ');
	let command = message.content.toLowerCase().split(" ")[0];
	command = command.slice(prefix.length)

    if (command === `play`) {
        if (!message.member.voiceChannel) return message.channel.send('<:false:484531097200361482> | **Please join a voice channel to play music**.');
        if (args.length == 0) {
            message.channel.send(`<:false:484531097200361482> | **Correct usage**:
\`=play <song name> | <song url>\``)
            return;
        }
        if (queue.length > 0 || isPlaying) {
            getID(args, function(id) {
                add_to_queue(id);
                fetchVideoInfo(id, function(err, videoInfo) {
					if (err) throw new Error(err);
					message.channel.send(`<:truecheckmark:484218789446156288> | **Added to the queue**:
\`${videoInfo.title}\``)
                    let play_info = new Discord.RichEmbed()
						.setAuthor(message.guild.name, message.guild.iconURL)
						.setDescription(`**${videoInfo.title}**`)
						.setImage(videoInfo.thumbnailUrl)
                        .setColor("#12D175")
                        .setFooter('Added by : ' + message.author.tag, message.author.avatarURL)
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
					message.channel.send(`:notes: | **Now playing**:
\`${videoInfo.title}\``)
                    let play_info = new Discord.RichEmbed()
					.setAuthor(message.guild.name, message.guild.iconURL)
					.setDescription(`**${videoInfo.title}**`)
					.setImage(videoInfo.thumbnailUrl)
					.setColor("#12D175")
					.setFooter('Added by : ' + message.author.tag, message.author.avatarURL)
                    message.channel.sendEmbed(play_info)
                    message.channel.send(':one: | **First song in the queue**.')
                });
            });
        }
    }
    else if (command === `skip`) {
        if (!message.member.voiceChannel) return message.channel.send('<:false:484531097200361482> | **Please join a voice channel to play music**.');
        if (!queue) return message.channel.send(':mag_right: | **There is no queue to skip**.')
        message.channel.send(':fast_forward: | **Skipped**.').then(() => {
            skip_song(message);
            var server = server = servers[message.guild.id];
        });
    }
    else if (message.content.startsWith(prefix + 'vol')) {
        if (!message.member.voiceChannel) return message.channel.send('<:false:484531097200361482> | **Please join a voice channel to play music**.');
        if (args > 100) return message.channel.send(`:warning: | **Please use**:
\`=vol [ from 0 to 100 ] to set the volume\``)
        if (args < 1) return message.channel.send(`:warning: | **Please use**:
\`=vol [ from 0 to 100 ] to set the volume\``)
        dispatcher.setVolume(1 * args / 50);
        message.channel.sendMessage(`\:truecheckmark: | **The volume now is**: \`${dispatcher.volume*50}%\``);
    }
    else if (command === 'pause') {
        if (!message.member.voiceChannel) return message.channel.send('<:false:484531097200361482> | **Please join a voice channel to play music**.');
        if (!queue) return message.channel.send(':mag_right: | **There is no queue to pause**.')
        message.channel.send(':arrow_forward: | **Paused**.').then(() => {
            dispatcher.pause();
        });
    }
    else if (command === 'resume') {
        if (!message.member.voiceChannel) return message.channel.send('<:false:484531097200361482> | **Please join a voice channel to play music**.');
            if (!queue) return message.channel.send(':mag_right: | **There is no queue to resume**.')
            message.channel.send(':pause_button: | **Resumed**.').then(() => {
            dispatcher.resume();
        });
    }
    else if (command === `stop`) {
        if (!message.member.voiceChannel) return message.channel.send('<:false:484531097200361482> | **Please join a voice channel to play music**.');
        if (!queue) return message.channel.send(':mag_right: | **There is no queue to stop**.')
        message.channel.send(':stop_button: | **Stopped**.');
        var server = server = servers[message.guild.id];
        if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
    }
    else if (command === 'join') {
        if (!message.member.voiceChannel) return message.channel.send(":mag_right: | **I can't find you in any voice channel**.");
        message.member.voiceChannel.join().then(message.channel.send('<:truecheckmark:484218789446156288> | **Joined  your voice channel**.'));
    }
    else if (mess.startsWith(prefix + 'play')) {
        if (!message.member.voiceChannel) return message.channel.send('<:false:484531097200361482> | **Please join a voice channel to play music**.');
        if (isPlaying == false) return message.channel.send(':octagonal_sign: | **Error `404`**.');
        let playing_now_info = new Discord.RichEmbed()
        fetchVideoInfo(id, function(err, videoInfo) {
					if (err) throw new Error(err);
		message.channel.send(`\:truecheckmark: | **Added to the queue**:
\`${videoInfo.title}\``)
.setAuthor(message.guild.name, message.guild.iconURL)
.setDescription(`**${videoInfo.title}**`)
.setImage(videoInfo.thumbnailUrl)
.setColor("#12D175")
.setFooter('Added by : ' + message.author.tag, message.author.avatarURL)
        //.setDescription('?')
        message.channel.sendEmbed(playing_now_info);
    })}
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

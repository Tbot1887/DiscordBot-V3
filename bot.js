/*
	Project Name: Tbot's Discord Bot
	Written By: Thomas Ruigrok
    
    Copyright 2019-2020 By Thomas Ruigrok.
    
	This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.

    This Source Code Form is "Incompatible With Secondary Licenses", as
    defined by the Mozilla Public License, v. 2.0.
*/



/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////
//Variable declarations below this line                        //
////////////////////////////////////////////////////////////////

//Declare Discord Integration variables
const Discord = require('discord.js');
const client = new Discord.Client();

//Declare other integration variables
const fs = require('fs');
const ConnectionCheck = require('internet-available');

//Declare other const variables
const KEY_FILE_NAME = "/home/pi/DiscordBot/DiscordLoginToken.key";
const LOG_FILE_PATH = "/home/pi/DiscordBot/logs/CmdLog.log";
const ERROR_FILE_PATH = "/home/pi/DiscordBot/logs/Errors.log";

// Declare Bot const variables
const BOT_VERSION = '1.7.5';
const ADMIN_ROLE_NAME = "BotAdmin";
const CMD_PREFIX = '!!';
const AdminCmdPrefix = '*!';

// Declare one-time assignment variables
var DISCORD_LOGIN_TOKEN = 'TOKEN-AUTO-INJECTED-FROM-INIT';

// Commands Arrays
const CMDS = ['!!help', '!!ping', '!!cookie', '!!marco', '!!mcServer'];
const CMDS_DESCRP = ["Srsly Becky? It's pretty obvious m8", "Pong!", "Give a cookie, Get a Cookie!", "Polo!", "Minecraft Server IPs"];
const ADMINCMDS = ['*!reset', '*!shutdown'];
const ADMINCMDS_DESCRP = ["Restarts the bot", "Stops the bot"];

/////////////////////////////////////////////////////////////////
//MAIN                                                         //
////////////////////////////////////////////////////////////////

//Load Discord Login Token from file & Login to discord
init();

// On Client Ready, Send message to console
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// When a message is received, check against available commands
client.on('message', msg => {
    //Set msg to lowercase for command Checking
    msg = convertToLowercase(msg);

    //Command Checking
    checkForCommand(msg);
});


/////////////////////////////////////////////////////////////////
//END MAIN                                                     //
////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
//INITIALIZATION functions below this line                     //
////////////////////////////////////////////////////////////////


function init() {
    ConnectionCheck().then(function(){
        if(readKeyFromFile()){
           //login to client
           client.login(DISCORD_LOGIN_TOKEN);
        } else {
           error_log("Can't load discord key token. Aborting...", -100, exitScript);
        }
    }).catch(function(){
        error_log("Internet Connection unavailable. Aborting...", -404, exitScript);
    });
}

function readKeyFromFile() {
    var keyLoaded = true;

    var keyFileData;
    fileArray = [];

    //Read token from file
    try {
        //Read login token from key file
        keyFileData = fs.readFileSync(KEY_FILE_NAME);
        //Split file data at new line char
        fileArray = keyFileData.toString().split(/\r?\n/);
        //Set login token to 3rd line of file
        DISCORD_LOGIN_TOKEN = fileArray[2];
    } catch (err) {
        console.log("Error getting token from file. Terminating...");
        keyLoaded = false
    }

    return keyLoaded;
}


/////////////////////////////////////////////////////////////////
//Cammand Functions below this line                            //
////////////////////////////////////////////////////////////////


function checkForCommand(msg) {
    if (msg.content === CMD_PREFIX + 'ping') {
        Ping(msg);
    } else if (msg.content === CMD_PREFIX + 'cookie') {
        Cookie(msg);
    } else if (msg.content === CMD_PREFIX + 'marco') {
        Marco_polo(msg);
    } else if (msg.content === CMD_PREFIX + 'mcserver') {
        MinecraftIPs(msg);
    } else if (msg.content === AdminCmdPrefix + 'reset') {
        ResetBot(msg);
    } else if (msg.content === AdminCmdPrefix + 'shutdown') {
        StopBot(msg);
    } else if (msg.content === CMD_PREFIX + 'help') {
        Help(msg);
    } else if (wildcard(msg.content, '*bubblegum*')) {
        BubbleGum(msg);
    };
}


function Help(msg) {
    //Regular Commands
    response = '\n' + "Available Commands" + '\n' + "-------------------\n";
    for (i = 0; i < CMDS.length; i++) {
        response += CMDS[i] + " - " + CMDS_DESCRP[i] + '\n';
    }

    //Admin Commands
    response += "\n ADMIN Commands" + '\n' + "-------------------\n";
    for (i = 0; i < ADMINCMDS.length; i++) {
        response += ADMINCMDS[i] + " - " + ADMINCMDS_DESCRP[i] + '\n';
    }

    //Reply
    msg.reply(response);
}


function Ping(msg) {
    msg.reply('pong');
}


function Cookie(msg) {
    msg.reply(':cookie:');
}


function Marco_polo(msg) {
    msg.reply('Polo!');
}


function MinecraftIPs(msg) {
    msg.reply('\n Main MC Server: N/A \n Backup MC Server: N/A \n Skyblock MC Server (MC Version 1.??): N/A');
}


function RockPaperScissors(msg) {

    /* 	if (userChoice ==! 'rock' || userChoice ==! 'paper' || userChoice ==! 'scissors'){
    		msg.reply("Please choose either rock, paper, or scissors (All Lowercase)")
    	}
    	else{
    	} */
}

function BubbleGum(msg) {
    const BUBBLEGUM_RESPONSE = "shut your bubble gum dumb dumb skin tone chicken bone google chrome no homo flip phone disowned ice cream cone garden gnome extra chromosome metronome dimmadome genome full blown monochrome student loan indiana jones over grown flint stone X and Y Chromosome friend zome sylvester stalone sierra leone auto zone friend zone professionally seen silver patrone big headed ass UP";
    msg.reply(BUBBLEGUM_RESPONSE);
}


function CheckUserRole(msg) {
    var returnVar = false;
    //Validate user has sufficient permissions
    if (msg.guild.roles.find(role => role.name === ADMIN_ROLE_NAME)) {
        returnVar = true;
    }

    return returnVar;
}


function ResetBot(msg) {
    var channel = msg.channel;
    
    //Create log entry
    AdminCmdLog(msg, "reset");
    
    //Validate User role
    if (CheckUserRole(msg)) {
        // send channel a message that you're resetting bot
        channel.send('Bot Restarting...')
            .then(msg => client.destroy())
            .then(() => client.login(DISCORD_LOGIN_TOKEN));
    } else {
        msg.reply("You don't have permission to use that command. You must have the role of:  `" + ADMIN_ROLE_NAME + "`");
    }
}


function StopBot(msg) {
    var channel = msg.channel;
    
    //Create log entry
    AdminCmdLog(msg, "shutdown");

    //Validate User role
    if (CheckUserRole(msg)) {
        // send channel a message that you're stopping bot
        
        channel.send('Bot Shutting Down...')
            .then(msg => client.destroy())
            .then(() => process.exit(0));
        
    } else {
        msg.reply("You don't have permission to use that command. You must have the role of:  `" + ADMIN_ROLE_NAME + "`");
    }
}


/////////////////////////////////////////////////////////////////
//Utility Functions below this line                            //
////////////////////////////////////////////////////////////////

//Wildcard Regex Test
function wildcard(message, rule) {
    var escapeRegex = (message) => message.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(message);
}


function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() - date.getTimezoneOffset()*60*1000);
    return newDate;   
}


function convertToLowercase(msg) {
    // Convert msg to lowercase
    msg.content = msg.content.toLowerCase();

    //Return the changed message
    return msg;
}


function AdminCmdLog(msg, cmdRcvd){
    //Declare vars
    var date = new Date();
    var time = time_pad(date.getUTCHours()) + ":" + time_pad(date.getUTCMinutes());
    var localTime = time_pad(date.getHours()) + ":" + time_pad(date.getMinutes());
    var user = msg.member.user.tag;
    
    //Command Received: 04/04/2020 @ 22:49 (UTC: 04:49) By: tbot1887#1234 -- Command Issued: reset
    var logString = "Command Received: " + time_pad((date.getMonth()+1)) + "/" + time_pad(date.getDate()) + "/" + date.getFullYear() + " @ " 
        + localTime + "(UTC: " + time + ") By: " + user + " -- Command Issued: " + cmdRcvd;

    //Write Logfile to file @ console
    console.log(logString);
    //Open Log File
    try {
        fs.appendFileSync(LOG_FILE_PATH, logString + '\n');
    } catch (error) {
        msg.channel.send("WARNING!!! Log File Creation Failed." + '\n' + error.toString());
    }
}


function time_pad(n) {
    return String("00" + n).slice(-2);
}


function error_log(errorMsg, errorCode, callback){
    //Set Exit (STOP) Code
    process.exitCode = errorCode;

    //create log string
    var logString = "STOP CODE: " + errorCode + " - Details: " + errorMsg;
    
    //Write Logfile to file @ console
    console.log(logString);
    
    //Open Log File & Write too it
    try {
        fs.appendFileSync(ERROR_FILE_PATH, logString + '\n');
    } catch (error) {
        //If writing failed
        console.log("WARNING!!! Log File Creation Failed." + '\n' + error.toString());
    }

    //Callback function
    if (typeof callback == "function") 
        callback(); 
}


function exitScript(){
    process.exit();
}

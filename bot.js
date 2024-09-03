/*
    Project Name: Tbot's Discord Bot
    @author Thomas Ruigrok

    @copyright Copyright 2019-2024 By Thomas Ruigrok.

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
require('dotenv').config()
const fs = require('fs');
const ConnectionCheck = require('internet-available');
const roleClaim = require('./role-claim');

//Declare other const variables
const KEY_FILE_NAME = "/home/pi/DiscordBot/DiscordLoginToken.key";
const LOG_FILE_PATH = "/home/pi/DiscordBot/logs/CmdLog.log";
const ERROR_FILE_PATH = "/home/pi/DiscordBot/logs/Errors.log";

// Declare Bot const variables
const BOT_VERSION = '3.2.5';
const BOT_NAME = "Squishy Overlord Bot";
const ADMIN_ROLE_NAME = "BotAdmin";
const AUTHOR = "Thomas Ruigrok #8086";
const CMD_PREFIX = '!!';
const AdminCmdPrefix = '*!';

// Other vars
const MC_ENABLED = false;
const JOKE_API = "https://official-joke-api.appspot.com/jokes/random";

// Declare one-time assignment variables
var DISCORD_LOGIN_TOKEN = 'TOKEN-AUTO-INJECTED-FROM-INIT';

// Commands Arrays
const CMDS = ['!!help', '!!Version', '!!ping', '!!cookie', '!!marco', '!!mcServer'];
const CMDS_DESCRP = ["Srsly Becky? It's pretty obvious m8", "Displays the currently running Bot Version", "Pong!", "Give a cookie, Get a Cookie!", "Polo!", "Minecraft Server IPs"];
const ADMINCMDS = ['*!reset', '*!shutdown'];
const ADMINCMDS_DESCRP = ["Restarts the bot", "Stops the bot"];

/////////////////////////////////////////////////////////////////
//MAIN                                                         //
////////////////////////////////////////////////////////////////

//Load Discord Login Token from file & Login to discord
Init();

// On Client Ready, Send message to console
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    roleClaim(client);
});

// When a message is received, check against available commands
client.on('message', msg => {

    //Verify bot is not sending the message
    if (msg.author.id != client.user.id) {

        //Set msg to lowercase for command Checking
        msg = ConvertToLowercase(msg);

        //Moderation
        Moderation(msg);
        //Command Checking
        CheckForCommand(msg);
	//Other
	LuckyNumbers(msg);
    }
});


/////////////////////////////////////////////////////////////////
//END MAIN                                                     //
////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
//INITIALIZATION functions below this line                     //
////////////////////////////////////////////////////////////////

/**
 * Initialization Function to load application variables
 */
function Init() {
    console.log(GetBotInfo());
    ConnectionCheck().then(function() {
        if (ReadKeyFromFile()) {
            //login to client
            client.login(DISCORD_LOGIN_TOKEN);
        } else {
            Error_log("Can't load discord key token. Aborting...", -100, exitScript);
        }
    }).catch(function() {
	sleep(30000).then(function() {
		ConnectionCheck().then(function() {
			if (ReadKeyFromFile()) {
				//login to client
				client.login(DISCORD_LOGIN_TOKEN);
			} else {
				Error_log("Can't load discord key token. Aborting...", -100, exitScript);
			}
		}).catch(function() {
			Error_log("Internet Connection unavailable. Aborting...", -404, exitScript);
		})
	})
    });
}

/**
 * Reads the discord Login Token from file
 * @return keyLoaded
 */
function ReadKeyFromFile() {
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
//Command Functions below this line                            //
////////////////////////////////////////////////////////////////

//TODO: Add Stuff Here
function Moderation(msg) {

}

/**
 * Check for a valid command
 * @param {object} msg - Discord.js Message Object
 */
function CheckForCommand(msg) {
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
    } else if (Wildcard(msg.content, '*bubblegum*')) {
        BubbleGum(msg);
    } else if (msg.content === CMD_PREFIX + 'version') {
        GetInfo(msg);
    };
}

/**
 * Check to see if numbers add up to either 69 or 420 inside the message string
 */
function LuckyNumbers(msg) {
	var str = msg.content;

	var numbers = str.match(/\d+/g);

	if (numbers != null) {
		var total = 0;
		for (var i = 0; i < numbers.length; i++) {
		let num = Number(numbers[i])
		total += num
		}
		if(total === 69){
			msg.reply("All the numbers in your message add up to 69, congrats!")
		} else if(total === 420) {
			msg.reply("All the numbers in your message add up to 420, congrats!")
		}
	}
}


/**
 * The Help Command - Lists available commands
 * @param {object} msg - Discord.js Message Object
 */
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


/**
 * the Version command - Lists information about the bot (IE. Current Version & Author)
 * @param {object} msg - Discord.js Message Object
 */
function GetInfo(msg) {
    var channel = msg.channel;
    channel.send(GetBotInfo());
}


/**
 * the Ping command - Simple test reply command (First command)
 * @param {object} msg - Discord.js Message Object
 */
function Ping(msg) {
    msg.reply('pong');
}


/**
 * the Cookie Command - Replies with a cookie Emoticon
 * @param {object} msg 
 */
function Cookie(msg) {
    msg.reply(':cookie:');
}


/**
 * the marco command - Replies to 'Marco' with 'Polo!'
 * @param {object} msg - Discord.js Message Object
 */
function Marco_polo(msg) {
    msg.reply('Polo!');
}


/**
 * the MCServer Command - If MC_ENABLED is true. Print the Minecraft server IP(s)
 * @param {object} msg - Discord.js Message Object
 */
function MinecraftIPs(msg) {
    if (MC_ENABLED)
        msg.reply('\n Main MC Server:');
    else
        msg.reply('NO MC Servers Available');
}


//TODO: Work on function
function RockPaperScissors(msg) {

    /* 	if (userChoice ==! 'rock' || userChoice ==! 'paper' || userChoice ==! 'scissors'){
    		msg.reply("Please choose either rock, paper, or scissors (All Lowercase)")
    	}
    	else{
    	} */
}


/**
 * the Joke Command - Create a Fetch Request to the Official Joke API & Responds with a joke
 * @param {object} msg - Discord.js Message Object
 */
function TellMeAJoke(msg) {
    let channel = msg.channel;
    let joke = null;

    //Fetch Request
    fetch(JOKE_API)
        .then((response) => {
            //Check the response status code
            if(response.status !== 200)
                throw Error(response.statusText);
            else
                return response.json();
        })
        .then((jsonResponse) => {
            joke = jsonResponse;

            channel.send(joke.setup.toString())
            setTimeout(() => {channel.send(joke.punchline.toString())},3000)
        }).catch((error) => {
            channel.send("I encountered an error: Here are the details: \n" + error.message + "\n Please try again later...");
    });
}


/**
 * replies to any message containing the word 'bubblegum' with the bubblegum meme
 * @param {object} msg - Discord.js Message Object
 */
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


/**
 * Admin Command to reset (Restart) the bot
 * @param {object} msg - Discord.js Message Object
 */
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


/**
 * Admin Command to shutdown the bot
 * @param {object} msg - Discord.js Message Object 
 */
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


/**
 * Admin Command to mute a user
 * Not Implemented Yet!
 * @param {object} msg - Discord.js Message Object 
 */
function MuteUser(msg)
{
    msg.reply(NotImplemented());
}


/**
 * Admin Command to kick a user
 * Not Implemented Yet!
 * @param {object} msg - Discord.js Message Object 
 */
function KickUser(msg)
{
    msg.reply(NotImplemented());
}


/**
 * Admin Command to ban a user
 * Not Implemented Yet!
 * @param {object} msg - Discord.js Message Object 
 */
function BanUser(msg)
{
    msg.reply(NotImplemented());
}


/////////////////////////////////////////////////////////////////
//Utility Functions below this line                            //
////////////////////////////////////////////////////////////////


/**
 * Utility function to check if a user has a role
 * @param {object} msg - Discord.js Message Object
 * @returns {boolean} true/false depending on if user has role
 */
function CheckUserRole(msg) {
    var returnVar = false;
    //Validate user has sufficient permissions
    if (msg.guild.roles.cache.find(role => role.name === ADMIN_ROLE_NAME)) {
        returnVar = true;
    }

    return returnVar;
}


/**
 * Determines if a message contains the rule specified
 * @param {string} message - Discord Message Contents
 * @param {string} rule - Phrase to match (RegEx)
 * @returns {boolean} True/False
 */
function Wildcard(message, rule) {
    var escapeRegex = (message) => message.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp("^" + rule.split("*").map(escapeRegex).join(".*") + "$").test(message);
}


/**
 * Helper Function to combine bot Info into a single string
 * @returns {string} Bot Info String
 */
function GetBotInfo() {
    var returnStr = BOT_NAME + " Version " + BOT_VERSION + '\n' + "Author: " + AUTHOR;
    return returnStr;
}


/**
 * Converts UTC Date to a Local Date
 * @param {Date} date - Date to be converted
 * @returns {Date} UTC Date in Local Date
 */
function ConvertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return newDate;
}


/**
 * Converts a Discord message to lowercase
 * @param {object} msg - Discord.js Message Object
 * @returns {object} Discord.js Message Object converted to lowerCase
 */
function ConvertToLowercase(msg) {
    // Convert msg to lowercase
    msg.content = msg.content.toLowerCase();

    //Return the changed message
    return msg;
}


/**
 * Logs an admin command to a log file & discord channel
 * @param {object} msg - Discord.js Message Object 
 * @param {*} cmdRcvd - The name of the command received
 */
function AdminCmdLog(msg, cmdRcvd) {
    //Declare vars
    var date = new Date();
    var time = TimePad(date.getUTCHours()) + ":" + TimePad(date.getUTCMinutes());
    var localTime = TimePad(date.getHours()) + ":" + TimePad(date.getMinutes());
    var user = msg.member.user.tag;

    //Command Received: 04/04/2020 @ 22:49 (UTC: 04:49) By: tbot1887#1234 -- Command Issued: reset
    var logString = "Command Received: " + TimePad((date.getMonth() + 1)) + "/" + TimePad(date.getDate()) + "/" + date.getFullYear() + " @ " +
        localTime + "(UTC: " + time + ") By: " + user + " -- Command Issued: " + cmdRcvd;

    //Write Logfile to file @ console
    console.log(logString);
    //Open Log File
    try {
        fs.appendFileSync(LOG_FILE_PATH, logString + '\n');
    } catch (error) {
        msg.channel.send("WARNING!!! Log File Creation Failed." + '\n' + error.toString());
    }
}


/**
 * Pads a number with a leading zero
 * @param {number} n - The number to be padded
 * @returns {string} Number padded with leading zero if needed
 */
function TimePad(n) {
    return String("00" + n).slice(-2);
}


/**
 * Creates a timeout promise
 * @param {number} time - Time to wait in miliseconds
 * @returns {promise}
 */
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


/**
 * Returns a non implemented yet message
 * @returns {string} Command is not implemented yet!
 */
function NotImplemented() {
    return "Command is not implemented yet!"
}


/**
 * Logs an error occurrence to a file & sets an exit code
 * @param {string} errorMsg - The error message Text
 * @param {number} errorCode - The Error Code
 * @param {*} callback - Callback function if needed
 */
function Error_log(errorMsg, errorCode, callback) {
    //Set Exit (STOP) Code
    process.exitCode = errorCode;

    //create log string
    var logString = TimePad((date.getMonth() + 1)) + "/" + TimePad(date.getDate()) + "/" + date.$        localTime + "(UTC: " + time + ")\n"
    var logString += "STOP CODE: " + errorCode + " - Details: " + errorMsg;

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


/**
 * exits the currently running script
 */
function exitScript() {
    process.exit();
}

ATTENDANCE_URL = "https://zonai.skport.com/web/v1/game/endfield/attendance"
WEBHOOK_URL = "" // leave empty if u dont need to add a webhook

const accounts = {
  "MainAccount": {
    "cred": "your_cred",
    "game_role": "your_game_role",
    "sign": "your_sign"
  },
  "AltAccount": {
    "cred": "your_alt_cred",
    "game_role": "your_alt_game_role",
    "sign": "your_alt_sign"
  }
}

function Notify(message){
    if (WEBHOOK_URL != "") {
        let options = {
            "method": "POST",
            "headers": { "Content-Type": "application/json" },
            "payload": JSON.stringify({ "content": message,
            "username": "SKPort Check-in",
            "avatar_url": "https://static0.thegamerimages.com/wordpress/wp-content/uploads/wm/2026/01/arknights-endfield-laevatain-character-closeup.jpg?w=1600&h=900&fit=crop"
            })
        };

        UrlFetchApp.fetch(WEBHOOK_URL, options);
    }
}

function Claim(account, identifier){
    const timestamp = ( Math.floor(Date.now() / 1000) ).toString()
    const headers = {
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0",
        'Accept': "*/*",
        'Accept-Encoding': "gzip, deflate, br, zstd",
        'Accept-Language': "en-US,en;q=0.5",
        'Connection': "keep-alive",
        'Content-Type': "application/json",
        'Referer': "https://game.skport.com/",
        'Origin': "https://game.skport.com/",
        'sk-language': "EN",
        'Sec-Fetch-Dest': "empty",
        'Sec-Fetch-Mode': "cors",
        'Sec-Fetch-Site': "same-site",
        'cred': account.cred,
        'timestamp': timestamp,
        'sk-game-role': account.game_role,
        'platform': "3",
        'vName': "1.0.0",
        'sign': account.sign
    }
    
    const options = {
        method: "POST",
        headers: headers,
        muteHttpExceptions: true
    }

    const response = UrlFetchApp.fetch(ATTENDANCE_URL, options)
    const parsedResponse = JSON.parse(response.getContentText())
    
    const retCode = parsedResponse.code
    if (retCode == 0) {
      let message = `Checked in successfully on account:${identifier}!`
      const awards = parsedResponse.data.awardIds.map(award => {
        const resource = parsedResponse.data.resourceInfoMap[award.id];
        return `${resource.name}: ${resource.count}`;
        }).join(', ');
      message += ` \nAwards:(${awards})`
      Notify(message);
    }
    else if (retCode == 10001) {
      let message = `Already checked in on account:${identifier}!`
      Notify(message);
    }
    else {
      let message = `Another check in error on account:${identifier} has occurred. retCode: ${retCode}`;
      Notify(message);
    }
}

function main(){
  for (const identifier in accounts) {
    Claim(accounts[identifier], identifier);
  }
}

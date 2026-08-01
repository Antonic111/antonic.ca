export const commandSections = [
  {
    title: "Social/Informational Commands",
    category: "social",
    commands: [
      {
        aliases: ["!commands"],
        description: "Will provide a link to this website you are currently using.",
        platform: null,
      },
      {
        aliases: ["!discord", "!disc", "!dc"],
        description: "Provides a invite link to my [Discord](https://discord.com/invite/YE9uCuQcrW) community server.",
        platform: null,
      },
      {
        aliases: ["!instagram", "!insta", "!ig"],
        description: "Provides a link to my [Instagram](https://www.instagram.com/official_antonic) account.",
        platform: null,
      },
      {
        aliases: ["!tiktok", "!tt"],
        description: "Provides a link to my [TikTok](https://www.tiktok.com/@official_antonic) account.",
        platform: null,
      },
      {
        aliases: ["!facebook", "!fb"],
        description: "Provides a link to my [Facebook](https://www.facebook.com/officiallyantonic/) account.",
        platform: null,
      },
      {
        aliases: ["!twitch"],
        description: "Provides a link to my [Twitch](https://www.twitch.tv/official_antonic) account.",
        platform: ["kick", "youtube"],
      },
      {
        aliases: ["!kick"],
        description: "Provides a link to my [Kick](https://kick.com/official-antonic) account.",
        platform: ["youtube", "twitch"],
      },
      {
        aliases: ["!youtube", "!yt"],
        description: "Provides a link to my [YouTube](https://www.youtube.com/@Official_Antonic) account.",
        platform: ["kick", "twitch"],
      },
      {
        aliases: ["!livingdex", "!shinydex", "!ld", "!sd", "!collection"],
        description: "Provides a link to [ultimatedextracker](https://ultimatedextracker.com) to view my complete shiny Pokémon collection tracker.",
        platform: null,
      },
      {
        aliases: ["!cards"],
        description: "Provides a link to my [Collectr](https://app.getcollectr.com/showcase/profile/@antonic) page to view my full card collection.",
        platform: null,
      },
      {
        aliases: ["!website"],
        description: "Provides a link to [ultimatedextracker](https://ultimatedextracker.com) to view the home of the site.",
        platform: null,
      },
      {
        aliases: ["!merch"],
        description: "Provides a link to my [Fourthwall](https://antonic.store/) to view and purchase my merchandise.",
        platform: null,
      },
      {
        aliases: ["!watchtime"],
        description: "Displays your total watch time on my channel.",
        platform: ["twitch"],
      },
      {
        aliases: ["!followage", "!howlong", "!fa"],
        description: "Displays how long you have been following my channel.",
        platform: ["twitch"],
      },
      {
        aliases: ["!code"],
        description: "Displays my Dynamax Adventure and trade code. (2580 0852)",
        platform: null,
      },
      {
        aliases: ["!friendcode"],
        description: "Displays my Nintendo Switch friend code for viewers to add me.",
        platform: null,
      },
      {
        aliases: ["!social", "!socials", "!solo", "!solo.to"],
        description: "Displays my [solo.to](https://solo.to/antonic) with all social media links and additional resources.",
        platform: null,
      },
      {
        aliases: ["!donation", "!donate"],
        description: "Provides a [StreamElements](https://streamelements.com/antonic111-1c2e0/tip) donation link to support the stream.",
        platform: null,
      },
    ],
  },
  {
    title: "Fun/Other Commands",
    category: "fun",
    commands: [
      {
        aliases: ["!r.i.p", "!rip"],
        description: "Pay respects. (Press F)",
        platform: null,
      },
      {
        aliases: ["!first"],
        description: "One-time claim per stream to receive 5000 currency and flex your achievement.",
        platform: ["youtube"],
      },
      {
        aliases: ["!longesthunts", "!lh", "!longest"],
        description: "Displays a list of my top 3 longest shiny hunts of all time.",
        platform: null,
      },
      {
        aliases: ["!checkin", "!checkin {username}"],
        description: "Displays your total check-in count and current leaderboard rank. Add a username to check another viewer's stats. Example: !checkin Antonic",
        platform: null,
      },
      {
        aliases: ["!checkinmonthly", "!checkinmonthly {username}"],
        description: "Displays your monthly check-in count and current monthly leaderboard rank. Add a username to check another viewer's stats. Example: !checkinmonthly Antonic",
        platform: null,
      },
      {
        aliases: ["!checkinlb", "!checkin leaderboard"],
        description: "Displays the top 3 viewers with the most stream visits.",
        platform: null,
      },
      {
        aliases: ["!checkinlbmonthly"],
        description: "Displays the top 3 viewers with the most monthly stream visits.",
        platform: null,
      },
      {
        aliases: ["!checkinmilestone"],
        description: "Displays how far you are from the next milestone reward.",
        platform: null,
      },
      {
        aliases: ["!lurk", "!lurking", "!brb", "!afk"],
        description: "Notifies the streamer and chat that you are lurking in the stream.",
        platform: null,
      },
      {
        aliases: ["!quote {number}"],
        description: "Displays a random quote, or specify a number to view a specific quote.",
        platform: null,
      },
      {
        aliases: ["!gamblingluck", "!gl"],
        description: "Sends a luck message to the chat for gambling.",
        platform: null,
      },
      {
        aliases: ["!shinyluck", "!sl", "!shinyluck {username}", "!shinyluck {mon}"],
        description: "Sends a shiny luck message to the chat. Add a username or Pokémon to send luck to a specific person or for a specific hunt.",
        platform: null,
      },
      {
        aliases: ["!topstreak", "!ts"],
        description: "Shows the highest shiny luck streak ever achieved on the stream.",
        platform: null,
      },
      {
        aliases: ["!goon"],
        description: "Sends a goon message about a random character or Pokémon.",
        platform: null,
      },
      {
        aliases: ["!goonstats"],
        description: "Displays the 3 most gooned pokemon/characters from the !goon command.",
        platform: null,
      },
      {
        aliases: ["@nult {message}"],
        description: "ChatGPT powered assistant that responds to questions in chat. Example: @nult How was your day?",
        platform: null,
      },
      {
        aliases: ["!caught {Form} {Mon}"],
        description: "Adds the specified Pokémon as caught and displays it on a scroller on the stream overlay.",
        platform: null,
      },
    ],
  },
  {
    title: "Economy Commands",
    category: "economy",
    commands: [
      {
        aliases: ["!currency", "!bal", "!balance", "!antoncoin"],
        description: "Check your current Anton Coin balance (the official stream currency).",
        platform: null,
      },
      {
        aliases: ["!leaderboard", "!lb"],
        description: "View the stream's economy leaderboard to see the wealthiest viewers.",
        platform: null,
      },
      {
        aliases: ["!give {name} {amount}"],
        description: "Transfer a specified amount of your Anton Coins to another viewer.",
        platform: null,
      },
      {
        aliases: ["!biggestwin", "!bigwins", "!bw"],
        description: "Display a list of the largest gambling payouts in the stream's history.",
        platform: null,
      },
      {
        aliases: ["!coinflip {amount}"],
        description: "Gamble your Anton Coins on a 50/50 coin flip.",
        platform: null,
      },
      {
        aliases: ["!slots {amount}"],
        description: "Bet your Anton Coins on the slot machine for a chance to hit the jackpot.",
        platform: null,
      },
    ],
  },
];


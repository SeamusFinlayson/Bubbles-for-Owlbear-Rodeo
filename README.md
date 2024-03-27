# **Stat Bubbles for D&D** Owlbear Rodeo Extension

Track hit points and armor class using this [Owlbear Rodeo](https://www.owlbear.rodeo/) extension.

![Stat Bubbles GitHub Image](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/079334d0-a813-4a6a-a225-19a07a1f3f53)

## Installing

Visit the [Owlbear Rodeo store](https://extensions.owlbear.rodeo/bubble-tracker) to install the extension.

## How it works

This extension provides a simple way to track:

* Hit Points
* Maximum Hit Points
* Temporary Hit Points
* and Armor Class

Stat Bubbles also features:

* A per token setting to hide stats from players
* A tool for applying area of effect (AEO) spells
* Settings to configure health bar positions
* An option to show the players segmented enemy health bars
* Name tags that will never overlap with health bars

### The Basics

**Right click** on a token to access the **context menu embed** and edit a token's stats.

![Player Edit Stats Menu](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/12b2e273-8a5f-4798-bd73-289ed3f91ceb)


**This extension does math for you!** To add 6 to your HP type +6 and press Enter. To subtract 6 from your HP type -6 and press Enter. This works for every stat.

<img name="Inline Math Demo" src="https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/efb78c59-b37c-4166-8643-0a4d600b16c4" width=600>

In a hurry? press **Tab** to cycle through the bubbles.

This extension works with tokens on the **Prop**, **Mount**, and **Character** layers.

The health bar is **created automatically** if a number greater than 0 is in the max health field. The temporary HP and armor class bubbles work the same way.

### Game / Dungeon Masters

The GM gets access to more configuration options.

Use the **hide stats from players** switch in the context menu to prevent your players from seeing a creature's stats, both in the context menu and on the map. A creature's health bar background turns black to indicate that it is hidden.

![GM Edit Stats Menu](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/a97e35c1-a2ef-44a4-affd-f5e027d94e9e)

The **AOE Tool** allows GMs to quickly apply AEO damage and healing. Great for spells like fireball or mass healing word.

Use the select tool to select all the creatures you want to include, right click to open the context menu, then use the Shift + S shortcut to open the tool. Any creature that has a maximum health greater than zero will be added to the list. Accidentally select something that shouldn't be included? No need to restart, just set the multiplier to none. Set the multiplier according to whether creatures pass their saving throw or not and whether they are vulnerable or resistant to the damage type. Press confirm, and you're done. If you made a mistake the damage or healing can be undone using the undo button.

![AEO Tool](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/36c1ba8b-71b3-4ae6-896e-2162b48dde04)

The **settings** menu allows GMs (but not players) to customize the extension to better fit their use case.

![Settings Menu](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/08d3801b-c5ad-40b6-938f-01a4ad8028ab)

|Setting|Description|
|---|---|
| Vertical offset | Move all tokens' stats up and down to accommodate name tags or other extensions. |
| Origin above token | Move all tokens' stats above them. |
| Show monster health bars to players | Show just the health bar of hidden tokens to players. This won't allow players to edit the stats or see the exact health numbers. |
| Monster health bar segments | When *Show monster health bars to players* is enabled the GM has the option to show a less granular version of the monsters' health to players.   For example: say you only want to show when a monster drops to half health, write 2 in this field. Leaving this setting at 0 shows the exact health bar fill. |
| Name tags (beta) | This feature (which is still in development) adds a custom implementation of name tags to Owlbear Rodeo that will never overlap with a token's health bar. Currently the only way to change the name is for the GM to set it in the accessibility settings. |
| Report Bug | This button links to the [Owlbear Rodeo Discord](https://discord.gg/WMp9bky4be) where you can report bugs. Including @Seamus in your post will help me find it faster. |

### Uninstalling

Refresh your page after uninstalling the extension to clear health bars and stat bubbles from the scene. Token data will **not** be deleted by uninstalling.

## Feature Requests

I may accept feature requests but - as I have limited time and development plans of my own - being a paid member on [Patreon](https://www.patreon.com/SeamusFinlayson) is your best path to getting a feature implemented.

## Support

If you need support for this extension you can message me in the [Owlbear Rodeo Discord](https://discord.gg/yWSErB6Qaj) @Seamus or open an issue on [GitHub](https://github.com/SeamusFinlayson/Bubbles-for-Owkbear-Rodeo).

If you like using this extension consider [supporting me on Patreon](https://www.patreon.com/SeamusFinlayson) where paid members can request features. You can also follow along there as a free member for updates.

## Building

This project uses [PNPm](https://pnpm.io/) as a package manager.

To install all the dependencies run:

`pnpm install`

To run in a development mode run:

`pnpm dev`

To make a production build run:

`pnpm build`

## License

GNU GPLv3

## Contributing

Copyright (C) 2023 Owlbear Rodeo

Copyright (C) 2023 Seamus Finlayson

Feel free to fork this but if you post it to the store please do not use my extension name or logo. I am unlikely to accept pull requests.
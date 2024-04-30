---
title: Stat Bubbles for D&D
description: Health Bars and Armor Class for your D&D adventures!
author: Seamus Finlayson
image: https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/6e2bcd42-d59e-4482-8fc9-c514bfd3a1c5
icon: https://owlbear-rodeo-bubbles-extension.onrender.com/logo.png
tags:
  - combat
manifest: https://owlbear-rodeo-bubbles-extension.onrender.com/manifest.json
learn-more: https://github.com/SeamusFinlayson/Bubbles-for-Owkbear-Rodeo
---

# Stat Bubbles for D&D

_Health Bars and Armor Class for your D&D adventures!_

## How it works

This extension provides a simple way to track:

- Hit Points
- Maximum Hit Points
- Temporary Hit Points
- and Armor Class

Stat Bubbles also features:

- A per token setting to hide stats from players
- Name tags that will never overlap with health bars
- A tool for applying area of effect (AEO) spells
- Settings to configure health bar positions
- An option to show the players segmented enemy health bars

### The Basics

**Right click** on a token to access the **context menu embed** and edit a token's stats.

![Player Edit Stats Menu](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/dde2df48-cb42-4a92-9a44-400a3ae1c2af)

**This extension does math for you!** To add 6 to your HP type +6 and press Enter. To subtract 6 from your HP type -6 and press Enter. This works for every stat.

<img name="Inline Math Demo" src="https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/b261ac10-c4be-4a39-bdb1-53c11005d8db" width=600>

In a hurry? press **Tab** to cycle through the bubbles.

This extension works with tokens on the **Prop**, **Mount**, and **Character** layers.

The health bar is **created automatically** if a number greater than 0 is in the max health field. The temporary HP and armor class bubbles work the same way.

### Name tags

Name tags can be enabled from the settings menu. Once enabled both players and GMs can set a token's name in the context menu embed. The autofill icon sets the name tag to the token's name property found under the accessibility settings. The name that you give the token will also be displayed in initiative tracking extensions.

![Menu with name tag](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/d33baca1-b430-4251-b326-26cd2e446b7d)

### Game / Dungeon Masters

The GM gets access to more configuration options.

Use the **hide stats from players** switch in the context menu to prevent your players from seeing a creature's stats, both in the context menu and on the map. A creature's health bar background turns black to indicate that it is hidden.

![GM Edit Stats Menu](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/f2d8c675-a115-43a6-827e-a9a24c2f4324)

The **AOE Tool** allows GMs to quickly apply AEO damage and healing. Great for spells like fireball or mass healing word.

Use the select tool to select all the creatures you want to include, right click to open the context menu, then use the Shift + S shortcut to open the tool. Any creature that has a maximum health greater than zero will be added to the list. Accidentally select something that shouldn't be included? No need to restart, just set the multiplier to none. Set the multiplier according to whether creatures pass their saving throw or not and whether they are vulnerable or resistant to the damage type. Press confirm, and you're done. If you made a mistake the damage or healing can be undone using the undo button.

![AEO Tool](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/5d9a0f64-606f-47c4-97b5-6a9770db44eb)

The **settings** menu allows GMs to customize the extension to better fit their use case.

![Settings Menu](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/9237a415-9dce-41fc-bab8-2e758cd909e6)

| Setting                             | Description                                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Vertical offset                     | Move all tokens' stats up and down to accommodate name tags or other extensions.                                                                                                                                                                                                                              |
| Origin above token                  | Move all tokens' stats above them.                                                                                                                                                                                                                                                                            |
| Show monster health bars to players | Show just the health bar of hidden tokens to players. This won't allow players to edit the stats or see the exact health numbers.                                                                                                                                                                             |
| Monster health bar segments         | When _Show monster health bars to players_ is enabled the GM has the option to show a less granular version of the monsters' health to players. For example: say you only want to show when a monster drops to half health, write 2 in this field. Leaving this setting at 0 shows the exact health bar fill. |
| Name tags                           | This feature adds a custom implementation of name tags to Owlbear Rodeo that will never overlap with a token's health bar.                                                                                                                                                                                    |
| Report Bug                          | This button links to the [Owlbear Rodeo Discord](https://discord.gg/WMp9bky4be) where you can report bugs. Including @Seamus in your post will help me find it faster.                                                                                                                                        |

### Uninstalling

Refresh your page after uninstalling the extension to clear health bars and stat bubbles from the scene. Token data will **not** be deleted by uninstalling.

## Feature Requests

I may accept feature requests but - as I have limited time and development plans of my own - being a paid member on [Patreon](https://www.patreon.com/SeamusFinlayson) is your best path to getting a feature implemented.

## Support

If you need support for this extension you can message me in the [Owlbear Rodeo Discord](https://discord.gg/yWSErB6Qaj) @Seamus or open an issue on [GitHub](https://github.com/SeamusFinlayson/Bubbles-for-Owkbear-Rodeo).

If you like using this extension consider [supporting me on Patreon](https://www.patreon.com/SeamusFinlayson) where paid members can request features. You can also follow along there as a free member for updates.

---
title: Stat Bubbles for D&D
description: Health Bars and Armor Class for your D&D adventures!
author: Seamus Finlayson
image: https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/c8871bc3-b27c-424e-b15b-5fd44a8f53ec
icon: https://owlbear-rodeo-bubbles-extension.onrender.com/logo.png
tags:
  - combat
manifest: https://owlbear-rodeo-bubbles-extension.onrender.com/manifest.json
learn-more: https://github.com/SeamusFinlayson/Bubbles-for-Owkbear-Rodeo
---

# Stat Bubbles for D&D

**Health Bars and Armor Class for your D&D adventures!** 

This extension provides a simple way to track:
* Hit points
* Maximum hit points
* Temporary hit points
* Armor class 
* And hide the monsters' stats from players.

## How it works

### Basic

**Right click** on a token to access the **context menu embed** to edit a token's stats.

![image](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/a97e35c1-a2ef-44a4-affd-f5e027d94e9e)


**This extension does math for you!** 
To add 6 to your HP type +6 and press Enter. To subtract 6 from your HP type -6 and press Enter. This works for every stat.

<img src="https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/efb78c59-b37c-4166-8643-0a4d600b16c4" width=600>

In a hurry? press **Tab** to cycle through the bubbles.

This extension works with tokens on the **Prop**, **Mount**, and **Character** layers.

The health bar is **created automatically** if a number greater than 0 is in the max health field. The temporary HP and armor class bubbles work the same way.

### For GMs

Use the **hide switch** to hide the monster stats from your players.

The hide switch:

* Hides the health bar from players.
* Removes the context menu icon for the players.
* Turns the health bar background black to indicate that it is hidden.

Players don't get access to the hide switch. This is what they see when editing their character:

![image](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/12b2e273-8a5f-4798-bd73-289ed3f91ceb)

The **settings** menu allows GMs (but not players) to customize the extension to better fit their use case.

![image](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/1b0df2f5-f51f-43de-b156-4c27ba79d75e)

|Menu Item|Description|
|---|---|
| ? | View these instructions in a new tab |
| Vertical offset | Move all tokens' stats up and down to accommodate name tags or other extensions. |
| Origin above token | Move all tokens' stats above them. |
| Show monster health bars to players | Show just the health bar of hidden tokens to players. |
| Monster health bar segments | When *Show monster health bars to players* is enabled the GM has the option to show a less granular version of the monsters' health to players.   For example: say you only want to show when a monster drops to half health, write 2 in this field. |
| Name tags (beta) | This feature (which is still in development) adds a custom implementation of name tags to Owlbear Rodeo that will never overlap with a token's health bar.|
| Create debug report | If your having problems with this extension and contact me for support I may ask you to use this. Otherwise, don't worry about it. |

### Uninstalling

Refresh your page after uninstalling the extension to clear health bars and stat bubbles from the scene.

## Support

If you need support for this extension you can open an issue on [GitHub](https://github.com/SeamusFinlayson/Bubbles-for-Owkbear-Rodeo) or message me in the [Owlbear Rodeo discord](https://discord.gg/yWSErB6Qaj) @Seamus.

If you like using this extension consider [buying me a coffee](https://ko-fi.com/seamusfinlayson).
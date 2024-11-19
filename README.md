# **Stat Bubbles for D&D** Owlbear Rodeo Extension

Track hit points and armor class using this [Owlbear Rodeo](https://www.owlbear.rodeo/) extension.

![Stat Bubbles GitHub Image](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/6e2bcd42-d59e-4482-8fc9-c514bfd3a1c5)

## Installing

Visit the [Owlbear Rodeo store](https://extensions.owlbear.rodeo/bubble-tracker) to install the extension.

## How it works

This extension provides a simple way to track:

- Current Hit Points
- Hit Point Maximum
- Temporary Hit Points
- and Armor Class

Stat Bubbles also features:

- A per token setting to hide stats from players
- Name tags that will never overlap with health bars
- A tools for applying area of effect (AEO) spells
- Settings to configure health bar positions
- An option to show the players segmented enemy health bars

### The Basics

**Right click** on a token to access the **context menu** and edit its stats.

<img name="Player Context Menu" src="https://github.com/user-attachments/assets/476d0377-19ff-4f3c-a50f-df62c38adaa7" width=300>

**This extension does math for you!** The inline math feature makes repetitive calculations effortless. To add 6 to your HP type +6 and press Enter. To subtract 6 from your HP type -6 and press Enter. This works for every stat.

<img name="Inline Math Demo" src="https://github.com/user-attachments/assets/440423a0-3ee7-4f2e-9a36-c65da92b354e" width=600>

In a hurry? press **Tab** to cycle through the bubbles.

This extension works with tokens on the **Prop**, **Mount**, and **Character** layers.

The health bar is **created automatically** if a number greater than 0 is in the max health field. The temporary HP and armor class bubbles work the same way.

### Game / Dungeon Masters

The GM gets access to more configuration options.

By clicking the button at the bottom of the context menu the GM can lock their players out of viewing tokens' stats.

<img name="GM Context Menu" src="https://github.com/user-attachments/assets/fbdc127d-41cc-4023-90fd-575909ad5569" width=300>

### Action Menu

The action menu provides access to all of a rooms tokens in one place.

Quickly apply AOE effects or modify multiple tokens using the built in operations.

Roll dice either publicly or secretly using the command line. Your rolls are stored in the scene roll log. Check out [RPG Dice Roller](https://dice-roller.github.io/documentation/guide/notation/) for details on the supported dice notations.

![Action Menu](https://github.com/user-attachments/assets/86d39c02-219d-47b6-986d-6f5785e71d07)

### Name tags

Name tags can be enabled from the settings menu. Once enabled both players and GMs can set a token's name in the context menu embed. The autofill icon sets the name tag to the token's name property found under the accessibility settings. The name that you give the token will also be displayed in initiative tracking extensions.

<img name="Name tag context menu" src="https://github.com/user-attachments/assets/9f349b52-4918-464c-99ff-7db63550e31d" width=300>

### Settings

The settings menu allows GMs to customize the extension to better fit their use case. There are room level settings that apply to every scene opened in the current room, and scene level settings which override the room settings and apply no matter what room the scene is being viewed in.

![Settings Menu](https://github.com/user-attachments/assets/a8758eca-e727-4509-933d-456c57210fc9)

### Uninstalling

Refresh your page after uninstalling the extension to clear health bars and stat bubbles from the scene. Token data will **not** be deleted by uninstalling.

## Feature Requests

I may accept feature requests but - as I have limited time and development plans of my own - being a paid member on [Patreon](https://www.patreon.com/SeamusFinlayson) is your best path to getting a feature implemented.

## Support

If you need support for this extension you can message me in the [Owlbear Rodeo Discord](https://discord.gg/yWSErB6Qaj) @Seamus or open an issue on [GitHub](https://github.com/SeamusFinlayson/Bubbles-for-Owkbear-Rodeo).

If you like using this extension consider [supporting me on Patreon](https://www.patreon.com/SeamusFinlayson) where paid members can request features. You can also follow along there as a free member for updates.

## Building

This project uses [pnpm](https://pnpm.io/) as a package manager.

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

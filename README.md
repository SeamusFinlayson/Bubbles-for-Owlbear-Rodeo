# Stat Bubbles Extension for Owlbear Rodeo

Track hit points and armor class with Roll20 style bubbles using this [Owlbear Rodeo](https://www.owlbear.rodeo/) extension.

![image](https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo/assets/77430559/842822f4-b5e5-43e4-a079-41a2ed877af7)

## Installing

Add [this link](https://owlbear-rodeo-bubbles-extension.onrender.com/manifest.json) to Owlbear Rodeo to use the extension.

## How to use

### Basic

**This extension does math for you!** 
To add 6 to you HP type +6 and press Enter. To subtract 6 to you HP type -6 and press Enter. This works for every bubble.

**Deigned to be keyboard friendly.**

1. Click on a token and use the shortcut Shift + S to see and edit a token's trackers.
2. Press Tab to cycle through the bubbles.
3. Press the Space key to toggle the switch.
4. When you're done press Escape and the menu will close.

Works with tokens on the **Prop**, **Mount**, and **Character** layers.

The **health bar is created automatically** if a number greater than 0 is in the max health (second) bubble.

### For GMs

Use the **hide switch** to hide the monster stats from your players. 

The hide switch:

* Hides the health bar from players.
* Removes the context menu icon for the players.
* Turns the health bar background black to indicate that it is hidden.

## Building

This project uses [Yarn](https://yarnpkg.com/) as a package manager.

To install all the dependencies run:

`yarn`

To run in a development mode run:

`yarn dev`

To make a production build run:

`yarn build`

## License

GNU GPLv3

## Contributing

Copyright (C) 2023 Owlbear Rodeo

Copyright (C) 2023 Seamus Finlayson

I may accept feature requests, feel free to fork this but if you post it to the store please do not use my extension name or logo.

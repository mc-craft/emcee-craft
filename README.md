# Emcee Craft
A library that supplements [minecraft-data](https://github.com/PrismarineJS/node-minecraft-data)'s data and provides utility functions to search said data.

NOTE: This is experimental and currently is only tested for 1.9. However, we are
open to pull requests to support all versions.

### What is supplemented?
All item and block objects have references to recipes that are used to make
the given block or item, and that are made using said block or item as an
ingredient. For example, wood planks are both craftable and can be used to craft
other items. All block and item objects have two attributes added: `madeBy` and 
`usedBy`. `madeBy` is an array of recipe objects that make the given block or
item. `usedBy` is an array of recipe objects that can be made using the given as
an ingredient.

### What is normalized?
TODO

### How can I use this?
TODO

### Contributing
TODO

module.exports = function(version) {
  var minecraftData = require('minecraft-data')(version);
  var craft = require('./lib/mccraft');

  console.log('original items');
  console.log(minecraftData.items);

  // normalize recipes and ingredients for easier parsing
  craft.normalizeRecipes(minecraftData);
  // console.log(minecraftData.recipes);

  // normalize blocks and items by splitting all variations into their own objects
  craft.normalizeBlocksAndItems(minecraftData);
  console.log('normalized items');
  console.log(minecraftData.items);

  // supplement item and block data with recipes
  craft.supplementBlockAndItemData(minecraftData);

  // reindex both blocks and items based on their display names (unique)
  minecraftData.blocksByName = craft.indexDataByName(minecraftData.blocks);
  minecraftData.itemsByName = craft.indexDataByName(minecraftData.items);

  /**
   * Find a block or item with the given `displayName`.
   *
   * @param {String} name The name which to search for a block or item
   * @return {Object} Item or block that was found
   */
  minecraftData.findItemOrBlockByName = function(name) {
    return minecraftData.blocksByName[name] || minecraftData.itemsByName[name];
  }

  return minecraftData;
  /**
  return {
    craft: craft,
    minecraftData: minecraftData
  };
  */
};

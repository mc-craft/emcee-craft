var _ = require('underscore');

/**
 * Returns a normalized version of a given single ingredient.
 *
 * @param {Number|Object} ingredient A non-normalized ingredient
 * @return {Object} A normalized ingredient object
 */
function normalizeIngredient(ingredient) {
  var normalized = null;

  if (_.isNumber(ingredient)) {
    normalized = {
      id: ingredient,
      variationId: 0
    };
  } else if (_.isObject(ingredient)) {
    normalized = {
      id: ingredient.id,
      variationId: ingredient.metadata
    };
  } else {
    // TODO remove debugging code
    if (!_.isNull(ingredient)) {
      throw 'unknown type: ' + typeof(ingredient);
    }
  }

  return normalized;
}

/**
 * Returns a normalized version of the given ingredients in a 3x3 matrix.
 *
 * Ex: [
 *   [{ id: 1, variationId: 1},{ id: 1, variationId: 1},{ id: 1, variationId: 1}],
 *   [ null, null, null ],
 *   [ null, null, null ],
 * ]
 *
 * @param {Array} ingredients An array of non-normalized ingredients
 * @return {Array} A 3x3 matrix of normalized ingredient objects
 */
function normalizeIngredients(ingredients) {
  var matrix = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];

  _.each(ingredients, function(ing, index) {
    matrix[0][index] = normalizeIngredient(ing);
  });

  return matrix;
}

/**
 * Returns a normalized version of the given inShape array in a 3x3 matrix.
 *
 * Ex: [
 *   [{ id: 1, variationId: 1},{ id: 1, variationId: 1},{ id: 1, variationId: 1}],
 *   [{ id: 1, variationId: 1}, null                   ,{ id: 1, variationId: 1}],
 *   [{ id: 1, variationId: 1},{ id: 1, variationId: 1},{ id: 1, variationId: 1}],
 * ]
 *
 * @param {Array} inShape An array of non-normalized inShape ingredients
 * @return {Array} A 3x3 matrix of normalized ingredient objects
 */
function normalizeInShape(inShape) {
  var matrix = [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ];

  _.each(inShape, function(row, rowIndex) {
    _.each(row, function(col, colIndex) {
      matrix[rowIndex][colIndex] = normalizeIngredient(col);
    });

  });

  return matrix;
}

/**
 * Returns a normalized result object.
 *
 * To normalize result objects, we just change the non-descriptive `metadata`
 * attribute to `variationId`.
 *
 * @param {Object} result A non-normalized result object
 * @returns {Object} A normalized result object
 */
function normalizeResult(result) {
  return {
    count: result.count,
    id: result.id,
    variationId: result.metadata
  }
}

/**
 * Returns an array of normalized recipe objects.
 *
 * We normalize the recipes object by removing the id's, and making sure all fo
 * the data has the same consistent schema. We also skip the one recipe that has
 * the outShape attribute, because it is not relevant to us. The schema is as
 * follows: TODO
 */
function normalizeRecipes(minecraftData) {
  minecraftData.recipes = _.flatten(_.map(minecraftData.recipes, function(variations, key) {
    return _.map(variations, function(recipe) {
      var normalizedIngredients;

      if (recipe.ingredients) {
        normalizedIngredients = normalizeIngredients(recipe.ingredients);
      } else {
        normalizedIngredients = normalizeInShape(recipe.inShape);
      }

      // normalize recipe
      return {
        ingredients: normalizedIngredients,
        result: normalizeResult(recipe.result),
        recipeId: key
      };
    });
  }));
}

/**
 * Supplements all TODO
 */
function supplementBlockAndItemData(minecraftData) {
  _.each(minecraftData.recipes, function(recipe, index) {
    var resultant = minecraftData.findItemOrBlockById(recipe.result.id);
    var variation = resultant;

    console.log(recipe);

    if (resultant.variations) {
      variation = resultant.variations.find(function(v) {
        return v.metadata === recipe.result.variationId;
      });
    }

    // supplement variation with the recipe to make it
    variation.madeBy = variation.madeBy || [];
    variation.madeBy.push(recipe);

    // supplement variations with recipes that variation appears as ingredient
    _.each(recipe.ingredients, function(row) {
      _.each(row, function(ing) {
        if (!_.isNull(ing)) {
          var resultant = minecraftData.findItemOrBlockById(ing.id);
          var variation = resultant;

          if (resultant.variations) {
            variation = resultant.variations.find(function(v) {
              return v.metadata === ing.variationId;
            });
          }

          variation.usedBy = variation.usedBy || [];
          variation.usedBy.push(recipe);
        }
      });
    });
  });
}

/**
 * TODO
 */
function normalizeBlocksAndItems(minecraftData) {
  minecraftData.blocks = _.flatten(_.map(minecraftData.blocks, function(block) {
    if (_.isUndefined(block.variations)) {
      // block has no variations; return as is
      return block;
    }

    // create all variations as their own blocks
    return _.map(block.variations, function(v) {
      // create base version
      var base = _.extendOwn({}, block);
      delete base.variations;

      // supplement data
      base.variationId = v.metadata;
      base.displayName = v.displayName;

      return base;
    });
  }));

  minecraftData.items = _.flatten(_.map(minecraftData.items, function(item) {
    if (_.isUndefined(item.variations)) {
      // item has no variations; return as is
      return item;
    }

    // create all variations as their own items
    return _.map(item.variations, function(v) {
      // create base version
      var base = _.extendOwn({}, item);
      delete base.variations;

      // supplement data
      base.variationId = v.metadata;
      base.displayName = v.displayName;

      return base;
    });
  }));
}

/**
 * Indexes the given `data` by the `displayName`, not the `name` attribute.
 * 
 * We use the `displayName` to index because it is unique.
 *
 * @param {Array} data The data to index
 * @return {Object} An object of `displayName` keys to `data` values
 */
function indexDataByName(data) {
  var indexed = {};
  _.each(data, function(datum) {
    indexed[datum.displayName] = datum;
  });

  return indexed;
}

module.exports = {
  indexDataByName: indexDataByName,
  normalizeBlocksAndItems: normalizeBlocksAndItems,
  normalizeIngredient: normalizeIngredient,
  normalizeIngredients: normalizeIngredients,
  normalizeInShape: normalizeInShape,
  normalizeResult: normalizeResult,
  normalizeRecipes: normalizeRecipes,
  supplementBlockAndItemData: supplementBlockAndItemData
};

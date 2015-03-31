Meteor.methods({
  transpile: function (inputCode, whitelist) {
    try {
      if (whitelist && ! whitelist.length) {
        // An empty whitelist runs ALL transforms due to Babel bug #1044
        // (a fix for which is on their experimental branch).
        // Temporary workaround:
        return {
          code: inputCode
        };
      }
      var result = Babel.transform(inputCode, {
        whitelist: whitelist,
        externalHelpers: true,
        loose: "all"
      });

      return {
        code: result.code
      };
    } catch (e) {
      if (e.loc) {
        // Babel error
        throw new Meteor.Error('syntax-error', e.toString());
      } else {
        throw new Meteor.Error(500, e.toString());
      }
    }
  }
});

TryIt = new ReactiveDict('tryit');

TryIt.FEATURES = [
  "es6.templateLiterals",
  "es6.arrowFunctions",
  "es6.blockScoping",
  "es6.blockScopingTDZ"
];

TryIt.setDefault('input', 'print(`Yo, ${name}!`);');
TryIt.setDefault('output', {});
TryIt.setDefault('features', ['es6.templateLiterals']);
TryIt.revisionCounter = 0;

Template.tryit.helpers({
  input: function () {
    return TryIt.get('input');
  },
  output: function () {
    return TryIt.get('output');
  },
  features: TryIt.FEATURES
});

Template.tryit.events({
  'keyup #tryit-input': function (event) {
    var input = event.currentTarget.value;
    TryIt.set("input", input);
  },
  'click .feature': function (event) {
    var featureName = this.featureName;
    var oldFeatures = TryIt.get('features');
    var newFeatures;
    if (_.contains(oldFeatures, featureName)) {
      newFeatures = _.without(oldFeatures, featureName);
    } else {
      newFeatures = oldFeatures.concat([featureName]);
    }
    TryIt.set('features', newFeatures);
  }
});

Template.feature.helpers({
  isSelected: function () {
    return _.contains(TryIt.get('features'), this.featureName);
  }
});

Tracker.autorun(function () {
  var input = TryIt.get("input");
  var features = TryIt.get("features");

  TryIt.revisionCounter++;
  var rev = TryIt.revisionCounter;
  Meteor.call('transpile', input, features, function (error, result) {
    if (TryIt.revisionCounter !== rev) {
      // A new method call has been made since this one.
      // It may have already landed, or it may be pending,
      // so do nothing and let it take precendece.
      return;
    }
    if (error) {
      TryIt.set('output', {error: error});
    } else {
      TryIt.set('output', {code: result.code});
    }
  });
});

Template.cases.helpers({
  testGroups: BabelTests.Transpile.groups,
  featureList: function () {
    return this.features.join(', ');
  }
});

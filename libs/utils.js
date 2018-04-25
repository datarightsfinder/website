class Utils {
  static checkForMissingEnvVars(expectedVars) {
    const ERROR_TEMPLATE = "⚠️  {{ ERROR }} not defined";

    var errors = [];
    var hasMissing = false;

    for (var envVar in expectedVars) {
      envVar = expectedVars[envVar];

      if (!process.env[envVar]) {
        errors.push(envVar);
        hasMissing = true;
      }
    }

    for (var error in errors) {
      error = errors[error];
      console.log(ERROR_TEMPLATE.replace("{{ ERROR }}", error));
    }

    return hasMissing;
  }
}

module.exports = Utils;

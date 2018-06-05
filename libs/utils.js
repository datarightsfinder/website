class Utils {
  static checkForMissingEnvVars(expectedVars) {
    const ERROR_TEMPLATE = '⚠️  {{ ERROR }} not defined';

    let errors = [];
    let hasMissing = false;

    for (let envVar in expectedVars) {
      envVar = expectedVars[envVar];

      if (!process.env[envVar]) {
        errors.push(envVar);
        hasMissing = true;
      }
    }

    for (let error in errors) {
      error = errors[error];
      console.log(ERROR_TEMPLATE.replace('{{ ERROR }}', error));
    }

    return hasMissing;
  }
}

module.exports = Utils;

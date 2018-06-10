class Utils {
  static checkForMissingEnvVars(expectedVars) {
    const ERROR_TEMPLATE = '⚠️  {{ ERROR }} not defined';

    let errors = [];
    let hasMissing = false;

    expectedVars.forEach(function(envVar) {
      if (!process.env[envVar]) {
        errors.push(envVar);
        hasMissing = true;
      }
    });

    errors.forEach(function(error) {
      console.log(ERROR_TEMPLATE.replace('{{ ERROR }}', error));
    });

    return hasMissing;
  }
}

module.exports = Utils;

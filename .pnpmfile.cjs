function readPackage(pkg, context) {
  if (pkg.dependencies) {
    if (pkg.dependencies['fast-uri']) pkg.dependencies['fast-uri'] = '3.1.6';
    if (pkg.dependencies['js-yaml']) pkg.dependencies['js-yaml'] = '4.3.2';
    if (pkg.dependencies['semver']) pkg.dependencies['semver'] = '5.7.2';
  }
  if (pkg.devDependencies) {
    if (pkg.devDependencies['fast-uri']) pkg.devDependencies['fast-uri'] = '3.1.6';
    if (pkg.devDependencies['js-yaml']) pkg.devDependencies['js-yaml'] = '4.3.2';
    if (pkg.devDependencies['semver']) pkg.devDependencies['semver'] = '5.7.2';
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage
  }
};

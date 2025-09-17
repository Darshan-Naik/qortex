#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to prepare packages for publishing by creating publishable package.json files in dist folders
 */

const packages = [
  {
    name: 'qortex-core',
    path: 'packages/qortex-core',
    publishName: 'qortex-core',
    description: 'Framework-agnostic query cache & fetch registry (MFE friendly).'
  },
  {
    name: 'qortex-react',
    path: 'packages/qortex-react',
    publishName: 'qortex-react',
    description: 'React hook bridge for qortex runtime',
    // Transform workspace dependencies to published versions
    dependencyTransforms: {
      'qortex-core': 'qortex-core' // workspace:* -> qortex-core (same version)
    }
  }
];

function createPublishablePackageJson(pkg) {
  const srcPackageJsonPath = path.join(pkg.path, 'package.json');
  const distPackageJsonPath = path.join(pkg.path, 'dist', 'package.json');
  
  // Read the source package.json
  const srcPackageJson = JSON.parse(fs.readFileSync(srcPackageJsonPath, 'utf8'));
  
  // Transform dependencies if needed
  let dependencies = { ...(srcPackageJson.dependencies || {}) };
  if (pkg.dependencyTransforms) {
    Object.entries(pkg.dependencyTransforms).forEach(([workspaceDep, publishedDep]) => {
      if (dependencies[workspaceDep]) {
        // Replace workspace dependency with published version
        if (workspaceDep !== publishedDep) {
          dependencies[publishedDep] = srcPackageJson.version; // Use same version
          delete dependencies[workspaceDep];
        } else {
          // Same name, just replace the value
          dependencies[publishedDep] = srcPackageJson.version;
        }
      }
    });
  }

  // Create publishable package.json
  const publishablePackageJson = {
    name: pkg.publishName,
    version: srcPackageJson.version,
    description: pkg.description,
    main: "index.js",
    module: "index.mjs",
    types: "index.d.ts",
    exports: {
      ".": {
        "types": "./index.d.ts",
        "import": "./index.mjs",
        "require": "./index.js"
      }
    },
    publishConfig: {
      "access": "public"
    },
    files: [
      "index.js",
      "index.mjs", 
      "index.d.ts",
      "README.md"
    ],
    repository: srcPackageJson.repository,
    homepage: srcPackageJson.homepage,
    bugs: srcPackageJson.bugs,
    keywords: srcPackageJson.keywords,
    author: srcPackageJson.author,
    license: srcPackageJson.license,
    // Include transformed dependencies but not devDependencies
    dependencies: dependencies,
    peerDependencies: srcPackageJson.peerDependencies || {}
  };
  
  // Write the publishable package.json to dist folder
  fs.writeFileSync(distPackageJsonPath, JSON.stringify(publishablePackageJson, null, 2));
  console.log(`✅ Created publishable package.json for ${pkg.name}`);
}

// Create publishable package.json for each package
packages.forEach(createPublishablePackageJson);

console.log('🎉 All publishable package.json files created successfully!');

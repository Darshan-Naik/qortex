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
    description: 'Framework-agnostic query cache & fetch registry (MFE friendly).',
    persisterExport: 'persister-export'
  },
  {
    name: 'qortex-react',
    path: 'packages/qortex-react',
    publishName: 'qortex-react',
    description: 'React hook bridge for qortex runtime',
    persisterExport: 'persister',
    // Transform workspace dependencies to published versions
    dependencyTransforms: {
      'qortex-core': 'qortex-core' // workspace:* -> qortex-core (same version)
    }
  }
];

function createPublishablePackageJson(pkg) {
  const srcPackageJsonPath = path.join(pkg.path, 'package.json');
  const distPackageJsonPath = path.join(pkg.path, 'dist', 'package.json');
  const distPath = path.join(pkg.path, 'dist');

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

  // Build exports and files arrays dynamically based on what's in dist folder
  const exports = {
    ".": {
      "types": "./index.d.ts",
      "import": "./index.mjs",
      "require": "./index.js"
    }
  };

  const files = [
    "index.js",
    "index.mjs",
    "index.d.ts"
  ];

  // Add persister export if the files exist
  if (pkg.persisterExport) {
    const persisterFiles = [
      `${pkg.persisterExport}.js`,
      `${pkg.persisterExport}.mjs`,
      `${pkg.persisterExport}.d.ts`
    ];

    // Check if all persister files exist
    const persisterFilesExist = persisterFiles.every(file =>
      fs.existsSync(path.join(distPath, file))
    );

    if (persisterFilesExist) {
      exports[`./${pkg.persisterExport}`] = {
        "types": `./${pkg.persisterExport}.d.ts`,
        "import": `./${pkg.persisterExport}.mjs`,
        "require": `./${pkg.persisterExport}.js`
      };

      files.push(...persisterFiles);
    }
  }

  files.push("README.md");

  // Create publishable package.json
  const publishablePackageJson = {
    name: pkg.publishName,
    version: srcPackageJson.version,
    description: pkg.description,
    main: "index.js",
    module: "index.mjs",
    types: "index.d.ts",
    sideEffects: srcPackageJson.sideEffects || false,
    exports: exports,
    publishConfig: {
      "access": "public"
    },
    files: files,
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

  // Copy README.md to dist folder
  const srcReadmePath = path.join(pkg.path, 'README.md');
  const distReadmePath = path.join(pkg.path, 'dist', 'README.md');

  if (fs.existsSync(srcReadmePath)) {
    fs.copyFileSync(srcReadmePath, distReadmePath);
    console.log(`✅ Copied README.md for ${pkg.name}`);
  } else {
    console.log(`⚠️  No README.md found for ${pkg.name}`);
  }

  console.log(`✅ Created publishable package.json for ${pkg.name}`);
}

// Create publishable package.json for each package
packages.forEach(createPublishablePackageJson);

console.log('🎉 All publishable package.json files created successfully!');

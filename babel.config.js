require.extensions['.css'] = () => undefined;
const path = require('path');
const glob = require('glob');

/**
 * We require a mapper for some PF modules because the modle export names do not match their location
 */
const mapper = {
  TextVariants: 'Text',
  EmptyStateVariant: 'EmptyState',
  PaginationVariant: 'Pagination',
  SelectVariant: 'selectConstants',
  DropdownPosition: 'dropdownConstants',
  TextListVariants: 'TextList',
  TextListItemVariants: 'TextListItem',
  ClipboardCopyVariant: 'ClipboardCopy',
  TooltipPosition: 'Tooltip',
};

const IconMapper = {
  AnsibeTowerIcon: 'ansibeTower-icon',
};

const FECMapper = {
  SkeletonSize: 'Skeleton',
  PageHeaderTitle: 'PageHeader',
  conditionalFilterType: 'ConditionalFilter',
};

const NotificationMapper = {
  REMOVE_NOTIFICATION: 'actionTypes',
  ADD_NOTIFICATION: 'actionTypes',
  NotificationsPortal: 'NotificationPortal',
  addNotification: 'actions',
};

/**
 * These two plugins will replace all replative imports with absolute import paths to the commonJS version of asset
 * PF esm build is broken, it points to commonJS files internaly
 * There fore its better to use commonJS version of the build to avoid duplicate cjs/esm variants of components
 * After its fixed in PF we can swap to using esm build
 */
const patternflyTransformImports = (env) => [
  'transform-imports',
  {
    '@patternfly/react-table': {
      skipDefaultConversion: true,
      transform: `@patternfly/react-table/dist/${env}`,
    },
    '@patternfly/react-core': {
      transform: (importName) => {
        let res;
        const files = glob.sync(
          path.resolve(
            __dirname,
            `./node_modules/@patternfly/react-core/dist/${env}/**/${
              mapper[importName] || importName
            }.js`
          )
        );
        if (files.length > 0) {
          res = files[0];
        } else {
          throw `File with importName ${importName} does not exist`;
        }

        res = res.replace(path.resolve(__dirname, './node_modules/'), '');
        res = res.replace(/^\//, '');
        return res;
      },
      preventFullImport: true,
      skipDefaultConversion: true,
    },
    '@patternfly/react-icons': {
      transform: (importName) =>
        `@patternfly/react-icons/dist/${env}/icons/${
          IconMapper[importName] ||
          importName
            .split(/(?=[A-Z])/)
            .join('-')
            .toLowerCase()
        }.js`,
      preventFullImport: true,
    },
  },
  'patternfly-react',
];

const fecTransformImports = (env) => [
  'transform-imports',
  {
    '@redhat-cloud-services/frontend-components': {
      transform: (importName) =>
        `@redhat-cloud-services/frontend-components/components/${env}/${
          FECMapper[importName] || importName
        }.js`,
      preventFullImport: false,
      skipDefaultConversion: true,
    },
    '@redhat-cloud-services/frontend-components-notifications': {
      transform: (importName) =>
        `@redhat-cloud-services/frontend-components-notifications/${env}/${
          NotificationMapper[importName] || importName
        }.js`,
      preventFullImport: true,
    },
  },
  'frontend-components',
];

module.exports = {
  presets: ['@babel/env', '@babel/react', '@babel/flow'],
  plugins: [
    [
      'transform-inline-environment-variables',
      {
        include: ['NODE_ENV'],
      },
    ],
    '@babel/plugin-transform-runtime',
    '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-proposal-object-rest-spread',
    'lodash',
    '@babel/plugin-proposal-class-properties',
  ],
  env: {
    esm: {
      plugins: [patternflyTransformImports('esm'), fecTransformImports('esm')],
    },
    production: {
      plugins: [patternflyTransformImports('esm'), fecTransformImports('esm')],
    },
    development: {
      plugins: [patternflyTransformImports('esm'), fecTransformImports('esm')],
    },
    componentTest: {
      plugins: ['istanbul'],
    },
  },
};

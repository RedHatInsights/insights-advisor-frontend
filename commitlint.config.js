module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'subject-case': [0, 'always'],
    'footer-max-length': [0, 'always'],
    'footer-max-line-length': [0, 'always'],
    'body-max-length': [0, 'always'],
    'body-max-line-length': [0, 'always'],
  },
};

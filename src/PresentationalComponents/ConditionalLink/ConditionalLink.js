import PropTypes from 'prop-types';

/**
 * This component conditionally wraps a child based on a condition
 * If the condition is true, then the component will wrap the child
 * If the condition is false, the component won't render, but the children will
 */
// TODO remove this is not used anywhere.
const ConditionalLink = ({ condition, wrap, children }) =>
  condition ? wrap(children) : children;

ConditionalLink.propTypes = {
  condition: PropTypes.any.isRequired,
  wrap: PropTypes.any.isRequired,
  children: PropTypes.any.isRequired,
};

export default ConditionalLink;

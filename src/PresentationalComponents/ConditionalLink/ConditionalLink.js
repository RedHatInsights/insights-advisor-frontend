import PropTypes from 'prop-types';

/**
 * This is a dumb component that only recieves properties from a smart component.
 * Dumb components are usually functions and not classes.
 *
 * @param props the props given by the smart component.
 */

const ConditionalLink = ({ condition, wrap, children }) => condition ? wrap(children) : children;

ConditionalLink.propTypes = {
    condition: PropTypes.any.isRequired,
    wrap: PropTypes.any.isRequired,
    children: PropTypes.any.isRequired
};

export default ConditionalLink;

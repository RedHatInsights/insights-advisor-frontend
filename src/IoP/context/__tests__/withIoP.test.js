import React, { useContext } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { withIoP } from '../withIoP';
import { EnvironmentContext } from '../../../App';

describe('withIoP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap component and render it', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withIoP(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should pass props to wrapped component', () => {
    const TestComponent = ({ testProp }) => <div>{testProp}</div>;
    const WrappedComponent = withIoP(TestComponent);

    render(<WrappedComponent testProp="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should provide EnvironmentContext to wrapped component', () => {
    const TestComponent = () => {
      const envContext = useContext(EnvironmentContext);
      return <div>Context: {typeof envContext === 'object' ? 'Provided' : 'Missing'}</div>;
    };
    const WrappedComponent = withIoP(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Context: Provided')).toBeInTheDocument();
  });

  it('should set displayName for wrapped component', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    const WrappedComponent = withIoP(TestComponent);

    expect(WrappedComponent.displayName).toBe('withIoP(TestComponent)');
  });

  it('should set displayName using component name if displayName is not set', () => {
    function MyComponent() {
      return <div>Test</div>;
    }
    const WrappedComponent = withIoP(MyComponent);

    expect(WrappedComponent.displayName).toBe('withIoP(MyComponent)');
  });

  it('should initialize mock chrome object on window', () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withIoP(TestComponent);

    render(<WrappedComponent />);

    expect(window.insights).toBeDefined();
    expect(window.insights.chrome).toBeDefined();
    expect(window.insights.chrome.auth).toBeDefined();
    expect(window.insights.chrome.getUserPermissions).toBeDefined();
  });

  it('should provide mock chrome.auth.getUser function', async () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withIoP(TestComponent);

    render(<WrappedComponent />);

    const user = await window.insights.chrome.auth.getUser();
    expect(user).toBeDefined();
    expect(typeof user).toBe('object');
  });

  it('should provide mock chrome.getUserPermissions function', async () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withIoP(TestComponent);

    render(<WrappedComponent />);

    const permissions = await window.insights.chrome.getUserPermissions();
    expect(permissions).toBeDefined();
    expect(Array.isArray(permissions)).toBe(true);
  });

  it('should wrap multiple components independently', () => {
    const Component1 = () => <div>Component 1</div>;
    const Component2 = () => <div>Component 2</div>;

    const Wrapped1 = withIoP(Component1);
    const Wrapped2 = withIoP(Component2);

    const { rerender } = render(<Wrapped1 />);
    expect(screen.getByText('Component 1')).toBeInTheDocument();

    rerender(<Wrapped2 />);
    expect(screen.getByText('Component 2')).toBeInTheDocument();
  });

  it('should handle component with no name gracefully', () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withIoP(TestComponent);

    expect(WrappedComponent.displayName).toContain('withIoP');
  });
});

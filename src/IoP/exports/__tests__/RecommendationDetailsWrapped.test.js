import React from 'react';
import { render } from '@testing-library/react';
import RecommendationDetailsWrapped, {
  responseDataInterceptor,
} from '../RecommendationDetailsWrapped';
import { IoP } from '../../index';

jest.mock('../../index', () => ({
  IoP: {
    IopRecommendationDetails: jest.fn(() => (
      <div>Mocked IopRecommendationDetails</div>
    )),
  },
}));

describe('RecommendationDetailsWrapped', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render IopRecommendationDetails with axios instance', () => {
    render(<RecommendationDetailsWrapped testProp="test" />);

    expect(IoP.IopRecommendationDetails).toHaveBeenCalled();
    const callArgs = IoP.IopRecommendationDetails.mock.calls[0][0];
    expect(callArgs.testProp).toBe('test');
    expect(callArgs.axios).toBeDefined();
    expect(typeof callArgs.axios).toBe('function');
  });

  it('should pass through all props to IopRecommendationDetails', () => {
    const testProps = {
      prop1: 'value1',
      prop2: 'value2',
      ruleId: 'test-rule',
    };

    render(<RecommendationDetailsWrapped {...testProps} />);

    expect(IoP.IopRecommendationDetails).toHaveBeenCalled();
    const callArgs = IoP.IopRecommendationDetails.mock.calls[0][0];
    expect(callArgs.prop1).toBe('value1');
    expect(callArgs.prop2).toBe('value2');
    expect(callArgs.ruleId).toBe('test-rule');
    expect(callArgs.axios).toBeDefined();
  });

  describe('responseDataInterceptor', () => {
    it('should return response.data when data exists', () => {
      const response = {
        data: { key: 'value' },
        status: 200,
      };

      const result = responseDataInterceptor(response);

      expect(result).toEqual({ key: 'value' });
    });

    it('should return full response when data does not exist', () => {
      const response = {
        status: 200,
      };

      const result = responseDataInterceptor(response);

      expect(result).toEqual(response);
    });

    it('should return full response when data is null', () => {
      const response = {
        data: null,
        status: 200,
      };

      const result = responseDataInterceptor(response);

      expect(result).toEqual(response);
    });

    it('should return full response when data is undefined', () => {
      const response = {
        data: undefined,
        status: 200,
      };

      const result = responseDataInterceptor(response);

      expect(result).toEqual(response);
    });
  });
});

/**
 * Copyright (c) 2026 Velocity BPA
 * Licensed under the Business Source License 1.1
 */

import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { Tradier } from '../nodes/Tradier/Tradier.node';

// Mock n8n-workflow
jest.mock('n8n-workflow', () => ({
  ...jest.requireActual('n8n-workflow'),
  NodeApiError: class NodeApiError extends Error {
    constructor(node: any, error: any) { super(error.message || 'API Error'); }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(node: any, message: string) { super(message); }
  },
}));

describe('Tradier Node', () => {
  let node: Tradier;

  beforeAll(() => {
    node = new Tradier();
  });

  describe('Node Definition', () => {
    it('should have correct basic properties', () => {
      expect(node.description.displayName).toBe('Tradier');
      expect(node.description.name).toBe('tradier');
      expect(node.description.version).toBe(1);
      expect(node.description.inputs).toContain('main');
      expect(node.description.outputs).toContain('main');
    });

    it('should define 5 resources', () => {
      const resourceProp = node.description.properties.find(
        (p: any) => p.name === 'resource'
      );
      expect(resourceProp).toBeDefined();
      expect(resourceProp!.type).toBe('options');
      expect(resourceProp!.options).toHaveLength(5);
    });

    it('should have operation dropdowns for each resource', () => {
      const operations = node.description.properties.filter(
        (p: any) => p.name === 'operation'
      );
      expect(operations.length).toBe(5);
    });

    it('should require credentials', () => {
      expect(node.description.credentials).toBeDefined();
      expect(node.description.credentials!.length).toBeGreaterThan(0);
      expect(node.description.credentials![0].required).toBe(true);
    });

    it('should have parameters with proper displayOptions', () => {
      const params = node.description.properties.filter(
        (p: any) => p.displayOptions?.show?.resource
      );
      for (const param of params) {
        expect(param.displayOptions.show.resource).toBeDefined();
        expect(Array.isArray(param.displayOptions.show.resource)).toBe(true);
      }
    });
  });

  // Resource-specific tests
describe('Account Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				accessToken: 'test-token',
				baseUrl: 'https://api.tradier.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	it('should get user profile successfully', async () => {
		const mockResponse = { profile: { id: '123', name: 'John Doe' } };
		mockExecuteFunctions.getNodeParameter.mockReturnValue('getProfile');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.tradier.com/v1/user/profile',
			headers: {
				Authorization: 'Bearer test-token',
				Accept: 'application/json',
			},
			json: true,
		});
	});

	it('should get accounts successfully', async () => {
		const mockResponse = { accounts: [{ account: { account_number: '123456' } }] };
		mockExecuteFunctions.getNodeParameter.mockReturnValue('getAccounts');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
	});

	it('should get account balances successfully', async () => {
		const mockResponse = { balances: { total_equity: 10000 } };
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getBalances')
			.mockReturnValueOnce('123456');
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.tradier.com/v1/accounts/123456/balances',
			headers: {
				Authorization: 'Bearer test-token',
				Accept: 'application/json',
			},
			json: true,
		});
	});

	it('should handle errors properly', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('getProfile');
		mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
		mockExecuteFunctions.continueOnFail.mockReturnValue(true);

		const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
	});

	it('should get account history with pagination', async () => {
		const mockResponse = { history: { event: [] } };
		mockExecuteFunctions.getNodeParameter
			.mockReturnValueOnce('getHistory')
			.mockReturnValueOnce('123456')
			.mockReturnValueOnce(2)
			.mockReturnValueOnce(50);
		mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

		const result = await executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }]);

		expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
		expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
			method: 'GET',
			url: 'https://api.tradier.com/v1/accounts/123456/history?page=2&limit=50',
			headers: {
				Authorization: 'Bearer test-token',
				Accept: 'application/json',
			},
			json: true,
		});
	});

	it('should throw error for unknown operation', async () => {
		mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

		await expect(
			executeAccountOperations.call(mockExecuteFunctions, [{ json: {} }])
		).rejects.toThrow('Unknown operation: unknownOperation');
	});
});

describe('Order Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				accessToken: 'test-token',
				baseUrl: 'https://api.tradier.com/v1'
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn()
			},
		};
	});

	describe('getOrders operation', () => {
		it('should get orders successfully', async () => {
			const mockResponse = { orders: [{ id: '123', symbol: 'AAPL' }] };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getOrders')
				.mockReturnValueOnce('account123')
				.mockReturnValueOnce(1)
				.mockReturnValueOnce(false);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeOrderOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.tradier.com/v1/accounts/account123/orders?page=1',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
				},
				json: true,
			});
		});

		it('should handle errors', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getOrders');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeOrderOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
		});
	});

	describe('createOrder operation', () => {
		it('should create order successfully', async () => {
			const mockResponse = { order: { id: '456', status: 'pending' } };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createOrder')
				.mockReturnValueOnce('account123')
				.mockReturnValueOnce('equity')
				.mockReturnValueOnce('AAPL')
				.mockReturnValueOnce('buy')
				.mockReturnValueOnce(100)
				.mockReturnValueOnce('limit')
				.mockReturnValueOnce('day')
				.mockReturnValueOnce(150.00)
				.mockReturnValueOnce(0);
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeOrderOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.tradier.com/v1/accounts/account123/orders',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: {
					class: 'equity',
					symbol: 'AAPL',
					side: 'buy',
					quantity: 100,
					type: 'limit',
					duration: 'day',
					price: 150.00,
				},
				json: true,
			});
		});
	});

	describe('deleteOrder operation', () => {
		it('should delete order successfully', async () => {
			const mockResponse = { order: { id: '456', status: 'canceled' } };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('deleteOrder')
				.mockReturnValueOnce('account123')
				.mockReturnValueOnce('456');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeOrderOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				url: 'https://api.tradier.com/v1/accounts/account123/orders/456',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
				},
				json: true,
			});
		});
	});
});

describe('MarketData Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				bearerToken: 'test-token',
				baseUrl: 'https://api.tradier.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
			},
		};
	});

	describe('getQuotes operation', () => {
		it('should get quotes successfully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getQuotes')
				.mockReturnValueOnce('AAPL,GOOGL')
				.mockReturnValueOnce(false);

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				quotes: [
					{ symbol: 'AAPL', last: 150.00 },
					{ symbol: 'GOOGL', last: 2800.00 },
				],
			});

			const result = await executeMarketDataOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.tradier.com/v1/markets/quotes',
				headers: {
					Authorization: 'Bearer test-token',
					Accept: 'application/json',
				},
				qs: {
					symbols: 'AAPL,GOOGL',
				},
				json: true,
			});

			expect(result).toHaveLength(1);
			expect(result[0].json.quotes).toHaveLength(2);
		});

		it('should handle errors gracefully', async () => {
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('getQuotes')
				.mockReturnValueOnce('INVALID');

			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(
				new Error('Invalid symbol'),
			);
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeMarketDataOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(result[0].json.error).toBe('Invalid symbol');
		});
	});

	describe('getClock operation', () => {
		it('should get market clock successfully', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValueOnce('getClock');

			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue({
				clock: {
					state: 'open',
					timestamp: 1234567890,
				},
			});

			const result = await executeMarketDataOperations.call(
				mockExecuteFunctions,
				[{ json: {} }],
			);

			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.tradier.com/v1/markets/clock',
				headers: {
					Authorization: 'Bearer test-token',
					Accept: 'application/json',
				},
				json: true,
			});

			expect(result[0].json.clock.state).toBe('open');
		});
	});
});

describe('Options Resource', () => {
  let mockExecuteFunctions: any;

  beforeEach(() => {
    mockExecuteFunctions = {
      getNodeParameter: jest.fn(),
      getCredentials: jest.fn().mockResolvedValue({
        accessToken: 'test-token',
        baseUrl: 'https://api.tradier.com/v1'
      }),
      getInputData: jest.fn().mockReturnValue([{ json: {} }]),
      getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
      continueOnFail: jest.fn().mockReturnValue(false),
      helpers: {
        httpRequest: jest.fn(),
        requestWithAuthentication: jest.fn()
      },
    };
  });

  describe('getOptionsChains operation', () => {
    it('should get options chains successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getOptionsChains')
        .mockReturnValueOnce('AAPL')
        .mockReturnValueOnce('2023-12-15')
        .mockReturnValueOnce(true);

      const mockResponse = { options: { option: [{ symbol: 'AAPL231215C00150000' }] } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOptionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://api.tradier.com/v1/markets/options/chains?symbol=AAPL&expiration=2023-12-15&greeks=true',
        headers: {
          'Authorization': 'Bearer test-token',
          'Accept': 'application/json'
        },
        json: true,
      });
      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });

    it('should handle errors in getOptionsChains', async () => {
      mockExecuteFunctions.getNodeParameter.mockReturnValue('getOptionsChains');
      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));
      mockExecuteFunctions.continueOnFail.mockReturnValue(true);

      const result = await executeOptionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: { error: 'API Error' }, pairedItem: { item: 0 } }]);
    });
  });

  describe('getStrikes operation', () => {
    it('should get strikes successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getStrikes')
        .mockReturnValueOnce('AAPL')
        .mockReturnValueOnce('2023-12-15');

      const mockResponse = { strikes: { strike: [150, 155, 160] } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOptionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('getExpirations operation', () => {
    it('should get expirations successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('getExpirations')
        .mockReturnValueOnce('AAPL')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const mockResponse = { expirations: { date: ['2023-12-15', '2023-12-22'] } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOptionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('lookupOptions operation', () => {
    it('should lookup options successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('lookupOptions')
        .mockReturnValueOnce('AAPL');

      const mockResponse = { securities: { security: [{ symbol: 'AAPL231215C00150000' }] } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOptionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });

  describe('searchOptions operation', () => {
    it('should search options successfully', async () => {
      mockExecuteFunctions.getNodeParameter
        .mockReturnValueOnce('searchOptions')
        .mockReturnValueOnce('AAPL');

      const mockResponse = { securities: { security: [{ symbol: 'AAPL', description: 'Apple Inc.' }] } };
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await executeOptionsOperations.call(mockExecuteFunctions, [{ json: {} }]);

      expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
    });
  });
});

describe('Watchlist Resource', () => {
	let mockExecuteFunctions: any;

	beforeEach(() => {
		mockExecuteFunctions = {
			getNodeParameter: jest.fn(),
			getCredentials: jest.fn().mockResolvedValue({
				accessToken: 'test-token',
				baseUrl: 'https://api.tradier.com/v1',
			}),
			getInputData: jest.fn().mockReturnValue([{ json: {} }]),
			getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
			continueOnFail: jest.fn().mockReturnValue(false),
			helpers: {
				httpRequest: jest.fn(),
				requestWithAuthentication: jest.fn(),
			},
		};
	});

	describe('getWatchlists operation', () => {
		it('should get all watchlists successfully', async () => {
			const mockResponse = { watchlists: [{ id: '1', name: 'My Watchlist' }] };
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getWatchlists');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'GET',
				url: 'https://api.tradier.com/v1/watchlists',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
				},
				json: true,
			});
		});

		it('should handle errors when getting watchlists', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getWatchlists');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('API Error'));

			await expect(executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('API Error');
		});
	});

	describe('createWatchlist operation', () => {
		it('should create watchlist successfully', async () => {
			const mockResponse = { watchlist: { id: '123', name: 'New Watchlist' } };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('createWatchlist')
				.mockReturnValueOnce('New Watchlist')
				.mockReturnValueOnce('AAPL,MSFT');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.tradier.com/v1/watchlists',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				form: {
					name: 'New Watchlist',
					symbols: 'AAPL,MSFT',
				},
				json: true,
			});
		});
	});

	describe('deleteWatchlist operation', () => {
		it('should delete watchlist successfully', async () => {
			const mockResponse = { success: true };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('deleteWatchlist')
				.mockReturnValueOnce('123');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				url: 'https://api.tradier.com/v1/watchlists/123',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
				},
				json: true,
			});
		});
	});

	describe('addSymbol operation', () => {
		it('should add symbol to watchlist successfully', async () => {
			const mockResponse = { success: true };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('addSymbol')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce('TSLA');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'POST',
				url: 'https://api.tradier.com/v1/watchlists/123/symbols',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				form: {
					symbols: 'TSLA',
				},
				json: true,
			});
		});
	});

	describe('removeSymbol operation', () => {
		it('should remove symbol from watchlist successfully', async () => {
			const mockResponse = { success: true };
			mockExecuteFunctions.getNodeParameter
				.mockReturnValueOnce('removeSymbol')
				.mockReturnValueOnce('123')
				.mockReturnValueOnce('AAPL');
			mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

			const result = await executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: mockResponse, pairedItem: { item: 0 } }]);
			expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
				method: 'DELETE',
				url: 'https://api.tradier.com/v1/watchlists/123/symbols/AAPL',
				headers: {
					'Authorization': 'Bearer test-token',
					'Accept': 'application/json',
				},
				json: true,
			});
		});
	});

	describe('error handling', () => {
		it('should handle errors with continueOnFail enabled', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('getWatchlists');
			mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(new Error('Network Error'));
			mockExecuteFunctions.continueOnFail.mockReturnValue(true);

			const result = await executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }]);

			expect(result).toEqual([{ json: { error: 'Network Error' }, pairedItem: { item: 0 } }]);
		});

		it('should throw error for unknown operation', async () => {
			mockExecuteFunctions.getNodeParameter.mockReturnValue('unknownOperation');

			await expect(executeWatchlistOperations.call(mockExecuteFunctions, [{ json: {} }])).rejects.toThrow('Unknown operation: unknownOperation');
		});
	});
});
});

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import { accountOperations, accountFields, executeAccountOperation } from './actions/account';
import { tradingOperations, tradingFields, executeTradingOperation } from './actions/trading';
import { marketDataOperations, marketDataFields, executeMarketDataOperation } from './actions/marketData';
import { fundamentalsOperations, fundamentalsFields, executeFundamentalsOperation } from './actions/fundamentals';
import { watchlistsOperations, watchlistsFields, executeWatchlistsOperation } from './actions/watchlists';
import { streamingOperations, streamingFields, executeStreamingOperation } from './actions/streaming';
import { utilityOperations, utilityFields, executeUtilityOperation } from './actions/utility';

// Emit licensing notice once per node load
let licensingNoticeEmitted = false;
function emitLicensingNotice() {
	if (!licensingNoticeEmitted) {
		console.warn(`[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`);
		licensingNoticeEmitted = true;
	}
}

export class Tradier implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tradier',
		name: 'tradier',
		icon: 'file:tradier.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Trade stocks and options with Tradier brokerage API',
		defaults: {
			name: 'Tradier',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'tradierApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Fundamentals (Beta)',
						value: 'fundamentals',
					},
					{
						name: 'Market Data',
						value: 'marketData',
					},
					{
						name: 'Order',
						value: 'order',
					},
					{
						name: 'Options',
						value: 'options',
					},
					{
						name: 'Streaming',
						value: 'streaming',
					},
					{
						name: 'Trading',
						value: 'trading',
					},
					{
						name: 'Utility',
						value: 'utility',
					},
					{
						name: 'Watchlists',
						value: 'watchlists',
					},
				],
				default: 'account',
			},
			// Account operations and fields
			...accountOperations,
			...accountFields,
			// Trading operations and fields
			...tradingOperations,
			...tradingFields,
			// Market Data operations and fields
			...marketDataOperations,
			...marketDataFields,
			// Fundamentals operations and fields
			...fundamentalsOperations,
			...fundamentalsFields,
			// Watchlists operations and fields
			...watchlistsOperations,
			...watchlistsFields,
			// Streaming operations and fields
			...streamingOperations,
			...streamingFields,
			// Utility operations and fields
			...utilityOperations,
			...utilityFields,
			// New Order operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['order'] } },
				options: [
					{ name: 'Get Orders', value: 'getOrders', description: 'Get orders for account', action: 'Get orders for account' },
					{ name: 'Get Order', value: 'getOrder', description: 'Get specific order details', action: 'Get specific order details' },
					{ name: 'Create Order', value: 'createOrder', description: 'Place new order', action: 'Place new order' },
					{ name: 'Update Order', value: 'updateOrder', description: 'Modify existing order', action: 'Modify existing order' },
					{ name: 'Delete Order', value: 'deleteOrder', description: 'Cancel order', action: 'Cancel order' },
				],
				default: 'getOrders',
			},
			// New Options operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['options'] } },
				options: [
					{ name: 'Get Options Chains', value: 'getOptionsChains', description: 'Get full options chain', action: 'Get options chains' },
					{ name: 'Get Strikes', value: 'getStrikes', description: 'Get option strikes for symbol', action: 'Get strikes' },
					{ name: 'Get Expirations', value: 'getExpirations', description: 'Get option expiration dates', action: 'Get expirations' },
					{ name: 'Lookup Options', value: 'lookupOptions', description: 'Search for option symbols', action: 'Lookup options' },
					{ name: 'Search Options', value: 'searchOptions', description: 'Search options by criteria', action: 'Search options' },
				],
				default: 'getOptionsChains',
			},
			// Order fields
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['getOrders', 'getOrder', 'createOrder', 'updateOrder', 'deleteOrder'] } },
				default: '',
				description: 'The account ID to perform operations on',
			},
			{
				displayName: 'Order ID',
				name: 'orderId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['getOrder', 'updateOrder', 'deleteOrder'] } },
				default: '',
				description: 'The order ID',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				required: false,
				displayOptions: { show: { resource: ['order'], operation: ['getOrders'] } },
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Include Tags',
				name: 'includeTags',
				type: 'boolean',
				required: false,
				displayOptions: { show: { resource: ['order'], operation: ['getOrders'] } },
				default: false,
				description: 'Whether to include tags in the response',
			},
			{
				displayName: 'Class',
				name: 'class',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder'] } },
				options: [
					{ name: 'Equity', value: 'equity' },
					{ name: 'Option', value: 'option' },
					{ name: 'Multileg', value: 'multileg' },
					{ name: 'Combo', value: 'combo' },
				],
				default: 'equity',
				description: 'The order class',
			},
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder'] } },
				default: '',
				description: 'The trading symbol',
			},
			{
				displayName: 'Side',
				name: 'side',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder'] } },
				options: [
					{ name: 'Buy', value: 'buy' },
					{ name: 'Buy to Cover', value: 'buy_to_cover' },
					{ name: 'Sell', value: 'sell' },
					{ name: 'Sell Short', value: 'sell_short' },
				],
				default: 'buy',
				description: 'The order side',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder'] } },
				default: 1,
				description: 'The order quantity',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder', 'updateOrder'] } },
				options: [
					{ name: 'Market', value: 'market' },
					{ name: 'Limit', value: 'limit' },
					{ name: 'Stop', value: 'stop' },
					{ name: 'Stop Limit', value: 'stop_limit' },
				],
				default: 'market',
				description: 'The order type',
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				required: true,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder', 'updateOrder'] } },
				options: [
					{ name: 'Day', value: 'day' },
					{ name: 'Good Till Canceled', value: 'gtc' },
					{ name: 'Pre Market', value: 'pre' },
					{ name: 'Post Market', value: 'post' },
				],
				default: 'day',
				description: 'The order duration',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				required: false,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder', 'updateOrder'] } },
				default: 0,
				description: 'The order price (required for limit orders)',
			},
			{
				displayName: 'Stop Price',
				name: 'stop',
				type: 'number',
				required: false,
				displayOptions: { show: { resource: ['order'], operation: ['createOrder', 'updateOrder'] } },
				default: 0,
				description: 'The stop price (required for stop orders)',
			},
			// Options fields
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['options'], operation: ['getOptionsChains', 'getStrikes', 'getExpirations'] } },
				default: '',
				description: 'The underlying symbol',
			},
			{
				displayName: 'Expiration',
				name: 'expiration',
				type: 'string',
				required: false,
				displayOptions: { show: { resource: ['options'], operation: ['getOptionsChains', 'getStrikes'] } },
				default: '',
				description: 'Option expiration date (YYYY-MM-DD format)',
			},
			{
				displayName: 'Include Greeks',
				name: 'greeks',
				type: 'boolean',
				required: false,
				displayOptions: { show: { resource: ['options'], operation: ['getOptionsChains'] } },
				default: false,
				description: 'Whether to include option Greeks in the response',
			},
			{
				displayName: 'Include All Roots',
				name: 'includeAllRoots',
				type: 'boolean',
				required: false,
				displayOptions: { show: { resource: ['options'], operation: ['getExpirations'] } },
				default: false,
				description: 'Whether to include all root symbols',
			},
			{
				displayName: 'Strikes',
				name: 'strikes',
				type: 'boolean',
				required: false,
				displayOptions: { show: { resource: ['options'], operation: ['getExpirations'] } },
				default: false,
				description: 'Whether to include strikes information',
			},
			{
				displayName: 'Underlying',
				name: 'underlying',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['options'], operation: ['lookupOptions', 'searchOptions'] } },
				default: '',
				description: 'The underlying symbol to search for',
			},
		],
	};

	constructor() {
		emitLicensingNotice();
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let results: any[];

				switch (resource) {
					case 'account':
						results = await executeAccountOperation.call(this, operation, i);
						break;
					case 'trading':
						results = await executeTradingOperation.call(this, operation, i);
						break;
					case 'marketData':
						results = await executeMarketDataOperation.call(this, operation, i);
						break;
					case 'fundamentals':
						results = await executeFundamentalsOperation.call(this, operation, i);
						break;
					case 'watchlists':
						results = await executeWatchlistsOperation.call(this, operation, i);
						break;
					case 'streaming':
						results = await executeStreamingOperation.call(this, operation, i);
						break;
					case 'utility':
						results = await executeUtilityOperation.call(this, operation, i);
						break;
					case 'order':
						const orderResults = await executeOrderOperations.call(this, items);
						return [orderResults];
					case 'options':
						const optionsResults = await executeOptionsOperations.call(this, items);
						return [optionsResults];
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				for (const result of results) {
					returnData.push({ json: result });
				}
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

// ============================================================
// New Resource Handler Functions
// ============================================================

async function executeOrderOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('tradierApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;

			switch (operation) {
				case 'getOrders': {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const page = this.getNodeParameter('page', i, 1) as number;
					const includeTags = this.getNodeParameter('includeTags', i, false) as boolean;

					const queryParams = new URLSearchParams();
					queryParams.append('page', page.toString());
					if (includeTags) {
						queryParams.append('includeTags', 'true');
					}

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/accounts/${accountId}/orders?${queryParams.toString()}`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getOrder': {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const orderId = this.getNodeParameter('orderId', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/accounts/${accountId}/orders/${orderId}`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'createOrder': {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const orderClass = this.getNodeParameter('class', i) as string;
					const symbol = this.getNodeParameter('symbol', i) as string;
					const side = this.getNodeParameter('side', i) as string;
					const quantity = this.getNodeParameter('quantity', i) as number;
					const type = this.getNodeParameter('type', i) as string;
					const duration = this.getNodeParameter('duration', i) as string;
					const price = this.getNodeParameter('price', i, 0) as number;
					const stop = this.getNodeParameter('stop', i, 0) as number;

					const body: any = {
						class: orderClass,
						symbol,
						side,
						quantity,
						type,
						duration,
					};

					if (price > 0) {
						body.price = price;
					}

					if (stop > 0) {
						body.stop = stop;
					}

					const options: any = {
						method: 'POST',
						url: `${credentials.baseUrl}/accounts/${accountId}/orders`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'updateOrder': {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const orderId = this.getNodeParameter('orderId', i) as string;
					const type = this.getNodeParameter('type', i) as string;
					const duration = this.getNodeParameter('duration', i) as string;
					const price = this.getNodeParameter('price', i, 0) as number;
					const stop = this.getNodeParameter('stop', i, 0) as number;

					const body: any = {
						type,
						duration,
					};

					if (price > 0) {
						body.price = price;
					}

					if (stop > 0) {
						body.stop = stop;
					}

					const options: any = {
						method: 'PUT',
						url: `${credentials.baseUrl}/accounts/${accountId}/orders/${orderId}`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
							'Content-Type': 'application/json',
						},
						body,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'deleteOrder': {
					const accountId = this.getNodeParameter('accountId', i) as string;
					const orderId = this.getNodeParameter('orderId', i) as string;

					const options: any = {
						method: 'DELETE',
						url: `${credentials.baseUrl}/accounts/${accountId}/orders/${orderId}`,
						headers: {
							'Authorization': `Bearer ${credentials.accessToken}`,
							'Accept': 'application/json',
						},
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}

async function executeOptionsOperations(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
	const returnData: INodeExecutionData[] = [];
	const operation = this.getNodeParameter('operation', 0) as string;
	const credentials = await this.getCredentials('tradierApi') as any;

	for (let i = 0; i < items.length; i++) {
		try {
			let result: any;
			const baseHeaders = {
				'Authorization': `Bearer ${credentials.accessToken}`,
				'Accept': 'application/json',
			};

			switch (operation) {
				case 'getOptionsChains': {
					const symbol = this.getNodeParameter('symbol', i) as string;
					const expiration = this.getNodeParameter('expiration', i) as string;
					const greeks = this.getNodeParameter('greeks', i) as boolean;

					let url = `${credentials.baseUrl}/markets/options/chains?symbol=${encodeURIComponent(symbol)}`;
					if (expiration) url += `&expiration=${expiration}`;
					if (greeks) url += `&greeks=true`;

					const options: any = {
						method: 'GET',
						url,
						headers: baseHeaders,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getStrikes': {
					const symbol = this.getNodeParameter('symbol', i) as string;
					const expiration = this.getNodeParameter('expiration', i) as string;

					let url = `${credentials.baseUrl}/markets/options/strikes?symbol=${encodeURIComponent(symbol)}`;
					if (expiration) url += `&expiration=${expiration}`;

					const options: any = {
						method: 'GET',
						url,
						headers: baseHeaders,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'getExpirations': {
					const symbol = this.getNodeParameter('symbol', i) as string;
					const includeAllRoots = this.getNodeParameter('includeAllRoots', i) as boolean;
					const strikes = this.getNodeParameter('strikes', i) as boolean;

					let url = `${credentials.baseUrl}/markets/options/expirations?symbol=${encodeURIComponent(symbol)}`;
					if (includeAllRoots) url += `&includeAllRoots=true`;
					if (strikes) url += `&strikes=true`;

					const options: any = {
						method: 'GET',
						url,
						headers: baseHeaders,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'lookupOptions': {
					const underlying = this.getNodeParameter('underlying', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/markets/options/lookup?underlying=${encodeURIComponent(underlying)}`,
						headers: baseHeaders,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				case 'searchOptions': {
					const underlying = this.getNodeParameter('underlying', i) as string;

					const options: any = {
						method: 'GET',
						url: `${credentials.baseUrl}/markets/search?underlying=${encodeURIComponent(underlying)}`,
						headers: baseHeaders,
						json: true,
					};

					result = await this.helpers.httpRequest(options) as any;
					break;
				}

				default:
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
			}

			returnData.push({
				json: result,
				pairedItem: { item: i },
			});

		} catch (error: any) {
			if (this.continueOnFail()) {
				returnData.push({
					json: { error: error.message },
					pairedItem: { item: i },
				});
			} else {
				throw error;
			}
		}
	}

	return returnData;
}
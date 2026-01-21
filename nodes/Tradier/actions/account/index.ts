/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createTradierClient, type TradierCredentials } from '../../transport';
import { simplifyResponse, prepareOutput, cleanObject } from '../../utils';
import { TRANSACTION_TYPES, SORT_DIRECTIONS, ORDER_STATUSES } from '../../constants';

export const accountOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['account'],
			},
		},
		options: [
			{
				name: 'Get Balances',
				value: 'getBalances',
				description: 'Get account balance information',
				action: 'Get account balances',
			},
			{
				name: 'Get Gain/Loss',
				value: 'getGainLoss',
				description: 'Get closed position gain/loss',
				action: 'Get gain loss report',
			},
			{
				name: 'Get History',
				value: 'getHistory',
				description: 'Get account transaction history',
				action: 'Get transaction history',
			},
			{
				name: 'Get Order',
				value: 'getOrder',
				description: 'Get details of a specific order',
				action: 'Get order details',
			},
			{
				name: 'Get Orders',
				value: 'getOrders',
				description: 'Get list of orders',
				action: 'Get orders list',
			},
			{
				name: 'Get Positions',
				value: 'getPositions',
				description: 'Get current positions',
				action: 'Get positions',
			},
			{
				name: 'Get User Profile',
				value: 'getProfile',
				description: 'Get user profile information',
				action: 'Get user profile',
			},
		],
		default: 'getBalances',
	},
];

export const accountFields: INodeProperties[] = [
	// Account ID field (shared across operations)
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		description: 'Account ID (leave empty to use default from credentials)',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getBalances', 'getPositions', 'getHistory', 'getOrders', 'getOrder', 'getGainLoss'],
			},
		},
	},
	// Order ID for getOrder operation
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the order to retrieve',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getOrder'],
			},
		},
	},
	// History filters
	{
		displayName: 'Filters',
		name: 'historyFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getHistory'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				description: 'Maximum number of entries to return',
			},
			{
				displayName: 'Start Date',
				name: 'start',
				type: 'dateTime',
				default: '',
				description: 'Start date for history',
			},
			{
				displayName: 'End Date',
				name: 'end',
				type: 'dateTime',
				default: '',
				description: 'End date for history',
			},
			{
				displayName: 'Transaction Type',
				name: 'type',
				type: 'options',
				options: TRANSACTION_TYPES,
				default: 'all',
				description: 'Type of transaction to filter',
			},
		],
	},
	// Orders filters
	{
		displayName: 'Filters',
		name: 'ordersFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getOrders'],
			},
		},
		options: [
			{
				displayName: 'Include Tags',
				name: 'includeTags',
				type: 'boolean',
				default: false,
				description: 'Whether to include tags in order response',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: ORDER_STATUSES,
				default: 'all',
				description: 'Filter orders by status',
			},
		],
	},
	// Gain/Loss filters
	{
		displayName: 'Filters',
		name: 'gainLossFilters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getGainLoss'],
			},
		},
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				description: 'Maximum number of entries to return',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				default: 1,
				description: 'Page number for pagination',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Close Date', value: 'closeDate' },
					{ name: 'Open Date', value: 'openDate' },
				],
				default: 'closeDate',
				description: 'Field to sort by',
			},
			{
				displayName: 'Sort Direction',
				name: 'sort',
				type: 'options',
				options: SORT_DIRECTIONS,
				default: 'desc',
				description: 'Sort direction',
			},
			{
				displayName: 'Start Date',
				name: 'start',
				type: 'dateTime',
				default: '',
				description: 'Start date for gain/loss report',
			},
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				default: '',
				description: 'Filter by symbol',
			},
		],
	},
];

export async function executeAccountOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject[]> {
	const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
	const client = createTradierClient(this, credentials);

	let accountId = this.getNodeParameter('accountId', i, '') as string;
	if (!accountId) {
		accountId = credentials.accountId || '';
	}

	if (!accountId && operation !== 'getProfile') {
		throw new Error('Account ID is required. Please provide it in the node or credentials.');
	}

	switch (operation) {
		case 'getProfile': {
			const response = await client.request('GET', '/v1/user/profile');
			const profile = simplifyResponse(response, 'profile');
			return prepareOutput(Array.isArray(profile) ? profile : [profile]).map((item) => item.json as IDataObject);
		}

		case 'getBalances': {
			const response = await client.request('GET', `/v1/accounts/${accountId}/balances`);
			const balances = simplifyResponse(response, 'balances');
			return prepareOutput(Array.isArray(balances) ? balances : [balances]).map((item) => item.json as IDataObject);
		}

		case 'getPositions': {
			const response = await client.request('GET', `/v1/accounts/${accountId}/positions`);
			const positions = simplifyResponse(response, 'positions.position');
			if (!positions || positions === 'null' || (Array.isArray(positions) && positions.length === 0)) {
				return [];
			}
			return prepareOutput(Array.isArray(positions) ? positions : [positions]).map((item) => item.json as IDataObject);
		}

		case 'getHistory': {
			const filters = this.getNodeParameter('historyFilters', i, {}) as IDataObject;
			const qs = cleanObject({
				limit: filters.limit,
				start: filters.start ? new Date(filters.start as string).toISOString().split('T')[0] : undefined,
				end: filters.end ? new Date(filters.end as string).toISOString().split('T')[0] : undefined,
				type: filters.type !== 'all' ? filters.type : undefined,
			});

			const response = await client.request('GET', `/v1/accounts/${accountId}/history`, {}, qs);
			const history = simplifyResponse(response, 'history.event');
			if (!history || history === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(history) ? history : [history]).map((item) => item.json as IDataObject);
		}

		case 'getOrders': {
			const filters = this.getNodeParameter('ordersFilters', i, {}) as IDataObject;
			const qs = cleanObject({
				includeTags: filters.includeTags,
			});

			const response = await client.request('GET', `/v1/accounts/${accountId}/orders`, {}, qs);
			let orders = simplifyResponse(response, 'orders.order');
			if (!orders || orders === 'null') {
				return [];
			}

			if (!Array.isArray(orders)) {
				orders = [orders];
			}

			// Filter by status if specified
			if (filters.status && filters.status !== 'all') {
				orders = orders.filter((order: IDataObject) => order.status === filters.status);
			}

			return prepareOutput(orders).map((item) => item.json as IDataObject);
		}

		case 'getOrder': {
			const orderId = this.getNodeParameter('orderId', i) as string;
			const response = await client.request('GET', `/v1/accounts/${accountId}/orders/${orderId}`);
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'getGainLoss': {
			const filters = this.getNodeParameter('gainLossFilters', i, {}) as IDataObject;
			const qs = cleanObject({
				page: filters.page,
				limit: filters.limit,
				sortBy: filters.sortBy,
				sort: filters.sort,
				start: filters.start ? new Date(filters.start as string).toISOString().split('T')[0] : undefined,
				symbol: filters.symbol,
			});

			const response = await client.request('GET', `/v1/accounts/${accountId}/gainloss`, {}, qs);
			const gainLoss = simplifyResponse(response, 'gainloss.closed_position');
			if (!gainLoss || gainLoss === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(gainLoss) ? gainLoss : [gainLoss]).map((item) => item.json as IDataObject);
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createTradierClient, type TradierCredentials } from '../../transport';
import { simplifyResponse, prepareOutput, cleanObject } from '../../utils';
import {
	ORDER_TYPES,
	EQUITY_ORDER_SIDES,
	OPTION_ORDER_SIDES,
	ORDER_DURATIONS,
} from '../../constants';

export const tradingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['trading'],
			},
		},
		options: [
			{
				name: 'Cancel Order',
				value: 'cancelOrder',
				description: 'Cancel an existing order',
				action: 'Cancel an order',
			},
			{
				name: 'Modify Order',
				value: 'modifyOrder',
				description: 'Modify an existing order',
				action: 'Modify an order',
			},
			{
				name: 'Place Equity Order',
				value: 'placeEquityOrder',
				description: 'Place a stock or ETF order',
				action: 'Place equity order',
			},
			{
				name: 'Place Multileg Order',
				value: 'placeMultilegOrder',
				description: 'Place a multi-leg options order',
				action: 'Place multileg order',
			},
			{
				name: 'Place OCO Order',
				value: 'placeOcoOrder',
				description: 'Place a One-Cancels-Other order',
				action: 'Place oco order',
			},
			{
				name: 'Place Option Order',
				value: 'placeOptionOrder',
				description: 'Place a single-leg option order',
				action: 'Place option order',
			},
			{
				name: 'Place OTO Order',
				value: 'placeOtoOrder',
				description: 'Place a One-Triggers-Other order',
				action: 'Place oto order',
			},
			{
				name: 'Place OTOCO Order',
				value: 'placeOtocoOrder',
				description: 'Place a One-Triggers-OCO order',
				action: 'Place otoco order',
			},
			{
				name: 'Preview Order',
				value: 'previewOrder',
				description: 'Preview an order without placing it',
				action: 'Preview an order',
			},
		],
		default: 'placeEquityOrder',
	},
];

export const tradingFields: INodeProperties[] = [
	// Account ID
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		default: '',
		description: 'Account ID (leave empty to use default from credentials)',
		displayOptions: {
			show: {
				resource: ['trading'],
			},
		},
	},
	// Symbol for equity orders
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		required: true,
		default: '',
		description: 'Stock or ETF symbol',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeEquityOrder', 'previewOrder'],
			},
		},
	},
	// Option Symbol
	{
		displayName: 'Option Symbol',
		name: 'optionSymbol',
		type: 'string',
		required: true,
		default: '',
		description: 'OCC option symbol (e.g., AAPL240119C00150000)',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeOptionOrder'],
			},
		},
	},
	// Underlying Symbol for multileg
	{
		displayName: 'Underlying Symbol',
		name: 'underlyingSymbol',
		type: 'string',
		required: true,
		default: '',
		description: 'Underlying stock symbol',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeMultilegOrder', 'placeOtoOrder', 'placeOcoOrder', 'placeOtocoOrder'],
			},
		},
	},
	// Equity Side
	{
		displayName: 'Side',
		name: 'equitySide',
		type: 'options',
		options: EQUITY_ORDER_SIDES,
		required: true,
		default: 'buy',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeEquityOrder', 'previewOrder'],
			},
		},
	},
	// Option Side
	{
		displayName: 'Side',
		name: 'optionSide',
		type: 'options',
		options: OPTION_ORDER_SIDES,
		required: true,
		default: 'buy_to_open',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeOptionOrder'],
			},
		},
	},
	// Quantity
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		required: true,
		default: 1,
		description: 'Number of shares or contracts',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeEquityOrder', 'placeOptionOrder', 'previewOrder'],
			},
		},
	},
	// Order Type
	{
		displayName: 'Order Type',
		name: 'orderType',
		type: 'options',
		options: ORDER_TYPES,
		required: true,
		default: 'market',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeEquityOrder', 'placeOptionOrder', 'placeMultilegOrder', 'previewOrder'],
			},
		},
	},
	// Duration
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'options',
		options: ORDER_DURATIONS,
		required: true,
		default: 'day',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeEquityOrder', 'placeOptionOrder', 'placeMultilegOrder', 'previewOrder'],
			},
		},
	},
	// Limit Price
	{
		displayName: 'Limit Price',
		name: 'limitPrice',
		type: 'number',
		default: 0,
		description: 'Limit price (required for limit and stop-limit orders)',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeEquityOrder', 'placeOptionOrder', 'placeMultilegOrder', 'previewOrder'],
				orderType: ['limit', 'stop_limit'],
			},
		},
	},
	// Stop Price
	{
		displayName: 'Stop Price',
		name: 'stopPrice',
		type: 'number',
		default: 0,
		description: 'Stop price (required for stop and stop-limit orders)',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeEquityOrder', 'placeOptionOrder', 'previewOrder'],
				orderType: ['stop', 'stop_limit'],
			},
		},
	},
	// Multileg Legs
	{
		displayName: 'Legs',
		name: 'legs',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
			minValue: 2,
		},
		default: { legValues: [] },
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeMultilegOrder'],
			},
		},
		options: [
			{
				displayName: 'Leg',
				name: 'legValues',
				values: [
					{
						displayName: 'Option Symbol',
						name: 'optionSymbol',
						type: 'string',
						default: '',
						required: true,
					},
					{
						displayName: 'Side',
						name: 'side',
						type: 'options',
						options: OPTION_ORDER_SIDES,
						default: 'buy_to_open',
						required: true,
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						default: 1,
						required: true,
					},
				],
			},
		],
	},
	// Order ID for modify/cancel
	{
		displayName: 'Order ID',
		name: 'orderId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['modifyOrder', 'cancelOrder'],
			},
		},
	},
	// Modify Order Fields
	{
		displayName: 'New Order Type',
		name: 'newOrderType',
		type: 'options',
		options: ORDER_TYPES,
		default: 'limit',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['modifyOrder'],
			},
		},
	},
	{
		displayName: 'New Duration',
		name: 'newDuration',
		type: 'options',
		options: ORDER_DURATIONS,
		default: 'day',
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['modifyOrder'],
			},
		},
	},
	{
		displayName: 'New Price',
		name: 'newPrice',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['modifyOrder'],
			},
		},
	},
	{
		displayName: 'New Stop Price',
		name: 'newStopPrice',
		type: 'number',
		default: 0,
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['modifyOrder'],
			},
		},
	},
	// OTO/OCO/OTOCO Settings
	{
		displayName: 'Primary Order',
		name: 'primaryOrder',
		type: 'collection',
		placeholder: 'Configure Primary Order',
		default: {},
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeOtoOrder', 'placeOtocoOrder'],
			},
		},
		options: [
			{
				displayName: 'Option Symbol',
				name: 'optionSymbol',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Side',
				name: 'side',
				type: 'options',
				options: OPTION_ORDER_SIDES,
				default: 'buy_to_open',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Order Type',
				name: 'type',
				type: 'options',
				options: ORDER_TYPES,
				default: 'limit',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: ORDER_DURATIONS,
				default: 'day',
			},
		],
	},
	{
		displayName: 'Secondary Order',
		name: 'secondaryOrder',
		type: 'collection',
		placeholder: 'Configure Secondary Order',
		default: {},
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeOtoOrder'],
			},
		},
		options: [
			{
				displayName: 'Option Symbol',
				name: 'optionSymbol',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Side',
				name: 'side',
				type: 'options',
				options: OPTION_ORDER_SIDES,
				default: 'sell_to_close',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Order Type',
				name: 'type',
				type: 'options',
				options: ORDER_TYPES,
				default: 'limit',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: ORDER_DURATIONS,
				default: 'gtc',
			},
		],
	},
	{
		displayName: 'OCO Order 1',
		name: 'ocoOrder1',
		type: 'collection',
		placeholder: 'Configure First OCO Order',
		default: {},
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeOcoOrder', 'placeOtocoOrder'],
			},
		},
		options: [
			{
				displayName: 'Option Symbol',
				name: 'optionSymbol',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Side',
				name: 'side',
				type: 'options',
				options: OPTION_ORDER_SIDES,
				default: 'sell_to_close',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Order Type',
				name: 'type',
				type: 'options',
				options: ORDER_TYPES,
				default: 'limit',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: ORDER_DURATIONS,
				default: 'gtc',
			},
		],
	},
	{
		displayName: 'OCO Order 2',
		name: 'ocoOrder2',
		type: 'collection',
		placeholder: 'Configure Second OCO Order',
		default: {},
		displayOptions: {
			show: {
				resource: ['trading'],
				operation: ['placeOcoOrder', 'placeOtocoOrder'],
			},
		},
		options: [
			{
				displayName: 'Option Symbol',
				name: 'optionSymbol',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Side',
				name: 'side',
				type: 'options',
				options: OPTION_ORDER_SIDES,
				default: 'sell_to_close',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Order Type',
				name: 'type',
				type: 'options',
				options: ORDER_TYPES,
				default: 'stop',
			},
			{
				displayName: 'Stop Price',
				name: 'stop',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'options',
				options: ORDER_DURATIONS,
				default: 'gtc',
			},
		],
	},
];

export async function executeTradingOperation(
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

	if (!accountId) {
		throw new Error('Account ID is required. Please provide it in the node or credentials.');
	}

	switch (operation) {
		case 'placeEquityOrder': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const side = this.getNodeParameter('equitySide', i) as string;
			const quantity = this.getNodeParameter('quantity', i) as number;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const duration = this.getNodeParameter('duration', i) as string;

			const body: IDataObject = {
				class: 'equity',
				symbol,
				side,
				quantity,
				type: orderType,
				duration,
			};

			if (orderType === 'limit' || orderType === 'stop_limit') {
				body.price = this.getNodeParameter('limitPrice', i) as number;
			}
			if (orderType === 'stop' || orderType === 'stop_limit') {
				body.stop = this.getNodeParameter('stopPrice', i) as number;
			}

			const response = await client.request('POST', `/v1/accounts/${accountId}/orders`, body);
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'placeOptionOrder': {
			const optionSymbol = this.getNodeParameter('optionSymbol', i) as string;
			const side = this.getNodeParameter('optionSide', i) as string;
			const quantity = this.getNodeParameter('quantity', i) as number;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const duration = this.getNodeParameter('duration', i) as string;

			const body: IDataObject = {
				class: 'option',
				symbol: optionSymbol.substring(0, optionSymbol.search(/\d/)),
				option_symbol: optionSymbol,
				side,
				quantity,
				type: orderType,
				duration,
			};

			if (orderType === 'limit' || orderType === 'stop_limit') {
				body.price = this.getNodeParameter('limitPrice', i) as number;
			}
			if (orderType === 'stop' || orderType === 'stop_limit') {
				body.stop = this.getNodeParameter('stopPrice', i) as number;
			}

			const response = await client.request('POST', `/v1/accounts/${accountId}/orders`, body);
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'placeMultilegOrder': {
			const underlyingSymbol = this.getNodeParameter('underlyingSymbol', i) as string;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const duration = this.getNodeParameter('duration', i) as string;
			const legs = this.getNodeParameter('legs', i) as { legValues: IDataObject[] };

			if (!legs.legValues || legs.legValues.length < 2) {
				throw new Error('Multileg orders require at least 2 legs');
			}

			const body: IDataObject = {
				class: 'multileg',
				symbol: underlyingSymbol,
				type: orderType,
				duration,
			};

			if (orderType === 'limit' || orderType === 'stop_limit') {
				body.price = this.getNodeParameter('limitPrice', i) as number;
			}

			// Add legs
			legs.legValues.forEach((leg, index) => {
				body[`option_symbol[${index}]`] = leg.optionSymbol;
				body[`side[${index}]`] = leg.side;
				body[`quantity[${index}]`] = leg.quantity;
			});

			const response = await client.request('POST', `/v1/accounts/${accountId}/orders`, body);
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'placeOtoOrder': {
			const underlyingSymbol = this.getNodeParameter('underlyingSymbol', i) as string;
			const primaryOrder = this.getNodeParameter('primaryOrder', i) as IDataObject;
			const secondaryOrder = this.getNodeParameter('secondaryOrder', i) as IDataObject;

			const body: IDataObject = {
				class: 'oto',
				symbol: underlyingSymbol,
				duration: primaryOrder.duration || 'day',
				// Primary leg
				'option_symbol[0]': primaryOrder.optionSymbol,
				'side[0]': primaryOrder.side,
				'quantity[0]': primaryOrder.quantity,
				'type[0]': primaryOrder.type,
				'price[0]': primaryOrder.price,
				// Secondary leg
				'option_symbol[1]': secondaryOrder.optionSymbol,
				'side[1]': secondaryOrder.side,
				'quantity[1]': secondaryOrder.quantity,
				'type[1]': secondaryOrder.type,
				'price[1]': secondaryOrder.price,
			};

			const response = await client.request('POST', `/v1/accounts/${accountId}/orders`, cleanObject(body));
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'placeOcoOrder': {
			const underlyingSymbol = this.getNodeParameter('underlyingSymbol', i) as string;
			const ocoOrder1 = this.getNodeParameter('ocoOrder1', i) as IDataObject;
			const ocoOrder2 = this.getNodeParameter('ocoOrder2', i) as IDataObject;

			const body: IDataObject = {
				class: 'oco',
				symbol: underlyingSymbol,
				duration: ocoOrder1.duration || 'gtc',
				// First leg
				'option_symbol[0]': ocoOrder1.optionSymbol,
				'side[0]': ocoOrder1.side,
				'quantity[0]': ocoOrder1.quantity,
				'type[0]': ocoOrder1.type,
				'price[0]': ocoOrder1.price,
				// Second leg
				'option_symbol[1]': ocoOrder2.optionSymbol,
				'side[1]': ocoOrder2.side,
				'quantity[1]': ocoOrder2.quantity,
				'type[1]': ocoOrder2.type,
				'stop[1]': ocoOrder2.stop,
			};

			const response = await client.request('POST', `/v1/accounts/${accountId}/orders`, cleanObject(body));
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'placeOtocoOrder': {
			const underlyingSymbol = this.getNodeParameter('underlyingSymbol', i) as string;
			const primaryOrder = this.getNodeParameter('primaryOrder', i) as IDataObject;
			const ocoOrder1 = this.getNodeParameter('ocoOrder1', i) as IDataObject;
			const ocoOrder2 = this.getNodeParameter('ocoOrder2', i) as IDataObject;

			const body: IDataObject = {
				class: 'otoco',
				symbol: underlyingSymbol,
				duration: primaryOrder.duration || 'day',
				// Primary trigger
				'option_symbol[0]': primaryOrder.optionSymbol,
				'side[0]': primaryOrder.side,
				'quantity[0]': primaryOrder.quantity,
				'type[0]': primaryOrder.type,
				'price[0]': primaryOrder.price,
				// OCO leg 1
				'option_symbol[1]': ocoOrder1.optionSymbol,
				'side[1]': ocoOrder1.side,
				'quantity[1]': ocoOrder1.quantity,
				'type[1]': ocoOrder1.type,
				'price[1]': ocoOrder1.price,
				// OCO leg 2
				'option_symbol[2]': ocoOrder2.optionSymbol,
				'side[2]': ocoOrder2.side,
				'quantity[2]': ocoOrder2.quantity,
				'type[2]': ocoOrder2.type,
				'stop[2]': ocoOrder2.stop,
			};

			const response = await client.request('POST', `/v1/accounts/${accountId}/orders`, cleanObject(body));
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'modifyOrder': {
			const orderId = this.getNodeParameter('orderId', i) as string;
			const body: IDataObject = cleanObject({
				type: this.getNodeParameter('newOrderType', i) as string,
				duration: this.getNodeParameter('newDuration', i) as string,
				price: this.getNodeParameter('newPrice', i) as number,
				stop: this.getNodeParameter('newStopPrice', i) as number,
			});

			const response = await client.request('PUT', `/v1/accounts/${accountId}/orders/${orderId}`, body);
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'cancelOrder': {
			const orderId = this.getNodeParameter('orderId', i) as string;
			const response = await client.request('DELETE', `/v1/accounts/${accountId}/orders/${orderId}`);
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		case 'previewOrder': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const side = this.getNodeParameter('equitySide', i) as string;
			const quantity = this.getNodeParameter('quantity', i) as number;
			const orderType = this.getNodeParameter('orderType', i) as string;
			const duration = this.getNodeParameter('duration', i) as string;

			const body: IDataObject = {
				class: 'equity',
				symbol,
				side,
				quantity,
				type: orderType,
				duration,
				preview: 'true',
			};

			if (orderType === 'limit' || orderType === 'stop_limit') {
				body.price = this.getNodeParameter('limitPrice', i) as number;
			}
			if (orderType === 'stop' || orderType === 'stop_limit') {
				body.stop = this.getNodeParameter('stopPrice', i) as number;
			}

			const response = await client.request('POST', `/v1/accounts/${accountId}/orders`, body);
			const order = simplifyResponse(response, 'order');
			return prepareOutput(Array.isArray(order) ? order : [order]).map((item) => item.json as IDataObject);
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

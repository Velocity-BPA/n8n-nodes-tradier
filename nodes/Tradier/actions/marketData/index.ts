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
	MARKET_DATA_INTERVALS,
	TIME_SALES_INTERVALS,
	SESSION_FILTERS,
	EXCHANGE_CODES,
	SECURITY_TYPES,
} from '../../constants';

export const marketDataOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['marketData'],
			},
		},
		options: [
			{
				name: 'Get Calendar',
				value: 'getCalendar',
				description: 'Get market calendar',
				action: 'Get market calendar',
			},
			{
				name: 'Get Clock',
				value: 'getClock',
				description: 'Get market clock status',
				action: 'Get market clock',
			},
			{
				name: 'Get History',
				value: 'getHistory',
				description: 'Get historical price data',
				action: 'Get historical data',
			},
			{
				name: 'Get Option Chain',
				value: 'getOptionChain',
				description: 'Get option chain for a symbol',
				action: 'Get option chain',
			},
			{
				name: 'Get Option Expirations',
				value: 'getOptionExpirations',
				description: 'Get available option expiration dates',
				action: 'Get option expirations',
			},
			{
				name: 'Get Option Strikes',
				value: 'getOptionStrikes',
				description: 'Get available strikes for an expiration',
				action: 'Get option strikes',
			},
			{
				name: 'Get Quotes',
				value: 'getQuotes',
				description: 'Get real-time quotes',
				action: 'Get quotes',
			},
			{
				name: 'Get Time & Sales',
				value: 'getTimeSales',
				description: 'Get time and sales data',
				action: 'Get time and sales',
			},
			{
				name: 'Lookup Symbols',
				value: 'lookupSymbols',
				description: 'Search for symbols',
				action: 'Lookup symbols',
			},
		],
		default: 'getQuotes',
	},
];

export const marketDataFields: INodeProperties[] = [
	// Symbols for quotes
	{
		displayName: 'Symbols',
		name: 'symbols',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of symbols (e.g., AAPL,MSFT,GOOGL)',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getQuotes'],
			},
		},
	},
	// Symbol for single operations
	{
		displayName: 'Symbol',
		name: 'symbol',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getHistory', 'getOptionChain', 'getOptionExpirations', 'getOptionStrikes', 'getTimeSales'],
			},
		},
	},
	// History options
	{
		displayName: 'Interval',
		name: 'interval',
		type: 'options',
		options: MARKET_DATA_INTERVALS,
		default: 'daily',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getHistory'],
			},
		},
	},
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getHistory', 'getTimeSales'],
			},
		},
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		default: '',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getHistory', 'getTimeSales'],
			},
		},
	},
	// Option chain options
	{
		displayName: 'Expiration',
		name: 'expiration',
		type: 'string',
		required: true,
		default: '',
		description: 'Expiration date (YYYY-MM-DD)',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getOptionChain', 'getOptionStrikes'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'optionChainOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getOptionChain'],
			},
		},
		options: [
			{
				displayName: 'Include Greeks',
				name: 'greeks',
				type: 'boolean',
				default: false,
				description: 'Whether to include option Greeks',
			},
		],
	},
	// Time and sales options
	{
		displayName: 'Interval',
		name: 'timeSalesInterval',
		type: 'options',
		options: TIME_SALES_INTERVALS,
		default: '1min',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getTimeSales'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'timeSalesOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getTimeSales'],
			},
		},
		options: [
			{
				displayName: 'Session Filter',
				name: 'sessionFilter',
				type: 'options',
				options: SESSION_FILTERS,
				default: 'all',
			},
		],
	},
	// Calendar options
	{
		displayName: 'Month',
		name: 'month',
		type: 'number',
		default: 0,
		description: 'Month (1-12), leave 0 for current month',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getCalendar'],
			},
		},
	},
	{
		displayName: 'Year',
		name: 'year',
		type: 'number',
		default: 0,
		description: 'Year (e.g., 2024), leave 0 for current year',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['getCalendar'],
			},
		},
	},
	// Symbol lookup
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		required: true,
		default: '',
		description: 'Search query for symbol lookup',
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['lookupSymbols'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'lookupOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['marketData'],
				operation: ['lookupSymbols'],
			},
		},
		options: [
			{
				displayName: 'Exchanges',
				name: 'exchanges',
				type: 'multiOptions',
				options: EXCHANGE_CODES,
				default: [],
			},
			{
				displayName: 'Types',
				name: 'types',
				type: 'multiOptions',
				options: SECURITY_TYPES,
				default: [],
			},
		],
	},
];

export async function executeMarketDataOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject[]> {
	const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
	const client = createTradierClient(this, credentials);

	switch (operation) {
		case 'getQuotes': {
			const symbols = this.getNodeParameter('symbols', i) as string;
			const qs = { symbols: symbols.replace(/\s/g, '') };

			const response = await client.request('GET', '/v1/markets/quotes', {}, qs);
			const quotes = simplifyResponse(response, 'quotes.quote');
			if (!quotes || quotes === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(quotes) ? quotes : [quotes]).map((item) => item.json as IDataObject);
		}

		case 'getHistory': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const interval = this.getNodeParameter('interval', i) as string;
			const startDate = this.getNodeParameter('startDate', i, '') as string;
			const endDate = this.getNodeParameter('endDate', i, '') as string;

			const qs = cleanObject({
				symbol,
				interval,
				start: startDate ? new Date(startDate).toISOString().split('T')[0] : undefined,
				end: endDate ? new Date(endDate).toISOString().split('T')[0] : undefined,
			});

			const response = await client.request('GET', '/v1/markets/history', {}, qs);
			const history = simplifyResponse(response, 'history.day');
			if (!history || history === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(history) ? history : [history]).map((item) => item.json as IDataObject);
		}

		case 'getOptionChain': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const expiration = this.getNodeParameter('expiration', i) as string;
			const options = this.getNodeParameter('optionChainOptions', i, {}) as IDataObject;

			const qs = cleanObject({
				symbol,
				expiration,
				greeks: options.greeks ? 'true' : undefined,
			});

			const response = await client.request('GET', '/v1/markets/options/chains', {}, qs);
			const chain = simplifyResponse(response, 'options.option');
			if (!chain || chain === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(chain) ? chain : [chain]).map((item) => item.json as IDataObject);
		}

		case 'getOptionExpirations': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const qs = { symbol };

			const response = await client.request('GET', '/v1/markets/options/expirations', {}, qs);
			const expirations = simplifyResponse(response, 'expirations.date');
			if (!expirations || expirations === 'null') {
				return [];
			}
			const dates = Array.isArray(expirations) ? expirations : [expirations];
			return dates.map((date: string) => ({ date } as IDataObject));
		}

		case 'getOptionStrikes': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const expiration = this.getNodeParameter('expiration', i) as string;
			const qs = { symbol, expiration };

			const response = await client.request('GET', '/v1/markets/options/strikes', {}, qs);
			const strikes = simplifyResponse(response, 'strikes.strike');
			if (!strikes || strikes === 'null') {
				return [];
			}
			const strikeList = Array.isArray(strikes) ? strikes : [strikes];
			return strikeList.map((strike: number) => ({ strike } as IDataObject));
		}

		case 'getTimeSales': {
			const symbol = this.getNodeParameter('symbol', i) as string;
			const interval = this.getNodeParameter('timeSalesInterval', i) as string;
			const startDate = this.getNodeParameter('startDate', i, '') as string;
			const endDate = this.getNodeParameter('endDate', i, '') as string;
			const options = this.getNodeParameter('timeSalesOptions', i, {}) as IDataObject;

			const qs = cleanObject({
				symbol,
				interval,
				start: startDate ? new Date(startDate).toISOString() : undefined,
				end: endDate ? new Date(endDate).toISOString() : undefined,
				session_filter: options.sessionFilter !== 'all' ? options.sessionFilter : undefined,
			});

			const response = await client.request('GET', '/v1/markets/timesales', {}, qs);
			const series = simplifyResponse(response, 'series.data');
			if (!series || series === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(series) ? series : [series]).map((item) => item.json as IDataObject);
		}

		case 'getClock': {
			const response = await client.request('GET', '/v1/markets/clock');
			const clock = simplifyResponse(response, 'clock');
			return prepareOutput(Array.isArray(clock) ? clock : [clock]).map((item) => item.json as IDataObject);
		}

		case 'getCalendar': {
			const month = this.getNodeParameter('month', i, 0) as number;
			const year = this.getNodeParameter('year', i, 0) as number;

			const qs = cleanObject({
				month: month > 0 ? month : undefined,
				year: year > 0 ? year : undefined,
			});

			const response = await client.request('GET', '/v1/markets/calendar', {}, qs);
			const calendar = simplifyResponse(response, 'calendar.days.day');
			if (!calendar || calendar === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(calendar) ? calendar : [calendar]).map((item) => item.json as IDataObject);
		}

		case 'lookupSymbols': {
			const query = this.getNodeParameter('query', i) as string;
			const options = this.getNodeParameter('lookupOptions', i, {}) as IDataObject;

			const qs = cleanObject({
				q: query,
				exchanges: (options.exchanges as string[])?.join(',') || undefined,
				types: (options.types as string[])?.join(',') || undefined,
			});

			const response = await client.request('GET', '/v1/markets/lookup', {}, qs);
			const securities = simplifyResponse(response, 'securities.security');
			if (!securities || securities === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(securities) ? securities : [securities]).map((item) => item.json as IDataObject);
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

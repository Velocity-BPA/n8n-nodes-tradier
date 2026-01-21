/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createTradierClient, type TradierCredentials } from '../../transport';
import { simplifyResponse, prepareOutput } from '../../utils';

export const fundamentalsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['fundamentals'],
			},
		},
		options: [
			{
				name: 'Get Company Info',
				value: 'getCompanyInfo',
				description: 'Get company profile information',
				action: 'Get company info',
			},
			{
				name: 'Get Corporate Actions',
				value: 'getCorporateActions',
				description: 'Get corporate actions (splits, mergers, etc.)',
				action: 'Get corporate actions',
			},
			{
				name: 'Get Corporate Calendars',
				value: 'getCorporateCalendars',
				description: 'Get corporate calendar events',
				action: 'Get corporate calendars',
			},
			{
				name: 'Get Dividends',
				value: 'getDividends',
				description: 'Get dividend information',
				action: 'Get dividends',
			},
			{
				name: 'Get Financial Ratios',
				value: 'getFinancialRatios',
				description: 'Get financial ratios',
				action: 'Get financial ratios',
			},
		],
		default: 'getCompanyInfo',
	},
];

export const fundamentalsFields: INodeProperties[] = [
	{
		displayName: 'Symbols',
		name: 'symbols',
		type: 'string',
		required: true,
		default: '',
		description: 'Comma-separated list of symbols',
		displayOptions: {
			show: {
				resource: ['fundamentals'],
			},
		},
	},
];

export async function executeFundamentalsOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject[]> {
	const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
	const client = createTradierClient(this, credentials);
	const symbols = this.getNodeParameter('symbols', i) as string;
	const qs = { symbols: symbols.replace(/\s/g, '') };

	switch (operation) {
		case 'getCompanyInfo': {
			const response = await client.request('GET', '/beta/markets/fundamentals/company', {}, qs);
			const items = simplifyResponse(response, 'items');
			if (!items || items === 'null') {
				return [];
			}
			const itemArray = Array.isArray(items) ? items : [items];
			return itemArray.flatMap((item: any) => {
				const results = item.results;
				if (Array.isArray(results)) {
					return results.map((r: any) => r as IDataObject);
				}
				return results ? [results as IDataObject] : [];
			});
		}

		case 'getCorporateCalendars': {
			const response = await client.request('GET', '/beta/markets/fundamentals/calendars', {}, qs);
			const items = simplifyResponse(response, 'items');
			if (!items || items === 'null') {
				return [];
			}
			const itemArray = Array.isArray(items) ? items : [items];
			return itemArray.flatMap((item: any) => {
				const results = item.results;
				if (Array.isArray(results)) {
					return results.map((r: any) => r as IDataObject);
				}
				return results ? [results as IDataObject] : [];
			});
		}

		case 'getDividends': {
			const response = await client.request('GET', '/beta/markets/fundamentals/dividends', {}, qs);
			const items = simplifyResponse(response, 'items');
			if (!items || items === 'null') {
				return [];
			}
			const itemArray = Array.isArray(items) ? items : [items];
			return itemArray.flatMap((item: any) => {
				const results = item.results;
				if (Array.isArray(results)) {
					return results.map((r: any) => r as IDataObject);
				}
				return results ? [results as IDataObject] : [];
			});
		}

		case 'getFinancialRatios': {
			const response = await client.request('GET', '/beta/markets/fundamentals/ratios', {}, qs);
			const items = simplifyResponse(response, 'items');
			if (!items || items === 'null') {
				return [];
			}
			const itemArray = Array.isArray(items) ? items : [items];
			return itemArray.flatMap((item: any) => {
				const results = item.results;
				if (Array.isArray(results)) {
					return results.map((r: any) => r as IDataObject);
				}
				return results ? [results as IDataObject] : [];
			});
		}

		case 'getCorporateActions': {
			const response = await client.request('GET', '/beta/markets/fundamentals/corporate_actions', {}, qs);
			const items = simplifyResponse(response, 'items');
			if (!items || items === 'null') {
				return [];
			}
			const itemArray = Array.isArray(items) ? items : [items];
			return itemArray.flatMap((item: any) => {
				const results = item.results;
				if (Array.isArray(results)) {
					return results.map((r: any) => r as IDataObject);
				}
				return results ? [results as IDataObject] : [];
			});
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

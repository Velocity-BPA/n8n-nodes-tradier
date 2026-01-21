/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createTradierClient, type TradierCredentials } from '../../transport';
import { simplifyResponse, prepareOutput } from '../../utils';

export const watchlistsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['watchlists'],
			},
		},
		options: [
			{
				name: 'Add Symbols',
				value: 'addSymbols',
				description: 'Add symbols to a watchlist',
				action: 'Add symbols to watchlist',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new watchlist',
				action: 'Create a watchlist',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a watchlist',
				action: 'Delete a watchlist',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a specific watchlist',
				action: 'Get a watchlist',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all watchlists',
				action: 'Get all watchlists',
			},
			{
				name: 'Remove Symbols',
				value: 'removeSymbols',
				description: 'Remove symbols from a watchlist',
				action: 'Remove symbols from watchlist',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a watchlist name',
				action: 'Update a watchlist',
			},
		],
		default: 'getAll',
	},
];

export const watchlistsFields: INodeProperties[] = [
	// Watchlist ID
	{
		displayName: 'Watchlist ID',
		name: 'watchlistId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['watchlists'],
				operation: ['get', 'update', 'delete', 'addSymbols', 'removeSymbols'],
			},
		},
	},
	// Name for create/update
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['watchlists'],
				operation: ['create', 'update'],
			},
		},
	},
	// Symbols for create/add/remove
	{
		displayName: 'Symbols',
		name: 'symbols',
		type: 'string',
		default: '',
		description: 'Comma-separated list of symbols',
		displayOptions: {
			show: {
				resource: ['watchlists'],
				operation: ['create', 'addSymbols', 'removeSymbols'],
			},
		},
	},
];

export async function executeWatchlistsOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject[]> {
	const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
	const client = createTradierClient(this, credentials);

	switch (operation) {
		case 'getAll': {
			const response = await client.request('GET', '/v1/watchlists');
			const watchlists = simplifyResponse(response, 'watchlists.watchlist');
			if (!watchlists || watchlists === 'null') {
				return [];
			}
			return prepareOutput(Array.isArray(watchlists) ? watchlists : [watchlists]).map((item) => item.json as IDataObject);
		}

		case 'get': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;
			const response = await client.request('GET', `/v1/watchlists/${watchlistId}`);
			const watchlist = simplifyResponse(response, 'watchlist');
			return prepareOutput(Array.isArray(watchlist) ? watchlist : [watchlist]).map((item) => item.json as IDataObject);
		}

		case 'create': {
			const name = this.getNodeParameter('name', i) as string;
			const symbols = this.getNodeParameter('symbols', i, '') as string;

			const body: IDataObject = { name };
			if (symbols) {
				body.symbols = symbols.replace(/\s/g, '');
			}

			const response = await client.request('POST', '/v1/watchlists', body);
			const watchlist = simplifyResponse(response, 'watchlist');
			return prepareOutput(Array.isArray(watchlist) ? watchlist : [watchlist]).map((item) => item.json as IDataObject);
		}

		case 'update': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;
			const name = this.getNodeParameter('name', i) as string;

			const body = { name };
			const response = await client.request('PUT', `/v1/watchlists/${watchlistId}`, body);
			const watchlist = simplifyResponse(response, 'watchlist');
			return prepareOutput(Array.isArray(watchlist) ? watchlist : [watchlist]).map((item) => item.json as IDataObject);
		}

		case 'delete': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;
			const response = await client.request('DELETE', `/v1/watchlists/${watchlistId}`);
			return [{ success: true, watchlistId } as IDataObject];
		}

		case 'addSymbols': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;
			const symbols = this.getNodeParameter('symbols', i) as string;

			const body = { symbols: symbols.replace(/\s/g, '') };
			const response = await client.request('POST', `/v1/watchlists/${watchlistId}/symbols`, body);
			const watchlist = simplifyResponse(response, 'watchlist');
			return prepareOutput(Array.isArray(watchlist) ? watchlist : [watchlist]).map((item) => item.json as IDataObject);
		}

		case 'removeSymbols': {
			const watchlistId = this.getNodeParameter('watchlistId', i) as string;
			const symbols = this.getNodeParameter('symbols', i) as string;

			const qs = { symbols: symbols.replace(/\s/g, '') };
			const response = await client.request('DELETE', `/v1/watchlists/${watchlistId}/symbols`, {}, qs);
			const watchlist = simplifyResponse(response, 'watchlist');
			return prepareOutput(Array.isArray(watchlist) ? watchlist : [watchlist]).map((item) => item.json as IDataObject);
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { createTradierClient, type TradierCredentials } from '../../transport';
import { simplifyResponse, prepareOutput } from '../../utils';

export const streamingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['streaming'],
			},
		},
		options: [
			{
				name: 'Create Events Session',
				value: 'createEventsSession',
				description: 'Create a session for account event streaming',
				action: 'Create events session',
			},
			{
				name: 'Create Market Session',
				value: 'createSession',
				description: 'Create a session for market data streaming',
				action: 'Create market session',
			},
		],
		default: 'createSession',
	},
];

export const streamingFields: INodeProperties[] = [];

export async function executeStreamingOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject[]> {
	const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
	const client = createTradierClient(this, credentials);

	switch (operation) {
		case 'createSession': {
			const response = await client.request('POST', '/v1/markets/events/session');
			const stream = simplifyResponse(response, 'stream');
			return prepareOutput(Array.isArray(stream) ? stream : [stream]).map((item) => item.json as IDataObject);
		}

		case 'createEventsSession': {
			const response = await client.request('POST', '/v1/accounts/events/session');
			const stream = simplifyResponse(response, 'stream');
			return prepareOutput(Array.isArray(stream) ? stream : [stream]).map((item) => item.json as IDataObject);
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

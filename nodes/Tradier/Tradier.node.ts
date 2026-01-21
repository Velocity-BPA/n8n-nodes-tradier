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
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				for (const result of results) {
					returnData.push({ json: result });
				}
			} catch (error) {
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

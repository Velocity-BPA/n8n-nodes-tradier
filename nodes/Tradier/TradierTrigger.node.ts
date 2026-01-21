/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IPollFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { createTradierClient, type TradierCredentials, type TradierClient } from './transport';
import { TRIGGER_TYPES, PRICE_ALERT_CONDITIONS } from './constants';

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

// Helper functions defined outside the class since poll() rebinds 'this'
async function getOrders(client: TradierClient, accountId: string): Promise<IDataObject[]> {
	const response = await client.request('GET', `/v1/accounts/${accountId}/orders`);
	const orders = response?.orders?.order;
	if (!orders || orders === 'null') return [];
	return Array.isArray(orders) ? orders : [orders];
}

async function getPositions(client: TradierClient, accountId: string): Promise<IDataObject[]> {
	const response = await client.request('GET', `/v1/accounts/${accountId}/positions`);
	const positions = response?.positions?.position;
	if (!positions || positions === 'null') return [];
	return Array.isArray(positions) ? positions : [positions];
}

async function getBalances(client: TradierClient, accountId: string): Promise<IDataObject> {
	const response = await client.request('GET', `/v1/accounts/${accountId}/balances`);
	return response?.balances || {};
}

async function getQuotes(client: TradierClient, symbols: string): Promise<IDataObject[]> {
	const response = await client.request('GET', '/v1/markets/quotes', {}, { symbols });
	const quotes = response?.quotes?.quote;
	if (!quotes || quotes === 'null') return [];
	return Array.isArray(quotes) ? quotes : [quotes];
}

async function getClock(client: TradierClient): Promise<IDataObject> {
	const response = await client.request('GET', '/v1/markets/clock');
	return response?.clock || {};
}

export class TradierTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tradier Trigger',
		name: 'tradierTrigger',
		icon: 'file:tradier.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["triggerType"]}}',
		description: 'Triggers on Tradier account and market events',
		defaults: {
			name: 'Tradier Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'tradierApi',
				required: true,
			},
		],
		polling: true,
		properties: [
			{
				displayName: 'Trigger Type',
				name: 'triggerType',
				type: 'options',
				options: TRIGGER_TYPES,
				default: 'newOrder',
				description: 'The type of event to trigger on',
			},
			{
				displayName: 'Account ID',
				name: 'accountId',
				type: 'string',
				default: '',
				description: 'Account ID (leave empty to use default from credentials)',
				displayOptions: {
					show: {
						triggerType: ['newOrder', 'orderFilled', 'orderCanceled', 'positionChange', 'balanceChange'],
					},
				},
			},
			// Price Alert settings
			{
				displayName: 'Symbol',
				name: 'symbol',
				type: 'string',
				required: true,
				default: '',
				description: 'Stock symbol to monitor',
				displayOptions: {
					show: {
						triggerType: ['priceAlert'],
					},
				},
			},
			{
				displayName: 'Condition',
				name: 'condition',
				type: 'options',
				options: PRICE_ALERT_CONDITIONS,
				default: 'above',
				displayOptions: {
					show: {
						triggerType: ['priceAlert'],
					},
				},
			},
			{
				displayName: 'Price',
				name: 'targetPrice',
				type: 'number',
				default: 0,
				description: 'Target price threshold',
				displayOptions: {
					show: {
						triggerType: ['priceAlert'],
					},
				},
			},
		],
	};

	constructor() {
		emitLicensingNotice();
	}

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const triggerType = this.getNodeParameter('triggerType') as string;
		const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
		const client = createTradierClient(this, credentials);

		let accountId = this.getNodeParameter('accountId', '') as string;
		if (!accountId) {
			accountId = credentials.accountId || '';
		}

		const staticData = this.getWorkflowStaticData('node');

		switch (triggerType) {
			case 'newOrder': {
				if (!accountId) throw new Error('Account ID is required');

				const orders = await getOrders(client, accountId);
				const knownOrderIds = (staticData.knownOrderIds as string[]) || [];
				const newOrders = orders.filter((order) => !knownOrderIds.includes(String(order.id)));

				if (newOrders.length === 0) {
					return null;
				}

				staticData.knownOrderIds = orders.map((order) => String(order.id));
				return [newOrders.map((order) => ({ json: order }))];
			}

			case 'orderFilled': {
				if (!accountId) throw new Error('Account ID is required');

				const orders = await getOrders(client, accountId);
				const filledOrderIds = (staticData.filledOrderIds as string[]) || [];
				const newlyFilled = orders.filter(
					(order) => order.status === 'filled' && !filledOrderIds.includes(String(order.id)),
				);

				if (newlyFilled.length === 0) {
					return null;
				}

				staticData.filledOrderIds = orders
					.filter((order) => order.status === 'filled')
					.map((order) => String(order.id));
				return [newlyFilled.map((order) => ({ json: order }))];
			}

			case 'orderCanceled': {
				if (!accountId) throw new Error('Account ID is required');

				const orders = await getOrders(client, accountId);
				const canceledOrderIds = (staticData.canceledOrderIds as string[]) || [];
				const newlyCanceled = orders.filter(
					(order) => order.status === 'canceled' && !canceledOrderIds.includes(String(order.id)),
				);

				if (newlyCanceled.length === 0) {
					return null;
				}

				staticData.canceledOrderIds = orders
					.filter((order) => order.status === 'canceled')
					.map((order) => String(order.id));
				return [newlyCanceled.map((order) => ({ json: order }))];
			}

			case 'positionChange': {
				if (!accountId) throw new Error('Account ID is required');

				const positions = await getPositions(client, accountId);
				const positionsHash = JSON.stringify(
					positions.map((p) => ({
						symbol: p.symbol,
						quantity: p.quantity,
						cost_basis: p.cost_basis,
					})),
				);

				const previousHash = staticData.positionsHash as string;
				if (previousHash === positionsHash) {
					return null;
				}

				staticData.positionsHash = positionsHash;

				if (!previousHash) {
					// First run, don't trigger
					return null;
				}

				return [positions.map((position) => ({ json: position }))];
			}

			case 'balanceChange': {
				if (!accountId) throw new Error('Account ID is required');

				const balances = await getBalances(client, accountId);
				const currentEquity = balances.total_equity;
				const previousEquity = staticData.totalEquity as number;

				if (previousEquity !== undefined && previousEquity === currentEquity) {
					return null;
				}

				staticData.totalEquity = currentEquity;

				if (previousEquity === undefined) {
					// First run, don't trigger
					return null;
				}

				return [[{ json: { ...balances, previous_equity: previousEquity, equity_change: Number(currentEquity) - Number(previousEquity) } }]];
			}

			case 'priceAlert': {
				const symbol = this.getNodeParameter('symbol') as string;
				const condition = this.getNodeParameter('condition') as string;
				const targetPrice = this.getNodeParameter('targetPrice') as number;

				const quotes = await getQuotes(client, symbol);
				if (quotes.length === 0) {
					return null;
				}

				const quote = quotes[0];
				const currentPrice = Number(quote.last);
				const previousPrice = staticData.lastPrice as number;

				let triggered = false;

				switch (condition) {
					case 'above':
						triggered = currentPrice >= targetPrice && (previousPrice === undefined || previousPrice < targetPrice);
						break;
					case 'below':
						triggered = currentPrice <= targetPrice && (previousPrice === undefined || previousPrice > targetPrice);
						break;
					case 'cross':
						if (previousPrice !== undefined) {
							triggered =
								(currentPrice >= targetPrice && previousPrice < targetPrice) ||
								(currentPrice <= targetPrice && previousPrice > targetPrice);
						}
						break;
				}

				staticData.lastPrice = currentPrice;

				if (!triggered) {
					return null;
				}

				return [[{ json: { ...quote, target_price: targetPrice, condition, triggered_at: new Date().toISOString() } }]];
			}

			case 'marketOpen': {
				const clock = await getClock(client);
				const currentState = clock.state;
				const previousState = staticData.marketState as string;

				staticData.marketState = currentState;

				if (previousState !== 'open' && currentState === 'open') {
					return [[{ json: { ...clock, event: 'market_open', triggered_at: new Date().toISOString() } }]];
				}

				return null;
			}

			case 'marketClose': {
				const clock = await getClock(client);
				const currentState = clock.state;
				const previousState = staticData.marketState as string;

				staticData.marketState = currentState;

				if (previousState === 'open' && currentState === 'closed') {
					return [[{ json: { ...clock, event: 'market_close', triggered_at: new Date().toISOString() } }]];
				}

				return null;
			}

			default:
				throw new Error(`Unknown trigger type: ${triggerType}`);
		}
	}
}

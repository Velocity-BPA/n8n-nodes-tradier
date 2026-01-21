/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const ORDER_TYPES = [
	{ name: 'Market', value: 'market' },
	{ name: 'Limit', value: 'limit' },
	{ name: 'Stop', value: 'stop' },
	{ name: 'Stop Limit', value: 'stop_limit' },
];

export const EQUITY_ORDER_SIDES = [
	{ name: 'Buy', value: 'buy' },
	{ name: 'Sell', value: 'sell' },
	{ name: 'Buy to Cover', value: 'buy_to_cover' },
	{ name: 'Sell Short', value: 'sell_short' },
];

export const OPTION_ORDER_SIDES = [
	{ name: 'Buy to Open', value: 'buy_to_open' },
	{ name: 'Buy to Close', value: 'buy_to_close' },
	{ name: 'Sell to Open', value: 'sell_to_open' },
	{ name: 'Sell to Close', value: 'sell_to_close' },
];

export const ORDER_DURATIONS = [
	{ name: 'Day', value: 'day' },
	{ name: 'Good Till Canceled (GTC)', value: 'gtc' },
	{ name: 'Pre-Market', value: 'pre' },
	{ name: 'Post-Market', value: 'post' },
];

export const ORDER_CLASSES = [
	{ name: 'Equity', value: 'equity' },
	{ name: 'Option', value: 'option' },
	{ name: 'Multileg', value: 'multileg' },
	{ name: 'Combo', value: 'combo' },
];

export const ORDER_STATUSES = [
	{ name: 'All', value: 'all' },
	{ name: 'Open', value: 'open' },
	{ name: 'Pending', value: 'pending' },
	{ name: 'Filled', value: 'filled' },
	{ name: 'Canceled', value: 'canceled' },
	{ name: 'Expired', value: 'expired' },
	{ name: 'Rejected', value: 'rejected' },
	{ name: 'Partially Filled', value: 'partially_filled' },
];

export const OPTION_TYPES = [
	{ name: 'Call', value: 'call' },
	{ name: 'Put', value: 'put' },
];

export const MARKET_DATA_INTERVALS = [
	{ name: '1 Minute', value: '1min' },
	{ name: '5 Minutes', value: '5min' },
	{ name: '15 Minutes', value: '15min' },
	{ name: 'Daily', value: 'daily' },
	{ name: 'Weekly', value: 'weekly' },
	{ name: 'Monthly', value: 'monthly' },
];

export const TIME_SALES_INTERVALS = [
	{ name: 'Tick', value: 'tick' },
	{ name: '1 Minute', value: '1min' },
	{ name: '5 Minutes', value: '5min' },
	{ name: '15 Minutes', value: '15min' },
];

export const SESSION_FILTERS = [
	{ name: 'All', value: 'all' },
	{ name: 'Open', value: 'open' },
];

export const TRIGGER_TYPES = [
	{ name: 'New Order', value: 'newOrder' },
	{ name: 'Order Filled', value: 'orderFilled' },
	{ name: 'Order Canceled', value: 'orderCanceled' },
	{ name: 'Position Change', value: 'positionChange' },
	{ name: 'Balance Change', value: 'balanceChange' },
	{ name: 'Price Alert', value: 'priceAlert' },
	{ name: 'Market Open', value: 'marketOpen' },
	{ name: 'Market Close', value: 'marketClose' },
];

export const PRICE_ALERT_CONDITIONS = [
	{ name: 'Above', value: 'above' },
	{ name: 'Below', value: 'below' },
	{ name: 'Crosses', value: 'cross' },
];

export const MULTILEG_STRATEGIES = [
	{ name: 'Spread', value: 'spread' },
	{ name: 'Straddle', value: 'straddle' },
	{ name: 'Strangle', value: 'strangle' },
	{ name: 'Iron Condor', value: 'condor' },
	{ name: 'Butterfly', value: 'butterfly' },
	{ name: 'Custom', value: 'custom' },
];

export const TRANSACTION_TYPES = [
	{ name: 'All', value: 'all' },
	{ name: 'Trade', value: 'trade' },
	{ name: 'Option', value: 'option' },
	{ name: 'ACH', value: 'ach' },
	{ name: 'Wire', value: 'wire' },
	{ name: 'Dividend', value: 'dividend' },
	{ name: 'Fee', value: 'fee' },
	{ name: 'Tax', value: 'tax' },
	{ name: 'Journal', value: 'journal' },
	{ name: 'Check', value: 'check' },
	{ name: 'Transfer', value: 'transfer' },
	{ name: 'Adjustment', value: 'adjustment' },
	{ name: 'Interest', value: 'interest' },
];

export const SORT_DIRECTIONS = [
	{ name: 'Ascending', value: 'asc' },
	{ name: 'Descending', value: 'desc' },
];

export const CALENDAR_TYPES = [
	{ name: 'Market', value: 'market' },
	{ name: 'Option Expirations', value: 'options' },
];

export const EXCHANGE_CODES = [
	{ name: 'NYSE', value: 'N' },
	{ name: 'NASDAQ', value: 'Q' },
	{ name: 'NYSE American', value: 'A' },
	{ name: 'NYSE Arca', value: 'P' },
	{ name: 'BATS', value: 'Z' },
];

export const SECURITY_TYPES = [
	{ name: 'Stock', value: 'stock' },
	{ name: 'ETF', value: 'etf' },
	{ name: 'Option', value: 'option' },
	{ name: 'Index', value: 'index' },
];

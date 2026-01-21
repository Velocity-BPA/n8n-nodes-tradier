/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	ORDER_TYPES,
	EQUITY_ORDER_SIDES,
	OPTION_ORDER_SIDES,
	ORDER_DURATIONS,
	ORDER_CLASSES,
	ORDER_STATUSES,
	OPTION_TYPES,
	MARKET_DATA_INTERVALS,
	TRIGGER_TYPES,
	MULTILEG_STRATEGIES,
} from '../../nodes/Tradier/constants';

describe('Tradier Constants', () => {
	describe('ORDER_TYPES', () => {
		it('should contain all required order types', () => {
			expect(ORDER_TYPES).toContainEqual({ name: 'Market', value: 'market' });
			expect(ORDER_TYPES).toContainEqual({ name: 'Limit', value: 'limit' });
			expect(ORDER_TYPES).toContainEqual({ name: 'Stop', value: 'stop' });
			expect(ORDER_TYPES).toContainEqual({ name: 'Stop Limit', value: 'stop_limit' });
		});
	});

	describe('EQUITY_ORDER_SIDES', () => {
		it('should contain buy and sell sides for equities', () => {
			expect(EQUITY_ORDER_SIDES).toContainEqual({ name: 'Buy', value: 'buy' });
			expect(EQUITY_ORDER_SIDES).toContainEqual({ name: 'Sell', value: 'sell' });
			expect(EQUITY_ORDER_SIDES).toContainEqual({ name: 'Buy to Cover', value: 'buy_to_cover' });
			expect(EQUITY_ORDER_SIDES).toContainEqual({ name: 'Sell Short', value: 'sell_short' });
		});
	});

	describe('OPTION_ORDER_SIDES', () => {
		it('should contain all option trading sides', () => {
			expect(OPTION_ORDER_SIDES).toContainEqual({ name: 'Buy to Open', value: 'buy_to_open' });
			expect(OPTION_ORDER_SIDES).toContainEqual({ name: 'Buy to Close', value: 'buy_to_close' });
			expect(OPTION_ORDER_SIDES).toContainEqual({ name: 'Sell to Open', value: 'sell_to_open' });
			expect(OPTION_ORDER_SIDES).toContainEqual({ name: 'Sell to Close', value: 'sell_to_close' });
		});
	});

	describe('ORDER_DURATIONS', () => {
		it('should contain standard duration types', () => {
			expect(ORDER_DURATIONS).toContainEqual({ name: 'Day', value: 'day' });
			expect(ORDER_DURATIONS).toContainEqual({ name: 'Good Till Canceled (GTC)', value: 'gtc' });
			expect(ORDER_DURATIONS).toContainEqual({ name: 'Pre-Market', value: 'pre' });
			expect(ORDER_DURATIONS).toContainEqual({ name: 'Post-Market', value: 'post' });
		});
	});

	describe('ORDER_CLASSES', () => {
		it('should contain all order class types', () => {
			expect(ORDER_CLASSES).toContainEqual({ name: 'Equity', value: 'equity' });
			expect(ORDER_CLASSES).toContainEqual({ name: 'Option', value: 'option' });
			expect(ORDER_CLASSES).toContainEqual({ name: 'Multileg', value: 'multileg' });
			expect(ORDER_CLASSES).toContainEqual({ name: 'Combo', value: 'combo' });
		});
	});

	describe('ORDER_STATUSES', () => {
		it('should contain all possible order statuses', () => {
			expect(ORDER_STATUSES).toContainEqual({ name: 'Open', value: 'open' });
			expect(ORDER_STATUSES).toContainEqual({ name: 'Filled', value: 'filled' });
			expect(ORDER_STATUSES).toContainEqual({ name: 'Canceled', value: 'canceled' });
			expect(ORDER_STATUSES).toContainEqual({ name: 'Pending', value: 'pending' });
			expect(ORDER_STATUSES).toContainEqual({ name: 'Rejected', value: 'rejected' });
		});
	});

	describe('OPTION_TYPES', () => {
		it('should contain call and put types', () => {
			expect(OPTION_TYPES).toContainEqual({ name: 'Call', value: 'call' });
			expect(OPTION_TYPES).toContainEqual({ name: 'Put', value: 'put' });
		});
	});

	describe('MARKET_DATA_INTERVALS', () => {
		it('should contain standard interval types', () => {
			expect(MARKET_DATA_INTERVALS).toContainEqual({ name: '1 Minute', value: '1min' });
			expect(MARKET_DATA_INTERVALS).toContainEqual({ name: '5 Minutes', value: '5min' });
			expect(MARKET_DATA_INTERVALS).toContainEqual({ name: '15 Minutes', value: '15min' });
			expect(MARKET_DATA_INTERVALS).toContainEqual({ name: 'Daily', value: 'daily' });
			expect(MARKET_DATA_INTERVALS).toContainEqual({ name: 'Weekly', value: 'weekly' });
			expect(MARKET_DATA_INTERVALS).toContainEqual({ name: 'Monthly', value: 'monthly' });
		});
	});

	describe('TRIGGER_TYPES', () => {
		it('should contain all trigger event types', () => {
			expect(TRIGGER_TYPES).toContainEqual({ name: 'New Order', value: 'newOrder' });
			expect(TRIGGER_TYPES).toContainEqual({ name: 'Order Filled', value: 'orderFilled' });
			expect(TRIGGER_TYPES).toContainEqual({ name: 'Order Canceled', value: 'orderCanceled' });
			expect(TRIGGER_TYPES).toContainEqual({ name: 'Position Change', value: 'positionChange' });
			expect(TRIGGER_TYPES).toContainEqual({ name: 'Balance Change', value: 'balanceChange' });
			expect(TRIGGER_TYPES).toContainEqual({ name: 'Price Alert', value: 'priceAlert' });
		});
	});

	describe('MULTILEG_STRATEGIES', () => {
		it('should contain common options strategies', () => {
			const strategyValues = MULTILEG_STRATEGIES.map((s) => s.value);
			expect(strategyValues).toContain('spread');
			expect(strategyValues).toContain('straddle');
			expect(strategyValues).toContain('strangle');
		});
	});
});

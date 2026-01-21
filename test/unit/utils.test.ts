/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	parseOccSymbol,
	buildOccSymbol,
	cleanObject,
	formatCurrency,
	formatPercentage,
	isValidSymbol,
} from '../../nodes/Tradier/utils';

describe('Tradier Utils', () => {
	describe('parseOccSymbol', () => {
		it('should parse a valid call option symbol', () => {
			const result = parseOccSymbol('AAPL240119C00150000');
			expect(result).not.toBeNull();
			expect(result?.underlying).toBe('AAPL');
			expect(result?.expiration).toBe('2024-01-19');
			expect(result?.optionType).toBe('call');
			expect(result?.strikePrice).toBe(150);
		});

		it('should parse a valid put option symbol', () => {
			const result = parseOccSymbol('MSFT240315P00400000');
			expect(result).not.toBeNull();
			expect(result?.underlying).toBe('MSFT');
			expect(result?.expiration).toBe('2024-03-15');
			expect(result?.optionType).toBe('put');
			expect(result?.strikePrice).toBe(400);
		});

		it('should parse symbol with decimal strike price', () => {
			const result = parseOccSymbol('SPY240119C00475500');
			expect(result).not.toBeNull();
			expect(result?.strikePrice).toBe(475.5);
		});

		it('should return null for invalid symbol format', () => {
			const result = parseOccSymbol('INVALID');
			expect(result).toBeNull();
		});

		it('should return null for empty string', () => {
			const result = parseOccSymbol('');
			expect(result).toBeNull();
		});
	});

	describe('buildOccSymbol', () => {
		it('should build a call option symbol', () => {
			const result = buildOccSymbol('AAPL', '2024-01-19', 'call', 150);
			expect(result).toBe('AAPL240119C00150000');
		});

		it('should build a put option symbol', () => {
			const result = buildOccSymbol('MSFT', '2024-03-15', 'put', 400);
			expect(result).toBe('MSFT240315P00400000');
		});

		it('should handle decimal strike prices', () => {
			const result = buildOccSymbol('SPY', '2024-01-19', 'call', 475.5);
			expect(result).toBe('SPY240119C00475500');
		});

		it('should pad short symbols', () => {
			const result = buildOccSymbol('F', '2024-01-19', 'call', 12);
			expect(result).toBe('F240119C00012000');
		});
	});

	describe('cleanObject', () => {
		it('should remove undefined values', () => {
			const obj = { a: 1, b: undefined, c: 'test' };
			const result = cleanObject(obj);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove null values', () => {
			const obj = { a: 1, b: null, c: 'test' };
			const result = cleanObject(obj);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should remove empty strings', () => {
			const obj = { a: 1, b: '', c: 'test' };
			const result = cleanObject(obj);
			expect(result).toEqual({ a: 1, c: 'test' });
		});

		it('should handle empty object', () => {
			const result = cleanObject({});
			expect(result).toEqual({});
		});
	});

	describe('formatCurrency', () => {
		it('should format positive numbers', () => {
			const result = formatCurrency(1234.56);
			expect(result).toBe('$1,234.56');
		});

		it('should format negative numbers', () => {
			const result = formatCurrency(-1234.56);
			expect(result).toBe('-$1,234.56');
		});

		it('should format zero', () => {
			const result = formatCurrency(0);
			expect(result).toBe('$0.00');
		});
	});

	describe('formatPercentage', () => {
		it('should format positive percentages', () => {
			const result = formatPercentage(0.1234);
			expect(result).toBe('12.34%');
		});

		it('should format negative percentages', () => {
			const result = formatPercentage(-0.0567);
			expect(result).toBe('-5.67%');
		});
	});

	describe('isValidSymbol', () => {
		it('should return true for valid stock symbols', () => {
			expect(isValidSymbol('AAPL')).toBe(true);
			expect(isValidSymbol('MSFT')).toBe(true);
			expect(isValidSymbol('F')).toBe(true);
		});

		it('should return false for invalid symbols', () => {
			expect(isValidSymbol('')).toBe(false);
			expect(isValidSymbol('TOOLONGSYMBOL')).toBe(false);
			expect(isValidSymbol('123')).toBe(false);
		});
	});
});

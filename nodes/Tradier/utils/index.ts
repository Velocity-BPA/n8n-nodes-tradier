/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Simplify the API response by extracting nested data
 */
export function simplifyResponse(response: any, dataKey?: string): any {
	if (!response) {
		return [];
	}

	if (dataKey) {
		const parts = dataKey.split('.');
		let data = response;
		for (const part of parts) {
			if (data && typeof data === 'object' && part in data) {
				data = data[part];
			} else {
				return [];
			}
		}

		if (data === null || data === 'null') {
			return [];
		}

		if (Array.isArray(data)) {
			return data;
		}

		return data ? [data] : [];
	}

	return response;
}

/**
 * Prepare output data for n8n execution
 */
export function prepareOutput(
	items: any[],
	simplify: boolean = true,
	dataKey?: string,
): INodeExecutionData[] {
	if (!Array.isArray(items)) {
		items = items ? [items] : [];
	}

	return items.map((item) => ({
		json: item as IDataObject,
	}));
}

/**
 * Parse an OCC option symbol into its components
 * Format: SYMBOL + YYMMDD + C/P + Strike (8 digits with implied decimal)
 * Example: AAPL240119C00150000 = AAPL Jan 19 2024 $150 Call
 */
export function parseOccSymbol(occSymbol: string): IDataObject | null {
	const regex = /^([A-Z]{1,6})(\d{6})([CP])(\d{8})$/;
	const match = occSymbol.toUpperCase().match(regex);

	if (!match) {
		return null;
	}

	const [, underlying, dateStr, optionType, strikeStr] = match;

	const year = 2000 + parseInt(dateStr.substring(0, 2), 10);
	const month = parseInt(dateStr.substring(2, 4), 10);
	const day = parseInt(dateStr.substring(4, 6), 10);

	const strikePrice = parseInt(strikeStr, 10) / 1000;

	return {
		underlying,
		expiration: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
		expirationYear: year,
		expirationMonth: month,
		expirationDay: day,
		optionType: optionType === 'C' ? 'call' : 'put',
		strikePrice,
		occSymbol: occSymbol.toUpperCase(),
	};
}

/**
 * Build an OCC option symbol from components
 */
export function buildOccSymbol(
	underlying: string,
	expiration: string,
	optionType: 'call' | 'put',
	strikePrice: number,
): string {
	const dateParts = expiration.split('-');
	const year = dateParts[0].substring(2);
	const month = dateParts[1].padStart(2, '0');
	const day = dateParts[2].padStart(2, '0');

	const typeChar = optionType === 'call' ? 'C' : 'P';
	const strikeStr = Math.round(strikePrice * 1000)
		.toString()
		.padStart(8, '0');

	return `${underlying.toUpperCase()}${year}${month}${day}${typeChar}${strikeStr}`;
}

/**
 * Clean an object by removing undefined and null values
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const result: IDataObject = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
	}).format(value);
}

/**
 * Format percentage value
 */
export function formatPercentage(value: number, decimals: number = 2): string {
	return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Check if market is currently open (basic check)
 */
export function isMarketHours(): boolean {
	const now = new Date();
	const day = now.getUTCDay();
	const hours = now.getUTCHours();
	const minutes = now.getUTCMinutes();
	const time = hours * 60 + minutes;

	// Market hours: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
	// Weekdays only
	if (day === 0 || day === 6) {
		return false;
	}

	const marketOpen = 14 * 60 + 30; // 14:30 UTC
	const marketClose = 21 * 60; // 21:00 UTC

	return time >= marketOpen && time < marketClose;
}

/**
 * Validate a stock symbol
 */
export function isValidSymbol(symbol: string): boolean {
	return /^[A-Z]{1,5}$/.test(symbol.toUpperCase());
}

/**
 * Convert date string to YYYY-MM-DD format
 */
export function formatDate(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toISOString().split('T')[0];
}

/**
 * Get the current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
	return formatDate(new Date());
}

/**
 * Extract numeric value from string (handles currency formatting)
 */
export function extractNumber(value: string | number): number {
	if (typeof value === 'number') {
		return value;
	}
	return parseFloat(value.replace(/[^0-9.-]/g, ''));
}

/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeProperties, IDataObject } from 'n8n-workflow';
import { parseOccSymbol, buildOccSymbol } from '../../utils';
import { OPTION_TYPES } from '../../constants';

export const utilityOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['utility'],
			},
		},
		options: [
			{
				name: 'Build OCC Symbol',
				value: 'buildOccSymbol',
				description: 'Build an OCC option symbol from components',
				action: 'Build occ symbol',
			},
			{
				name: 'Parse OCC Symbol',
				value: 'parseOccSymbol',
				description: 'Parse an OCC option symbol into components',
				action: 'Parse occ symbol',
			},
		],
		default: 'parseOccSymbol',
	},
];

export const utilityFields: INodeProperties[] = [
	// Parse OCC Symbol
	{
		displayName: 'OCC Symbol',
		name: 'occSymbol',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'AAPL240119C00150000',
		description: 'The OCC option symbol to parse',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['parseOccSymbol'],
			},
		},
	},
	// Build OCC Symbol
	{
		displayName: 'Underlying Symbol',
		name: 'underlying',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'AAPL',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['buildOccSymbol'],
			},
		},
	},
	{
		displayName: 'Expiration Date',
		name: 'expiration',
		type: 'string',
		required: true,
		default: '',
		placeholder: '2024-01-19',
		description: 'Expiration date in YYYY-MM-DD format',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['buildOccSymbol'],
			},
		},
	},
	{
		displayName: 'Option Type',
		name: 'optionType',
		type: 'options',
		options: OPTION_TYPES,
		required: true,
		default: 'call',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['buildOccSymbol'],
			},
		},
	},
	{
		displayName: 'Strike Price',
		name: 'strikePrice',
		type: 'number',
		required: true,
		default: 0,
		placeholder: '150',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['buildOccSymbol'],
			},
		},
	},
];

export async function executeUtilityOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject[]> {
	switch (operation) {
		case 'parseOccSymbol': {
			const occSymbol = this.getNodeParameter('occSymbol', i) as string;
			const parsed = parseOccSymbol(occSymbol);

			if (!parsed) {
				throw new Error(`Invalid OCC symbol format: ${occSymbol}`);
			}

			return [parsed];
		}

		case 'buildOccSymbol': {
			const underlying = this.getNodeParameter('underlying', i) as string;
			const expiration = this.getNodeParameter('expiration', i) as string;
			const optionType = this.getNodeParameter('optionType', i) as 'call' | 'put';
			const strikePrice = this.getNodeParameter('strikePrice', i) as number;

			const occSymbol = buildOccSymbol(underlying, expiration, optionType, strikePrice);

			return [
				{
					occSymbol,
					underlying: underlying.toUpperCase(),
					expiration,
					optionType,
					strikePrice,
				},
			];
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}
}

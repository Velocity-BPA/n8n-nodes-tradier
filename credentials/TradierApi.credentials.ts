/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TradierApi implements ICredentialType {
	name = 'tradierApi';
	displayName = 'Tradier API';
	documentationUrl = 'https://documentation.tradier.com/';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The API access token from your Tradier account',
		},
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Production', value: 'production' },
				{ name: 'Sandbox', value: 'sandbox' },
			],
			default: 'sandbox',
			description: 'Whether to use the production or sandbox environment',
		},
		{
			displayName: 'Default Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			description: 'Default account ID to use for operations (optional)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.accessToken}}',
				Accept: 'application/json',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL:
				'={{$credentials.environment === "production" ? "https://api.tradier.com" : "https://sandbox.tradier.com"}}',
			url: '/v1/user/profile',
		},
	};
}

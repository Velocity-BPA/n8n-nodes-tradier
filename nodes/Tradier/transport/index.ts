/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	IPollFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

export interface TradierCredentials {
	accessToken: string;
	environment: 'production' | 'sandbox';
	accountId?: string;
}

export interface TradierClient {
	request: (
		method: IHttpRequestMethods,
		endpoint: string,
		body?: IDataObject,
		qs?: IDataObject,
	) => Promise<any>;
	requestAllItems: (
		method: IHttpRequestMethods,
		endpoint: string,
		body?: IDataObject,
		qs?: IDataObject,
		dataKey?: string,
	) => Promise<any[]>;
	getCredentials: () => TradierCredentials;
}

const BASE_URLS = {
	production: 'https://api.tradier.com',
	sandbox: 'https://sandbox.tradier.com',
};

export function createTradierClient(
	context: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	credentials: TradierCredentials,
): TradierClient {
	const baseUrl = BASE_URLS[credentials.environment];

	async function request(
		method: IHttpRequestMethods,
		endpoint: string,
		body?: IDataObject,
		qs?: IDataObject,
	): Promise<any> {
		const options: IHttpRequestOptions = {
			method,
			url: `${baseUrl}${endpoint}`,
			headers: {
				Authorization: `Bearer ${credentials.accessToken}`,
				Accept: 'application/json',
			},
			qs,
			json: true,
		};

		if (body && Object.keys(body).length > 0) {
			if (method === 'POST' || method === 'PUT') {
				options.headers!['Content-Type'] = 'application/x-www-form-urlencoded';
				options.body = body;
			}
		}

		try {
			const response = await context.helpers.httpRequest(options);
			return response;
		} catch (error: any) {
			if (error.response) {
				const message =
					error.response.body?.fault?.faultstring ||
					error.response.body?.error ||
					error.message;
				throw new NodeApiError(context.getNode(), error, { message });
			}
			throw error;
		}
	}

	async function requestAllItems(
		method: IHttpRequestMethods,
		endpoint: string,
		body?: IDataObject,
		qs?: IDataObject,
		dataKey?: string,
	): Promise<any[]> {
		const response = await request(method, endpoint, body, qs);

		if (dataKey) {
			const data = response[dataKey];
			if (Array.isArray(data)) {
				return data;
			}
			if (data === null || data === 'null') {
				return [];
			}
			return data ? [data] : [];
		}

		if (Array.isArray(response)) {
			return response;
		}

		return response ? [response] : [];
	}

	function getCredentials(): TradierCredentials {
		return credentials;
	}

	return {
		request,
		requestAllItems,
		getCredentials,
	};
}

export async function tradierApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
	const client = createTradierClient(this, credentials);
	return client.request(method, endpoint, body, qs);
}

export async function tradierApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	dataKey?: string,
): Promise<any[]> {
	const credentials = (await this.getCredentials('tradierApi')) as unknown as TradierCredentials;
	const client = createTradierClient(this, credentials);
	return client.requestAllItems(method, endpoint, body, qs, dataKey);
}

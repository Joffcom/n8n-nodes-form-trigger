import {
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeOperationError,
} from 'n8n-workflow';

export class FormTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Form Trigger',
		name: 'formTrigger',
		icon: 'file:webhook.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when Form events occur',
		defaults: {
			name: 'Form Trigger',
		},
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'displayForm',
				httpMethod: 'GET',
				responseMode: 'onReceived',
				path: 'webhook',
			},
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Page Title',
				type: 'string',
				default: 'Test Form',
				name: 'pageTitle',
			},
			{
				displayName: 'Page Description',
				type: 'string',
				default: 'Fill out the form below and we will get back to you.',
				name: 'pageDescription',
			},
			{
				displayName: 'Fields',
				name: 'fields',
				placeholder: 'Add Fields',
				description: 'Form Fields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'item',
						displayName: 'Item',
						values: [
							{
								displayName: 'Label',
								name: 'label',
								type: 'string',
								default: '',
								description: 'Label for the input item',
							},
							{
								displayName: 'Name or ID',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name to use for the input item',
							},
							{
								displayName: 'Input Type',
								name: 'inputType',
								type: 'options',
								default: 'text',
								description: 'Input type for the field',
								options: [
									{
										name: 'Date',
										value: 'date',
									},
									{
										name: 'Email',
										value: 'email',
									},
									{
										name: 'Hidden',
										value: 'hidden',
									},
									{
										name: 'Password',
										value: 'password',
									},
									{
										name: 'Text',
										value: 'text',
									},
								],
							},
							{
								displayName: 'Required',
								name: 'required',
								type: 'boolean',
								default: false,
								description: 'Whether the field is required or not',
							},
						],
					},
				],
			},
			// Optional Settings
			{
				displayName: 'Options',
				type: 'collection',
				name: 'options',
				default: {},
				options: [
					{
						displayName: 'Submit Button Label',
						name: 'submitLabel',
						default: 'Submit',
						type: 'string',
					},
					{
						displayName: 'CSS File',
						name: 'cssFile',
						default: 'https://joffcom.github.io/style.css',
						type: 'string',
					},
				],
			},
		],
	};

	// @ts-ignore (because of request)
	/*webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const credentials = await this.getCredentials('trelloApi');

				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}

				// Check all the webhooks which exist already if it is identical to the
				// one that is supposed to get created.
				const endpoint = `tokens/${credentials.apiToken}/webhooks`;

				const responseData = await apiRequest.call(this, 'GET', endpoint, {});

				const idModel = this.getNodeParameter('id') as string;
				const webhookUrl = this.getNodeWebhookUrl('default');

				for (const webhook of responseData) {
					if (webhook.idModel === idModel && webhook.callbackURL === webhookUrl) {
						// Set webhook-id to be sure that it can be deleted
						const webhookData = this.getWorkflowStaticData('node');
						webhookData.webhookId = webhook.id as string;
						return true;
					}
				}

				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');

				const credentials = await this.getCredentials('trelloApi');
				if (credentials === undefined) {
					throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
				}

				const idModel = this.getNodeParameter('id') as string;

				const endpoint = `tokens/${credentials.apiToken}/webhooks`;

				const body = {
					description: `n8n Webhook - ${idModel}`,
					callbackURL: webhookUrl,
					idModel,
				};

				const responseData = await apiRequest.call(this, 'POST', endpoint, body);

				if (responseData.id === undefined) {
					// Required data is missing so was not successful
					return false;
				}

				const webhookData = this.getWorkflowStaticData('node');
				webhookData.webhookId = responseData.id as string;

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId !== undefined) {
					const credentials = await this.getCredentials('trelloApi');
					if (credentials === undefined) {
						throw new NodeOperationError(this.getNode(), 'No credentials got returned!');
					}

					const endpoint = `tokens/${credentials.apiToken}/webhooks/${webhookData.webhookId}`;

					const body = {};

					try {
						await apiRequest.call(this, 'DELETE', endpoint, body);
					} catch (error) {
						return false;
					}

					// Remove from the static workflow data so that it is clear
					// that no webhooks are registred anymore
					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};*/



	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookName = this.getWebhookName();

		if (webhookName === 'displayForm') {
			const options = this.getNodeParameter('options', 0) as IDataObject;
			const submitLabel = options.submitLabel ? options.submitLabel : 'Submit';
			const cssFile = options.cssFile ? options.cssFile : 'https://joffcom.github.io/style.css';
			const pageTitle = this.getNodeParameter('pageTitle', 0) as string;
			const pageDescription = this.getNodeParameter('pageDescription', 0) as string;

			// HTML Fields
			const formFields = this.getNodeParameter(
				'fields.item',
				0,
			) as unknown as IDataObject[];

			let htmlFields : string = '';

			for (const field of formFields) {
				htmlFields += `<div class="form-group">
					<label for="${field.name}">${field.label}</label>
					<input type="${field.inputType}" class="form-control" id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}/>
				</div>`
				//htmlFields += `<input id="${field.name}" type="${field.inputType}" name="${field.name}" ${field.required ? 'required' : ''}/>`
			}


			const res = this.getResponseObject();
			const testForm = `<html>
			<head>
				<title>${pageTitle}</title>
				<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
				<link rel="stylesheet" href="${cssFile}" crossorigin="anonymous">
				</head>
				<body>
				<div class="container">
				<div class="page">
				<div class="form"><h1>${pageTitle}</h1><p>${pageDescription}</p>
<form action='#' method='post'>
<div class="item">
${htmlFields}
</div>
<div class="btn-block">
<button type="submit">${submitLabel}</button>
</div>
</form>             </div></div>   </div>  </body></html>`;
			res.status(200).send(testForm).end();
			return {
				noWebhookResponse: true,
			};
		}

		const bodyData = this.getBodyData();

		return {
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}

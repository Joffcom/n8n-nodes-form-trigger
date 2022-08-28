import {
	IWebhookFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';

export class FormTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Form Trigger',
		name: 'formTrigger',
		icon: 'file:webhook.svg',
		group: ['trigger'],
		version: 1,
		description: 'Starts a workflow when Form events occur',
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
				path: '={{$parameter.path}}',
				isFullPath: true,
			},
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: '={{$parameter.path}}',
				isFullPath: true,
			},
		],
		properties: [
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: 'forms/my-form',
				placeholder: 'webhook',
				required: true,
			},
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
				displayName: 'Form Type',
				name: 'formType',
				type: 'options',
				options: [
					{
						name: 'Custom Form HTML',
						value: 'customHTML',
						description: 'Use your own HTML for the form body'
					},
					{
						name: 'Form Builder',
						value: 'formBuilder',
						description: 'Use a simple form builder',
					},
				],
				default: 'formBuilder',
			},
			{
				displayName: 'Form HTML',
				name: 'formHTML',
				description: 'HTML to use for your form body',
				type: 'string',
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
				displayOptions: {
					show: {
						formType: [
							'customHTML',
						],
					},
				},
			},
			{
				displayName: 'Fields',
				name: 'fields',
				placeholder: 'Add Fields',
				description: 'Form Fields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				displayOptions: {
					show: {
						formType: [
							'formBuilder',
						],
					},
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
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Default value to use',
								displayOptions : {
									show: {
										inputType: [
											'hidden',
										],
									},
								},
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
						displayName: 'Bootstrap URL',
						name: 'bootstrap',
						default: 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css',
						type: 'string',
						description: 'URL for Bootstrap CSS',
					},
					{
						displayName: 'CSS File',
						name: 'cssFile',
						default: 'https://joffcom.github.io/style.css',
						type: 'string',
						description: 'URL for custom CSS, For an example see "https://joffcom.github.io/style.css"',
					},
					{
						displayName: 'Form ID',
						name: 'formId',
						default: 'n8n-form',
						type: 'string',
						description: 'Form ID to use',
					},
					{
						displayName: 'Form Name',
						name: 'formName',
						default: 'n8n-form',
						type: 'string',
						description: 'Form Name to use',
					},
					{
						displayName: 'Javascript',
						name: 'javascript',
						default: `$(document).on('submit','#n8n-form',function(e){
	$.post('#', $('#n8n-form').serialize(), function(result) {
		var resp = jQuery.parseJSON(result);
		if (resp.status === 'ok') {
			$("#status").attr('class', 'alert alert-success');
			$("#status").show();
			$('#status-text').text('Form has been submitted.');
		} else {
			$("#status").attr('class', 'alert alert-danger');
			$("#status").show();
			$('#status-text').text('Something went wrong.');
		}
	});
return false;
});`,
						type: 'string',
						typeOptions: {
							alwaysOpenEditWindow: true,
						},
						description: 'Javascript to use for form submission',
					},
					{
						displayName: 'jQuery',
						name: 'jQuery',
						default: 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js',
						type: 'string',
						description: 'URL for jQuery javascript',
					},
					{
						displayName: 'Submit Button Label',
						name: 'submitLabel',
						default: 'Submit',
						type: 'string',
						description: 'Text to use for the submit button',
					},
				],
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const webhookName = this.getWebhookName();

		if (webhookName === 'displayForm') {
			const options = this.getNodeParameter('options', 0) as IDataObject;
			const submitLabel = options.submitLabel ? options.submitLabel : 'Submit';
			const cssFile = options.cssFile ? options.cssFile : 'https://joffcom.github.io/style.css';
			const pageTitle = this.getNodeParameter('pageTitle', 0) as string;
			const pageDescription = this.getNodeParameter('pageDescription', 0) as string;
			const formType = this.getNodeParameter('formType', 0) as string;

			let htmlFields = '';

			if (formType === 'customHTML') {
				htmlFields = this.getNodeParameter('formHTML', 0) as string;
			} else {
				// HTML Fields
				const formFields = this.getNodeParameter(
					'fields.item',
					0,
				) as unknown as IDataObject[];

				for (const field of formFields) {
					htmlFields += '<div class="form-group">'
					// No label for hidden fields
					if (field.inputType !== 'hidden') {
						htmlFields += `<label for="${field.name}">${field.label}</label>`
						htmlFields += `<input type="${field.inputType}" class="form-control" id="${field.name}" name="${field.name}" value"${field.value}"/>`
					} else {
						htmlFields += `<input type="${field.inputType}" class="form-control" id="${field.name}" name="${field.name}" ${field.required ? 'required' : ''}/>`
					}
					htmlFields += '</div>';
				}
			}

			let defaultJS = `$(document).on('submit','#n8n-form',function(e){
	$.post('#', $('#n8n-form').serialize(), function(result) {
		var resp = jQuery.parseJSON(result);
		if (resp.status === 'ok') {
			$("#status").attr('class', 'alert alert-success');
			$("#status").show();
			$('#status-text').text('Form has been submitted.');
		} else {
		$("#status").attr('class', 'alert alert-danger');
		$("#status").show();
		$('#status-text').text('Something went wrong.');
		}
	});
	return false;
});`;

			let javascript = options.javascript ? options.javascript : defaultJS;
			let formName = options.formName ? options.formName : 'n8n-form';
			let formId = options.formId ? options.formId : 'n8n-form';
			let jQuery = options.jQuery ? options.jQuery : 'https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js';
			let bootstrapCss = options.bootstrap ? options.bootstrap : 'https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css';


			const res = this.getResponseObject();
			const testForm = `<html>
			<head>
				<title>${pageTitle}</title>
				<link rel="stylesheet" href="${bootstrapCss}" crossorigin="anonymous">
				<link rel="stylesheet" href="${cssFile}" crossorigin="anonymous">

				<script src="${jQuery}" type="text/javascript"></script>
				<script type="text/javascript">
					${javascript}
				</script>
				</head>
				<body>
					<div class="container">
						<div class="page">
						<div id="status" style="display: none" class="alert alert-danger">
            <p id="status-text" class="status-text"></p>
          </div>
							<div class="form">
								<h1>${pageTitle}</h1>
								<p>${pageDescription}</p>
								<form action='#' method='POST' name='${formName}' id='${formId}'>
									<div class="item">
										${htmlFields}
									</div>
									<div class="btn-block">
										<button type="submit">${submitLabel}</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</body>
			</html>`;
			res.status(200).send(testForm).end();
			return {
				noWebhookResponse: true,
			};
		}

		const bodyData = this.getBodyData();

		return {
			webhookResponse: '{"status": "ok"}',
			workflowData: [
				this.helpers.returnJsonArray(bodyData),
			],
		};
	}
}

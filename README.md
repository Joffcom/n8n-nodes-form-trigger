# n8n-nodes-form-trigger

This is an n8n community node. It lets you create a form to start your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Compatibility](#compatibility)  
[Usage](#usage)  <!-- delete if not using this section -->  
[Resources](#resources)  
[Version history](#version-history)  <!-- delete if not using this section -->  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Compatibility

Tested against 0.191.1 and 0.192.2

## Usage

Add the Form Trigger node to your workflow and either use the form builder or add your own custom html for your form. Once running use the Webhook GET URL.

When using custom HTML for your form make sure you include the name field for your form items unless you also change the javascript for the submission.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
* [Sample CSS File](https://joffcom.github.io/style.css)

### Form HTML
When coming up with your CSS the below HTML is the default structure used, In a future release using HTML from a file may be supported.
``` html
<html>
	<head>
		<title>{REPLACED WITH PAGE TITLE}</title>
		<link rel="stylesheet" href="{REPLACED WITH BOOTSTRAP LINK}" crossorigin="anonymous">
		<link rel="stylesheet" href="{REPLACED WITH CSS LINK}" crossorigin="anonymous">

		<script src="{REPLACED WITH JQUERY LINK}" type="text/javascript"></script>
		<script type="text/javascript">
			${REPLACED WITH SUBMISSION JS}
		</script>
	</head>
	<body>
		<div class="container">
			<div class="page">
				<div id="status" style="display: none" class="alert alert-danger">
					<p id="status-text" class="status-text">{REPLACED WITH MESSAGE FROM JS}</p>
				</div>
				<div class="form">
					<h1>{REPLACED WITH PAGE TITLE}</h1>
					<p>{REPLACED WITH FORM DESCRIPTION}</p>
					<form action='#' method='POST' name='{REPLACED WITH FORM NAME}' id='{REPLCED WITH FORM ID}'>
						<div class="item">
							{REPLACED WITH CUSTOM HTML OR BUILDER}
						</div>
						<div class="btn-block">
							<button type="submit">{REPLACED WITH SUBMIT LABEL}</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	</body>
</html>
```

## Version history

0.1.0 - Initial Release



// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const formatEmailTemplateWrapper = (
	content: string,
	subject: string,
	signature: string
) => {
	return `<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<title>${subject}</title>
		</head>
		<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">
			<div style="max-width: 600px; margin: 0 auto;">
			${content}
			${
				signature
					? `
				<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
				${signature}
				</div>
			`
					: ''
			}
			</div>
		</body>
		</html>`;
};

// Fonction pour formater le template avec les variables
const formatPreReminderTemplate = (
	template: string,
	variables: {
		amount: number;
		invoice_number: string;
		days_left: number;
	}
): string => {
	return (
		template
			// .replace(/{company}/g, variables.company)
			.replace(
				/{amount}/g,
				new Intl.NumberFormat('fr-FR', {
					style: 'currency',
					currency: 'EUR',
				}).format(variables.amount)
			)
			.replace(/{invoice_number}/g, variables.invoice_number)
			// .replace(
			// 	/{due_date}/g,
			// 	new Date(variables.due_date).toLocaleDateString('fr-FR')
			// )
			.replace(/{days_left}/g, variables.days_left.toString())
	);
};

const formatTemplate = (
	template: string,
	variables: {
		company: string;
		amount: number;
		invoice_number: string;
		due_date: string;
		days_late: number;
	}
): string => {
	return template
		.replace(/{company}/g, variables.company)
		.replace(
			/{amount}/g,
			new Intl.NumberFormat('fr-FR', {
				style: 'currency',
				currency: 'EUR',
			}).format(variables.amount)
		)
		.replace(/{invoice_number}/g, variables.invoice_number)
		.replace(
			/{due_date}/g,
			new Date(variables.due_date).toLocaleDateString('fr-FR')
		)
		.replace(/{days_late}/g, variables.days_late.toString());
};

// Update reminder table
const updateReminderTable = async (
	supabaseClient: any,
	receivableId: string,
	action: 'pre' | 'first' | 'second' | 'third' | 'final',
	emailContent: string
) => {
	// update the receivable status with the reminder type
	const { data, error } = await supabaseClient.from('reminders').insert({
		receivable_id: receivableId,
		reminder_type: action,
		reminder_date: new Date().toISOString(),
		email_sent: true,
		email_content: emailContent,
	});

	if (error) {
		throw new Error(error.message);
	}

	const { data: recevierData, error: receiverError } = await supabaseClient
		.from('receivables')
		.update({
			reminder_status: action.toLowerCase(),
			status:
				action === 'pre'
					? 'Relance préventive'
					: action === 'first'
					? 'Relance 1'
					: action === 'second'
					? 'Relance 2'
					: action === 'third'
					? 'Relance 3'
					: 'Relance finale',
		})
		.eq('id', receivableId);

	if (receiverError) {
		throw new Error(receiverError.message);
	}
};

const sendDueEmails = async (
	supabaseClient: any,
	clientMap: Map<string, any>,
	transporter: any,
	receivables: any
) => {
	const dueReceivables = receivables.filter((receivable: any) => {
		// Check if the date diff is alread present in the map
		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = dueDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return (
			diffDays <= clientMap.get(receivable.client_id)?.pre_reminder_days &&
			receivable.reminder_status === 'none'
		);
	});

	// Get the correct email template, and the subject from the db
	for (const receivable of dueReceivables) {
		if (receivable.email === undefined) return;

		const content = formatPreReminderTemplate(
			clientMap.get(receivable.client_id).pre_reminder_template,
			{
				amount: receivable.amount,
				invoice_number: receivable.invoice_number,
				days_left: clientMap.get(receivable.client_id).pre_reminder_days,
			}
		);
		const emailContent = formatEmailTemplateWrapper(
			content,
			`Email de pré relance - ${receivable.invoice_number}`,
			''
		);

		// Récupère le nom d'expéditeur personnalisé pour ce client (sendDueEmails)
		const { data: emailSettings, error: emailSettingsError } = await supabaseClient
			.from('email_settings')
			.select('sender_display_name')
			.eq('user_id', clientMap.get(receivable.client_id)?.user_id)
			.maybeSingle();
		let senderName = emailSettings?.sender_display_name;
		if (!senderName) {
			senderName = clientMap.get(receivable.client_id)?.company_name || ((clientMap.get(receivable.client_id)?.first_name || '') + ' ' + (clientMap.get(receivable.client_id)?.last_name || '')) || 'Payment Flow';
		}
		await transporter.sendMail({
			from: `${senderName} <${process.env.EMAIL_USER ?? ''}>`, // sender address
			to: receivable.email, // list of receivers
			subject: `Email de pré relance - ${receivable.invoice_number}`, // Subject line
			text: content, // plain text body
			html: emailContent, // html body
			attachments: receivable.invoice_pdf_url
				? [
						{
							filename: 'logo.png',
							path: receivable.invoice_pdf_url,
						},
				  ]
				: undefined,
		});

		await updateReminderTable(
			supabaseClient,
			receivable.id,
			'pre',
			emailContent
		);
	}
	// Return details of records that emails were sent to
	return dueReceivables.map((receivable) => receivable.id) || [];
};

const sendFirstReminders = async (
	supabaseClient: any,
	clientMap: Map<string, any>,
	transporter: any,
	receivables: any
) => {
	// Return details of records that emails were sent to
	const dueReceivables = receivables.filter((receivable: any) => {
		// Check if the date diff is alread present in the map
		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return (
			diffDays >= clientMap.get(receivable.client_id)?.reminder_delay_1 &&
			//diffDays < clientMap.get(receivable.client_id)?.reminder_delay_2 &&
			(receivable.reminder_status === 'none' ||
				receivable.reminder_status === 'pre')
		);
	});

	for (const receivable of dueReceivables) {
		if (receivable.email === undefined) continue;
		if (clientMap.get(receivable.client_id).reminder_template_1 === null)
			continue;

		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		const content = formatTemplate(
			clientMap.get(receivable.client_id).reminder_template_1,
			{
				amount: receivable.amount,
				invoice_number: receivable.invoice_number,
				days_late: diffDays,
				due_date: receivable.due_date,
				company: clientMap.get(receivable.client_id).company_name,
			}
		);
		const emailContent = formatEmailTemplateWrapper(
			content,
			`Relance facture ${receivable.invoice_number}`,
			''
		);

		await transporter.sendMail({
			from: process.env.EMAIL_USER ?? '', // sender address
			to: receivable.email, // list of receivers
			subject: `Relance facture ${receivable.invoice_number}`, // Subject line
			text: content, // plain text body
			html: emailContent, // html body
			attachments: receivable.invoice_pdf_url
				? [
						{
							filename: 'logo.png',
							path: receivable.invoice_pdf_url,
						},
				  ]
				: undefined,
		});

		await updateReminderTable(
			supabaseClient,
			receivable.id,
			'first',
			emailContent
		);
	}

	return dueReceivables.map((item) => item.id) || [];
};

const secondReminders = async (
	supabaseClient: any,
	clientMap: Map<string, any>,
	transporter: any,
	receivables: any
) => {
	// Return details of records that emails were sent to
	// Return details of records that emails were sent to
	const dueReceivables = receivables.filter((receivable: any) => {
		// Check if the date diff is alread present in the map
		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return (
			diffDays >= clientMap.get(receivable.client_id)?.reminder_delay_2 &&
			//diffDays < clientMap.get(receivable.client_id)?.reminder_delay_3 &&
			(receivable.reminder_status === 'none' ||
				receivable.reminder_status === 'pre' ||
				receivable.reminder_status === 'first')
		);
	});

	for (const receivable of dueReceivables) {
		if (receivable.email === undefined) continue;
		if (clientMap.get(receivable.client_id).reminder_template_2 === null)
			continue;

		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		const content = formatTemplate(
			clientMap.get(receivable.client_id).reminder_template_2,
			{
				amount: receivable.amount,
				invoice_number: receivable.invoice_number,
				days_late: diffDays,
				due_date: receivable.due_date,
				company: clientMap.get(receivable.client_id).company_name,
			}
		);
		const emailContent = formatEmailTemplateWrapper(
			content,
			`Relance facture ${receivable.invoice_number}`,
			''
		);

		await transporter.sendMail({
			from: process.env.EMAIL_USER ?? '', // sender address
			to: receivable.email, // list of receivers
			subject: `Relance facture ${receivable.invoice_number}`, // Subject line
			text: content, // plain text body
			html: emailContent, // html body
			attachments: receivable.invoice_pdf_url
				? [
						{
							filename: 'logo.png',
							path: receivable.invoice_pdf_url,
						},
				  ]
				: undefined,
		});

		await updateReminderTable(
			supabaseClient,
			receivable.id,
			'second',
			emailContent
		);
	}
	return dueReceivables.map((item) => item.id) || [];
};

const thirdReminders = async (
	supabaseClient: any,
	clientMap: Map<string, any>,
	transporter: any,
	receivables: any
) => {
	// Return details of records that emails were sent to
	const dueReceivables = receivables.filter((receivable: any) => {
		// Check if the date diff is alread present in the map
		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return (
			diffDays >= clientMap.get(receivable.client_id)?.reminder_delay_3 &&
			//diffDays < clientMap.get(receivable.client_id)?.reminder_delay_final &&
			(receivable.reminder_status === 'none' ||
				receivable.reminder_status === 'pre' ||
				receivable.reminder_status === 'first' ||
				receivable.reminder_status === 'second')
		);
	});

	for (const receivable of dueReceivables) {
		if (receivable.email === undefined) continue;
		if (clientMap.get(receivable.client_id).reminder_template_3 === null)
			continue;

		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		const content = formatTemplate(
			clientMap.get(receivable.client_id).reminder_template_3,
			{
				amount: receivable.amount,
				invoice_number: receivable.invoice_number,
				days_late: diffDays,
				due_date: receivable.due_date,
				company: clientMap.get(receivable.client_id).company_name,
			}
		);
		const emailContent = formatEmailTemplateWrapper(
			content,
			`Relance facture ${receivable.invoice_number}`,
			''
		);

		await transporter.sendMail({
			from: process.env.EMAIL_USER ?? '', // sender address
			to: receivable.email, // list of receivers
			subject: `Relance facture ${receivable.invoice_number}`, // Subject line
			text: content, // plain text body
			html: emailContent, // html body
			attachments: receivable.invoice_pdf_url
				? [
						{
							filename: 'logo.png',
							path: receivable.invoice_pdf_url,
						},
				  ]
				: undefined,
		});

		await updateReminderTable(
			supabaseClient,
			receivable.id,
			'third',
			emailContent
		);
	}
	return dueReceivables.map((item) => item.id) || [];
};

const finalReminders = async (
	supabaseClient: any,
	clientMap: Map<string, any>,
	transporter: any,
	receivables: any
) => {
	// Return details of records that emails were sent to
	// Return details of records that emails were sent to
	const dueReceivables = receivables.filter((receivable: any) => {
		// Check if the date diff is alread present in the map
		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return (
			diffDays >= clientMap.get(receivable.client_id)?.reminder_delay_final &&
			(receivable.reminder_status === 'none' ||
				receivable.reminder_status === 'pre' ||
				receivable.reminder_status === 'first' ||
				receivable.reminder_status === 'second' ||
				receivable.reminder_status === 'third')
		);
	});

	for (const receivable of dueReceivables) {
		if (receivable.email === undefined) continue;
		if (clientMap.get(receivable.client_id).reminder_template_final === null)
			continue;

		const dueDate = new Date(receivable.due_date);
		const today = new Date();
		const diffTime = today.getTime() - dueDate.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		const content = formatTemplate(
			clientMap.get(receivable.client_id).reminder_template_final,
			{
				amount: receivable.amount,
				invoice_number: receivable.invoice_number,
				days_late: diffDays,
				due_date: receivable.due_date,
				company: clientMap.get(receivable.client_id).company_name,
			}
		);
		const emailContent = formatEmailTemplateWrapper(
			content,
			`Relance facture ${receivable.invoice_number}`,
			''
		);

		await transporter.sendMail({
			from: process.env.EMAIL_USER ?? '', // sender address
			to: receivable.email, // list of receivers
			subject: `Relance facture ${receivable.invoice_number}`, // Subject line
			text: content, // plain text body
			html: emailContent, // html body
			attachments: receivable.invoice_pdf_url
				? [
						{
							filename: 'logo.png',
							path: receivable.invoice_pdf_url,
						},
				  ]
				: undefined,
		});

		await updateReminderTable(
			supabaseClient,
			receivable.id,
			'final',
			emailContent
		);
	}
};

// Ajout d'un export pour la fonction principale si manquant
export const setupMailTransporter = () => {
	const host = process.env.EMAIL_HOST;
	const port = process.env.EMAIL_PORT;
	const user = process.env.EMAIL_USER;
	const pass = process.env.EMAIL_PASS;

	if (
		host === undefined ||
		port === undefined ||
		user === undefined ||
		pass === undefined
	) {
		throw new Error(
			'Email configuration is missing, Please contact the administrator'
		);
	}

	return nodemailer.createTransport({
		host: host,
		port: parseInt(port, 10),
		secure: true, // true for port 465, false for other ports
		auth: {
			user: user,
			pass: pass,
		},
	});
};

		const supabaseClient = createClient(
		process.env.SUPABASE_URL ?? '',
		process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
		);

		const transporter = setupMailTransporter();

		// Send reminders to users who are closer to due date
		// Send reminders to clients who are due a reminder according to their reminder profile and have enabled reminders
		// After every reminder update the reminder history table with information about the reminder sent

		const { data: clients, error: clientsError } = await supabaseClient
			.from('clients')
			.select('*');

		if (clientsError) {
			return new Response(JSON.stringify({ error: clientsError.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const clientMap = new Map<string, any>(
			clients.map((client: any) => [client.id, client])
		);

		const { data, error } = await supabaseClient
			.from('receivables')
			.select('*')
			.eq('automatic_reminder', true)
			.not('email', 'is', null);

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const notifiedIds1 = await sendDueEmails(
			supabaseClient,
			clientMap,
			transporter,
			data
		);
		// Filter all the records that an emai was not sent to and pass them to the next function
		const notifiedIds2 = await sendFirstReminders(
			supabaseClient,
			clientMap,
			transporter,
			data.filter((record) => !notifiedIds1?.includes(record.id))
		);
		// Filter all the records that an emai was not sent to and pass them to the next function
		const notifiedIds3 = await secondReminders(
			supabaseClient,
			clientMap,
			transporter,
			data.filter(
				(record) => ![...notifiedIds1, ...notifiedIds2]?.includes(record.id)
			)
		);
		// Filter all the records that an emai was not sent to and pass them to the next function
		const notifiedIds4 = await thirdReminders(
			supabaseClient,
			clientMap,
			transporter,
			data.filter(
				(record) =>
					![...notifiedIds1, ...notifiedIds2, ...notifiedIds3]?.includes(
						record.id
					)
			)
		);
		// Filter all the records that an emai was not sent to and pass them to the next function
		await finalReminders(
			supabaseClient,
			clientMap,
			transporter,
			data.filter(
				(record) =>
					![
						...notifiedIds1,
						...notifiedIds2,
						...notifiedIds3,
						...notifiedIds4,
					]?.includes(record.id)
			)
		);

		return new Response(
			JSON.stringify({
				message: 'job ran successfully',
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			}
		);
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}


/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/pre-reminder-email' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/

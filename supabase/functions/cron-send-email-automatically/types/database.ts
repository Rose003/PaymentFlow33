export interface Client {
	id: string;
	company_name: string;
	email: string;
	phone?: string;
	address?: string;
	postal_code?: string;
	city?: string;
	country?: string;
	industry?: string;
	website?: string;
	needs_reminder: boolean;
	reminder_delay_1?: { j: number; h: number; m: number };
	reminder_delay_2?: { j: number; h: number; m: number };
	reminder_delay_3?: { j: number; h: number; m: number };
	reminder_delay_final?: { j: number; h: number; m: number };
	reminder_template_1?: string;
	reminder_template_2?: string;
	reminder_template_3?: string;
	reminder_template_final?: string;
	created_at: string;
	updated_at: string;
	owner_id: string;
	client_code: string;
	notes?: string;
	reminder_profile?: string;
	pre_reminder_days?: number;
	pre_reminder_template?: string;
}

export interface Receivable {
	id: string;
	client_id: string;
	management_number?: string; // Numéro dans gestion
	invoice_number: string;
	code?: string; // Code
	amount: number;
	paid_amount?: number; // Montant réglé
	document_date?: string; // Date pièce
	due_date: string;
	status:
		| 'pending'
		| 'reminded'
		| 'paid'
		| 'late'
		| 'legal'
		| 'Relance 1'
		| 'Relance 2'
		| 'Relance 3'
		| 'Relance finale'
		| 'Relance préventive';
	invoice_pdf_url?: string;
	installment_number?: string; // Numéro échéance
	owner_id: string;
	created_at: string;
	updated_at: string;
	notes?: string;
	email?: string;
	automatic_reminder?: boolean;
}
export interface ReminderProfile {
	id?: string;
	name: string;
	delay1: { j: number; h: number; m: number }; // Délai sous forme d'objet avec jours, heures, minutes
	delay2: { j: number; h: number; m: number }; // Délai sous forme d'objet avec jours, heures, minutes
	delay3: { j: number; h: number; m: number }; // Délai sous forme d'objet avec jours, heures, minutes
	delay4: { j: number; h: number; m: number }; // Délai sous forme d'objet avec jours, heures, minutes
	owner_id: string;
	public: boolean;
	created_at?: string;
	updated_at?: string;
  }
  

export interface Reminder {
	id: string;
	receivable_id: string;
	reminder_date: string;
	reminder_type: 'first' | 'second' | 'third' | 'final' | 'legal';
	email_sent: boolean;
	email_content?: string;
	created_at: string;
}

export interface UnknownClient {
	id?: string;
	owner_id: string;
	name: string;
	invoice_no: string;
	client_code: string;
	created_at?: string;
	updated_at?: string;
	amount?: string;
	paid_amount?: string;
	due_date?: string;
	document_date?: string;
	status?: string;
	comment?: string;
	date?: string;
}

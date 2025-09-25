import fetch from 'node-fetch'; // Si vous utilisez un environnement Node.js
// ou l'import natif fetch dans un environnement moderne qui le supporte (par exemple Deno ou Edge Functions)

// Cette fonction suppose que vous avez une variable d'environnement `SUPABASE_ACCESS_TOKEN` définie sur votre serveur
interface EmailSettings {
	provider_type: string;
	smtp_username: string;
	smtp_password: string;
	smtp_server: string;
	smtp_port: number;
	smtp_encryption: string;
	email_signature?: string;
}

export const sendEmail = async (
  settings: EmailSettings,
  to: string,
  subject: string,
  htmlContent: string,
  invoice_pdf_url?: string
): Promise<boolean> => {
  try {
    // Récupérer le token d'authentification depuis les variables d'environnement (ou un autre mécanisme d'auth)
    const access_token = process.env.SUPABASE_SERVICE_ROLE_KEY; // Assurez-vous que cette variable est bien définie dans votre environnement serveur

    if (!access_token) {
      throw new Error("Token d'accès non disponible.");
    }

    const res = await fetch(
      'https://rsomeerndudkhyhpigmn.supabase.co/functions/v1/send-smtp-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          list: [
            {
              settings,
              to,
              subject,
              html: `
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <title>${subject}</title>
                  </head>
                  <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">
                    <div style="max-width: 600px; margin: 0 auto;">
                      ${htmlContent}
                      ${
                        settings.email_signature
                          ? `
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                          ${settings.email_signature}
                        </div>
                      `
                          : ''
                      }
                    </div>
                  </body>
                </html>
              `,
              invoice_pdf_url: invoice_pdf_url,
            },
          ],
        }),
      }
    );

    console.log("Sending email:", {
      list: [
        {
          settings,
          to,
          subject,
          html: "<html>...</html>",
          invoice_pdf_url,
        },
      ]
    });

    const data = await res.json();
    const error = data?.failures;
    if (error) {
      console.error('Erreur Supabase Edge Function:', error);
      throw error;
    }

    if (!data?.success) {
      throw new Error(data?.error || "Échec de l'envoi de l'email");
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

/* export const sendEmail = async (
	settings: EmailSettings,
	to: string,
	subject: string,
	htmlContent: string,
	invoice_pdf_url?: string
): Promise<boolean> => {
	try {
		const auth_data = localStorage.getItem('paymentflow-auth');
		if (auth_data) {
			const access_token = JSON.parse(auth_data).access_token;
			const res = await fetch(
				'https://rsomeerndudkhyhpigmn.supabase.co/functions/v1/send-smtp-email',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${access_token}`,
					},
					body: JSON.stringify({
						list: [
							{
								settings,
								to,
								subject,
								html: `
			      <!DOCTYPE html>
			      <html>
			        <head>
			          <meta charset="utf-8">
			          <title>${subject}</title>
			        </head>
			        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px;">
			          <div style="max-width: 600px; margin: 0 auto;">
			            ${htmlContent}
			            ${
										settings.email_signature
											? `
			              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
			                ${settings.email_signature}
			              </div>
			            `
											: ''
									}
			          </div>
			        </body>
			      </html>
			    `,
								invoice_pdf_url: invoice_pdf_url,
							},
						],
					}),
				}
			);
			console.log(JSON.stringify({
				list: [
				  {
					settings,
					to,
					subject,
					html: "<html>...</html>",
					invoice_pdf_url,
				  }
				]
			  }));
			  
			const data = await res.json();
			const error = data?.failures;
			if (error) {
				console.error('Erreur Supabase Edge Function:', error);
				throw error;
			}

			if (!data?.success) {
				throw new Error(data?.error || "Échec de l'envoi de l'email");
			}

			return true;
		}
		return false;
	} catch (error) {
		console.error("Erreur lors de l'envoi de l'email:", error);
		throw error;
	}
}; */

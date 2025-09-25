import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Upload, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';
import { Client,Notification } from '../../types/database';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importer les styles
import { saveNotification } from '../../lib/notification';

interface CSVImportModalProps {
	onClose: () => void;
	onImportSuccess: (importedCount: number) => void;
}

export interface CSVMapping {
	company_name: string;
	client_code: string;
	email: string;
	phone: string | null;
	address: string | null;
	postal_code: string | null;
	city: string | null;
	country: string | null;
	industry: string | null;
	website: string | null;
	needs_reminder: string | null;
	comment: string|null;
	created_at: string | null;
	updated_at: string | null;
	reminderProfile:string|null;
}

interface MappingField {
	field: keyof CSVMapping;
	label: string;
	required: boolean;
}

// Composant Info pour l'aide
export function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='24'
			height='24'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			{...props}
		>
			<circle cx='12' cy='12' r='10' />
			<path d='M12 16v-4' />
			<path d='M12 8h.01' />
		</svg>
	);
}

export default function CSVImportModal({
	onClose,
	onImportSuccess,
}: CSVImportModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [csvData, setCsvData] = useState<string[][]>([]);
	const [headers, setHeaders] = useState<string[]>([]);
	const [mapping, setMapping] = useState<Record<string, keyof CSVMapping>>({});
	const [step, setStep] = useState<
		'upload' | 'mapping' | 'preview' | 'importing'
	>('upload');
	const [preview, setPreview] = useState<Client[]>([]);
	const [importing, setImporting] = useState(false);
	const [importedCount, setImportedCount] = useState(0);
	const [showHelp, setShowHelp] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [savingSchema, setSavingSchema] = useState(false);
	const [success, setSuccess] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const showError = (message: string) => {
		setError(message);
		setTimeout(() => {
		  setError(null);
		}, 3000);
	  }
	  const showSuccess = (message: string) => {
		setSuccess(message);
		setTimeout(() => {
		  setSuccess(null);
		}, 3000);
	  }
	const mappingFields: MappingField[] = [
		{ field: 'company_name', label: "entreprise", required: true },
		{ field: 'client_code', label: 'Code Client', required: false },
		{ field: 'email', label: 'Email', required: true },
		{ field: 'phone', label: 'Téléphone', required: false },
		{ field: 'address', label: 'Adresse', required: false },
		{ field: 'city', label: 'Ville', required: false },
		{ field: 'postal_code', label: 'Code postal', required: false },
		{ field: 'country', label: 'Pays', required: false },
		{ field: 'industry', label: "Secteur d'activité", required: false },
		{ field: 'website', label: 'Site web', required: false },
		{
			field: 'needs_reminder',
			label: 'Nécessite une relance',
			required: false,
		},
		{ field: 'created_at', label: 'Créé le', required: false },
		{ field: 'updated_at', label: 'Mis à jour', required: false },
	];
	

	// Désactiver le défilement du body quand la modale est ouverte
	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, []);


	const parseCSV = (text: string): string[][] => {
		// Gestion basique du CSV (pourrait être améliorée pour gérer les virgules dans les champs entre guillemets)
		const lines = text.split(/\r\n|\n/);
		return lines
			.map((line) => {
				// Gestion des séparateurs (virgule ou point-virgule)
				const separator = line.includes(';') ? ';' : ',';
				return line.split(separator).map((value) => value.trim());
			})
			.filter(
				(line) => line.length > 1 && line.some((cell) => cell.trim() !== '')
			);
	};
	const initializeMapping = async (csvHeaders: string[], userId: string) => {
		const autoMapping: Record<string, keyof CSVMapping> = {};
		const headerLower = csvHeaders.map((h) => h.toLowerCase());
	  
		const { data: savedMapping } = await supabase
		  .from('profiles')
		  .select('client_mapping')
		  .eq('id', userId);
	  
		if (
		  savedMapping !== null &&
		  savedMapping[0]?.client_mapping !== undefined &&
		  savedMapping[0]?.client_mapping !== null
		) {
		  const decodedMapping = JSON.parse(savedMapping[0].client_mapping);
	  
		  Object.entries(decodedMapping).forEach(([key, value]) => {
			autoMapping[key] = value as keyof CSVMapping;
		  });
		} else {
		  const mappings: { [key: string]: string[] } = {
			company_name: ['entreprise', 'société', 'company', 'nom', 'raison sociale', 'client'],
			email: ['email', 'e-mail', 'courriel', 'mail'],
			phone: ['téléphone', 'telephone', 'phone', 'tel', 'mobile'],
			address: ['adresse', 'address', 'rue'],
			city: ['ville', 'city', 'commune', 'localité'],
			postal_code: ['code postal', 'cp', 'postal', 'zip'],
			country: ['pays', 'country', 'nation'],
			industry: ['secteur', 'activité', 'industry', 'business'],
			website: ['site', 'web', 'website', 'url'],
			needs_reminder: ['relance', 'reminder', 'rappel', 'suivi'],
			created_at: ['créé le', 'crée le', 'cree le', 'created at', 'date de création', 'date creation'],
			updated_at: ['mis à jour', 'mise à jour', 'updated at', 'date de modification', 'modifié le'],
			client_code: ['client code']
		  };
	  
		  for (const [key, variants] of Object.entries(mappings)) {
			for (const variant of variants) {
			  const index = headerLower.findIndex((h) => h.includes(variant));
			  if (index !== -1) {
				autoMapping[csvHeaders[index]] = key as keyof CSVMapping;
				break;
			  }
			}
		  }
		}
	  
		return autoMapping;
	  };
	  
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (!selectedFile) return;

		setFile(selectedFile);
		setError(null);

		const reader = new FileReader();
		reader.onload = async (event) => {
			try {
				const text = event.target?.result as string;
				const parsedData = parseCSV(text);

				if (parsedData.length < 2) {
					showError(
						"Le fichier CSV doit contenir au moins une ligne d'en-tête et une ligne de données"
					);
					return;
				}

				const csvHeaders = parsedData[0];
				console.log("HEADERS",csvHeaders)
				setCsvData(parsedData.slice(1));
				setHeaders(csvHeaders);

				// Tentative de mapping automatique
				const autoMapping: Record<string, keyof CSVMapping> = {};
				// Check if saved config exists
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) throw new Error('Utilisateur non authentifié');
				const { data: savedMapping } = await supabase
					.from('profiles')
					.select('client_mapping')
					.eq('id', user.id);

				if (
					savedMapping !== null &&
					savedMapping[0].client_mapping !== undefined &&
					savedMapping[0].client_mapping !== null
				) {
					const decodedMapping = JSON.parse(savedMapping[0].client_mapping);

					Object.entries(decodedMapping).forEach(([key, value]) => {
						autoMapping[key] = value as keyof CSVMapping;
					});
				} else {
					const headerLower = csvHeaders.map((h) => h.toLowerCase());

					// Mapping pour le nom de l'entreprise
					const companyNameVariants = [
						'entreprise',
						"nom de l'entreprise",
						'société',
						'company',
						'nom',
						'raison sociale',
						'client',
					];
					for (const variant of companyNameVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'company_name';
							break;
						}
					}

					// Mapping pour l'email
					const emailVariants = ['email', 'e-mail', 'courriel', 'mail'];
					for (const variant of emailVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'email';
							break;
						}
					}

					// Mapping pour le téléphone
					const phoneVariants = [
						'téléphone',
						'telephone',
						'phone',
						'tel',
						'mobile',
					];
					for (const variant of phoneVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'phone';
							break;
						}
					}

					// Mapping pour l'adresse
					const addressVariants = ['adresse', 'address', 'rue'];
					for (const variant of addressVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'address';
							break;
						}
					}

					// Mapping pour la ville
					const cityVariants = ['ville', 'city', 'commune', 'localité'];
					for (const variant of cityVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'city';
							break;
						}
					}

					// Mapping pour le code postal
					const postalCodeVariants = ['code postal', 'cp', 'postal', 'zip'];
					for (const variant of postalCodeVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'postal_code';
							break;
						}
					}

					// Mapping pour le pays
					const countryVariants = ['pays', 'country', 'nation'];
					for (const variant of countryVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'country';
							break;
						}
					}

					// Mapping pour le secteur d'activité
					const industryVariants = [
						'secteur',
						'activité',
						'industry',
						'business'
					];
					for (const variant of industryVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'industry';
							break;
						}
					}

					// Mapping pour le site web
					const websiteVariants = ['site', 'web', 'website', 'url'];
					for (const variant of websiteVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'website';
							break;
						}
					}

					// Mapping pour la relance
					const reminderVariants = ['relance', 'reminder', 'rappel', 'suivi'];
					for (const variant of reminderVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'needs_reminder';
							break;
						}
					}

					// Mapping pour la date de création
					const createdAtVariants = [
						'créé le',
						'crée le',
						'cree le',
						'created at',
						'date de création',
						'date creation',
					];
					for (const variant of createdAtVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'created_at';
							break;
						}
					}

					// Mapping pour la date de mise à jour
					const updatedAtVariants = [
						'mis à jour',
						'mise à jour',
						'updated at',
						'date de modification',
						'modifié le',
					];
					for (const variant of updatedAtVariants) {
						const index = headerLower.findIndex((h) => h.includes(variant));
						if (index !== -1) {
							autoMapping[csvHeaders[index]] = 'updated_at';
							break;
						}
					}

					// Mapping for client code
					const index = headerLower.findIndex((h) => h.includes('client code'));
					if (index !== -1) {
						autoMapping[csvHeaders[index]] = 'client_code';
					}
				}

				setMapping(autoMapping);
				setStep('mapping');
			} catch (error) {
				console.error('Erreur lors de la lecture du fichier CSV:', error);
				showError('Le format du fichier CSV est invalide');
			}
		};

		reader.onerror = () => {
			showError('Erreur lors de la lecture du fichier');
		};

		reader.readAsText(selectedFile);
	};

	const handleMappingChange = (
		header: string,
		field: keyof CSVMapping | ''
	) => {
		if (field === '') {
			const newMapping = { ...mapping };
			delete newMapping[header];
			setMapping(newMapping);
		} else {
			setMapping({ ...mapping, [header]: field });
		}
	};

	const validateMapping = () => {
		// Vérifier que les champs requis sont mappés
		const requiredFields = mappingFields
			.filter((f) => f.required)
			.map((f) => f.field);
		const mappedFields = Object.values(mapping);

		const missingFields = requiredFields.filter(
			(field) => !mappedFields.includes(field)
		);

		if (missingFields.length > 0) {
			showError(
				`Les champs suivants sont requis : ${missingFields
					.map((f) => mappingFields.find((mf) => mf.field === f)?.label)
					.join(', ')}`
			);
			return false;
		}

		return true;
	};

	const formatDate = (dateStr: string): string | null => {
		if (!dateStr) return null;

		// Essayer différents formats de date
		let date: Date | null = null;

		// Format DD/MM/YYYY
		if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(dateStr)) {
			const parts = dateStr.split(/[\/\-\.]/);
			date = new Date(
				`${
					parts[2].length === 2 ? '20' + parts[2] : parts[2]
				}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
			);
		}
		// Format YYYY-MM-DD
		else if (/^\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}$/.test(dateStr)) {
			date = new Date(dateStr);
		}
		// Format MM/DD/YYYY (US)
		else if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4}$/.test(dateStr)) {
			const parts = dateStr.split(/[\/\-\.]/);
			// Essayer d'abord comme MM/DD/YYYY
			date = new Date(
				`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
			);
		}

		if (date && !isNaN(date.getTime())) {
			return date.toISOString();
		}

		return null;
	};


	const generatePreview = () => {
		if (!validateMapping()) return;
	  
		try {
		  // 🚨 Vérification des champs obligatoires
		  const missingRequiredFields = mappingFields.filter((field) => {
			if (field.required) {
			  // Est-ce qu'on a trouvé une colonne mappée à ce champ ?
			  const isMapped = Object.values(mapping).includes(field.field);
			  return !isMapped;
			}
			return false;
		  });
	  
		  if (missingRequiredFields.length > 0) {
			const missingFieldsLabels = missingRequiredFields.map((f) => f.label).join(', ');
			showError(`Les champs obligatoires suivants ne sont pas mappés : ${missingFieldsLabels}`);
			return;
		  }
	  
		  const previewData: Client[] = csvData.slice(0, 5).map((row, index) => {
			const client: any = {
			  id: `preview-${index}`,
			  company_name: '',
			  email: '',
			  needs_reminder: false,
			  created_at: new Date().toISOString(),
			  updated_at: new Date().toISOString(),
			  owner_id: '',
			};
	  
			// Remplir les données selon le mapping
			Object.entries(mapping).forEach(([header, field]) => {
			  const headerIndex = headers.indexOf(header);
			  if (headerIndex !== -1) {
				let value = row[headerIndex] || '';
	  
				// Traitement spécial pour needs_reminder
				if (field === 'needs_reminder') {
				  const lowerValue = value.toLowerCase();
				  client[field] =
					lowerValue === 'oui' ||
					lowerValue === 'yes' ||
					lowerValue === '1' ||
					lowerValue === 'true' ||
					lowerValue === 'relance en cours' ||
					lowerValue === 'OUI';
				}
				// Traitement spécial pour les dates
				else if (field === 'created_at' || field === 'updated_at') {
				  const formattedDate = formatDate(value);
				  if (formattedDate) {
					client[field] = formattedDate;
				  }
				} else {
				  client[field] = value;
				}
			  }
			});
	  
			return client as Client;
		  });
	  
		  setPreview(previewData);
		  setStep('preview');
		  setError(null);
		} catch (error) {
		  console.error("Erreur lors de la génération de l'aperçu:", error);
		  showError("Impossible de générer l'aperçu");
		}
	  };
	  
	const importClients = async () => {
		if (!validateMapping()) return;

		setImporting(true);
		setStep('importing');
		setError(null);
		setImportedCount(0);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error('Utilisateur non authentifié');

			const clientsToImport = csvData
				.map((row) => {
					const client: any = {
						company_name: '',
						email: '',
						owner_id: user.id,
						needs_reminder: false,
					};

					// Remplir les données selon le mapping
					Object.entries(mapping).forEach(([header, field]) => {
						const headerIndex = headers.indexOf(header);
						if (headerIndex !== -1) {
							let value = row[headerIndex] || '';

							// Traitement spécial pour needs_reminder
							if (field === 'needs_reminder') {
								const lowerValue = value.toLowerCase();
								client[field] =
									lowerValue === 'oui' ||
									lowerValue === 'yes' ||
									lowerValue === '1' ||
									lowerValue === 'true' ||
									lowerValue === 'relance en cours' ||
									lowerValue === 'OUI';
							}
							// Traitement spécial pour les dates
							else if (field === 'created_at' || field === 'updated_at') {
								const formattedDate = formatDate(value);
								if (formattedDate) {
									client[field] = formattedDate;
								}
							} else {
								client[field] = value || null;
							}
						}
					});

					return client;
				})
				.filter((client) => client.company_name && client.email);

			// Importer les clients directement sans filtrage supplémentaire
			let successCount = 0;

			// Get the default reminder profile
			const { data: reminderPorfile,error } = await supabase
				.from('reminder_profile')
				.select()
				.eq('name', 'Default')
				.eq('owner_id', user.id);
				if (error) {
					console.error("Erreur récupération de reminderpor_file:", error);
					throw error;
				}
			const reminderProfileExist =
				reminderPorfile !== null &&
				reminderPorfile[0] !== null &&
				reminderPorfile.length > 0;
			// Préparer les clients pour l'insertion
			const clientsToInsert = clientsToImport.map((client) => {
				return {
					...client,
					client_code:
						client.client_code ||
						Math.floor(Math.random() * (100000 - 150000) + 100000),
					owner_id: user.id,
					reminder_profile: reminderProfileExist ? reminderPorfile[0].id : null,
					reminder_delay_1: reminderProfileExist
						? reminderPorfile[0].delay1
						: 15,
					reminder_delay_2: reminderProfileExist
						? reminderPorfile[0].delay2
						: 30,
					reminder_delay_3: reminderProfileExist
						? reminderPorfile[0].delay3
						: 45,
					reminder_delay_final: reminderProfileExist
						? reminderPorfile[0].delay4
						: 60,
					created_at: client.created_at || new Date().toISOString(),
					updated_at: client.updated_at || new Date().toISOString(),
				};
			});

			if (clientsToInsert.length > 0) {
				console.log("CLIENT TO INSERT: ",clientsToInsert)
				const { data, error } = await supabase
					.from('clients')
					.upsert(clientsToInsert, {
						onConflict: 'owner_id, client_code',
					})
					.select();
console.log("DATA: ", data)
				if (error) {
					console.error("Erreur lors de l'import des clients:", error);
					throw error;
				} else {

					successCount = data?.length || 0;
				}

				setImportedCount(successCount);
			}

			if (successCount > 0) {
				onImportSuccess(successCount);
			} else {
				throw new Error("Aucun client n'a pu être importé");
			}
		} catch (error: any) {
			console.error("Erreur lors de l'import des clients:", error);
			showError(error.message || "Erreur lors de l'import des clients");
			setStep('preview'); // Return to preview step on error
		} finally {
			setImporting(false);
		}
	};

	
	
	const saveMapping = async () => {
	  const {
		data: { user },
	  } = await supabase.auth.getUser();
	  if (!user) throw new Error('Utilisateur non authentifié');
	
	  try {
		// 🚨 Vérification des champs obligatoires
		const missingRequiredFields = mappingFields.filter((field) => {
		  if (field.required) {
			// Est-ce que ce champ est mappé ?
			const isMapped = Object.values(mapping).includes(field.field);
			return !isMapped;
		  }
		  return false;
		});
	
		if (missingRequiredFields.length > 0) {
		  const missingFieldsLabels = missingRequiredFields.map((f) => f.label).join(', ');
		  showError(`Les champs obligatoires suivants ne sont pas mappés : ${missingFieldsLabels}`);
		  return;  // Ne pas continuer si des champs obligatoires sont manquants
		}
	
		// Si tout est bon, on continue avec l'enregistrement
		setSavingSchema(true);
		await supabase
		  .from('profiles')
		  .update({ client_mapping: JSON.stringify(mapping) })
		  .eq('id', user.id);
		  console.log("Mapping: ",mapping);
		  //si de nouveau entête apparaît, il faut pouvoir l'ajouter aux menues déroulantes
	
		// Réinitialiser l'erreur si le mapping est valide
		setError(null);
	
		// Afficher le message de succès via toast
		showSuccess("Le mapping a été enregistré avec succès.");
		if (user.id) {			
		  try {
			await saveNotification({
			  owner_id: user.id,
			  is_read: false,
			  type: 'info',
			  need_mail_notification:true,
			  message: 'Sauvegarde du mapping réussie.',
			  details:""
			});
		  } catch (error:any) {
			showError(error)
			console.error('Erreur lors de l’enregistrement de la notification:', error);
		  }
		}
		setSavingSchema(false);
	  } catch (err:any) {
		console.error('Erreur lors de l\'enregistrement du mapping:', err);
		if (user.id) {			
			try {
			  await saveNotification({
				owner_id: user.id,
				is_read: false,
				type: 'erreur',
				message: 'Erreur lors de l\'enregistrement du mapping: '+err,
				need_mail_notification:true,
				details:err
			  });
			} catch (error:any) {
			  showError(error)
			  console.error('Erreur lors de l’enregistrement de la notification:', error);
			}
		  }
		setSavingSchema(false);
		// Afficher le message d'erreur via toast
		showError("Erreur lors de l'enregistrement du mapping");
	  }
	};
	
			

	const resetForm = () => {
		setFile(null);
		setCsvData([]);
		setHeaders([]);
		setMapping({});
		setStep('upload');
		setError(null);
		setPreview([]);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};
	return (
		<div className='fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-auto'>
			<div className='min-h-screen py-8 px-4 flex items-center justify-center'>
				<div className='relative bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mx-auto'>
					<button
						onClick={onClose}
						className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
					>
						<X className='h-6 w-6' />
					</button>

					<h2 className='text-2xl font-bold mb-6'>
						Import de clients depuis un fichier CSV
					</h2>

					{error && (
						<div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center'>
							<span>{error}</span>
						</div>
					)}
					{success && (
						<div className='mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700'>
							{success}
						</div>
					)}
					{step === 'upload' && (
						<div className='space-y-6'>
							<div className='border-2 border-dashed border-gray-300 rounded-lg p-8 text-center'>
								<Upload className='mx-auto h-12 w-12 text-gray-400 mb-4' />
								<p className='text-gray-600 mb-4'>
									Glissez-déposez votre fichier CSV ici ou cliquez pour
									sélectionner un fichier
								</p>
								<input
									type='file'
									accept='.csv'
									onChange={handleFileChange}
									className='hidden'
									ref={fileInputRef}
								/>
								<button
									onClick={() => fileInputRef.current?.click()}
									className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
								>
									Sélectionner un fichier
								</button>
							</div>

							<div className='bg-blue-50 p-4 rounded-md'>
								<div className='flex items-start'>
									<InfoIcon className='h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0' />
									<div>
										<p className='text-blue-800 font-medium mb-2'>
											Format attendu
										</p>
										<p className='text-blue-700 text-sm'>
											Le fichier CSV doit contenir une ligne d'en-tête avec les
											noms des colonnes. Les colonnes obligatoires sont le nom
											de l'entreprise et l'email. L'ordre recommandé des
											colonnes est : entreprise, email, téléphone, adresse,
											ville, code postal, pays, secteur, site web, créé le, mis
											à jour, relance.
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					{step === 'mapping' && (
						<div className='space-y-6'>
							<div className='flex justify-between items-center'>
								<p className='text-gray-600'>
									Fichier : <span className='font-medium'>{file?.name}</span>
								</p>
								<button
									onClick={resetForm}
									className='text-blue-600 hover:text-blue-800 text-sm'
								>
									Changer de fichier
								</button>
							</div>

							<div className='bg-gray-50 p-4 rounded-md mb-4'>
								<div className='flex justify-between items-center mb-2'>
									<h3 className='font-medium'>Correspondance des colonnes</h3>
									<button
										onClick={() => setShowHelp(!showHelp)}
										className='text-blue-600 hover:text-blue-800 flex items-center text-sm'
									>
										<HelpCircle className='h-4 w-4 mr-1' />
										{showHelp ? "Masquer l'aide" : "Afficher l'aide"}
									</button>
								</div>

								{showHelp && (
									<div className='bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-700'>
										<p className='mb-2'>
											<span className='font-medium'>
												Correspondance des colonnes :
											</span>{' '}
											Associez chaque colonne de votre fichier CSV à un champ
											dans notre système.
										</p>
										<ul className='list-disc pl-5 space-y-1'>
											<li>
												<span className='font-medium'>
													Nom de l'entreprise et Email
												</span>{' '}
												sont obligatoires.
											</li>
											<li>
												Pour le champ{' '}
												<span className='font-medium'>
													Nécessite une relance
												</span>
												, les valeurs acceptées sont : "Oui", "OUI", "Yes", "1",
												"True", "Relance en cours".
											</li>
											<li>
												Pour les champs{' '}
												<span className='font-medium'>Créé le</span> et{' '}
												<span className='font-medium'>Mis à jour</span>,
												plusieurs formats de date sont acceptés.
											</li>
											<li>
												Les colonnes non mappées seront ignorées lors de
												l'import.
											</li>
										</ul>
									</div>
								)}

<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
  {headers.map((header, index) => (
    <div key={index} className='flex items-center space-x-2'>
      <div
        className='w-1/2 font-medium truncate'
        title={header}
      >
        {header}
      </div>
      <select
        value={mapping[header] || ''}
        onChange={(e) =>
          handleMappingChange(
            header,
            e.target.value as keyof CSVMapping | ''
          )
        }
        className='w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent'
      >
        <option value=''>Ne pas importer</option>
        {mappingFields.map((field) => (
			<option
  key={field.field}
  value={field.field}
  disabled={!!(
    field.label && Object.entries(mapping)
      .filter(([key, value]) => Boolean(value) && key !== String(header))
      .some(([_, value]) => value === field.field)
  )}
>
  {field.label}
  {field.required ? ' *' : ''}
</option>

        ))}
      </select>
    </div>
  ))}
</div>

							</div>

							<div className='flex justify-between space-x-4'>
								<button
									onClick={saveMapping}
									className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex'
									disabled={savingSchema}
								>
									{savingSchema && <Loader2 className='animate-spin' />}
									Sauvegarder
								</button>
								<div className='flex space-x-4'>
									<button
										onClick={resetForm}
										className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
									>
										Annuler
									</button>
									<button
										onClick={generatePreview}
										className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
									>
										Aperçu
									</button>
								</div>
							</div>
						</div>
					)}

					{step === 'preview' && (
						<div className='space-y-6'>
							<div className='flex justify-between items-center'>
								<p className='text-gray-600'>
									Aperçu des 5 premiers clients (sur {csvData.length})
								</p>
								<button
									onClick={() => setStep('mapping')}
									className='text-blue-600 hover:text-blue-800 text-sm'
								>
									Modifier le mapping
								</button>
							</div>

							<div className='overflow-x-auto'>
								<table className='min-w-full divide-y divide-gray-200'>
									<thead className='bg-gray-50'>
										<tr>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Entreprise
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Code Client
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Email
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Téléphone
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Adresse
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Ville
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Code postal
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Pays
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Secteur
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Site web
											</th>
											<th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
												Relance
											</th>
										</tr>
									</thead>
									<tbody className='bg-white divide-y divide-gray-200'>
										{preview.map((client, index) => (
											<tr key={index}>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
													{client.company_name}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
													{client.client_code}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
													{client.email}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
													{client.phone || '-'}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
													{client.address || '-'}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
													{client.city || '-'}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
													{client.postal_code || '-'}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
													{client.country || 'France'}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
													{client.industry || '-'}
												</td>
												<td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
													{client.website || '-'}
												</td>
												<td className='px-4 py-3 whitespace-nowrap'>
													<span
														className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
															client.needs_reminder
																? 'bg-red-100 text-red-800'
																: 'bg-green-100 text-green-800'
														}`}
													>
														{client.needs_reminder ? 'Oui' : 'Non'}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className='flex justify-end space-x-4'>
								<button
									onClick={resetForm}
									className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors'
								>
									Annuler
								</button>
								<button
									onClick={importClients}
									className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors'
								>
									Importer {csvData.length} clients
								</button>
							</div>
						</div>
					)}

					{step === 'importing' && (
						<div className='text-center py-8'>
							<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4'></div>
							<p className='text-lg font-medium'>
								Importation en cours... {importedCount} / {csvData.length}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

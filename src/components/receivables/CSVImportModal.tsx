import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { X, Upload, AlertCircle, Info, Loader2 } from "lucide-react";
import { Receivable, Client } from "../../types/database";
import Papa from "papaparse";
import { toast } from "react-toastify";

interface CSVImportModalProps {
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
  receivables: (Receivable & { client: Client })[];
}
interface MappingField {
  field: keyof CSVMapping;
  label: string;
  required: boolean;
}

export interface CSVMapping {
  client: string;
  invoice_number: string;
  amount: string;
  paid_amount: string | null;
  due_date: string;
  status: string | null;
  document_date: string | null;
  installment_number: string | null;
  client_code: string | null;
  email: string | null;
  code: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const mappingFields: MappingField[] = [
  { field: "client", label: "Client", required: false },
  { field: "invoice_number", label: "Facture", required: false },
  { field: "amount", label: "Montant", required: false },
  { field: "paid_amount", label: "Montant réglé", required: false },
  { field: "due_date", label: "Date d'échéance", required: false },
  { field: "status", label: "Statut", required: false },
  { field: "document_date", label: "Date pièce", required: false },
  { field: "installment_number", label: "Numéro d'échéance", required: false },
  { field: "client_code", label: "Code Client", required: false },
  { field: "email", label: "Email", required: false },
];

// Shanaka (Start)
const columnMapping: { [key: string]: string } = {
  // Numéro de facture
  invoice_number: "invoice_number",
  "numéro de facture": "invoice_number",
  "n° facture": "invoice_number",
  "n°facture": "invoice_number",
  "num facture": "invoice_number",
  invoice: "invoice_number",
  "invoice number": "invoice_number",
  facture: "invoice_number",
  "numero facture": "invoice_number",
  numéro: "invoice_number",
  ref: "invoice_number",
  référence: "invoice_number",
  reference: "invoice_number",

  // Numéro dans gestion
  "Numéro dans gestion": "client_code",
  "n° gestion": "client_code",
  "n° dans gestion": "client_code",
  "n°gestion": "client_code",
  "num gestion": "client_code",
  "numéro gestion": "client_code",
  "numero gestion": "client_code",
  "ref gestion": "client_code",
  "référence gestion": "client_code",
  "reference gestion": "client_code",
  "management number": "client_code",
  management_number: "client_code",
  "internal ref": "client_code",
  "internal reference": "client_code",
  "code client": "client_code",

  // Code
  code: "code",
  "code facture": "code",
  "code référence": "code",
  "code reference": "code",
  "invoice code": "code",
  "ref code": "code",

  // Montant
  montant: "amount",
  "montant ht": "amount",
  "montant ttc": "amount",
  "montant devise": "amount",
  prix: "amount",
  total: "amount",
  price: "amount",
  "total amount": "amount",
  amount: "amount",
  somme: "amount",

  // Montant réglé
  "montant réglé": "paid_amount",
  "montant regle": "paid_amount",
  "montant payé": "paid_amount",
  "montant paye": "paid_amount",
  réglé: "paid_amount",
  regle: "paid_amount",
  payé: "paid_amount",
  paye: "paid_amount",
  paid: "paid_amount",
  paid_amount: "paid_amount",
  payment: "paid_amount",

  // Date d'échéance
  "date d'échéance": "due_date",
  "date echéance": "due_date",
  "date d'echeance": "due_date",
  "date échéance": "due_date",
  "date echeance": "due_date",
  échéance: "due_date",
  echeance: "due_date",
  "due date": "due_date",
  due_date: "due_date",
  deadline: "due_date",
  "date limite": "due_date",
  "date butoir": "due_date",

  // Statut
  status: "status",
  état: "status",
  etat: "status",
  statut: "status",
  state: "status",

  // Client
  client: "client",
  client_id: "client",
  "nom client": "client",
  "nom du client": "client",
  "raison sociale": "client",
  société: "client",
  societe: "client",
  entreprise: "client",
  customer: "client",
  "customer name": "client",
  company: "client",
  "company name": "client",
  "nom (client)": "client",

  // Numéro d'échéance
  "n° échéance": "installment_number",
  "n°échéance": "installment_number",
  "num échéance": "installment_number",
  "numéro échéance": "installment_number",
  "numero echeance": "installment_number",
  installment: "installment_number",
  installment_number: "installment_number",
  "installment number": "installment_number",
  "payment number": "installment_number",
  "n° paiement": "installment_number",

  //Date pièce
  "date pièce": "document_date",
  document_date: "document_date",

  //Montant Réglé Devise
  "montant réglé devise": "paid_amount",
  //Email
  Email: "email",
  email: "email",
  mail: "email",
};
// Shanaka (Finish)
export default function CSVImportModal({
  onClose,
  onImportSuccess,
  receivables,
}: CSVImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [planError,setPlanError]=useState<string | null>(null);

  //Shanaka (Start)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  //Shanaka (Finish)
  const [step, setStep] = useState<
    "upload" | "preview" | "importing" | "mapping"
  >("upload");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<(Receivable & { client: Client })[]>(
    []
  );
  const [, setImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientMap, setClientMap] = useState<Record<string, Client>>({});
  const [newClients, setNewClients] = useState<Record<string, Client>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mapping, setMapping] = useState<Record<string, keyof CSVMapping>>({});
  const [savingSchema, setSavingSchema] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  let planMessage="";
  // Plus de validation des en-têtes requis
  const expectedHeaders: string[] = [];
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError(null);
    }, 3000);
  };

  // Désactiver le défilement du body quand la modale est ouverte
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // Charger les clients au montage
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("owner_id", user.id)
        .order("company_name");

      if (error) throw error;

      setClients(data || []);

      // Créer un map pour un accès rapide par ID et par nom d'entreprise
      const map: Record<string, Client> = {};
      data?.forEach((client) => {
        map[client.id] = client;
        // Ajouter aussi une entrée avec le nom d'entreprise en minuscules pour faciliter la recherche
        map[client.company_name.toLowerCase()] = client;
      });
      setClientMap(map);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      showError("Impossible de charger la liste des clients");
    }
  };
  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };
  const handleMapping = async (header: string[]) => {
    const headerMap = new Map(
      header.map((item) => [columnMapping[item], true])
    );
    const missingHeaders: string[] = [];
    for (const expected of expectedHeaders) {
      if (!headerMap.has(columnMapping[expected.toLowerCase().trim()])) {
        missingHeaders.push(expected);
      }
    }

    if (missingHeaders.length > 0) {
      showError(
        `Le fichier CSV doit contenir une colonne "${missingHeaders.join(
          ","
        )}" pour importer les données`
      );
      return;
    }

    const autoMapping: Record<string, keyof CSVMapping> = {};
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non authentifié");
    const { data: savedMapping } = await supabase
      .from("profiles")
      .select("receivables_mapping")
      .eq("id", user.id);
    if (
      savedMapping !== null &&
      savedMapping[0].receivables_mapping !== undefined &&
      savedMapping[0].receivables_mapping !== null
    ) {
      const decodedMapping = JSON.parse(savedMapping[0].receivables_mapping);

      Object.entries(decodedMapping).forEach(([key, value]) => {
        autoMapping[key] = value as keyof CSVMapping;
      });
    } else {
      // columnMapping
      for (const col of header) {
        const mappedColumn = columnMapping[col.trim().toLowerCase()];
        if (mappedColumn !== undefined && mappedColumn !== null) {
          autoMapping[col.trim().toLowerCase()] =
            mappedColumn as keyof CSVMapping;
        }
      }
    }
    setMapping(autoMapping);
    setStep("mapping");
  };

  const handleMappingChange = (
    header: string,
    field: keyof CSVMapping | ""
  ) => {
    if (field === "") {
      const newMapping = { ...mapping };
      delete newMapping[header];
      setMapping(newMapping);
    } else {
      setMapping({ ...mapping, [header]: field });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    Papa.parse(selectedFile, {
      complete: (result) => {
        if (result.data.length > 0) {
          const headers = result.data[0] as string[];
          // Shanaka (Start)
          const cleanedHeaders = headers.map((h) => {
            return h.toLowerCase().trim();
          });
          setCsvHeaders(cleanedHeaders);

          const rows = result.data.slice(1) as string[][];
    //      console.log("Données parsées: " + rows);

          setData(rows);
          handleMapping(cleanedHeaders);
        }
      },
      header: false,
      skipEmptyLines: true,
      error: (error) => {
        showError(`Erreur lors de l'analyse du fichier: ${error.message}`);
      },
    });
  };

  const formatDate = (dateStr: string): string | null => {
    if (!dateStr) return null;

    // Nettoyer la chaîne de date
    dateStr = dateStr.trim();

    // Essayer différents formats de date
    let date: Date | null = null;

    // Format DD/MM/YYYY ou DD/MM/YY
    if (/^\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}$/.test(dateStr)) {
      const parts = dateStr.split(/[\/\-\.]/);
      // Si l'année est sur 2 chiffres, ajouter 20 devant (pour 20xx)
      const year = parts[2].length === 2 ? "20" + parts[2] : parts[2];
      date = new Date(
        `${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
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
        `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`
      );
    }

    if (date && !isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }

    return null;
  };

  const getClientId = (clientIdentifier: string): string | null => {
    if (!clientIdentifier) return null;

   // console.log("Client Key:", clientIdentifier);
    // Si c'est déjà un UUID valide
    if (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        clientIdentifier
      )
    ) {
      const client = clients.find((c) => c?.id === clientIdentifier);
      return client ? client.id : null;
    }

    // Chercher par nom d'entreprise exact (insensible à la casse)
    const clientKey = clientIdentifier.toLowerCase().trim();

    // Recherche directe dans le map
    if (clientMap[clientKey]) {
      return clientMap[clientKey].id;
    }

    // Chercher par correspondance exacte
    // Shanaka (Start)
    const exactMatch = clients.find(
      (c) => c?.client_code && c.client_code.toLowerCase().trim() === clientKey
    );
    // Shanaka (Finish)

    if (exactMatch) {
      return exactMatch.id;
    }

    //Shanaka (Start)
    // Removed partial match as we need the exact match to get the correct client id to see if the client is new
    // Chercher par correspondance partielle
    const partialMatches = clients.filter((c) => {
      return c?.client_code && clientKey.includes(c.client_code.toLowerCase());
    });
    if (partialMatches.length === 1) {
      return partialMatches[0].id;
    }

    // Si plusieurs correspondances partielles, prendre la plus proche
    if (partialMatches.length > 1) {
      // Trier par longueur de nom d'entreprise (du plus court au plus long)
      partialMatches.sort(
        (a, b) => a.client_code.length - b.client_code.length
      );
      return partialMatches[0].id;
    }
    //Shanaka (Finish)
    // Recherche avec caractères spéciaux nettoyés
    const cleanClientKey = clientKey.replace(/[&@]/g, "").trim();
    if (cleanClientKey !== clientKey) {
      const cleanMatches = clients.filter(
        (c) =>
          (c?.client_code &&
            c.client_code
              .toLowerCase()
              .replace(/[&@]/g, "")
              .includes(cleanClientKey)) ||
          (c?.client_code &&
            cleanClientKey.includes(
              c.client_code.toLowerCase().replace(/[&@]/g, "")
            ))
      );

      if (cleanMatches.length === 1) {
        return cleanMatches[0].id;
      }

      if (cleanMatches.length > 1) {
        cleanMatches.sort(
          (a, b) => a.client_code.length - b.client_code.length
        );
        return cleanMatches[0].id;
      }
    }

    // Si c'est un nombre, essayer de trouver le client par index (pour les cas où le CSV contient des indices au lieu des noms)
    if (/^\d+$/.test(clientIdentifier)) {
      const index = parseInt(clientIdentifier, 10) - 1; // Ajuster pour l'indexation à base 0
      if (index >= 0 && index < clients.length) {
        return clients[index].id;
      }
    }

    // Recherche par nom partiel sans tenir compte des espaces et de la casse
    const normalizedKey = clientKey.replace(/\s+/g, "");
    const normalizedMatches = clients.filter((c) => {
      if (c?.company_name === "") {
        return normalizedKey === "";
      }
      if (normalizedKey === "") {
        return c?.client_code === "";
      }
      return (
        (c?.client_code &&
          c.client_code
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(normalizedKey)) ||
        (c?.client_code &&
          normalizedKey.includes(
            c.client_code.toLowerCase().replace(/\s+/g, "")
          ))
      );
    });
    if (normalizedMatches.length === 1) {
      return normalizedMatches[0].id;
    }

    if (normalizedMatches.length > 1) {
      normalizedMatches.sort(
        (a, b) => a.client_code.length - b.client_code.length
      );
      return normalizedMatches[0].id;
    }

    return null;
  };

  const mapStatus = (
    statusStr: string
  ): "pending" | "reminded" | "paid" | "late" | "legal" | undefined => {
    if (!statusStr) return undefined;

    const statusLower = statusStr.toLowerCase();

    if (
      statusLower.includes("payé") ||
      statusLower.includes("paye") ||
      statusLower.includes("paid") ||
      statusLower.includes("réglé") ||
      statusLower.includes("regle")
    ) {
      return "paid";
    }

    if (
      statusLower.includes("relance") ||
      statusLower.includes("reminded") ||
      statusLower.includes("rappel")
    ) {
      return "reminded";
    }

    if (
      statusLower.includes("retard") ||
      statusLower.includes("late") ||
      statusLower.includes("overdue")
    ) {
      return "late";
    }

    if (
      statusLower.includes("legal") ||
      statusLower.includes("contentieux") ||
      statusLower.includes("juridique") ||
      statusLower.includes("avocat")
    ) {
      return "legal";
    }

    return "pending";
  };

  const generatePreview = async () => {
    try {
      // First check if the required fields are present
      // SCV header has the header from the csv
      // Mapping has the csv -> to db mapping

      // Trouver les indices des colonnes
      const clientIndex = csvHeaders.findIndex((h) => mapping[h] === "client");
      const invoiceIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "invoice_number"
      );
      const amountIndex = csvHeaders.findIndex((h) => mapping[h] === "amount");
      const emailIndex = csvHeaders.findIndex((h) => mapping[h] === "email");
      const paidAmountIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "paid_amount"
      );
      const documentDateIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "document_date"
      );
      const dueDateIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "due_date"
      );
      const installmentNumberIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "installment_number"
      );
      const statusIndex = csvHeaders.findIndex((h) => mapping[h] === "status");
      // Plus de validation des colonnes requises, utilisation de valeurs par défaut
      const clientCodeIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "client_code"
      );

      // Réinitialiser les nouveaux clients
      const newClientsMap: Record<string, Client> = {};
      const previewData: (Receivable & { client: Client })[] = data
        .slice(0, 5)
        .map((row, index) => {
          // Récupérer les valeurs des colonnes avec des valeurs par défaut
          const clientName =
            clientIndex !== -1 ? row[clientIndex] : "Client inconnu";
          const invoiceNumber =
            invoiceIndex !== -1 ? row[invoiceIndex] : `FACT-${index + 1}`;
          const amountStr = amountIndex !== -1 ? row[amountIndex] : "0";
          const paidAmountStr =
            paidAmountIndex !== -1 ? row[paidAmountIndex] : "0";
          const documentDate =
            documentDateIndex !== -1
              ? formatDate(row[documentDateIndex])
              : null;
          const dueDateStr = row[dueDateIndex] || "";
          const installmentNumber =
            installmentNumberIndex !== -1 ? row[installmentNumberIndex] : null;
          const statusStr = statusIndex !== -1 ? row[statusIndex] : "";
          // Nettoyer et convertir les valeurs

          const amount =
            parseFloat(amountStr.replace(/[^\d.,]/g, "").replace(",", ".")) ||
            0;
          const paidAmount = paidAmountStr
            ? parseFloat(
                paidAmountStr.replace(/[^\d.,]/g, "").replace(",", ".")
              ) || null
            : null;
          const dueDate =
            formatDate(dueDateStr) || new Date().toISOString().split("T")[0];

          const status = mapStatus(statusStr);
          const clientCode = row[clientCodeIndex] || "";
          // Trouver le client correspondant en utilisant le nom du client

          const clientId = getClientId(clientName);
          console.log("ClientID", clientId, clientName);
          const email: string =
            row[emailIndex] ||
            `${clientName
              .toLowerCase()
              .trim()
              .replace(/\s+/g, ".")}@example.com`;
          //shanaka (Start)
          // Check if the client is already in the new clients map
          const client = clientId
            ? clientMap[clientId]
            : newClientsMap[`new-${clientName}`] ?? null;
          //shanaka (Finish)
          // Si le client n'est pas trouvé, créer un nouveau client temporaire
          if (!client) {
            // Générer un ID temporaire pour le nouveau client
            const tempId = `new-${clientName}`;
            // Créer un nouveau client avec le nom fourni
            const newClient: Client = {
              id: tempId,
              company_name: clientName,
              client_code:
                clientCodeIndex !== -1
                  ? row[clientCodeIndex]
                  : Math.floor(Math.random() * (100000 - 150000) + 100000),
              email: email,
              needs_reminder: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              owner_id: "", // Sera rempli lors de l'import
              pre_reminder_enable: false,
              reminder_enable_1: false,
              reminder_enable_2: false,
              reminder_enable_3: false,
              reminder_enable_final: false,
            };
            // Ajouter au map des nouveaux clients
            newClientsMap[tempId] = newClient;
            return {
              id: `preview-${index}`,
              client_id: tempId,
              invoice_number: invoiceNumber,
              amount,
              paid_amount: paidAmount,
              document_date: documentDate,
              due_date: dueDate,
              installment_number: installmentNumber,
              status,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              client: newClient,
              email: email,
            } as Receivable & { client: Client };
          }
          return {
            id: `preview-${index}`,
            client_id: client.id,
            invoice_number: invoiceNumber,
            amount,
            paid_amount: paidAmount,
            document_date: documentDate,
            due_date: dueDate,
            installment_number: installmentNumber,
            status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            client: client,
            email: email,
          } as Receivable & { client: Client };
        });

      setNewClients(newClientsMap);
      setPreview(previewData);
      setStep("preview");
    } catch (error) {
      console.error("Erreur lors de la génération de l'aperçu:", error);
      showError("Impossible de générer l'aperçu");
    }
  };

  const importReceivables = async () => {
    setImporting(true);
    setStep("importing");
    setError(null);
    setImportedCount(0);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié");

      // Trouver les indices des colonnes
      //Shanaka (Start)
      // Replaced the const header , with csvHeader from the state
      //Rino (restart mdr)
      const clientIndex = csvHeaders.findIndex((h) => mapping[h] === "client");
      const invoiceIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "invoice_number"
      );
      const amountIndex = csvHeaders.findIndex((h) => mapping[h] === "amount");
      const emailIndex = csvHeaders.findIndex((h) => mapping[h] === "email");
      const paidAmountIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "paid_amount"
      );
      const documentDateIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "document_date"
      );
      const dueDateIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "due_date"
      );
      const installmentNumberIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "installment_number"
      );
      const statusIndex = csvHeaders.findIndex((h) => mapping[h] === "status");
      const clientCodeIndex = csvHeaders.findIndex(
        (h) => mapping[h] === "client_code"
      );
      //Shanaka (Finish)
      // Créer d'abord les nouveaux clients
      const createdClients: Record<string, string> = {}; // Map des IDs temporaires vers les vrais IDs

      // Get the default reminder profile
      const { data: reminderPorfile } = await supabase
        .from("reminder_profile")
        .select()
        .eq("name", "Default")
        .eq("owner_id", user.id);

      const reminderProfileExist =
        reminderPorfile !== null &&
        reminderPorfile[0] !== null &&
        reminderPorfile.length > 0;

      for (const [tempId, newClient] of Object.entries(newClients)) {
        //		console.log("EMAILLLLLLLLLLLL:",newClient.email);

        try {
          const { data: createdClient, error } = await supabase
            .from("clients")
            .insert([
              {
                //Shanaka(Start)
                // Trimmed the company_name
                company_name: newClient.company_name.trim(),
                client_code: newClient.client_code,

                //Shanaka(Finish)
                email: newClient.email,
                needs_reminder: true,
                owner_id: user.id,
                reminder_profile: reminderProfileExist
                  ? reminderPorfile[0].id
                  : null,
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
              },
            ])
            .select()
            .single();

          if (error) {
            console.error("Erreur lors de la création du client:", error);
            continue;
          }

          if (createdClient) {
            createdClients[tempId] = createdClient.id;
          }
        } catch (err) {
          console.error("Exception lors de la création du client:", err);
        }
      }

      // Préparer les créances à importer
      const receivablesToImport = [];

      for (const row of data) {
        try {
          // Récupérer les valeurs des colonnes
          //Shanaka(Start)
          // Trimmed clientName
          const clientName = row[clientIndex].trim() || "";
          //Shanaka(Finish)
          const invoiceNumber = row[invoiceIndex] || "";
          const amountStr = row[amountIndex] || "0";
          const paidAmountStr =
            paidAmountIndex !== -1 ? row[paidAmountIndex] : "";
          const documentDate =
            documentDateIndex !== -1
              ? formatDate(row[documentDateIndex])
              : null;
          const dueDateStr = row[dueDateIndex] || "";
          const installmentNumber =
            installmentNumberIndex !== -1 ? row[installmentNumberIndex] : null;
          const statusStr = statusIndex !== -1 ? row[statusIndex] : "";

          // Nettoyer et convertir les valeurs
          const amount =
            parseFloat(amountStr.replace(/[^\d.,]/g, "").replace(",", ".")) ||
            0;
          const paidAmount = paidAmountStr
            ? parseFloat(
                paidAmountStr.replace(/[^\d.,]/g, "").replace(",", ".")
              ) || null
            : null;
          const dueDate =
            formatDate(dueDateStr) || new Date().toISOString().split("T")[0];
          const status = mapStatus(statusStr);
          const clientCode = row[clientCodeIndex] || "";
          //Jetemail
          const email = row[emailIndex];
          // Trouver le client correspondant
          let clientId = getClientId(clientName);

          // Si le client n'est pas trouvé, vérifier s'il a été créé
          if (!clientId) {
            // Chercher dans les clients nouvellement créés
            for (const [tempId, realId] of Object.entries(createdClients)) {
              const newClient = newClients[tempId];
              //Shanaka(Start)
              // Trimmed the company name
              if (newClient && newClient.company_name.trim() === clientName) {
                // Shanaka (Finish)
                clientId = realId;
                break;
              }
            }

            // Si toujours pas trouvé, créer un nouveau client à la volée
            if (!clientId) {
              try {
                // Créer un nouveau client
                const { data: newClient, error } = await supabase
                  .from("clients")
                  .upsert(
                    [
                      {
                        company_name: clientName,
                        client_code: clientCode,
                        email: `${clientName
                          .toLowerCase()
                          .replace(/\s+/g, ".")}@example.com`,
                        needs_reminder: true,
                        owner_id: user.id,
                      },
                    ],
                    {
                      onConflict: "owner_id, client_code",
                    }
                  )
                  .select()
                  .single();

                if (error) {
                  console.error(
                    "Erreur lors de la création du client à la volée:",
                    error
                  );
                  continue;
                }

                if (newClient) {
                  clientId = newClient.id;
                } else {
                  continue;
                }
              } catch (err) {
                console.error(
                  "Exception lors de la création du client à la volée:",
                  err
                );
                continue;
              }
            }
          }

          // Ajouter la créance avec des valeurs par défaut si nécessaire
          if (clientId) {
            receivablesToImport.push({
              client_id: clientId,
              invoice_number:
                invoiceNumber || `FACT-${Math.floor(Math.random() * 100000)}`,
              amount: amount || 0,
              paid_amount: paidAmount || 0,
              document_date:
                documentDate || new Date().toISOString().split("T")[0],
              due_date: dueDate || new Date().toISOString().split("T")[0],
              installment_number: installmentNumber || 1,
              email: email,
              automatic_reminder: false,
              //status: status !== null ? status : undefined,
              owner_id: user.id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error("Erreur lors du traitement d'une ligne:", err);
          // Continuer avec la ligne suivante
        }
      }
      //Jet1
      const batchSize = 20;
      let successCount = 0;

      for (let i = 0; i < receivablesToImport.length; i += batchSize) {
        const batch = receivablesToImport.slice(i, i + batchSize);
        if (batch.length === 0) continue;

        try {
          const { data: existing, error: fetchError } = await supabase
            .from("receivables")
            .select("owner_id, invoice_number, status,amount")
            .in(
              "owner_id",
              batch.map((r) => r.owner_id)
            );
          const existingTotalAmount =
            existing?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
			console.log("Montant totale avant mise à jour: ",existingTotalAmount)
          if (fetchError) {
            console.error("Erreur de récupération:", fetchError);
            continue;
          }

          const existingMap = new Map(
            existing.map((r) => [`${r.owner_id}-${r.invoice_number}`, r])
          );

          const toInsert: any[] = [];
          const toUpdate: any[] = [];

          for (const record of batch) {
            //Jetemail
            const key = `${record.owner_id}-${record.invoice_number}`;
            if (existingMap.has(key)) {
              //console.log(record);

              // On garde le status actuel
              const existingStatus = existingMap.get(key)?.status;
              toUpdate.push({ ...record, status: existingStatus });
            } else {
              toInsert.push(record);
            }
          }
          // 1. Cloner existingMap pour le mettre à jour localement
          const updatedMap = new Map(existingMap);

          // 2. Appliquer les mises à jour
          for (const record of toUpdate) {
            const key = `${record.owner_id}-${record.invoice_number}`;
            updatedMap.set(key, { ...record });
          }

          // 3. Appliquer les nouvelles insertions
          for (const record of toInsert) {
            const key = `${record.owner_id}-${record.invoice_number}`;
            updatedMap.set(key, { ...record });
          }

          // 4. Recalculer la somme des amount après mises à jour et insertions
          const updatedTotalAmount = Array.from(updatedMap.values()).reduce(
            (sum, item) => sum + (item.amount || 0),
            0
          );

          console.log(
            "Montant total après update + insert:",
            updatedTotalAmount
          );
		  //Jet limitation
		  // 1. Récupérer le plan d’abonnement
  const { data: subscription, error: subscriptionError } = await supabase
  .from('subscriptions')
  .select('plan')
  .eq('user_id', user.id)
  .limit(1)
  .single();

if (subscriptionError || !subscription) {
  showError("Impossible de récupérer le type d'abonnement.");
  return;
}

// 2. Définir les limites selon les plans
const planLimits = {
  free: 25000,
  basic: 50000,
  pro: 200000,
  company: Infinity,
};

const userPlan = subscription.plan;
const maxOverDues = Number(planLimits[userPlan as keyof typeof planLimits]) ?? 0;
console.log(typeof updatedTotalAmount, updatedTotalAmount);
console.log(typeof maxOverDues, maxOverDues);
if (updatedTotalAmount >= maxOverDues) {
   planMessage = `Limite atteinte : votre plan "${userPlan}" permet de gérer jusqu'à ${maxOverDues} Euro d'encours`;
  setPlanError(planMessage);         // Pour afficher dans le composant si besoin
  throw new Error(planMessage);    
}
          // INSERT uniquement les nouveaux
          if (toInsert.length > 0) {
            const { error: insertError } = await supabase
              .from("receivables")
              .insert(toInsert);

            if (insertError) {
              console.error("Erreur lors de l'insertion:", insertError);
            } else {
              successCount += toInsert.length;
            }
          }

          // UPDATE les existants (sans changer le status)
          if (toUpdate.length > 0) {
            const { error: updateError } = await supabase
              .from("receivables")
              .upsert(toUpdate, {
                onConflict: "owner_id, invoice_number",
                ignoreDuplicates: false,
              });

            if (updateError) {
              console.error("Erreur lors de la mise à jour:", updateError);
            } else {
              successCount += toUpdate.length;
            }
          }

          setImportedCount(successCount);
        } catch (err) {
          console.error("Exception:", err);
        }
      }

      // Mettre à jour les clients pour activer les relances et ajouter les nouveaux mails
      //JetNewEmail
      const clientIds = [
        ...new Set(receivablesToImport.map((r) => r.client_id)),
      ];

      if (clientIds.length > 0) {
        try {
          // 1. On récupère les clients existants
          const { data: existingClients, error } = await supabase
            .from("clients")
            .select("id, email")
            .in("id", clientIds);

          if (error) throw error;

          // 2. On prépare les mises à jour
          const updates = [];

          for (const r of receivablesToImport) {
            const client = existingClients.find((c) => c.id === r.client_id);
            if (!client) continue;

            const existingEmails = client.email
              ? client.email.split(",").map((e: string) => e.trim())
              : [];

            // Si l'email n'existe pas encore, on l'ajoute
            if (!existingEmails.includes(r.email)) {
              const newEmails = [...existingEmails, r.email].join(", ");
              updates.push({
                id: r.client_id,
                email: newEmails,
                needs_reminder: true,
              });
            } else {
              // Mettre à jour needs_reminder même si pas besoin de changer email
              updates.push({
                id: r.client_id,
                email: client.email,
                needs_reminder: true,
              });
            }
          }

          // 3. On exécute les mises à jour
          for (const update of updates) {
            await supabase
              .from("clients")
              .update({
                email: update.email,
                needs_reminder: update.needs_reminder,
              })
              .eq("id", update.id);
          }
        } catch (err) {
          console.error("Erreur lors de la mise à jour des clients:", err);
        }
      }

      // Delete lines that were not in the csv
      const prevItems = new Set(
        receivablesToImport.map(
          (item) => `${item.owner_id}-${item.invoice_number}`
        )
      );

      const missingReceivables = receivables.filter(
        (item) => !prevItems.has(`${item.owner_id}-${item.invoice_number}`)
      );

      if (missingReceivables.length > 0) {
        try {
          await supabase
            .from("receivables")
            .delete()
            .in(
              "id",
              missingReceivables.map((item) => item.id)
            );
        } catch (err) {
          console.error(
            "Erreur lors de la suppression des créances manquantes:",
            err
          );
        }
      }

      if (successCount > 0) {
        onImportSuccess(successCount);
      } else {
   
			throw new Error((planMessage==="")?"Aucune créance n'a pu être importée!":planMessage)}
    } catch (error: any) {
      console.error("Erreur lors de l'import des créances:", error);
      showError(error.message || "Erreur lors de l'import des créances");
      setStep("preview"); // Return to preview step on error
    } finally {
      setImporting(false);
    }
  };

  const saveMapping = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Utilisateur non authentifié");

    try {
      setSavingSchema(true);
      await supabase
        .from("profiles")
        .update({ receivables_mapping: JSON.stringify(mapping) })
        .eq("id", user.id);
      showSuccess("Le mapping a été enregistré avec succès.");

      setSavingSchema(false);
    } catch (err) {
      console.error(
        "Erreur lors de la suppression des créances manquantes:",
        err
      );
      showError("Erreur lors de l'enregistrement du mapping."); // <-- Ajout du toast d'erreur
      setSavingSchema(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setData([]);
    setStep("upload");
    setError(null);
    setPreview([]);
    setNewClients({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4 flex items-center justify-center">
        <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl mx-auto">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>

          <h2 className="text-2xl font-bold mb-6">
            Import de créances depuis un fichier CSV
          </h2>

          {error && (
            <div className="fixed mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="fixed mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
              {success}
            </div>
          )}
          {step === "upload" && (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">
                  Glissez-déposez votre fichier CSV ici ou cliquez pour
                  sélectionner un fichier
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Sélectionner un fichier
                </button>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-blue-800 font-medium mb-2">
                      Format attendu
                    </p>
                    {/* 	<p className='text-blue-700 text-sm'>
											Le fichier CSV doit contenir une ligne d'en-tête avec les
											noms des colonnes suivantes:
										</p>
										<ul className='list-disc pl-5 text-blue-700 text-sm mt-1'>
											{expectedHeaders.map((header, index) => (
												<li
													key={index}
													className={index < 4 ? 'font-semibold' : ''}
												>
													{header}
													{index < 4 ? ' *' : ''}
												</li>
											))}
										</ul>
										<p className='text-blue-700 text-sm mt-2'>
											* Les colonnes marquées d'un astérisque sont obligatoires.
										</p> */}
                    <p className="text-blue-700 text-sm mt-2">
                      * Il faut spécifier{" "}
                      <strong>un numéro de facture unique</strong> pour chaque
                      ligne du CSV.
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                      <strong>Note :</strong> Si un client n'existe pas dans votre liste, il sera automatiquement créé lors de l'import. Le fichier doit être au format CSV séparé par des virgules (<strong>UTF-8</strong>).
                    </p>
                    <p className="text-blue-700 text-sm mt-2">
                      <strong>Attention</strong> : Si le code client n'est pas unique, celui-ci ne doit pas être importé.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {step === "mapping" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Fichier : <span className="font-medium">{file?.name}</span>
                </p>
                <button
                  onClick={resetForm}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Changer de fichier
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {csvHeaders.map((header, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-1/2 font-medium truncate"
                        title={header}
                      >
                        {header}
                      </div>
                      <select
                        value={mapping[header] || ""}
                        onChange={(e) =>
                          handleMappingChange(
                            header,
                            e.target.value as keyof CSVMapping | ""
                          )
                        }
                        disabled={savingSchema}
                        className="w-1/2 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Ne pas importer</option>
                        {mappingFields.map((field) => (
                          <option
                            key={field.field}
                            value={field.field}
                            disabled={
                              mapping[header]
                                ? Object.entries(mapping)
                                    .filter(
                                      ([key, value]) =>
                                        Boolean(value) && key !== String(header)
                                    )
                                    .some(([_, value]) => value === field.field)
                                : false
                            }
                          >
                            {field.label}
                            {field.required ? " *" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between space-x-4">
                <button
                  onClick={saveMapping}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex"
                  disabled={savingSchema}
                >
                  {savingSchema && <Loader2 className="animate-spin" />}
                  Sauvegarder
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={resetForm}
                    disabled={savingSchema}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={generatePreview}
                    disabled={savingSchema}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Aperçu
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Aperçu des 5 premières créances (sur {data.length})
                </p>
                <button
                  onClick={resetForm}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Changer de fichier
                </button>
              </div>

              {Object.keys(newClients).length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                  <h3 className="font-medium mb-2 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Nouveaux clients à créer ({Object.keys(newClients).length})
                  </h3>
                  <p className="text-sm mb-2">
                    Les clients suivants n'existent pas dans votre liste et
                    seront créés automatiquement:
                  </p>
                  <ul className="list-disc pl-5 text-sm">
                    {Object.values(newClients).map((client, index) => (
                      <li key={index}>{client.company_name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Facture
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant devise
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant Réglé devise
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date pièce
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Échéance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro échéance
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((receivable, index) => (
                      <tr
                        key={index}
                        className={
                          receivable.client_id.startsWith("new-")
                            ? "bg-yellow-50"
                            : ""
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {receivable.client_id.startsWith("new-") ? (
                            <span className="flex items-center">
                              <span className="font-medium text-yellow-600">
                                {receivable.client.company_name}
                              </span>
                              <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Nouveau
                              </span>
                            </span>
                          ) : (
                            receivable.client.company_name
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {receivable.invoice_number}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(receivable.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {receivable.paid_amount
                            ? new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              }).format(receivable.paid_amount)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {receivable.document_date
                            ? new Date(
                                receivable.document_date
                              ).toLocaleDateString("fr-FR")
                            : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(receivable.due_date).toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {receivable.installment_number || "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              receivable.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : receivable.status === "late"
                                ? "bg-red-100 text-red-800"
                                : receivable.status === "reminded"
                                ? "bg-yellow-100 text-yellow-800"
                                : receivable.status === "legal"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {receivable.status === "paid" && "Payé"}
                            {receivable.status === "late" && "En retard"}
                            {receivable.status === "reminded" && "Relancé"}
                            {receivable.status === "pending" && "En attente"}
                            {receivable.status === "legal" && "Contentieux"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {receivable.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={importReceivables}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Importer {data.length} créances
                </button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium">
                Importation en cours... {importedCount} / {data.length}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

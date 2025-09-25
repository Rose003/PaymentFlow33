import { AlertCircle, Check, Plus, Upload } from "lucide-react";
import { useState } from "react";
import ClientList from "./ClientList";
import UnknownClientList from "../unknownClients/UnknownClientList";
import { useAbonnement } from "../context/AbonnementContext";

export type SelectedPage = "client" | "unknown";

const ClientPage = () => {
  const { checkAbonnement } = useAbonnement();
  const [tab, setTab] = useState<"client" | "unknown">("client");
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  // const [searchTerm, setSearchTerm] = useState<string>('');
  const handleClick = () => {
    if (!checkAbonnement()) return;
    console.log("Action autorisée !");
	return true;
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 ml-4">
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <div className="flex gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const allowed = handleClick();
              if (!allowed) return;
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-green-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          >
            <Upload className="h-5 w-5" />
            Importer CSV
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const allowed = handleClick();
              if (!allowed) return;
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white font-medium shadow-md
                   hover:bg-blue-700 transition-all duration-300 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            <Plus className="h-5 w-5" />
            Nouveau client
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-2 ml-4">
        <button
          type="button"
          onClick={() => setTab("client")}
          className={`px-3 py-1 rounded-md ${
            tab === "client"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Créances client
        </button>
        <button
          type="button"
          onClick={() => setTab("unknown")}
          className={`px-3 py-1 rounded-md ${
            tab === "unknown"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          Client comptoir
        </button>
      </div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {importSuccess && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
          <Check className="h-5 w-5 mr-2" />
          {importSuccess}
        </div>
      )}

      {tab === "client" && (
        <ClientList
          setShowForm={setShowForm}
          showForm={showForm}
          setShowImportModal={setShowImportModal}
          showImportModal={showImportModal}
          setError={setError}
          setImportSuccess={setImportSuccess}
          importSuccess={importSuccess}
        />
      )}
      {tab === "unknown" && (
        <UnknownClientList
          setShowForm={setShowForm}
          showForm={showForm}
          setShowImportModal={setShowImportModal}
          showImportModal={showImportModal}
          setError={setError}
          setImportSuccess={setImportSuccess}
        />
      )}
    </div>
  );
};

export default ClientPage;

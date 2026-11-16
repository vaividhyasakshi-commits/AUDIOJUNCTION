import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandLogo from "../components/BrandLogo";

import {
  collection,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import { signOut } from "firebase/auth";

import {
  Search, Eye, Users, Mail, Tags,
  LogOut, Download, Loader2, Inbox,
  Radio, X, ChevronDown,
} from "lucide-react";

import { auth, db } from "../firebase";

import EnquiryModal from "../components/EnquiryModal";
import SearchModal from "../components/SearchModal";

const emptyFilters = {
  category: "",
  subcategory: "",
};

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "Just now";

  return timestamp.toDate().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [enquiries, setEnquiries] = useState([]);
  const [knownEnquiries, setKnownEnquiries] = useState([]);

  const [selected, setSelected] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const [filters, setFilters] = useState(emptyFilters);
  const [activeTab, setActiveTab] = useState("all");
  const [pageSize, setPageSize] = useState(50);

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [openingId, setOpeningId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    setConnected(false);

    const constraints = [];

    if (filters.category) {
      constraints.push(
        where("category", "==", filters.category)
      );
    }

    if (filters.subcategory) {
      constraints.push(
        where("subcategory", "==", filters.subcategory)
      );
    }

    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageSize));

    const enquiryQuery = query(
      collection(db, "enquiries"),
      ...constraints
    );

    const unsubscribe = onSnapshot(
      enquiryQuery,
      { includeMetadataChanges: true },

      (snapshot) => {
        const records = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setEnquiries(records);

        setKnownEnquiries((prev) => {
          const map = new Map(
            prev.map((item) => [item.id, item])
          );

          records.forEach((item) => map.set(item.id, item));

          return [...map.values()];
        });

        setLoading(false);
        setConnected(!snapshot.metadata.fromCache);
      },

      (err) => {
        console.error(err);

        setEnquiries([]);
        setLoading(false);
        setConnected(false);

        setError(
          err.code === "failed-precondition"
            ? "Firestore indexes are not ready yet."
            : "Unable to load enquiries. Check Firebase permissions."
        );
      }
    );

    return unsubscribe;

  }, [filters.category, filters.subcategory, pageSize]);

  const visibleEnquiries = enquiries.filter((item) => {
    if (activeTab === "new") return !item.viewed;
    if (activeTab === "viewed") return item.viewed;

    if (activeTab === "uncategorized") {
      return !item.category || !item.subcategory;
    }

    return true;
  });

  const stats = {
    total: enquiries.length,
    unread: enquiries.filter((item) => !item.viewed).length,
    categorized: enquiries.filter(
      (item) => item.category && item.subcategory
    ).length,
  };

  async function handleView(enquiry) {
    if (openingId) return;

    setOpeningId(enquiry.id);
    setError("");

    try {
      if (!enquiry.viewed) {
        await updateDoc(doc(db, "enquiries", enquiry.id), {
          viewed: true,
        });
      }

      setSelected({
        ...enquiry,
        viewed: true,
      });

    } catch (err) {
      console.error(err);
      setError("Unable to open this enquiry.");
    } finally {
      setOpeningId(null);
    }
  }

  function handleSearch(newFilters) {
    setFilters(newFilters);
    setPageSize(50);
    setActiveTab("all");
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate("/admin/login", { replace: true });
    } catch {
      setError("Unable to logout. Please try again.");
    }
  }

  function exportCSV() {
    if (!visibleEnquiries.length) return;

    const escapeCSV = (value) => {
      let text = String(value ?? "");

      // Prevent spreadsheet formula injection.
      if (/^\s*[=+\-@\t\r\n]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Name",
      "Phone",
      "Requirement",
      "Category",
      "Subcategory",
      "Status",
      "Submitted At",
    ];

    const rows = visibleEnquiries.map((item) => [
      item.name,
      item.phone,
      item.requirement,
      item.category,
      item.subcategory,
      item.viewed ? "Viewed" : "New",
      formatDate(item.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "customer-enquiries.csv";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const isFiltered = Boolean(
    filters.category || filters.subcategory
  );

  const tabs = [
    { value: "all", label: "All Enquiries" },
    { value: "new", label: "New" },
    { value: "viewed", label: "Viewed" },
    { value: "uncategorized", label: "Uncategorized" },
  ];

  return (
    <main className="dashboard-page">

      <header className="dashboard-header">
        <div className="dashboard-header-inner">

<div className="dashboard-brand">

  <BrandLogo small />

  <div>
    <h1>Enquiry Manager</h1>
    <p>Audio Junction</p>
  </div>

</div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>

        </div>
      </header>

      <div className="dashboard-container">

        <div className="dashboard-intro">
          <div>
            <h2>Customer Enquiries</h2>
            <p>Manage and organize your customer requirements.</p>
          </div>

          <div className={`live-indicator ${
            connected ? "" : "offline-indicator"
          }`}>
            <Radio size={17} />

            {connected
              ? "Live Updates"
              : loading
                ? "Connecting..."
                : "Not connected"}
          </div>
        </div>

        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue-icon">
              <Users size={24} />
            </div>

            <div>
              <p>Loaded Enquiries</p>
              <h3>{stats.total}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange-icon">
              <Mail size={24} />
            </div>

            <div>
              <p>Unread Enquiries</p>
              <h3>{stats.unread}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green-icon">
              <Tags size={24} />
            </div>

            <div>
              <p>Categorized</p>
              <h3>{stats.categorized}</h3>
            </div>
          </div>

        </div>

        <section className="enquiry-panel">

          <div className="panel-toolbar">

            <div>
              <h3>
                {isFiltered ? "Search Results" : "Latest Enquiries"}
              </h3>

              <p>{visibleEnquiries.length} records displayed</p>
            </div>

            <div className="toolbar-actions">

              <button
                className="secondary-button"
                onClick={exportCSV}
                disabled={!visibleEnquiries.length || loading}
              >
                <Download size={17} /> Export CSV
              </button>

              <button
                className="search-button"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={18} /> Search
              </button>

            </div>
          </div>

          {isFiltered && (
            <div className="active-filters">

              {filters.category && (
                <span>Category: {filters.category}</span>
              )}

              {filters.subcategory && (
                <span>Subcategory: {filters.subcategory}</span>
              )}

              <button onClick={() => handleSearch(emptyFilters)}>
                <X size={15} /> Clear Filters
              </button>

            </div>
          )}

          <div className="dashboard-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                className={activeTab === tab.value ? "active-tab" : ""}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}

                {tab.value === "new" && (
                  <span className="tab-count">
                    {stats.unread}
                  </span>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="dashboard-error">
              <div className="error-message" role="alert">
                {error}
              </div>
            </div>
          )}

          {loading ? (

            <div className="empty-state">
              <Loader2 size={35} className="spinner" />
              <p>Loading enquiries...</p>
            </div>

          ) : visibleEnquiries.length === 0 ? (

            <div className="empty-state">
              <Inbox size={45} />
              <h3>No enquiries found</h3>
              <p>Matching customer enquiries will appear here.</p>
            </div>

          ) : (

            <div className="table-wrapper">

              <table className="enquiry-table">

                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Customer Name</th>
                    <th>Category</th>
                    <th>Subcategory</th>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {visibleEnquiries.map((enquiry, index) => (

                    <tr
                      key={enquiry.id}
                      className={!enquiry.viewed ? "unread-row" : ""}
                    >

                      <td>{index + 1}</td>

                      <td>
                        <div className="customer-name">

                          <div className="customer-avatar">
                            {enquiry.name.charAt(0).toUpperCase()}
                          </div>

                          <strong>{enquiry.name}</strong>

                        </div>
                      </td>

                      <td className="capitalize-text">
                        {enquiry.category || "—"}
                      </td>

                      <td className="capitalize-text">
                        {enquiry.subcategory || "—"}
                      </td>

                      <td className="date-cell">
                        {formatDate(enquiry.createdAt)}
                      </td>

                      <td>
                        <span className={`status-pill ${
                          enquiry.viewed
                            ? "status-viewed"
                            : "status-new"
                        }`}>
                          {enquiry.viewed ? "Viewed" : "New"}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`view-button ${
                            enquiry.viewed
                              ? "viewed-button"
                              : "new-button"
                          }`}
                          disabled={Boolean(openingId)}
                          onClick={() => handleView(enquiry)}
                        >
                          {openingId === enquiry.id
                            ? <Loader2 size={16} className="spinner" />
                            : <Eye size={16} />}

                          View
                        </button>
                      </td>

                    </tr>

                  ))}

                </tbody>
              </table>
            </div>

          )}

          {!loading && enquiries.length === pageSize && (
            <div className="load-more-container">

              <button
                className="secondary-button"
                onClick={() => setPageSize((prev) => prev + 50)}
              >
                <ChevronDown size={18} /> Load More
              </button>

            </div>
          )}

          <div className="panel-footer">
            Showing {visibleEnquiries.length} of {enquiries.length} loaded enquiries
          </div>

        </section>
<footer className="dashboard-footer">
  © {new Date().getFullYear()} Audio Junction
  · Enquiry Manager
</footer>

      </div>

      {selected && (
        <EnquiryModal
          key={selected.id}
          enquiry={selected}
          enquiries={knownEnquiries}
          onClose={() => setSelected(null)}
        />
      )}

      {searchOpen && (
        <SearchModal
          enquiries={knownEnquiries}
          filters={filters}
          onSearch={handleSearch}
          onClose={() => setSearchOpen(false)}
        />
      )}

    </main>
  );
}
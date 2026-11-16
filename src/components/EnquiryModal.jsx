import { useState, useEffect } from "react";

import {
  X,
  Phone,
  Copy,
  Check,
  Save,
  Loader2,
  MessageCircle,
  CheckCircle2,
  Users,
} from "lucide-react";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

import {
  getCategories,
  getSubcategories,
  normalizeCategory,
  formatCategory,
} from "../data/categories";

import {
  getCommunityInvitation,
} from "../data/whatsapp";

export default function EnquiryModal({
  enquiry,
  enquiries,
  onClose,
}) {
  const categories = getCategories([
    ...enquiries,
    enquiry,
  ]);

  const [category, setCategory] = useState(
    enquiry.category || ""
  );

  const [customCategory, setCustomCategory] = useState("");

  const [subcategory, setSubcategory] = useState(
    enquiry.subcategory || ""
  );

  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(
    Boolean(enquiry.category && enquiry.subcategory)
  );

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const [invitationOpened, setInvitationOpened] =
    useState(false);

  const finalCategory = normalizeCategory(
    category === "__custom__"
      ? customCategory
      : category
  );

  const subcategories = getSubcategories(
    enquiries,
    finalCategory
  );

  const invitationUrl = getCommunityInvitation(enquiry);

  const communityConsent =
    enquiry.communityConsent === true;

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, saving]);

  function handleCategoryChange(e) {
    setCategory(e.target.value);
    setCustomCategory("");
    setSubcategory("");
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (saving) return;

    setError("");

    const finalSubcategory =
      normalizeCategory(subcategory);

    if (!finalCategory || !finalSubcategory) {
      setError("Please enter category and subcategory.");
      return;
    }

    try {
      setSaving(true);

      await updateDoc(
        doc(db, "enquiries", enquiry.id),
        {
          category: finalCategory,
          subcategory: finalSubcategory,
          viewed: true,
        }
      );

      setSaved(true);

      // Popup stays open after saving.
      // Do not call onClose() here.

    } catch (err) {
      console.error(err);
      setError("Unable to save customer details.");
    } finally {
      setSaving(false);
    }
  }

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(enquiry.phone);
      setCopied(true);
    } catch {
      setError("Unable to copy phone number.");
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={() => !saving && onClose()}
    >
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="customer-title">
              Customer Details
            </h2>

            <p>
              View and categorize this enquiry.
            </p>
          </div>

          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        <div className="modal-body">

          <div className="customer-details">

            <div className="detail-item">
              <span>Full Name</span>
              <h3>{enquiry.name}</h3>
            </div>

            <div className="detail-item">
              <span>Mobile Number</span>

              <div className="phone-detail">
                <h3>+91 {enquiry.phone}</h3>

                <button
                  type="button"
                  className="icon-button"
                  onClick={copyPhone}
                  aria-label="Copy phone number"
                >
                  {copied
                    ? <Check size={17} />
                    : <Copy size={17} />}
                </button>
              </div>
            </div>

            <div className="contact-actions">

              <a
                href={`tel:+91${enquiry.phone}`}
                className="contact-button"
              >
                <Phone size={16} />
                Call Customer
              </a>

              <a
                href={`https://wa.me/91${enquiry.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-button whatsapp-button"
              >
                <MessageCircle size={17} />
                WhatsApp
              </a>

            </div>

            <div className="detail-item">
              <span>Requirements</span>

              <div className="requirement-box">
                {enquiry.requirement}
              </div>
            </div>

          </div>

          <hr className="modal-divider" />

          <form
            onSubmit={handleSave}
            className="form-stack"
          >

            {/* CATEGORY SELECTOR */}

            <div className="form-group">
              <label htmlFor="category">
                Category
              </label>

              <select
                id="category"
                className="plain-input category-select"
                value={category}
                onChange={handleCategoryChange}
                disabled={saving}
                required
              >
                <option value="">
                  Select Category
                </option>

                {categories.map((item) => (
                  <option key={item} value={item}>
                    {formatCategory(item)}
                  </option>
                ))}

                <option value="__custom__">
                  + Type Custom Category
                </option>
              </select>
            </div>

            {/* CUSTOM CATEGORY */}

            {category === "__custom__" && (
              <div className="form-group">
                <label htmlFor="custom-category">
                  New Category Name
                </label>

                <input
                  id="custom-category"
                  className="plain-input"
                  placeholder="Enter custom category"
                  value={customCategory}
                  maxLength={100}
                  disabled={saving}
                  onChange={(e) => {
                    setCustomCategory(e.target.value);
                    setSaved(false);
                  }}
                  required
                />
              </div>
            )}

            {/* SUBCATEGORY */}

            <div className="form-group">
              <label htmlFor="subcategory">
                Subcategory
              </label>

              <input
                id="subcategory"
                className="plain-input"
                placeholder="e.g. Headset, Radio, DSLR"
                list="subcategory-suggestions"
                value={subcategory}
                maxLength={100}
                disabled={saving}
                onChange={(e) => {
                  setSubcategory(e.target.value);
                  setSaved(false);
                }}
                required
              />

              <datalist id="subcategory-suggestions">
                {subcategories.map((item) => (
                  <option
                    key={item}
                    value={formatCategory(item)}
                  />
                ))}
              </datalist>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`primary-button ${
                saved ? "saved-button" : ""
              }`}
              disabled={saving || saved}
            >
              {saving ? (
                <Loader2
                  size={18}
                  className="spinner"
                />
              ) : saved ? (
                <CheckCircle2 size={18} />
              ) : (
                <Save size={18} />
              )}

              {saving
                ? "Saving..."
                : saved
                  ? "Details Saved"
                  : "Save Customer Details"}
            </button>

            {saved && (
              <div className="save-success-message">
                <CheckCircle2 size={17} />
                Customer details saved successfully.
              </div>
            )}

          </form>

          {/* WHATSAPP COMMUNITY INVITATION */}

          {saved && (
            <div className="community-section">

              <div className="community-heading">
                <Users size={20} />

                <div>
                  <h3>Audio Junction Community</h3>
                  <p>Invite this customer to join.</p>
                </div>
              </div>

              {!communityConsent ? (
                <p className="field-hint">
                  Customer has not opted in to community
                  invitations. Obtain their permission first.
                </p>
              ) : !invitationUrl ? (
                <p className="field-hint">
                  Configure the WhatsApp community link
                  before sending invitations.
                </p>
              ) : (
                <a
                  href={invitationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="community-button"
                  onClick={() => setInvitationOpened(true)}
                >
                  <MessageCircle size={20} />

                  {invitationOpened
                    ? "Open Invitation Again"
                    : "Send Community Invitation"}
                </a>
              )}

              {invitationOpened && (
                <p className="field-hint">
                  Invitation opened in WhatsApp.
                  Press Send to deliver the message.
                </p>
              )}

            </div>
          )}

          <button
            type="button"
            className="secondary-button close-details-button"
            onClick={onClose}
            disabled={saving}
          >
            Close Details
          </button>

        </div>
      </section>
    </div>
  );
}
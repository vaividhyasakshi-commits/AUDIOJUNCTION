import { useState } from "react";

import {
  User,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";
import BrandLogo from "../components/BrandLogo";

const initialForm = {
  name: "",
  phone: "",
  requirement: "",
};

export default function EnquiryForm() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [consent, setConsent] = useState(false);

  const [communityConsent, setCommunityConsent] =
    useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "phone"
          ? value.replace(/\D/g, "").slice(0, 10)
          : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (form.name.trim().length < 2) {
      return setError("Please enter your full name.");
    }

    if (!/^\d{10}$/.test(form.phone)) {
      return setError(
        "Please enter a valid 10-digit mobile number."
      );
    }

    if (form.requirement.trim().length < 3) {
      return setError(
        "Please describe your requirements."
      );
    }

    if (!consent) {
      return setError(
        "Please agree to be contacted."
      );
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "enquiries"), {
        name: form.name.trim(),
        phone: form.phone,
        requirement: form.requirement.trim(),
        category: "",
        subcategory: "",
        viewed: false,
        communityConsent,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setForm(initialForm);
      setConsent(false);
      setCommunityConsent(false);

    } catch (err) {
      console.error(err);
      setError(
        "Unable to submit enquiry. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="public-page audio-junction-page">

      <div className="public-container">

        <div className="brand-block">
          <BrandLogo />
          <p>Customer Enquiry</p>
        </div>

        <div className="public-card">

          {success ? (
            <div className="success-state">

              <CheckCircle2 size={65} />

              <h2>Enquiry Submitted!</h2>

              <p>
                Thank you for sharing your requirements
                with Audio Junction. Our team will get
                in touch with you shortly.
              </p>

              <button
                className="primary-button"
                onClick={() => setSuccess(false)}
              >
                Submit Another Enquiry
              </button>

            </div>
          ) : (
            <>

              <div className="form-heading">
                <h2>Share Your Requirements</h2>

                <p>
                  Looking for something special?
                  Tell us what you need.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="form-stack"
              >

                <div className="form-group">

                  <label htmlFor="name">
                    Full Name *
                  </label>

                  <div className="input-wrapper">
                    <User size={19} />

                    <input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                      autoComplete="name"
                      required
                    />
                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="phone">
                    Mobile Number *
                  </label>

                  <div className="input-wrapper">

                    <Phone size={18} />

                    <span className="country-code">
                      +91
                    </span>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="Enter mobile number"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={10}
                      autoComplete="tel-national"
                      required
                    />

                  </div>
                </div>

                <div className="form-group">

                  <label htmlFor="requirement">
                    Your Requirements *
                  </label>

                  <div className="textarea-wrapper">

                    <MessageSquare size={19} />

                    <textarea
                      id="requirement"
                      name="requirement"
                      placeholder="Tell us what you are looking for..."
                      value={form.requirement}
                      onChange={handleChange}
                      rows={5}
                      maxLength={2000}
                      required
                    />

                  </div>

                  <small className="character-count">
                    {form.requirement.length}/2000
                  </small>

                </div>

                <label className="consent-row">

                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) =>
                      setConsent(e.target.checked)
                    }
                    required
                  />

                  <span>
                    I agree to be contacted regarding
                    my enquiry.
                  </span>

                </label>

                <label className="consent-row">

                  <input
                    type="checkbox"
                    checked={communityConsent}
                    onChange={(e) =>
                      setCommunityConsent(e.target.checked)
                    }
                  />

                  <span>
                    I would like to receive an invitation
                    to the Audio Junction WhatsApp Community.
                    (Optional)
                  </span>

                </label>

                {error && (
                  <div
                    className="error-message"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <button
                  className="primary-button"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2
                      size={19}
                      className="spinner"
                    />
                  ) : (
                    <Send size={18} />
                  )}

                  {loading
                    ? "Submitting..."
                    : "Submit Enquiry"}
                </button>

              </form>

              <div className="secure-note">
                <ShieldCheck size={17} />

                Your details will be used to respond to
                your enquiry and send community invitations
                if you opt in.
              </div>

            </>
          )}

        </div>

        <p className="public-footer">
          © {new Date().getFullYear()} Audio Junction
        </p>

      </div>
    </main>
  );
}
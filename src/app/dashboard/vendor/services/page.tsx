"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface ServiceItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  summary: string;
  image?: string;
  vendorName?: string;
  vendorEmail?: string;
}

const CATEGORIES = [
  "Venues & Estates",
  "Bridal Photography",
  "Gourmet Catering",
  "Floral & Decor",
  "Live Music & DJ",
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function VendorServicesPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const user = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        businessName?: string | null;
      }
    | undefined;

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(
    null
  );

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    if (searchParams.get("new") === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingService(null);
      setShowForm(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user?.email) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    let active = true;

    async function loadVendorServices() {
      try {
        const res = await fetch(
          `${API_BASE}/api/services/vendor?email=${encodeURIComponent(
            user!.email!
          )}`,
          { credentials: "include" }
        );
        if (!res.ok) {
          if (active) setServices([]);
          return;
        }
        const data = await res.json();
        if (active) {
          setServices(Array.isArray(data) ? data : data.services || []);
        }
      } catch {
        if (active) setServices([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVendorServices();
    return () => {
      active = false;
    };
  }, [user?.email]);

  const resetForm = () => {
    setTitle("");
    setCategory(CATEGORIES[0]);
    setLocation("");
    setPrice("");
    setSummary("");
    setImage("");
    setEditingService(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: ServiceItem) => {
    setEditingService(item);
    setTitle(item.title);
    setCategory(item.category || CATEGORIES[0]);
    setLocation(item.location);
    setPrice(String(item.price));
    setSummary(item.summary || "");
    setImage(item.image || "");
    setShowForm(true);
  };

  const handleImageUpload = async (file: File) => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) {
      toast.error("NEXT_PUBLIC_IMGBB_API_KEY is not configured");
      return;
    }

    setUploadingImg(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!data?.success || !data?.data?.url) {
        throw new Error("Image upload failed");
      }

      setImage(data.data.url);
      toast.success("Service photo uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.email) {
      toast.error("Vendor session not found");
      return;
    }

    const numericPrice = Number(price);
    if (
      !title.trim() ||
      !location.trim() ||
      Number.isNaN(numericPrice) ||
      numericPrice <= 0
    ) {
      toast.error("Please fill out title, location, and a valid price.");
      return;
    }

    setSubmitting(true);
    try {
      if (editingService) {
        const res = await fetch(
          `${API_BASE}/api/services/${editingService._id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              title: title.trim(),
              category,
              location: location.trim(),
              price: numericPrice,
              summary: summary.trim(),
              image: image.trim(),
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || "Failed to update service");
          return;
        }

        setServices((prev) =>
          prev.map((s) => (s._id === editingService._id ? data.service : s))
        );
        toast.success("Service updated successfully");
        resetForm();
      } else {
        const res = await fetch(`${API_BASE}/api/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: title.trim(),
            category,
            location: location.trim(),
            price: numericPrice,
            summary: summary.trim(),
            image: image.trim(),
            vendorEmail: user.email,
            vendorName: user.businessName || user.name || "Verified Studio",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || "Failed to create service");
          return;
        }

        setServices((prev) => [data.service, ...prev]);
        toast.success("Service published to marketplace");
        resetForm();
      }
    } catch {
      toast.error("Something went wrong while saving service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/services/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to delete service");
        return;
      }

      setServices((prev) => prev.filter((s) => s._id !== id));
      toast.success("Service removed");
    } catch {
      toast.error("Failed to delete service");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1F1A1D]">
            My Services
          </h1>
          <p className="mt-1 text-sm text-[#6B5E62]">
            Create, update, or remove your wedding service packages.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#5E1929] px-5 py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#46111E]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mt-6 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex items-center justify-between border-b border-[#E6DCD2] pb-4">
            <h2 className="font-serif text-xl font-bold text-[#1F1A1D]">
              {editingService ? "Edit Service" : "Add New Service"}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              aria-label="Close form"
              className="rounded-lg p-1.5 text-[#6B5E62] hover:bg-[#F7F1E7]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSaveService} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
                  SERVICE TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Royal Garden & Banquet Estate"
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-2.5 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
                  CATEGORY *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-2.5 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
                  LOCATION *
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Dhaka, Banani"
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-2.5 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
                  STARTING PRICE (USD) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2500"
                  className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-2.5 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
                DESCRIPTION
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe package details, capacity, or inclusions..."
                className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-2.5 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
                COVER IMAGE URL / UPLOAD
              </label>
              <div className="mt-1.5 flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://i.ibb.co/..."
                  className="flex-1 rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-2.5 text-sm text-[#1F1A1D] focus:border-[#5E1929] focus:outline-none"
                />
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E2D6C8] bg-[#F7F1E7] px-4 py-2.5 text-xs font-semibold text-[#5E1929] transition hover:border-[#C59B47]">
                  {uploadingImg ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{uploadingImg ? "Uploading..." : "Upload Photo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[#E6DCD2] px-5 py-2.5 text-xs font-semibold text-[#6B5E62] hover:bg-[#F7F1E7]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingImg}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5E1929] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#46111E] disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>
                  {submitting
                    ? "Saving..."
                    : editingService
                    ? "Update Service"
                    : "Save Service"}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="mt-7 rounded-3xl border border-[#E6DCD2] bg-white p-6 shadow-2xs sm:p-7">
        {loading ? (
          <p className="py-10 text-center text-sm text-[#6B5E62]">
            Loading your services...
          </p>
        ) : services.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-serif text-xl font-bold text-[#1F1A1D]">
              No services added yet
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-xs text-[#6B5E62]">
              Click “Add Service” to publish your first wedding
              package.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E6DCD2]">
            {services.map((item) => (
              <div
                key={item._id}
                className="flex flex-col justify-between gap-4 py-5 sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-16 w-20 shrink-0 rounded-xl border border-[#E6DCD2] object-cover"
                    />
                  )}
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-lg font-bold text-[#1F1A1D]">
                        {item.title}
                      </h2>
                      <span className="rounded-full bg-[#F2E2E4] px-2.5 py-0.5 text-[10px] font-bold text-[#5E1929]">
                        {item.category}
                      </span>
                    </div>

                    {item.summary && (
                      <p className="mt-1 max-w-xl text-xs text-[#6B5E62]">
                        {item.summary}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-[#6B5E62]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#C59B47]" />
                        <span>{item.location}</span>
                      </span>
                      <span className="font-serif text-sm font-bold text-[#5E1929]">
                        ${Number(item.price || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#E6DCD2] bg-[#FCFBF9] px-3.5 py-2 text-xs font-semibold text-[#1F1A1D] transition hover:border-[#C59B47]"
                  >
                    <Pencil className="h-3.5 w-3.5 text-[#5E1929]" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    disabled={deletingId === item._id}
                    onClick={() => handleDeleteService(item._id)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>
                      {deletingId === item._id ? "Deleting..." : "Delete"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
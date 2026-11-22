"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Upload, Loader2 } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { toast } from "sonner";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [businessName, setBusinessName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const hasMinLength = password.length >= 6;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  const uploadToImgBB = async (file: File): Promise<string> => {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) throw new Error("ImgBB API key is missing in .env.local");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data?.success || !data?.data?.url) {
      throw new Error("Profile image upload failed");
    }
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasMinLength || !hasUppercase || !hasLowercase) {
      toast.error(
        "Password must be at least 6 characters with 1 uppercase and 1 lowercase letter."
      );
      return;
    }

    if (role === "vendor" && !businessName.trim()) {
      toast.error("Please enter your business name for Vendor registration.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadToImgBB(imageFile);
      }

      const { error } = await signUp.email({
        email: email.trim(),
        password,
        name: name.trim(),
        image: imageUrl || undefined,
        // @ts-expect-error custom fields configured in Better Auth
        role,
        businessName: role === "vendor" ? businessName.trim() : "",
      });

      if (error) {
        toast.error(error.message || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully!");
      router.push(
        role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer"
      );
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
      });
    } catch {
      toast.error("Google sign up failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#1F1A1D]/55 px-4 py-8 backdrop-blur-sm">
      <div className="relative my-auto w-full max-w-[440px] rounded-[28px] border border-[#E6DCD2] bg-[#FAF7F2] px-8 py-9 shadow-2xl">
        {/* Top-right Close Button */}
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#E6DCD2] bg-[#F5EFE6] text-[#6B5E62] transition hover:border-[#C59B47] hover:text-[#1F1A1D]"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B47]">
            JOIN WEDPLAN
          </p>
          <h1 className="mt-1 font-serif text-[32px] font-bold leading-tight text-[#1F1A1D]">
            Create Your Account
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-[#6B5E62]">
            Select Customer or Vendor role. Admin accounts cannot be publicly
            registered.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
            >
              FULL NAME *
            </label>
            <input
              id="fullName"
              type="text"
              required
              placeholder="Sophia Laurent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] placeholder:text-[#A69A9E] focus:border-[#5E1929] focus:outline-none"
            />
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
            >
              EMAIL ADDRESS *
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="sophia@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] placeholder:text-[#A69A9E] focus:border-[#5E1929] focus:outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
            >
              PASSWORD *
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="Min 6 chars, 1 Uppercase, 1 Lowercase"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] placeholder:text-[#A69A9E] focus:border-[#5E1929] focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
              <span
                className={
                  hasMinLength
                    ? "font-medium text-emerald-700"
                    : "text-[#6B5E62]"
                }
              >
                • 6+ chars
              </span>
              <span
                className={
                  hasUppercase
                    ? "font-medium text-emerald-700"
                    : "text-[#6B5E62]"
                }
              >
                • 1 Uppercase
              </span>
              <span
                className={
                  hasLowercase
                    ? "font-medium text-emerald-700"
                    : "text-[#6B5E62]"
                }
              >
                • 1 Lowercase
              </span>
            </div>
          </div>

          {/* Account Role */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]">
              ACCOUNT ROLE *
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-xs font-semibold transition ${
                  role === "customer"
                    ? "border-[#5E1929] bg-[#FDF6F7] text-[#1F1A1D]"
                    : "border-[#E2D6C8] bg-[#FCFBF9] text-[#1F1A1D] hover:border-[#C59B47]"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    role === "customer"
                      ? "border-[#5E1929]"
                      : "border-[#9C8F93]"
                  }`}
                >
                  {role === "customer" && (
                    <span className="h-2 w-2 rounded-full bg-[#5E1929]" />
                  )}
                </span>
                <span>Customer (Couple)</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left text-xs font-semibold transition ${
                  role === "vendor"
                    ? "border-[#5E1929] bg-[#FDF6F7] text-[#1F1A1D]"
                    : "border-[#E2D6C8] bg-[#FCFBF9] text-[#1F1A1D] hover:border-[#C59B47]"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    role === "vendor"
                      ? "border-[#5E1929]"
                      : "border-[#9C8F93]"
                  }`}
                >
                  {role === "vendor" && (
                    <span className="h-2 w-2 rounded-full bg-[#5E1929]" />
                  )}
                </span>
                <span>Vendor (Business)</span>
              </button>
            </div>
          </div>

          {/* Vendor Business Name */}
          {role === "vendor" && (
            <div>
              <label
                htmlFor="businessName"
                className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
              >
                BUSINESS NAME *
              </label>
              <input
                id="businessName"
                type="text"
                required
                placeholder="Atelier Lumiere Studio"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E2D6C8] bg-[#FCFBF9] px-4 py-3 text-sm text-[#1F1A1D] placeholder:text-[#A69A9E] focus:border-[#5E1929] focus:outline-none"
              />
            </div>
          )}

          {/* Optional Profile Image via ImgBB */}
          <div>
            <label
              htmlFor="profileImage"
              className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#3D3337]"
            >
              PROFILE IMAGE (OPTIONAL)
            </label>
            <label
              htmlFor="profileImage"
              className="mt-1.5 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-[#D8CBB8] bg-[#FCFBF9] px-4 py-2.5 text-xs text-[#6B5E62] transition hover:border-[#C59B47]"
            >
              <span className="truncate">
                {imageFile ? imageFile.name : "Upload profile photo (ImgBB)"}
              </span>
              <Upload className="h-4 w-4 shrink-0 text-[#5E1929]" />
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5E1929] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#46111E] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{loading ? "Creating Account..." : "Register Account"}</span>
          </button>
        </form>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E2D6C8] bg-white py-3 text-sm font-semibold text-[#1F1A1D] transition hover:border-[#C59B47] hover:bg-[#FCFBF9] disabled:opacity-60"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.3 0 6.08-1.09 8.1-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.22 1.18-3.24 0-5.99-2.19-6.97-5.13H1.02v3.14C3.05 21.2 7.24 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.03 14.04c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.18H1.02C.37 7.47 0 8.91 0 10.45s.37 2.98 1.02 4.27l4.01-3.14Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.79 0 3.41.62 4.68 1.82l3.51-3.51C18.07 1.19 15.3 0 12 0 7.24 0 3.05 2.8 1.02 6.82l4.01 3.14c.98-2.94 3.73-5.21 6.97-5.21Z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Sign In Link */}
        <p className="mt-6 text-center text-xs text-[#6B5E62]">
          Already registered?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-[#5E1929] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
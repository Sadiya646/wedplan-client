"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Upload, Loader2 } from "lucide-react";
import { signUp, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
      { method: "POST", body: formData }
    );
    const data = await res.json();
    if (!data.success) throw new Error("Image upload failed");
    return data.data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password Validation (Min 6 chars, 1 uppercase, 1 lowercase)
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
      toast.error("Password must be at least 6 characters with 1 uppercase & 1 lowercase letter.");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        imageUrl = await uploadToImgBB(imageFile);
      }

      const { error } = await signUp.email({
        email,
        password,
        name,
        image: imageUrl || undefined,
        // @ts-expect-error custom fields configured in Better Auth
        role,
        businessName: role === "vendor" ? businessName : "",
      });

      if (error) {
        toast.error(error.message || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully!");
      router.push(role === "vendor" ? "/dashboard/vendor" : "/dashboard/customer");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/`,
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#E6DCD2] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#5E1929] text-[#C59B47]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#5E1929]">Create Your Account</h1>
          <p className="mt-1 text-sm text-[#6B5E62]">Join WedPlan as a couple or wedding vendor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              required
              placeholder="Sadiya Tasnim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 border-[#E6DCD2]"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 border-[#E6DCD2]"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="Min 6 chars, 1 Uppercase, 1 Lowercase"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 border-[#E6DCD2]"
            />
          </div>

          {/* Account Role Selection */}
          <div>
            <Label>Account Role</Label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              {(["customer", "vendor"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-lg border py-2 text-sm font-medium capitalize transition ${
                    role === r
                      ? "border-[#5E1929] bg-[#5E1929] text-[#FAF7F2]"
                      : "border-[#E6DCD2] bg-[#FAF7F2] text-[#1F1A1D] hover:border-[#C59B47]"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {role === "vendor" && (
            <div>
              <Label htmlFor="businessName">Business / Brand Name</Label>
              <Input
                id="businessName"
                required
                placeholder="Royal Orchid Events"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 border-[#E6DCD2]"
              />
            </div>
          )}

          {/* Optional Profile Image */}
          <div>
            <Label htmlFor="profileImage">Profile Image (Optional)</Label>
            <label
              htmlFor="profileImage"
              className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#C59B47] bg-[#FAF7F2] px-3 py-2 text-sm text-[#6B5E62] hover:bg-[#F2E2E4]/30"
            >
              <Upload className="h-4 w-4 text-[#5E1929]" />
              <span className="truncate">
                {imageFile ? imageFile.name : "Choose image file..."}
              </span>
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#5E1929] text-[#FAF7F2] hover:bg-[#47111E]"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E6DCD2]" />
          <span className="text-xs uppercase text-[#6B5E62]">or</span>
          <div className="h-px flex-1 bg-[#E6DCD2]" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignUp}
          className="w-full rounded-full border-[#E6DCD2] text-[#1F1A1D] hover:bg-[#FAF7F2]"
        >
          Continue with Google
        </Button>

        <p className="mt-5 text-center text-sm text-[#6B5E62]">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-[#5E1929] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
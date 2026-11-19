import Navbar from "@/components/shared/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar user={{
          name: undefined,
          email: undefined,
          image: undefined,
          role: undefined
        }} />
        {children}
      </body>
    </html>
  );
}
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flaash-shell flex flex-col min-h-dvh">
      {children}
    </div>
  );
}

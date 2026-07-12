export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-grow bg-background text-foreground p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">TransitOps</h1>
        <p className="text-muted-foreground">Smart Transport Operations Platform.</p>
        <div className="p-4 border rounded-lg bg-card">
          <p className="font-mono text-sm text-card-foreground">Frontend scaffolded successfully.</p>
        </div>
      </div>
    </main>
  );
}

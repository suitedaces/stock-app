import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-background">
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              <span className="text-blue-800">Fin</span>tool
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your favorite stocks 
            </p>
          </div>
          
          <div className="hidden sm:block">
            <NewsletterButton />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto">
        <Dashboard />
      </main>
    </div>
  );
}

function NewsletterButton() {
  return (
    <a
      href="https://fintool.substack.com"
      className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 px-4 py-2 text-sm font-medium text-blue-900 transition-all hover:text-blue-600 dark:text-blue-200 dark:hover:text-blue-300"
    >
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 ring-1 ring-blue-200 dark:ring-blue-800 transition-all group-hover:ring-2" />
      <span>✨ Subscribe to the newsletter!</span>
      <span className="relative transition-transform group-hover:translate-x-1">→</span>
    </a>
  );
}

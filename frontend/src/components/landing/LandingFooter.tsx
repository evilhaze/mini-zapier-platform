export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <p className="text-sm font-semibold text-slate-900">Zyper</p>
            <p className="text-sm text-slate-600">
              Design, run and monitor automations with visual workflows, triggers, actions and execution history.
            </p>
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} Zyper. All rights reserved.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Product</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="text-slate-600 hover:text-slate-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#ai" className="text-slate-600 hover:text-slate-900">
                    AI assistant
                  </a>
                </li>
                <li>
                  <a href="/workflows" className="text-slate-600 hover:text-slate-900">
                    Workflows
                  </a>
                </li>
                <li>
                  <a href="/executions" className="text-slate-600 hover:text-slate-900">
                    Executions
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Resources</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#templates" className="text-slate-600 hover:text-slate-900">
                    Templates
                  </a>
                </li>
                <li>
                  <a href="/integrations" className="text-slate-600 hover:text-slate-900">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="/api-docs" className="text-slate-600 hover:text-slate-900">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Company</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/home" className="text-slate-600 hover:text-slate-900">
                    Go to app
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Legal</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-600 hover:text-slate-900">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


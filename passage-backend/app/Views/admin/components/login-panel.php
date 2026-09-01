<div class="w-full max-w-6xl h-full max-h-[720px] flex rounded-[28px] overflow-hidden bg-white shadow-2xl shadow-slate-900/10">
  <div class="photo-panel hidden md:flex md:w-3/5 relative h-full slide-left">
    <img src="/assets/admin/img/passage.png" alt="PASSAGE – safe school transport in Kampala">
    <div class="photo-overlay"></div>

    <div class="absolute top-8 left-8 flex items-center gap-2.5">
      <div class="passage-brand-mark w-8 h-8 rounded-lg flex items-center justify-center shadow-md">
        <span class="text-white font-black text-base">P</span>
      </div>
      <span class="text-white font-extrabold text-xl tracking-wider">PASSAGE</span>
    </div>

    <div class="photo-badge">
      <div class="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-xl">
        <div class="flex items-center gap-2 mb-3">
          <span class="pill"><span class="pill-dot"></span>Match Confirmed</span>
          <span class="pill">🛡 Safe Route</span>
        </div>
        <h2 class="text-white font-bold text-lg leading-snug tracking-tight">Safe, verified transport for every school child.</h2>
        <p class="text-slate-200 text-sm mt-1.5 font-medium opacity-90">Connecting families with trusted drivers across Kampala.</p>
      </div>
    </div>
  </div>

  <div class="w-full md:w-2/5 bg-white flex flex-col justify-between items-center px-8 py-10 sm:px-12 lg:px-16 h-full overflow-hidden">
    <div class="hidden sm:block"></div>

    <div class="w-full max-w-sm my-auto">
      <div class="text-center mb-8 fade-up fade-up-1">
        <h1 class="text-4xl font-black text-slate-900 tracking-tight">PASSAGE</h1>
        <p class="passage-muted-text text-sm mt-2 font-bold uppercase tracking-wider text-[11px]">Secure Admin Portal</p>
      </div>

      <div id="errorAlert" class="hidden mb-5 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold text-center shadow-sm">
        Invalid credentials. Please try again.
      </div>

      <form id="loginForm" class="space-y-5">
        <div class="fade-up fade-up-2">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email / Username</label>
          <input type="email" id="email" class="input-field w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm bg-slate-50 focus:bg-white" placeholder="admin@passage.example" required>
        </div>

        <div class="fade-up fade-up-3">
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Password</label>
          <div class="relative">
            <input type="password" id="password" class="input-field w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 text-sm bg-slate-50 focus:bg-white" placeholder="••••••••" required>
            <button type="button" id="togglePw" class="passage-accent-hover absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200" tabindex="-1">
              <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between fade-up fade-up-4 pt-1">
          <label class="flex items-center gap-2.5 cursor-pointer select-none">
            <input type="checkbox" id="rememberMe" class="passage-control-accent w-4 h-4 border-slate-300 rounded">
            <span class="text-sm text-slate-600 font-medium">Remember me</span>
          </label>
          <a href="#" class="passage-link text-sm font-bold transition-colors duration-200">Forgot password?</a>
        </div>

        <div class="fade-up fade-up-5 pt-2">
          <button type="submit" class="passage-primary-button btn-shine w-full hover:shadow-xl hover:shadow-emerald-500/20 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 transition-all duration-300 text-sm tracking-wide transform active:scale-[0.99]">
            Sign In to Passage
          </button>
        </div>
      </form>
    </div>

    <p class="text-center text-slate-400 text-xs font-medium fade-up fade-up-5 mt-auto">&copy; 2026 Cissy Technologies. All rights reserved.</p>
  </div>
</div>

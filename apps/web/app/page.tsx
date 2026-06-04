import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  const stats = [
    { label: "SPI Price", value: "$1.00", sub: "1:1 USD Peg · Enforced" },
    { label: "Active Fiats", value: "35", sub: "120+ at Singularity" },
    { label: "Total Apps", value: "1,000+", sub: "Target: 10,000" },
    { label: "Phase", value: "3", sub: "Singularity Expansion" },
    { label: "NexusLaw", value: "v6.1", sub: "Shariah · MiCA · FATF" },
    { label: "ASI Contracts", value: "v15.0.2", sub: "SAPIENS Audited" },
  ];

  const phase3Features = [
    { icon: "🌉", title: "Cross-Chain Bridge", desc: "Native $SPI ↔ 1000+ assets across EVM, Cosmos, Solana. MEV-0. No Pi Coin." },
    { icon: "🏦", title: "RWA Vault Factory", desc: "Tokenised T-bills, real estate, sukuk. All overcollateralised in $SPI." },
    { icon: "⚡", title: "Singularity Swap DEX", desc: "Zero slippage · Zero IL · CEX speed. $SPI base pair. Halal-only tokens." },
    { icon: "🤖", title: "Agent Swarm 8x", desc: "ARCHON-1…8 running 600K app builds / day. Phase 3: 6M / day target." },
    { icon: "🔐", title: "ZK Privacy Layer", desc: "Quantum-resistant vault, ZK domain separation, Groth16 on-chain verifier." },
    { icon: "⚖️", title: "Autonomous Compliance", desc: "LEX Machina enforces onlySuperPiTokens() on every deploy. Auto-certifies halal." },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-900/50 border border-indigo-500/30 rounded-full px-4 py-1 text-xs text-indigo-300 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Phase 3 · Singularity Expansion · Live
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-3">
            <span className="text-white">Super</span>
            <span className="text-indigo-400"> Pi</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            The most advanced Pi Coin ecosystem — $314,159 Pure Pi Stablecoin, permanent taint protection,
            full-stack blockchain infrastructure. <span className="text-red-400 font-semibold">Pi Coin: BANNED FOREVER.</span>
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {stats.map((s) => (
            <Card key={s.label} className="bg-gray-900/70 border-gray-700/50 backdrop-blur">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-indigo-300">{s.value}</div>
                <div className="text-xs font-semibold text-white mt-1">{s.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Phase 3 · Singularity Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {phase3Features.map((f) => (
              <Card key={f.title} className="bg-gray-900/70 border-indigo-800/30 backdrop-blur hover:border-indigo-500/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{f.icon}</span> {f.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Singularity Roadmap</h2>
          <div className="flex flex-col md:flex-row gap-3 justify-center">
            {[
              { phase: "Phase 1", status: "✅ Complete", desc: "50+ contracts · NexusLaw v6.1 · 1K app catalog" },
              { phase: "Phase 2", status: "✅ Complete", desc: "ASI v15.0.2 · SAPIENS audit · ZK privacy · RWA" },
              { phase: "Phase 3", status: "🔥 Active", desc: "Cross-chain bridge · DEX · RWA vaults · 6M apps/day" },
              { phase: "Phase 4", status: "🎯 Target", desc: "10K apps · 195 countries · Full Singularity" },
            ].map((r) => (
              <div key={r.phase} className={`flex-1 p-4 rounded-xl border ${r.status.includes("Active") ? "border-indigo-500 bg-indigo-900/30" : r.status.includes("Target") ? "border-gray-600 bg-gray-800/30" : "border-green-700/40 bg-green-900/10"}`}>
                <div className="text-xs font-bold text-gray-400 mb-1">{r.phase}</div>
                <div className="text-sm font-bold mb-1">{r.status}</div>
                <div className="text-xs text-gray-500">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs mb-4">
            Powered by NexusLaw v6.1 · ASI v15.0.2 · Agent Swarm 8× · Chronos Oracle 35-fiat feed
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Explore Dapps</Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">GitHub</Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">Docs</Button>
          </div>
        </div>
      </div>
    </main>
  );
}

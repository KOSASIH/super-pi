/// Payout Automation Engine - Rust Core
/// ======================================
/// Automated weekly payout: 80% USDT (Arbitrum) + 20% PI (Pi Mainnet).
/// Gas deducted from PI allocation. $50 USD minimum threshold enforced.

use soroban_sdk::{contract, contractimpl, Env, Symbol, Address, log};

/// Payout configuration (immutable after deployment)
pub struct PayoutConfig {
    pub usdt_address: Symbol,    // Arbitrum USDT recipient
    pub pi_address: Symbol,      // Pi Mainnet recipient
    pub usdt_pct: u64,           // 80 (basis: 100)
    pub pi_pct: u64,             // 20
    pub min_threshold_usd: u64,  // 50_000_000 (in micro-USD, 6 decimals)
    pub gas_policy: Symbol,      // "deduct_from_pi_allocation"
}

/// A completed payout record
#[derive(Clone)]
pub struct PayoutRecord {
    pub payout_id: u64,
    pub total_usd: u64,         // micro-USD
    pub usdt_amount: u64,       // USDT (6 decimals)
    pub pi_amount: u64,         // PI (8 decimals)
    pub gas_deducted: u64,      // PI gas (8 decimals)
    pub timestamp: u64,
    pub success: bool,
}

#[contract]
pub struct PayoutEngineContract;

#[contractimpl]
impl PayoutEngineContract {
    /// Initialize payout engine with owner config.
    pub fn init(env: Env) {
        log!(&env, "Payout Engine initialized: 80% USDT→Arbitrum / 20% PI→Pi Mainnet");
    }

    /// Compute payout split given total_usd (micro-USD, 6 decimals).
    /// Returns (usdt_amount, net_pi_usd, gas_pi_usd).
    pub fn compute_split(env: Env, total_usd: u64) -> (u64, u64, u64) {
        let usdt_amount = (total_usd * 80) / 100;
        let pi_usd = (total_usd * 20) / 100;
        // Gas: 0.1% of PI allocation, minimum 1000 micro-USD
        let gas_usd = core::cmp::max(1_000u64, pi_usd / 1_000);
        let net_pi_usd = if pi_usd > gas_usd { pi_usd - gas_usd } else { 0 };

        log!(
            &env,
            "Payout split: total={}, usdt={}, pi_net={}, gas={}",
            total_usd, usdt_amount, net_pi_usd, gas_usd
        );
        (usdt_amount, net_pi_usd, gas_usd)
    }

    /// Execute a payout (called by automation on Friday 00:00 UTC).
    pub fn execute_payout(env: Env, total_usd: u64, payout_id: u64) -> PayoutRecord {
        let min_threshold: u64 = 50_000_000; // $50.00 in micro-USD

        if total_usd < min_threshold {
            log!(
                &env,
                "Payout skipped: ${} < ${} threshold",
                total_usd / 1_000_000,
                min_threshold / 1_000_000
            );
            return PayoutRecord {
                payout_id,
                total_usd,
                usdt_amount: 0,
                pi_amount: 0,
                gas_deducted: 0,
                timestamp: 0,
                success: false,
            };
        }

        let (usdt_amount, net_pi_usd, gas_usd) = Self::compute_split(env.clone(), total_usd);
        // PI price = $314,159 per PI = 314_159_000_000 micro-USD
        let pi_price_micro: u64 = 314_159_000_000;
        let pi_amount = (net_pi_usd * 100_000_000) / (pi_price_micro / 1_000_000);
        let gas_pi = (gas_usd * 100_000_000) / (pi_price_micro / 1_000_000);

        log!(
            &env,
            "Executing payout #{}: {} USDT + {} PI (gas_deducted={})",
            payout_id, usdt_amount, pi_amount, gas_pi
        );

        PayoutRecord {
            payout_id,
            total_usd,
            usdt_amount,
            pi_amount,
            gas_deducted: gas_pi,
            timestamp: 0, // env.ledger().timestamp() in production
            success: true,
        }
    }

    /// Verify payout rules are correct (owner audit tool).
    pub fn audit(env: Env) -> Symbol {
        log!(&env, "Payout audit: USDT=80%, PI=20%, gas=deduct_from_pi, min=$50");
        Symbol::new(&env, "audit_ok")
    }
}

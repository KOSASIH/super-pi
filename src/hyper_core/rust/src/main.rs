use soroban_sdk::Env;

mod lib; // Import lib.rs

fn main() {
    let env = Env::default();
    let ecosystem = lib::SuperPiEcosystem::init(env.clone());
    lib::SuperPiEcosystem::run_full_super_pi_ecosystem(env.clone());
    let status = lib::SuperPiEcosystem::get_ecosystem_status(env);
    println!("Ecosystem Status: {:?}", status);
}

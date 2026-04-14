// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title GlobalFiatRegistry — 195-Country Fiat Currency Interoperability Layer
 * @notice On-chain registry of all world fiat currencies approved for Bridge-Qirad.
 *         Manages exchange rates, settlement windows, partner banks, and geo-compliance.
 *         T+0: USD, EUR, IDR live.
 *         T+90d: 50+ fiats.
 *         T+12m: All 195 countries with local fiat support.
 *
 * @author NEXUS Prime / KOSASIH
 * @custom:version 1.0.0
 */

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract GlobalFiatRegistry is AccessControl, Pausable {

    bytes32 public constant RATE_ORACLE_ROLE  = keccak256("RATE_ORACLE_ROLE");
    bytes32 public constant LEX_MACHINA_ROLE  = keccak256("LEX_MACHINA_ROLE");
    bytes32 public constant BRIDGE_ROLE       = keccak256("BRIDGE_ROLE");
    bytes32 public constant PAUSER_ROLE       = keccak256("PAUSER_ROLE");

    // ── Settlement Windows ─────────────────────────────────────────────
    enum SettlementWindow { INSTANT, H0, H2, T1, T2 }

    // ── Fiat Currency Record ──────────────────────────────────────────
    struct FiatCurrency {
        bytes4  code;            // e.g. "USD ", "EUR ", "IDR "
        string  name;            // e.g. "US Dollar"
        uint16  countryCode;     // ISO 3166-1 numeric
        uint256 usdRateMicros;   // How many of this currency = 1 USD (6 decimal precision)
        uint256 lastUpdated;
        SettlementWindow settlement;
        bool    active;
        bool    regulated;       // Is the fiat partner bank regulated?
        string  partnerBank;     // Name of regulated partner (not sensitive)
        uint256 dailyLimitUsd;   // Max daily conversion per user in USD micros
        uint256 minTxUsd;        // Minimum transaction in USD micros
        bool    requiresKyc;     // Does this fiat rail require KYC?
        bool    blockedForSanctions; // FATF/OFAC blacklisted
    }

    // ── Country Record ────────────────────────────────────────────────
    struct Country {
        uint16  code;            // ISO 3166-1 numeric
        string  name;
        bytes4  primaryFiat;
        bool    lexApproved;     // LEX Machina approved for Super Apps
        bool    micaRegion;      // MiCA regulatory zone
        bool    sanctioned;      // OFAC/FATF blacklist
        string  regulatorName;   // Local financial regulator
    }

    // ── State ──────────────────────────────────────────────────────────
    mapping(bytes4 => FiatCurrency) public fiats;
    mapping(uint16 => Country)      public countries;
    bytes4[] public activeFiats;
    uint256  public totalActiveFiats;

    uint256 public constant RATE_STALENESS_LIMIT = 4 hours;

    // ── Events ────────────────────────────────────────────────────────
    event FiatAdded(bytes4 indexed code, string name, uint256 usdRate);
    event FiatRateUpdated(bytes4 indexed code, uint256 oldRate, uint256 newRate, uint256 timestamp);
    event FiatSuspended(bytes4 indexed code, string reason);
    event CountryRegistered(uint16 indexed countryCode, string name, bytes4 primaryFiat);
    event CountryApproved(uint16 indexed countryCode, bool lexApproved);

    error FiatNotActive(bytes4 code);
    error RateStale(bytes4 code, uint256 lastUpdated);
    error FiatSanctioned(bytes4 code);
    error CountrySanctioned(uint16 countryCode);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(RATE_ORACLE_ROLE, admin);
        _grantRole(LEX_MACHINA_ROLE, admin);
        _grantRole(BRIDGE_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);

        _bootstrapT0Fiats();
        _bootstrapT90Fiats();
        _bootstrapCountries();
    }

    // ── Rate Query ────────────────────────────────────────────────────
    /**
     * @notice Get the current USD rate for a fiat. Reverts if stale or inactive.
     * @param code 4-byte fiat code (e.g. "IDR ")
     * @return rateUsdMicros Amount of this fiat = 1 USD (6 decimal precision)
     */
    function getRate(bytes4 code) external view returns (uint256 rateUsdMicros) {
        FiatCurrency storage f = fiats[code];
        if (!f.active) revert FiatNotActive(code);
        if (f.blockedForSanctions) revert FiatSanctioned(code);
        if (block.timestamp - f.lastUpdated > RATE_STALENESS_LIMIT) revert RateStale(code, f.lastUpdated);
        return f.usdRateMicros;
    }

    /**
     * @notice Convert USD micros to fiat amount.
     */
    function usdToFiat(bytes4 code, uint256 usdMicros) external view returns (uint256 fiatAmount) {
        uint256 rate = this.getRate(code);
        return (usdMicros * rate) / 1_000_000;
    }

    /**
     * @notice Convert fiat amount to USD micros.
     */
    function fiatToUsd(bytes4 code, uint256 fiatAmount) external view returns (uint256 usdMicros) {
        uint256 rate = this.getRate(code);
        if (rate == 0) return 0;
        return (fiatAmount * 1_000_000) / rate;
    }

    // ── Rate Oracle Update ────────────────────────────────────────────
    function updateRate(bytes4 code, uint256 newRateMicros)
        external
        onlyRole(RATE_ORACLE_ROLE)
    {
        FiatCurrency storage f = fiats[code];
        require(f.active, "Fiat not registered");
        uint256 old = f.usdRateMicros;
        f.usdRateMicros = newRateMicros;
        f.lastUpdated   = block.timestamp;
        emit FiatRateUpdated(code, old, newRateMicros, block.timestamp);
    }

    function batchUpdateRates(bytes4[] calldata codes, uint256[] calldata rates)
        external
        onlyRole(RATE_ORACLE_ROLE)
    {
        require(codes.length == rates.length, "Length mismatch");
        for (uint i = 0; i < codes.length; i++) {
            if (fiats[codes[i]].active) {
                fiats[codes[i]].usdRateMicros = rates[i];
                fiats[codes[i]].lastUpdated   = block.timestamp;
                emit FiatRateUpdated(codes[i], 0, rates[i], block.timestamp);
            }
        }
    }

    // ── Add New Fiat ──────────────────────────────────────────────────
    function addFiat(
        bytes4  code,
        string calldata name,
        uint16  countryCode,
        uint256 usdRateMicros,
        SettlementWindow settlement,
        string calldata partnerBank,
        uint256 dailyLimitUsd,
        uint256 minTxUsd,
        bool    requiresKyc
    )
        external
        onlyRole(LEX_MACHINA_ROLE)
    {
        fiats[code] = FiatCurrency({
            code:          code,
            name:          name,
            countryCode:   countryCode,
            usdRateMicros: usdRateMicros,
            lastUpdated:   block.timestamp,
            settlement:    settlement,
            active:        true,
            regulated:     true,
            partnerBank:   partnerBank,
            dailyLimitUsd: dailyLimitUsd,
            minTxUsd:      minTxUsd,
            requiresKyc:   requiresKyc,
            blockedForSanctions: false
        });
        activeFiats.push(code);
        totalActiveFiats++;
        emit FiatAdded(code, name, usdRateMicros);
    }

    // ── Approve Country ───────────────────────────────────────────────
    function approveCountry(uint16 countryCode, bool approved)
        external
        onlyRole(LEX_MACHINA_ROLE)
    {
        countries[countryCode].lexApproved = approved;
        emit CountryApproved(countryCode, approved);
    }

    // ── View ──────────────────────────────────────────────────────────
    function getAllActiveFiats() external view returns (bytes4[] memory) {
        return activeFiats;
    }

    function isCountryApproved(uint16 countryCode) external view returns (bool) {
        Country storage c = countries[countryCode];
        return c.lexApproved && !c.sanctioned;
    }

    // ── Bootstrap: T+0 (Mandatory Day 1) ─────────────────────────────
    function _bootstrapT0Fiats() internal {
        _addFiat("USD ", "US Dollar",          840, 1_000_000,  SettlementWindow.INSTANT, "JPMC / Silvergate", 100_000_000_000, 1_000_000, false);
        _addFiat("EUR ", "Euro",                978, 1_080_000,  SettlementWindow.INSTANT, "Solarisbank",       100_000_000_000, 1_000_000, false);
        _addFiat("IDR ", "Indonesian Rupiah",   360, 16300_000_000, SettlementWindow.H0,  "BCA / Mandiri",      50_000_000_000, 10_000_000, true);
    }

    // ── Bootstrap: T+90d (50+ Fiats) ─────────────────────────────────
    function _bootstrapT90Fiats() internal {
        _addFiat("SGD ", "Singapore Dollar",    702, 1_340_000,   SettlementWindow.INSTANT, "DBS Bank",          50_000_000_000, 1_000_000,  false);
        _addFiat("JPY ", "Japanese Yen",        392, 149_000_000, SettlementWindow.H0,      "MUFG",             100_000_000_000, 1_000_000,  false);
        _addFiat("GBP ", "British Pound",       826, 795_000,     SettlementWindow.INSTANT, "Barclays",         100_000_000_000, 1_000_000,  false);
        _addFiat("AED ", "UAE Dirham",          784, 3_670_000,   SettlementWindow.H0,      "FAB / ENBD",        50_000_000_000, 1_000_000,  true);
        _addFiat("SAR ", "Saudi Riyal",         682, 3_750_000,   SettlementWindow.H0,      "Al Rajhi Bank",     50_000_000_000, 1_000_000,  true);
        _addFiat("MYR ", "Malaysian Ringgit",   458, 4_480_000,   SettlementWindow.H0,      "Maybank",           30_000_000_000, 1_000_000,  true);
        _addFiat("INR ", "Indian Rupee",        356, 83_000_000,  SettlementWindow.T1,      "HDFC Bank",         20_000_000_000, 1_000_000,  true);
        _addFiat("BRL ", "Brazilian Real",       76, 5_000_000,   SettlementWindow.T1,      "Nubank",            20_000_000_000, 1_000_000,  true);
        _addFiat("CNY ", "Chinese Yuan",        156, 7_240_000,   SettlementWindow.H2,      "CITIC Bank",        50_000_000_000, 1_000_000,  true);
        _addFiat("KRW ", "South Korean Won",    410, 1_320_000_000, SettlementWindow.H0,   "Kakao Bank",        30_000_000_000, 1_000_000,  false);
        _addFiat("AUD ", "Australian Dollar",    36, 1_530_000,   SettlementWindow.INSTANT, "CBA",              100_000_000_000, 1_000_000,  false);
        _addFiat("CAD ", "Canadian Dollar",     124, 1_360_000,   SettlementWindow.INSTANT, "TD Bank",          100_000_000_000, 1_000_000,  false);
        _addFiat("CHF ", "Swiss Franc",         756, 890_000,     SettlementWindow.INSTANT, "UBS",              100_000_000_000, 1_000_000,  false);
        _addFiat("TRY ", "Turkish Lira",        792, 32_000_000,  SettlementWindow.T1,      "Ziraat Bank",       10_000_000_000, 1_000_000,  true);
        _addFiat("NGN ", "Nigerian Naira",      566, 1_600_000_000, SettlementWindow.H2,   "GTBank",            10_000_000_000, 100_000,    true);
        _addFiat("PHP ", "Philippine Peso",     608, 56_000_000,  SettlementWindow.H0,      "BDO / GCash",       10_000_000_000, 1_000_000,  true);
        _addFiat("THB ", "Thai Baht",           764, 35_000_000,  SettlementWindow.H0,      "Kasikorn Bank",     20_000_000_000, 1_000_000,  false);
        _addFiat("VND ", "Vietnamese Dong",     704, 24_000_000_000, SettlementWindow.H2,  "Vietcombank",        5_000_000_000, 100_000,    true);
        _addFiat("BDT ", "Bangladeshi Taka",     50, 110_000_000, SettlementWindow.H2,      "Dutch-Bangla Bank",  5_000_000_000, 1_000_000,  true);
        _addFiat("PKR ", "Pakistani Rupee",     586, 280_000_000, SettlementWindow.T1,      "HBL",                5_000_000_000, 1_000_000,  true);
        _addFiat("EGP ", "Egyptian Pound",      818, 48_000_000,  SettlementWindow.T1,      "CIB Egypt",          5_000_000_000, 1_000_000,  true);
        _addFiat("ZAR ", "South African Rand",  710, 18_500_000,  SettlementWindow.T1,      "Standard Bank",     10_000_000_000, 1_000_000,  false);
        _addFiat("MXN ", "Mexican Peso",        484, 17_000_000,  SettlementWindow.T1,      "BBVA Mexico",       20_000_000_000, 1_000_000,  false);
        _addFiat("HKD ", "Hong Kong Dollar",    344, 7_810_000,   SettlementWindow.H0,      "HSBC HK",          100_000_000_000, 1_000_000,  false);
    }

    function _bootstrapCountries() internal {
        // T+0 mandatory
        _addCountry(840, "United States",  "USD ", true, false, false, "FinCEN / OCC");
        _addCountry(276, "Germany",        "EUR ", true, true,  false, "BaFin");
        _addCountry(360, "Indonesia",      "IDR ", true, false, false, "OJK / Bank Indonesia");
        _addCountry(702, "Singapore",      "SGD ", true, false, false, "MAS");
        _addCountry(392, "Japan",          "JPY ", true, false, false, "FSA Japan");
        _addCountry(826, "United Kingdom", "GBP ", true, true,  false, "FCA");
        _addCountry(784, "UAE",            "AED ", true, false, false, "CBUAE");
        _addCountry(682, "Saudi Arabia",   "SAR ", true, false, false, "SAMA");
        _addCountry(458, "Malaysia",       "MYR ", true, false, false, "BNM");
        _addCountry(356, "India",          "INR ", true, false, false, "RBI");
        _addCountry(410, "South Korea",    "KRW ", true, false, false, "FSC Korea");
        _addCountry(554, "China",          "CNY ", false, false, false, "PBOC"); // Restricted
        // Sanctioned countries
        _addCountry(408, "North Korea",    "KPW ", false, false, true, "SANCTIONED");
        _addCountry(364, "Iran",           "IRR ", false, false, true, "SANCTIONED");
        _addCountry(760, "Syria",          "SYP ", false, false, true, "SANCTIONED");
    }

    function _addFiat(
        bytes4 code, string memory name, uint16 cCode, uint256 rate,
        SettlementWindow sw, string memory bank, uint256 daily, uint256 min, bool kyc
    ) internal {
        fiats[code] = FiatCurrency({
            code: code, name: name, countryCode: cCode, usdRateMicros: rate,
            lastUpdated: block.timestamp, settlement: sw, active: true, regulated: true,
            partnerBank: bank, dailyLimitUsd: daily, minTxUsd: min, requiresKyc: kyc,
            blockedForSanctions: false
        });
        activeFiats.push(code);
        totalActiveFiats++;
    }

    function _addCountry(
        uint16 code, string memory name, bytes4 fiat,
        bool approved, bool mica, bool sanctioned, string memory regulator
    ) internal {
        countries[code] = Country({
            code: code, name: name, primaryFiat: fiat, lexApproved: approved,
            micaRegion: mica, sanctioned: sanctioned, regulatorName: regulator
        });
    }

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }
}

// Easy Partner Integration - Copy & Paste
export const PI_PARTNER_SDK = {
  displayPiValue: (piAmount: number | string) => {
    const amount = BigInt(piAmount);
    return StablecoinValueEnforcer.getPiValueDisplay(amount);
  },

  createPiButton: (amount: number, onClick: () => void) => {
    const value = StablecoinValueEnforcer.formatPiValue(BigInt(amount));
    return `
      <button onclick="${onClick.toString()}" 
              class="pi-stablecoin-btn bg-emerald-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-emerald-700">
        ${amount} 🌟Pi = ${value}
      </button>
    `;
  },

  // i18n Support
  getLocalizedValue: (amount: bigint, locale: string = 'en-US') => {
    return StablecoinValueEnforcer.formatPiValue(amount, 'USD');
  }
};

// Usage for partners:
// <script src="pi-partner-sdk.js"></script>
// PI_PARTNER_SDK.displayPiValue(1000) => "1,000 🌟Pi = $314,159,000 (Pure Pi Stablecoin)"

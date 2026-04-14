# $SPI Official Brand Guide — V1
**OFFICIAL_SPI_LOGO_V1** · AESTHETE Nexus · 2026-04-14

---

## 1. Logo

### 1.1 The Official $SPI Logo
The $SPI logo is a futuristic coin/medallion depicting Earth rendered in metallic circuit-board relief,
set within a cosmic deep-space background. It conveys globalism, advanced technology, ethical finance,
and universal connectivity — the core values of Super Pi Foundation.

### 1.2 Canonical Sources

| Format | CDN URL | Use Case |
|--------|---------|----------|
| SVG (canonical) | `https://cdn.superpi.id/token/SPI.svg` | All digital use |
| PNG 512×512 | `https://cdn.superpi.id/token/SPI_512.png` | High-res, App Stores |
| PNG 256×256 | `https://cdn.superpi.id/token/SPI_256.png` | Web, Dashboard |
| PNG 128×128 | `https://cdn.superpi.id/token/SPI_128.png` | Standard web icon |
| PNG 64×64 | `https://cdn.superpi.id/token/SPI_64.png` | Thumbnail, list view |
| PNG 32×32 | `https://cdn.superpi.id/token/SPI_32.png` | Favicon, small icon |

> ⚠️ **IMMUTABILITY RULE**: Always fetch from canonical CDN. Never host local copies without registry sync.

### 1.3 Repository Path
```
assets/tokens/SPI.svg          ← canonical SVG
assets/tokens/SPI.png          ← master PNG (512×512)
assets/tokens/SPI_512.png
assets/tokens/SPI_256.png
assets/tokens/SPI_128.png
assets/tokens/SPI_64.png
assets/tokens/SPI_32.png
```

---

## 2. Brand Colors

| Role | Name | Hex | Usage |
|------|------|-----|-------|
| Primary | Deep Space Black | `#0A0A1A` | Backgrounds, dark UI |
| Secondary | Antique Gold | `#B8960C` | Headlines, borders, coin rim |
| Accent 1 | Teal Circuit | `#00CED1` | CTAs, links, highlights |
| Accent 2 | Cosmic Indigo | `#9B59B6` | Gradients, cards |
| Accent 3 | Metallic Shimmer | `#F0E68C` | Hover states, glow effects |
| Background | Cosmos Black | `#050510` | Page backgrounds |

### CSS Variables
```css
:root {
  --spi-primary:    #0A0A1A;
  --spi-secondary:  #B8960C;
  --spi-accent1:    #00CED1;
  --spi-accent2:    #9B59B6;
  --spi-accent3:    #F0E68C;
  --spi-bg:         #050510;
}
```

### Tailwind Config
```js
colors: {
  'spi-primary':   '#0A0A1A',
  'spi-gold':      '#B8960C',
  'spi-teal':      '#00CED1',
  'spi-indigo':    '#9B59B6',
  'spi-shimmer':   '#F0E68C',
  'spi-bg':        '#050510',
}
```

---

## 3. Safe Space & Clear Zone

```
┌──────────────────────────┐
│   ← 1× logo width →      │
│                          │
│   ┌──────────────────┐   │
│ ↑ │                  │ ↑ │
│1× │   $SPI LOGO      │1× │
│ ↓ │                  │ ↓ │
│   └──────────────────┘   │
│                          │
└──────────────────────────┘
  Minimum clear zone = 1× the logo's own width/height on all sides.
```

---

## 4. Minimum Size

| Surface | Minimum Size |
|---------|-------------|
| Digital (screen) | 32×32 px |
| App icon | 64×64 px |
| Print | 12mm × 12mm |
| Favicon | 16×16 px (use simplified variant) |

---

## 5. Usage Rules (SAPIENS Guardian enforced)

### ✅ Approved
- Use the logo on dark (#0A0A1A or similar) backgrounds
- Use with gold (#B8960C) typography for `$SPI` text
- Display at any approved size ≥ 32px
- Always fetch from canonical CDN

### ❌ Prohibited
- Do NOT modify, crop, recolor, or distort the logo
- Do NOT combine with gambling, riba, alcohol, or prohibited symbols
- Do NOT use on a white/light background without the official light variant (TBD)
- Do NOT host unofficial variants — SAPIENS auto-scan purges them T+24h
- Do NOT create "$SPI" logos outside this canonical version

---

## 6. Dark/Light Mode

| Mode | Background | Logo Variant |
|------|-----------|-------------|
| Dark (default) | `#050510` | OFFICIAL_SPI_LOGO_V1 (full color) |
| Light | `#F8F8FF` | OFFICIAL_SPI_LOGO_V1 (full color on card) |

> Note: The logo naturally suits dark backgrounds. On light backgrounds, place inside a dark circular badge.

---

## 7. Typography Pairing

| Use | Font | Weight | Color |
|-----|------|--------|-------|
| `$SPI` brand mark | Inter / Space Grotesk | 700 Bold | `#B8960C` (gold) |
| Sub-heading | Inter | 600 SemiBold | `#00CED1` (teal) |
| Body | Inter | 400 Regular | `#E0E0E0` |

---

## 8. Compliance

| Attribute | Value |
|-----------|-------|
| SAPIENS Guardian | ✅ PASSED |
| Gambling content | 0 |
| Riba/interest symbols | 0 |
| Adult content | 0 |
| Pi Coin branding | 0 |
| Shariah compliance | ✅ |
| NexusLaw version | v2.1 |
| Authorized by | Founder KOSASIH · NEXUS Prime v2.2 |
| Registration date | 2026-04-14 |

---

## 9. Propagation Status

| Surface | Deadline | Status |
|---------|----------|--------|
| GitHub repo assets/ | T+1h | ✅ Complete |
| SuperApp SDK `/assets/tokens/` | T+1h | ✅ Committed |
| tokenURI metadata ($SPI ERC20) | T+1h | ✅ Committed |
| Super Pi Wallet, Explorer, Bridge-Qirad UI | T+1h | 🔄 Pending CDN deploy |
| All 100,000 Super App icons | T+24h | 🔄 ARCHON × 1,000 propagating |
| CoinGecko / CoinMarketCap API | T+24h | 🔄 OMEGA DeFi channel |
| App Store icons | T+24h | 🔄 VULCAN Deploy pipeline |

---

*AESTHETE Nexus — Chief Design · Super Pi Foundation*  
*Authorized: NEXUS Prime v2.2 · Founder KOSASIH · 2026-04-14*

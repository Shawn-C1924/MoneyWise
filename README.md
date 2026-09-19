# MoneyWise

MoneyWise is a lightweight, mobile-first personal budgeting and savings-planning Progressive Web App.

## Project aim

MoneyWise helps users:

- Track everyday and discretionary spending.
- Separate planned essentials from additional spending.
- Manage monthly allowances and carry unused amounts forward.
- Review spending by month with clear under/over indicators.
- Add, edit and manage recurring expenses and gift budgets.
- Build savings plans over a configurable timeframe.
- Compare a normal projected outcome with an essentials-only outcome.
- Adjust timeframe, starting savings, income, targets and monthly allowances.
- Use the app on iPhone through Safari and Add to Home Screen.
- Keep personal financial data stored locally on the user's device.

## Privacy

This public repository contains application code and generic project assets only.

Personal financial assumptions are not embedded in the public source. On first launch, MoneyWise asks the user to enter their own values. Those values are stored in the device/browser's local storage and are not uploaded to this repository.

Do not commit exported personal data or screenshots containing private financial information.

## Running

MoneyWise is a static PWA and can be hosted on GitHub Pages or another static HTTPS host.

On iPhone, open the hosted site in Safari and choose **Share → Add to Home Screen**.

## Files

- `index.html` — application interface and logic
- `manifest.webmanifest` — PWA metadata
- `sw.js` — service worker/offline cache
- `icon-192.png` / `icon-512.png` — MoneyWise Home Screen icons
- `README.md` — public project documentation

## Assets

The MoneyWise coin-stack and growth-arrow logo is included as the PWA/Home Screen icon.

Private financial screenshots and personal sample values are intentionally not included in the public project.

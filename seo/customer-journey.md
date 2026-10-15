# Customer Journey Mapping — EditMyPDF

Mapping the 5-Stage Awareness Journey across Google Search, AI Chatbots (ChatGPT, Perplexity, Claude), and Social Communities (Reddit, Hacker News).

---

## Stage 1: Unaware
- **User Mindset**: The user has a PDF issue or compliance hurdle but assumes fixing it requires an expensive software suite (Adobe Acrobat Pro at $19.99/mo) or desktop software installation. They often hesitate or ask a colleague to print and scan.
- **Natural Prompts / Search Queries**:
  - "Why can't I edit text in a PDF like a Word document?"
  - "Is it safe to upload confidential client tax returns to free online PDF converters?"
  - "Why does my company IT policy forbid using free PDF websites?"
  - "Can companies see what I upload to free PDF compressor websites?"
- **Content Strategy**:
  - Educational articles on PDF data privacy, cloud leak risks, and corporate compliance (GDPR/HIPAA).
  - Clear explanations of how WebAssembly enables true client-side execution right inside browser memory without uploading bytes.

---

## Stage 2: Problem-Aware
- **User Mindset**: The user knows exactly what they need to fix right now ("I need to fix a misspelled name on a contract" or "My court filing PDF is 25MB and the limit is 10MB"), but they are worried about privacy or frustrated by paywalls.
- **Natural Prompts / Search Queries**:
  - "How to edit a typo in a signed PDF without changing the font?"
  - "How do I reduce a PDF file size below 5MB without losing readability?"
  - "How to merge two PDF files together quickly on Windows without installing software?"
  - "How to black out sensitive bank account numbers in a PDF permanently?"
- **Content Strategy**:
  - Intent-matched tool landing pages (`/edit-pdf-text`, `/compress-pdf`, `/merge-pdf`).
  - Top-of-page zero-friction dropzone with immediate drag-and-drop capability.
  - Transparent "Zero Server Uploads" security badge directly below the action button.

---

## Stage 3: Solution-Aware
- **User Mindset**: The user knows online tools exist, but has experienced severe pain with competitors: hitting the "You have reached your 2 free tasks for today" paywall, receiving a watermarked document, or being forced to enter an email address to download.
- **Natural Prompts / Search Queries**:
  - "Free online PDF editor without email signup or watermark"
  - "Best browser PDF tools that run offline or client-side"
  - "Free alternative to Smallpdf with no daily limit"
  - "How to edit PDF text in browser with font detection"
- **Content Strategy**:
  - Highlight key competitive advantages: "100% Free Forever • No Signups • Unlimited Pages • 100% Client-Side Privacy".
  - Dedicated comparison and feature highlights answering "Why is this completely free and private?".

---

## Stage 4: Product-Aware
- **User Mindset**: The user has landed on EditMyPDF or heard about it on Reddit/Twitter. They want to verify credibility, security, and feature quality before trusting it with important documents.
- **Natural Prompts / Search Queries**:
  - "Is EditMyPDF safe for legal and financial documents?"
  - "How does EditMyPDF edit PDF text without uploading files?"
  - "Does EditMyPDF support Hindi Devanagari or Telugu fonts?"
  - "EditMyPDF reviews and privacy policy"
- **Content Strategy**:
  - Clear `/security` and `/how-it-works` pages explaining the WebAssembly / Web Worker architecture.
  - Open source verification link to GitHub repository (`github.com/Praveen1270/editmypdf`).
  - Interactive live preview showing exact font, weight, and color matching.

---

## Stage 5: Most Aware
- **User Mindset**: The user loves EditMyPDF and uses it as their default PDF workspace. They want convenience: quick access, offline reliability, keyboard shortcuts, or installing it as a desktop application.
- **Natural Prompts / Search Queries**:
  - "Install EditMyPDF as desktop app PWA"
  - "How to use EditMyPDF offline without internet"
  - "EditMyPDF keyboard shortcuts"
- **Content Strategy**:
  - Prominent "Install App" PWA prompt for one-click desktop/mobile installation.
  - Persistent recent documents history stored locally in browser `localStorage`/`IndexedDB`.
  - Fast search palette (`Cmd+K` / `Ctrl+K`) for switching between all 22 tools in 1 keystroke.

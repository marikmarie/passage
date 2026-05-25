const fs = require('fs');
const path = require('path');

// For now, we'll use a simple approach with Tailwind CDN output
// In production, you would use the full Tailwind build process

const tailwindOutput = `
/* Tailwind CSS v4 - Production Build */
/* This file should be generated via: npm run css:build */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  color: #1f2937;
  background-color: #ffffff;
}

/* Tailwind base utilities will be inserted here */
body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }

/* Grid System */
.grid { display: grid; }
.gap-6 { gap: 1.5rem; }
.gap-4 { gap: 1rem; }
.gap-3 { gap: 0.75rem; }
.gap-2 { gap: 0.5rem; }

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Flexbox */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-1 { flex: 1 1 0%; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.justify-start { justify-content: flex-start; }
.justify-end { justify-content: flex-end; }
.gap-1 { gap: 0.25rem; }

/* Width & Height */
.w-64 { width: 16rem; }
.w-full { width: 100%; }
.w-10 { width: 2.5rem; }
.w-8 { width: 2rem; }
.w-16 { width: 4rem; }
.h-screen { height: 100vh; }
.h-2 { height: 0.5rem; }
.h-10 { height: 2.5rem; }
.h-96 { height: 24rem; }

/* Padding */
.p-0 { padding: 0; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }
.p-6 { padding: 1.5rem; }
.p-8 { padding: 2rem; }
.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }

/* Margin */
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }

/* Background Colors */
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-600 { background-color: #4b5563; }
.bg-emerald-50 { background-color: #f0fdf4; }
.bg-emerald-100 { background-color: #dcfce7; }
.bg-emerald-500 { background-color: #10b981; }
.bg-emerald-600 { background-color: #059669; }
.bg-emerald-700 { background-color: #047857; }
.bg-blue-50 { background-color: #eff6ff; }
.bg-blue-100 { background-color: #dbeafe; }
.bg-blue-600 { background-color: #2563eb; }
.bg-purple-50 { background-color: #faf5ff; }
.bg-purple-100 { background-color: #f3e8ff; }
.bg-purple-600 { background-color: #9333ea; }
.bg-yellow-50 { background-color: #fefce8; }
.bg-yellow-100 { background-color: #fef08a; }
.bg-yellow-500 { background-color: #eab308; }
.bg-yellow-600 { background-color: #ca8a04; }
.bg-red-50 { background-color: #fef2f2; }
.bg-red-100 { background-color: #fee2e2; }
.bg-red-600 { background-color: #dc2626; }
.bg-green-50 { background-color: #f0fdf4; }
.bg-green-100 { background-color: #dcfce7; }
.bg-green-600 { background-color: #16a34a; }

/* Text Colors */
.text-white { color: #ffffff; }
.text-gray-50 { color: #f9fafb; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-700 { color: #374151; }
.text-gray-900 { color: #111827; }
.text-emerald-50 { color: #f0fdf4; }
.text-emerald-600 { color: #059669; }
.text-emerald-700 { color: #047857; }
.text-emerald-800 { color: #065f46; }
.text-blue-700 { color: #1d4ed8; }
.text-purple-700 { color: #7e22ce; }
.text-yellow-600 { color: #ca8a04; }
.text-yellow-700 { color: #b45309; }
.text-red-600 { color: #dc2626; }
.text-red-700 { color: #b91c1c; }
.text-red-800 { color: #991b1b; }
.text-green-700 { color: #15803d; }

/* Font Sizes */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }

/* Font Weight */
.font-normal { font-weight: 400; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-black { font-weight: 900; }

/* Border */
.border { border-width: 1px; border-color: #e5e7eb; }
.border-t { border-top-width: 1px; border-color: #e5e7eb; }
.border-b { border-bottom-width: 1px; border-color: #e5e7eb; }
.border-r { border-right-width: 1px; border-color: #e5e7eb; }
.border-l { border-left-width: 1px; border-color: #e5e7eb; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-emerald-200 { border-color: #a7f3d0; }
.border-red-200 { border-color: #fecaca; }

/* Rounded */
.rounded { border-radius: 0.25rem; }
.rounded-lg { border-radius: 0.5rem; }
.rounded-xl { border-radius: 0.75rem; }
.rounded-full { border-radius: 9999px; }

/* Shadows */
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }

/* Display */
.hidden { display: none; }
.block { display: block; }
.inline-block { display: inline-block; }
.inline { display: inline; }

/* Position */
.fixed { position: fixed; }
.absolute { position: absolute; }
.relative { position: relative; }
.static { position: static; }

/* Overflow */
.overflow-hidden { overflow: hidden; }
.overflow-y-auto { overflow-y: auto; }
.overflow-x-auto { overflow-x: auto; }
.overflow-scroll { overflow: scroll; }

/* Transitions */
.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }

/* Hover States */
.hover\\:bg-gray-50:hover { background-color: #f9fafb; }
.hover\\:bg-gray-100:hover { background-color: #f3f4f6; }
.hover\\:bg-emerald-50:hover { background-color: #f0fdf4; }
.hover\\:bg-emerald-100:hover { background-color: #dcfce7; }
.hover\\:bg-emerald-700:hover { background-color: #047857; }
.hover\\:bg-red-100:hover { background-color: #fee2e2; }
.hover\\:text-emerald-800:hover { color: #065f46; }
.hover\\:text-gray-800:hover { color: #1f2937; }

/* Divide */
.divide-y { border-bottom-width: 1px; }
.divide-y > * + * { border-top-width: 1px; border-top-color: #e5e7eb; }

/* Tracking */
.tracking-wide { letter-spacing: 0.025em; }

/* Uppercase */
.uppercase { text-transform: uppercase; }

/* Table Styles */
table { width: 100%; border-collapse: collapse; }
thead { background-color: #f9fafb; }
tbody tr { border-bottom: 1px solid #e5e7eb; }
tbody tr:hover { background-color: #f9fafb; }
`;

const outputPath = path.join(__dirname, 'admin-dashboard', 'assets', 'css', 'output.css');
fs.writeFileSync(outputPath, tailwindOutput);
console.log('✓ CSS file generated at:', outputPath);

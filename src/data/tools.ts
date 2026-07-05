export interface Tool {
  title: string;
  description: string;
  icon: string;
  href: string;
}

export const toolsByCategory: Record<string, Tool[]> = {
  "developer": [
  {
    title: 'Code Minifier',
    description: 'Instantly minify HTML, CSS, and JavaScript. Remove whitespace, comments, and optimize your code for production.',
    icon: '🗜️',
    href: '/developer/code-minifier'
  },
  {
    title: 'Markdown to HTML Converter',
    description: 'Convert Markdown text into clean HTML code instantly. Supports GitHub Flavored Markdown (GFM).',
    icon: '📝',
    href: '/developer/markdown-to-html'
  },
  {
    title: 'URL Slug Generator',
    description: 'Convert any text into a SEO-friendly URL slug. Instantly remove special characters, spaces, and generate clean slugs.',
    icon: '🔗',
    href: '/developer/slug-generator'
  },
  {
    title: 'UUID v4 Generator',
    description: 'Generate cryptographically secure UUID v4 identifiers instantly. Bulk generate up to 100 UUIDs at once.',
    icon: '🆔',
    href: '/developer/uuid-generator'
  },
  {
    title: 'JSON Formatter & Validator',
    description: 'Format, validate, and minify JSON data. Convert nested JSON structures into easy-to-read data tables.',
    icon: '{"}',
    href: '/developer/json-tools'
  },
  {
    title: 'XML Formatter & Validator',
    description: 'Format, validate, and minify XML documents. Parse complex XML into interactive data tables.',
    icon: '</> ',
    href: '/developer/xml-tools'
  },
  {
    title: 'Base64 Encoder & Decoder',
    description: 'Quickly encode text to Base64 or decode Base64 back to text.',
    icon: '🔤',
    href: '/developer/base64-converter'
  },
  {
    title: 'JWT Token Decoder',
    description: 'Decode and inspect JSON Web Tokens (JWT) payload and header data securely.',
    icon: '🔐',
    href: '/developer/jwt-decoder'
  },
  {
    title: 'Hash Generator',
    description: 'Generate cryptographic hashes like SHA-256, SHA-384, and SHA-512 from any text.',
    icon: '🔒',
    href: '/developer/hash-generator'
  },
  {
    title: 'Color Converter',
    description: 'Convert color codes between HEX, RGB, and HSL formats instantly.',
    icon: '🎨',
    href: '/developer/color-converter'
  },
  {
    title: 'Number Base Converter',
    description: 'Convert numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16).',
    icon: '🔢',
    href: '/developer/number-base'
  },
  {
    title: 'Regex Tester & Debugger',
    description: 'Test regular expressions in real-time with live match highlighting, flags, and capture group inspection.',
    icon: '⚡',
    href: '/developer/regex-tester'
  },
  {
    title: 'Unix Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates or date strings to Unix timestamps instantly.',
    icon: '🕐',
    href: '/developer/timestamp-converter'
  },
  // ── Format Converters ──────────────────────────────
  {
    title: 'JSON ↔ CSV Converter',
    description: 'Convert JSON arrays to CSV spreadsheets or CSV data back to JSON. Handles nested objects with dot-notation flattening.',
    icon: '📊',
    href: '/developer/json-csv'
  },
  {
    title: 'JSON ↔ YAML Converter',
    description: 'Convert between JSON and YAML formats instantly. Perfect for Kubernetes configs, CI/CD pipelines, and API specs.',
    icon: '📋',
    href: '/developer/json-yaml'
  },
  {
    title: 'XML ↔ CSV Converter',
    description: 'Transform XML documents into CSV tables or convert CSV data into structured XML. Great for legacy data migration.',
    icon: '🔄',
    href: '/developer/xml-csv'
  },
  {
    title: 'XML ↔ YAML Converter',
    description: 'Convert between XML and YAML formats. Useful for config file migration and cross-platform data exchange.',
    icon: '🔀',
    href: '/developer/xml-yaml'
  },
  // ── Escapers & Unescapers ──────────────────────────
  {
    title: 'HTML Escape & Unescape',
    description: 'Escape HTML special characters to entities or unescape entities back to readable HTML. Prevent XSS vulnerabilities.',
    icon: '🛡️',
    href: '/developer/html-escape'
  },
  {
    title: 'XML Escape & Unescape',
    description: 'Escape XML special characters or unescape XML entities. Safely embed text in XML documents.',
    icon: '📐',
    href: '/developer/xml-escape'
  },
  {
    title: 'JSON Escape & Unescape',
    description: 'Escape strings for embedding in JSON or unescape JSON-encoded strings back to plain text.',
    icon: '🔤',
    href: '/developer/json-escape'
  },
  {
    title: 'SQL Escape',
    description: 'Escape single quotes, backslashes, and special characters for safe SQL string literals.',
    icon: '🗄️',
    href: '/developer/sql-escape'
  },
  {
    title: 'CSV Escape',
    description: 'Escape CSV fields per RFC 4180 — properly quote fields containing commas, quotes, and newlines.',
    icon: '📑',
    href: '/developer/csv-escape'
  },
  // ── Data-to-Class Code Generators ──────────────────
  {
    title: 'JSON to TypeScript',
    description: 'Generate TypeScript interfaces from JSON data. Infers types, handles nested objects, arrays, and optional fields.',
    icon: '🟦',
    href: '/developer/json-to-typescript'
  },
  {
    title: 'JSON to Java',
    description: 'Generate Java POJO classes with getters, setters, and proper type mapping from any JSON structure.',
    icon: '☕',
    href: '/developer/json-to-java'
  },
  {
    title: 'JSON to Python',
    description: 'Generate Python dataclasses with type annotations from JSON. Supports nested structures and lists.',
    icon: '🐍',
    href: '/developer/json-to-python'
  },
  {
    title: 'JSON to C#',
    description: 'Generate C# classes with auto-properties and proper .NET type mapping from JSON objects.',
    icon: '🟣',
    href: '/developer/json-to-csharp'
  },
  {
    title: 'JSON to Go',
    description: 'Generate Go structs with json tags from JSON data. Handles nested objects and proper Go naming conventions.',
    icon: '🐹',
    href: '/developer/json-to-go'
  },
  // ── Diff / Compare Tools ───────────────────────────
  {
    title: 'JSON Diff',
    description: 'Compare two JSON objects side by side. Highlights added, removed, and changed keys with color-coded output.',
    icon: '🔍',
    href: '/developer/json-diff'
  },
  {
    title: 'XML Diff',
    description: 'Compare two XML documents with line-by-line diff highlighting. Find differences in structure and content.',
    icon: '📄',
    href: '/developer/xml-diff'
  },
  {
    title: 'Text Diff',
    description: 'Compare two blocks of text with a unified diff view. Highlights additions, deletions, and modifications line by line.',
    icon: '📝',
    href: '/developer/text-diff'
  },
  // ── Web Beautifiers ────────────────────────────────
  {
    title: 'HTML Beautifier',
    description: 'Format and indent messy HTML code with configurable indentation. Makes minified HTML readable instantly.',
    icon: '🌐',
    href: '/developer/html-beautifier'
  },
  {
    title: 'CSS Beautifier',
    description: 'Format compressed CSS into clean, readable stylesheets. One property per line with proper brace alignment.',
    icon: '🎨',
    href: '/developer/css-beautifier'
  },
  {
    title: 'JavaScript Beautifier',
    description: 'Format minified JavaScript into readable, properly indented code. Handles braces, semicolons, and nesting.',
    icon: '⚡',
    href: '/developer/js-beautifier'
  },
],
  "finance": [
 {
 title: 'Compound Interest Calculator',
 description: 'See how your money grows over time with the power of compound interest.',
 icon: '💰',
 href: '/finance/compound-interest',
 },
 {
 title: 'Cash-on-Cash Return',
 description: 'Evaluate rental property investments by calculating your annual cash return.',
 icon: '🏠',
 href: '/finance/cash-on-cash-return',
 },
 {
 title: 'Simple Interest Calculator',
 description: 'Calculate simple interest on loans and investments quickly.',
 icon: '📊',
 href: '/finance/simple-interest',
 },
],
  "health": [
  {
  title: 'TDEE Calculator',
  description: 'Calculate your Total Daily Energy Expenditure based on your activity level.',
  icon: '🔥',
  href: '/health/tdee-calculator',
  },
  {
  title: 'BMI Calculator',
  description: 'Calculate your Body Mass Index (BMI) and check your weight category.',
  icon: '⚖️',
  href: '/health/bmi-calculator',
  },
],
  "math": [
 {
 title: 'Random Number Generator',
 description: 'Generate random numbers within a specific range instantly. Support for multiple numbers, decimals, and custom separators.',
 icon: '🎲',
 href: '/math/random-number-generator',
 },
 {
 title: 'Scientific Calculator',
 description: 'Advanced math functions including trig, logarithms, and constants for STEM work.',
 icon: '🔬',
 href: '/math/scientific-calculator',
 },
 {
 title: 'Quadratic Equation Solver',
 description: 'Find the roots of any quadratic equation with step-by-step solutions.',
 icon: '📈',
 href: '/math/quadratic-solver',
 },
 {
 title: 'Matrix Calculator',
 description: 'Perform matrix operations: addition, multiplication, determinant, and inverse.',
 icon: '🔢',
 href: '/math/matrix-calculator',
 },
 {
 title: 'Percentage Calculator',
 description: 'Calculate percentages, increases, decreases, and percentage of a number.',
 icon: '📊',
 href: '/math/percentage-calculator',
 },
 {
 title: 'Unit Converter',
 description: 'Convert between length, weight, temperature, volume, and more.',
 icon: '📏',
 href: '/math/unit-converter',
 },
],
  "network": [
  {
    title: 'IP Subnet Calculator',
    description: 'Calculate network address, broadcast, subnet mask, host range, and usable hosts for any IPv4 subnet using CIDR notation.',
    icon: '🌐',
    href: '/network/ip-subnet-calculator'
  },
  {
    title: 'My IP Checker',
    description: 'Instantly find your public IP address with location, ISP, timezone, and coordinates.',
    icon: '🔍',
    href: '/network/my-ip'
  },
  {
    title: 'IP Address Lookup',
    description: 'Look up any public IP address to find its geolocation, ISP, ASN, timezone, and network details.',
    icon: '📡',
    href: '/network/ip-lookup'
  },
],
  "qr": [
  {
    title: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, email, phone numbers, and WiFi. Customize colors and size. Download as PNG.',
    icon: '📱',
    href: '/qr/qr-generator'
  },
],
  "security": [
  {
    title: 'Random Password Generator',
    description: 'Generate cryptographically secure passwords with custom length, character sets, and strength indicator.',
    icon: '🔐',
    href: '/security/password-generator'
  },
],
  "text": [
  {
    title: 'Number to Words Converter',
    description: 'Convert numbers into English words instantly. Useful for writing checks, filling out forms, or learning English numbers.',
    icon: '🔢',
    href: '/text/number-to-words'
  },
  {
    title: 'Word Counter',
    description: 'Real-time word, character, sentence, and paragraph counter with reading time estimate and keyword density.',
    icon: '📝',
    href: '/text/word-counter'
  },
  {
    title: 'Morse Code Translator',
    description: 'Translate text to Morse code and back. Includes audio playback with adjustable speed.',
    icon: '📡',
    href: '/text/morse-code'
  },
  {
    title: 'URL Encoder & Decoder',
    description: 'Encode or decode URLs and query strings instantly. Supports encodeURIComponent and encodeURI modes.',
    icon: '🔗',
    href: '/text/url-encoder'
  },
  {
    title: 'Text Case Converter',
    description: 'Convert text between UPPERCASE, lowercase, Title Case, camelCase, snake_case, PascalCase, kebab-case, and more.',
    icon: '🔡',
    href: '/text/case-converter'
  },
  {
    title: 'Lorem Ipsum Generator',
    description: 'Generate placeholder Lorem Ipsum text by paragraphs, sentences, or words. Customizable and instant.',
    icon: '📄',
    href: '/text/lorem-ipsum'
  },
],
  "tools": [
  { title: 'PDF Merger', description: 'Drag, reorder, and combine multiple PDF files into a single document instantly.', icon: '🔗', href: '/tools/pdf-merger' },
  { title: 'Split PDF By Range', description: 'Extract a specific page range (e.g. pages 3–8) from any PDF file.', icon: '✂️', href: '/tools/pdf-split-range' },
  { title: 'Split PDF To Pages', description: 'Separate every PDF page into its own individual downloadable file.', icon: '📑', href: '/tools/pdf-split-pages' },
  { title: 'Compose PDF', description: 'Create a PDF document from scratch using a built-in text editor.', icon: '✍️', href: '/tools/pdf-compose' },
  { title: 'Protect PDF', description: 'Add password protection and set read/print/copy permissions on PDFs.', icon: '🔒', href: '/tools/pdf-protect' },
  { title: 'Remove PDF Password', description: 'Unlock and remove password protection from a PDF file.', icon: '🔓', href: '/tools/pdf-remove-password' },
  { title: 'Flatten PDF', description: 'Flatten form fields and annotations for universal compatibility.', icon: '📄', href: '/tools/pdf-flatten' },
  { title: 'Preflight PDF', description: 'Inspect PDF metadata, page count, dimensions, and structure.', icon: '🔍', href: '/tools/pdf-preflight' },
  { title: 'PDF to Text', description: 'Extract all readable text from any PDF document.', icon: '📝', href: '/tools/pdf-to-text' },
  { title: 'PDF to Images', description: 'Convert each PDF page into a high-quality PNG image file.', icon: '🖼️', href: '/tools/pdf-to-images' },
  { title: 'PDF to HTML', description: 'Convert PDF content into an HTML page you can preview and download.', icon: '🌐', href: '/tools/pdf-to-html' },
  { title: 'Images to PDF', description: 'Combine multiple JPG/PNG/WebP images into a single PDF file.', icon: '🗂️', href: '/tools/images-to-pdf' },
],
  "trades": [
 {
 title: 'Concrete Slab Calculator',
 description: 'Calculate exactly how much concrete you need for slabs, footings, and walls.',
 icon: '🧱',
 href: '/trades/concrete-slab',
 },
 {
 title: 'Wire Size Calculator',
 description: 'Determine the correct wire gauge for electrical installations.',
 icon: '⚡',
 href: '/trades/wire-size',
 },
  {
  title: 'Solar Panel Calculator',
  description: 'Size your solar array based on energy usage and location.',
  icon: '☀️',
  href: '/trades/solar-panel',
  },
  {
  title: 'Board Feet Calculator',
  description: 'Calculate hardwood lumber volume in board feet.',
  icon: '🪵',
  href: '/trades/board-feet',
  },
  {
  title: 'Paint Calculator',
  description: 'Determine exactly how many gallons of paint your project needs.',
  icon: '🎨',
  href: '/trades/paint-calculator',
  },
],
};

export const allTools = Object.values(toolsByCategory).flat();

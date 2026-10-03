import { describe, expect, it } from "vitest";
import {
  sanitizeTicketHtml,
  isSafeAttachmentUrl,
} from "../lib/sanitize-ticket-html";

describe("Customer Content Sanitization & Security", () => {
  it("strips malicious script tags and inline XSS handlers", () => {
    const maliciousInput = `<img src=x onerror="alert('hacked')"> I was charged twice. <script>alert('xss')</script>`;
    const sanitized = sanitizeTicketHtml(maliciousInput);

    expect(sanitized).not.toContain("<script>");
    expect(sanitized).not.toContain("onerror");
    expect(sanitized).toContain("I was charged twice.");
  });

  it("preserves safe HTML tags like links, bold, and linebreaks", () => {
    const safeInput = `<p>Please see <b>invoice</b> at <a href="https://example.com" target="_blank">link</a>.</p>`;
    const sanitized = sanitizeTicketHtml(safeInput);

    expect(sanitized).toContain("<b>invoice</b>");
    expect(sanitized).toContain('href="https://example.com"');
  });

  it("blocks dangerous attachment URLs like javascript: protocol", () => {
    expect(isSafeAttachmentUrl("javascript:alert(document.cookie)")).toBe(false);
    expect(isSafeAttachmentUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeAttachmentUrl("https://files.example.com/screenshot.png")).toBe(true);
    expect(isSafeAttachmentUrl("http://example.com/file.pdf")).toBe(true);
  });
});

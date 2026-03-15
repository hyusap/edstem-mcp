import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { markdownToEdXml, edXmlToPlainText, ensureEdXml } from "../content.js";

describe("markdownToEdXml", () => {
  it("wraps plain text in a paragraph", () => {
    assert.equal(
      markdownToEdXml("Hello world"),
      '<document version="2.0"><paragraph>Hello world</paragraph></document>'
    );
  });

  it("converts headings", () => {
    const result = markdownToEdXml("# Title\n## Subtitle");
    assert.match(result, /<heading level="1">Title<\/heading>/);
    assert.match(result, /<heading level="2">Subtitle<\/heading>/);
  });

  it("converts bold and italic", () => {
    const result = markdownToEdXml("**bold** and *italic*");
    assert.match(result, /<bold>bold<\/bold>/);
    assert.match(result, /<italic>italic<\/italic>/);
  });

  it("converts inline code", () => {
    const result = markdownToEdXml("use `console.log`");
    assert.match(result, /<code>console.log<\/code>/);
  });

  it("escapes XML in inline code", () => {
    const result = markdownToEdXml("use `<div>`");
    assert.match(result, /<code>&lt;div&gt;<\/code>/);
  });

  it("does not double-escape text around code spans", () => {
    const result = markdownToEdXml("a & b with `x < y`");
    assert.match(result, /a &amp; b with/);
    assert.match(result, /<code>x &lt; y<\/code>/);
  });

  it("converts links", () => {
    const result = markdownToEdXml("[click](https://example.com)");
    assert.match(result, /<link href="https:\/\/example.com">click<\/link>/);
  });

  it("converts LaTeX", () => {
    const result = markdownToEdXml("$E = mc^2$");
    assert.match(result, /<math>E = mc\^2<\/math>/);
  });

  it("converts bullet lists", () => {
    const result = markdownToEdXml("- one\n- two");
    assert.match(result, /<list style="bullet">/);
    assert.match(result, /<list-item><paragraph>one<\/paragraph><\/list-item>/);
    assert.match(result, /<list-item><paragraph>two<\/paragraph><\/list-item>/);
  });

  it("converts numbered lists", () => {
    const result = markdownToEdXml("1. first\n2. second");
    assert.match(result, /<list style="number">/);
    assert.match(result, /<list-item><paragraph>first<\/paragraph><\/list-item>/);
  });

  it("converts code blocks without language", () => {
    const result = markdownToEdXml("```\nfoo\n```");
    assert.match(result, /<pre>foo<\/pre>/);
  });

  it("converts code blocks with language", () => {
    const result = markdownToEdXml("```python\nprint(1)\n```");
    assert.match(result, /<snippet language="python" runnable="false">print\(1\)<\/snippet>/);
  });

  it("escapes XML inside code blocks", () => {
    const result = markdownToEdXml("```\na < b && c > d\n```");
    assert.match(result, /<pre>a &lt; b &amp;&amp; c &gt; d<\/pre>/);
  });

  it("escapes language attribute in snippets", () => {
    const result = markdownToEdXml('```py">\ncode\n```');
    assert.match(result, /language="py&quot;&gt;"/);
  });

  it("converts callouts", () => {
    const result = markdownToEdXml("> [!warning] Be careful");
    assert.match(result, /<callout type="warning"><paragraph>Be careful<\/paragraph><\/callout>/);
  });

  it("converts multi-line callouts", () => {
    const result = markdownToEdXml("> [!info] Line one\n> Line two");
    assert.match(result, /<callout type="info"><paragraph>Line one Line two<\/paragraph><\/callout>/);
  });

  it("skips empty lines", () => {
    const result = markdownToEdXml("one\n\ntwo");
    assert.equal(
      result,
      '<document version="2.0"><paragraph>one</paragraph><paragraph>two</paragraph></document>'
    );
  });

  it("handles mixed content", () => {
    const md = "# Title\n\nSome **bold** text\n\n- item 1\n- item 2";
    const result = markdownToEdXml(md);
    assert.match(result, /<heading level="1">Title<\/heading>/);
    assert.match(result, /<bold>bold<\/bold>/);
    assert.match(result, /<list style="bullet">/);
  });
});

describe("edXmlToPlainText", () => {
  it("strips XML tags", () => {
    assert.equal(
      edXmlToPlainText('<document version="2.0"><paragraph>Hello</paragraph></document>'),
      "Hello"
    );
  });

  it("unescapes XML entities", () => {
    assert.equal(edXmlToPlainText("a &amp; b &lt; c &gt; d &quot;e&quot;"), 'a & b < c > d "e"');
  });

  it("returns empty string for empty input", () => {
    assert.equal(edXmlToPlainText(""), "");
  });
});

describe("ensureEdXml", () => {
  it("passes through raw Ed XML unchanged", () => {
    const xml = '<document version="2.0"><paragraph>test</paragraph></document>';
    assert.equal(ensureEdXml(xml), xml);
  });

  it("converts markdown to Ed XML", () => {
    const result = ensureEdXml("Hello");
    assert.match(result, /^<document version="2.0">/);
    assert.match(result, /<paragraph>Hello<\/paragraph>/);
  });
});

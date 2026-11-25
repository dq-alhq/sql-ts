import { useState } from "react";
import {
  Check,
  ChevronDown,
  Clipboard,
  Code2,
  Database,
  FileCode2,
  Layers3,
  Play,
  RotateCcw,
  Table2,
  WandSparkles,
} from "lucide-react";

type Column = { name: string; type: string; nullable: boolean };
const sampleSql = `CREATE TABLE \`penilaian_medis_igd\` (
  \`no_rawat\` varchar(17) NOT NULL,
  \`tanggal\` datetime NOT NULL,
  \`kd_dokter\` varchar(20) NOT NULL,
  \`anamnesis\` enum('Autoanamnesis','Alloanamnesis') NOT NULL,
  \`hubungan\` varchar(100) NOT NULL,
  \`keluhan_utama\` varchar(2000) NOT NULL DEFAULT '',
  \`rps\` varchar(2000) NOT NULL,
  \`rpd\` varchar(1000) NOT NULL DEFAULT '',
  \`rpk\` varchar(1000) NOT NULL,
  \`rpo\` varchar(1000) NOT NULL,
  \`alergi\` varchar(100) NOT NULL DEFAULT '',
  \`keadaan\` enum('Sehat','Sakit Ringan','Sakit Sedang','Sakit Berat') NOT NULL,
  \`gcs\` varchar(10) NOT NULL,
  \`kesadaran\` enum('Compos Mentis','Apatis','Somnolen','Sopor','Koma') NOT NULL,
  \`td\` varchar(8) NOT NULL DEFAULT '', \`nadi\` varchar(5) NOT NULL DEFAULT '', \`rr\` varchar(5) NOT NULL,
  \`suhu\` varchar(5) NOT NULL DEFAULT '', \`spo\` varchar(5) NOT NULL, \`bb\` varchar(5) NOT NULL DEFAULT '', \`tb\` varchar(5) NOT NULL DEFAULT '',
  \`kepala\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL, \`mata\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL, \`gigi\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL, \`leher\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL,
  \`thoraks\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL, \`abdomen\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL, \`genital\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL, \`ekstremitas\` enum('Normal','Abnormal','Tidak Diperiksa') NOT NULL,
  \`ket_fisik\` text NOT NULL, \`ket_lokalis\` text NOT NULL, \`ekg\` text NOT NULL, \`rad\` text NOT NULL, \`lab\` text NOT NULL, \`diagnosis\` varchar(500) NOT NULL, \`tata\` text NOT NULL
);`;

function pascalCase(value: string) {
  return (
    value
      .replace(/[`'"]/g, "")
      .split(/[^a-zA-Z0-9]+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join("") || "GeneratedTable"
  );
}
function parseSql(sql: string) {
  const tableName =
    sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"]?([\w-]+)[`"]?/i)?.[1] ??
    "generated_table";
  const open = sql.indexOf("("),
    close = sql.lastIndexOf(")"),
    body = open >= 0 && close > open ? sql.slice(open + 1, close) : sql;
  const columns: Column[] = [];
  body.split(/,(?![^()]*\))/).forEach((raw) => {
    const match = raw.trim().match(/^[`"]?([\w-]+)[`"]?\s+([a-z]+(?:\s*\([^)]*\))?)/i);
    if (!match || /^(primary|unique|key|constraint|foreign|check|index)$/i.test(match[1])) return;
    columns.push({ name: match[1], type: match[2], nullable: !/\bNOT\s+NULL\b/i.test(raw) });
  });
  return { tableName, columns };
}
function sqlTypeToTs(type: string) {
  const normalized = type.toLowerCase();
  if (normalized.startsWith("enum")) {
    const values = type.match(/\((.*)\)/)?.[1] ?? "";
    return (
      values
        .split(/',\s*'|",\s*"/)
        .map((v) => v.replace(/^['"]|['"]$/g, ""))
        .filter(Boolean)
        .map((v) => `'${v}'`)
        .join(" | ") || "string"
    );
  }
  if (/datetime|timestamp|date|time/.test(normalized)) return "Date | string";
  if (/int|decimal|float|double|numeric|real/.test(normalized)) return "number";
  if (/bool|tinyint\(1\)/.test(normalized)) return "boolean";
  return "string";
}
function formatInterface(tableName: string, columns: Column[]) {
  return `export interface ${pascalCase(tableName)} {\n${columns.map((c) => `  ${c.name}${c.nullable ? "?" : ""}: ${sqlTypeToTs(c.type)}`).join("\n")}\n}`;
}

function App() {
  const [sql, setSql] = useState(sampleSql),
    [copied, setCopied] = useState(false);
  const parsed = parseSql(sql),
    output = formatInterface(parsed.tableName, parsed.columns);
  const copyOutput = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <main className={"app"}>
      <nav className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Code2 size={19} />
          </div>
          <span>
            SQL<span className="brand-accent">→</span>TS
          </span>
          <span className="version">v1.0</span>
        </div>
        <div className="nav-actions">
          <div className="avatar">DQ</div>
        </div>
      </nav>
      <section className="hero">
        <div className="eyebrow">
          <WandSparkles size={14} /> DEVELOPER TOOL
        </div>
        <h1>
          Turn your SQL schema into
          <br />
          <span>type-safe TypeScript.</span>
        </h1>
        <p>
          Paste a MySQL <code>CREATE TABLE</code> statement and get a clean,
          <br className="desktop-break" /> ready-to-use TypeScript interface in seconds.
        </p>
      </section>
      <section className="workspace">
        <div className="panel input-panel">
          <div className="panel-head">
            <div className="panel-title">
              <div className="panel-icon blue">
                <Database size={16} />
              </div>
              <div>
                <strong>SQL schema</strong>
                <small>Paste your CREATE TABLE statement</small>
              </div>
            </div>
            <div className="head-actions">
              <button className="text-btn" onClick={() => setSql(sampleSql)}>
                Load example
              </button>
              <button className="clear-btn" onClick={() => setSql("")}>
                <RotateCcw size={14} /> Clear
              </button>
            </div>
          </div>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            spellCheck={false}
            aria-label="SQL schema input"
          />
          <div className="panel-foot">
            <span>{sql.length.toLocaleString()} characters</span>
            <span className="status">
              <span className="status-dot" /> Auto-detect enabled
            </span>
          </div>
        </div>
        <div className="convert-column">
          <div className="convert-line" />
          <button className="convert-btn">
            <Play size={15} fill="currentColor" />
          </button>
          <div className="convert-line" />
        </div>
        <div className="panel output-panel">
          <div className="panel-head">
            <div className="panel-title">
              <div className="panel-icon purple">
                <FileCode2 size={16} />
              </div>
              <div>
                <strong>TypeScript interface</strong>
                <small>Generated output</small>
              </div>
            </div>
            <button className="copy-btn" onClick={copyOutput}>
              {copied ? (
                <>
                  <Check size={15} /> Copied
                </>
              ) : (
                <>
                  <Clipboard size={15} /> Copy code
                </>
              )}
            </button>
          </div>
          <div className="code-wrap">
            <pre>
              <code>{output}</code>
            </pre>
          </div>
          <div className="panel-foot">
            <span>
              TypeScript <span className="dot-separator">•</span> Interface
            </span>
            <span className="valid">
              <Check size={13} /> Valid syntax
            </span>
          </div>
        </div>
      </section>
      <section className="summary">
        <div className="summary-title">
          <span className="summary-icon">
            <Table2 size={15} />
          </span>
          <span>
            <strong>{parsed.tableName}</strong>
            <small>Detected schema</small>
          </span>
        </div>
        <div className="summary-stat">
          <Layers3 size={16} />
          <span>
            <strong>{parsed.columns.length}</strong>
            <small>Fields</small>
          </span>
        </div>
        <div className="summary-stat">
          <ChevronDown size={16} />
          <span>
            <strong>
              {parsed.columns.filter((c) => c.type.toLowerCase().startsWith("enum")).length}
            </strong>
            <small>Enums</small>
          </span>
        </div>
        <div className="summary-stat">
          <Code2 size={16} />
          <span>
            <strong>Strict</strong>
            <small>Type mode</small>
          </span>
        </div>
      </section>
      <footer>
        <span>Built for developers who care about their types.</span>
        <span>
          SQL<span className="brand-accent">→</span>TS <span className="dot-separator">•</span>{" "}
          Local &amp; private
        </span>
      </footer>
    </main>
  );
}
export default App;

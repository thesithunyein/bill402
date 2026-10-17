export type InvoiceStatus = "pending" | "paid";

export interface Invoice {
  id: string;
  merchant: string;
  description: string;
  amountUsd: number;
  amountUnits: string; // USDC base units (6 decimals)
  webhookUrl: string | null;
  status: InvoiceStatus;
  paidAt: string | null;
  txHash: string | null;
  payer: string | null;
  createdAt: string;
}

export interface Stats {
  invoicesCreated: number;
  invoicesPaid: number;
  volumeUnits: string;
}

export interface Store {
  createInvoice(inv: Invoice): Promise<void>;
  getInvoice(id: string): Promise<Invoice | null>;
  markPaid(
    id: string,
    paid: { txHash: string; payer: string | null; paidAt: string },
  ): Promise<Invoice | null>;
  stats(): Promise<Stats>;
}

class MemoryStore implements Store {
  private rows = new Map<string, Invoice>();

  async createInvoice(inv: Invoice) {
    this.rows.set(inv.id, { ...inv });
  }

  async getInvoice(id: string) {
    return this.rows.get(id) ?? null;
  }

  async markPaid(id: string, paid: { txHash: string; payer: string | null; paidAt: string }) {
    const inv = this.rows.get(id);
    if (!inv) return null;
    inv.status = "paid";
    inv.txHash = paid.txHash;
    inv.payer = paid.payer;
    inv.paidAt = paid.paidAt;
    return { ...inv };
  }

  async stats(): Promise<Stats> {
    const all = [...this.rows.values()];
    let volume = 0n;
    for (const inv of all) {
      if (inv.status === "paid") volume += BigInt(inv.amountUnits);
    }
    return {
      invoicesCreated: all.length,
      invoicesPaid: all.filter((i) => i.status === "paid").length,
      volumeUnits: volume.toString(),
    };
  }
}

class PostgresStore implements Store {
  constructor(private sql: import("postgres").Sql) {}

  async createInvoice(inv: Invoice) {
    await this.sql`
      INSERT INTO invoices (id, merchant, description, amount_usd, amount_units, webhook_url, status, created_at)
      VALUES (${inv.id}, ${inv.merchant}, ${inv.description}, ${inv.amountUsd}, ${inv.amountUnits},
              ${inv.webhookUrl}, ${inv.status}, ${inv.createdAt})`;
  }

  async getInvoice(id: string) {
    const rows = await this.sql`
      SELECT * FROM invoices WHERE id = ${id} LIMIT 1`;
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      merchant: r.merchant,
      description: r.description,
      amountUsd: Number(r.amount_usd),
      amountUnits: r.amount_units,
      webhookUrl: r.webhook_url,
      status: r.status as InvoiceStatus,
      paidAt: r.paid_at,
      txHash: r.tx_hash,
      payer: r.payer,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    };
  }

  async markPaid(id: string, paid: { txHash: string; payer: string | null; paidAt: string }) {
    const rows = await this.sql`
      UPDATE invoices SET status = 'paid', tx_hash = ${paid.txHash}, payer = ${paid.payer}, paid_at = ${paid.paidAt}
      WHERE id = ${id} AND status = 'pending' RETURNING *`;
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      merchant: r.merchant,
      description: r.description,
      amountUsd: Number(r.amount_usd),
      amountUnits: r.amount_units,
      webhookUrl: r.webhook_url,
      status: "paid" as InvoiceStatus,
      paidAt: r.paid_at instanceof Date ? r.paid_at.toISOString() : String(r.paid_at),
      txHash: r.tx_hash,
      payer: r.payer,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    };
  }

  async stats(): Promise<Stats> {
    const rows = await this.sql`
      SELECT COUNT(*)::int AS created,
             COUNT(*) FILTER (WHERE status = 'paid')::int AS paid,
             COALESCE(SUM(amount_units) FILTER (WHERE status = 'paid'), 0)::text AS volume
      FROM invoices`;
    return {
      invoicesCreated: rows[0].created,
      invoicesPaid: rows[0].paid,
      volumeUnits: rows[0].volume,
    };
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  merchant TEXT NOT NULL,
  description TEXT NOT NULL,
  amount_usd NUMERIC(12,2) NOT NULL,
  amount_units TEXT NOT NULL,
  webhook_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  tx_hash TEXT,
  payer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`;

export function getStore(): Store {
  const g = globalThis as unknown as { __bill402_store?: Store };
  if (g.__bill402_store) return g.__bill402_store;

  let store: Store;
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const postgresFactory = require("postgres") as (url: string, opts?: object) => import("postgres").Sql;
    const sql = postgresFactory(databaseUrl, { prepare: false });
    void sql.unsafe(SCHEMA).catch((err: unknown) => console.error("schema init failed:", err));
    store = new PostgresStore(sql);
  } else {
    store = new MemoryStore();
  }
  g.__bill402_store = store;
  return store;
}

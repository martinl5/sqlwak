'use client';

import { useState } from 'react';
import { Database, Table, ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

interface ColumnInfo {
  name: string;
  type: string;
  description: string;
  primaryKey?: boolean;
  foreignKey?: string;
}

interface TableSchema {
  description: string;
  columns: ColumnInfo[];
  sample: string;
}

const SCHEMA: Record<string, TableSchema> = {
  customers: {
    description: 'LCB customer profiles with segment and credit data',
    columns: [
      { name: 'customer_id',   type: 'INTEGER', description: 'Unique identifier',                      primaryKey: true },
      { name: 'customer_name', type: 'TEXT',    description: 'Full customer name'                                       },
      { name: 'segment',       type: 'TEXT',    description: 'Banking tier: Mass / Priority / Private / SME'           },
      { name: 'credit_score',  type: 'INTEGER', description: 'Credit score (300–850)'                                  },
      { name: 'join_date',     type: 'TEXT',    description: 'Date customer onboarded (YYYY-MM-DD)'                    },
      { name: 'email',         type: 'TEXT',    description: 'Contact email'                                           },
    ],
    sample: 'SELECT * FROM customers LIMIT 5;',
  },
  products: {
    description: 'LCB product catalogue — savings, loans, investments, cards',
    columns: [
      { name: 'product_id',    type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'product_name',  type: 'TEXT',    description: 'Full product name (e.g. LCB EasySave Account)' },
      { name: 'product_type',  type: 'TEXT',    description: 'Category: Savings / Current / Fixed Deposit / Investment / Loan / Credit Card' },
      { name: 'interest_rate', type: 'REAL',    description: 'Annual interest rate (%)' },
      { name: 'min_balance',   type: 'REAL',    description: 'Minimum balance required (SGD)' },
    ],
    sample: 'SELECT * FROM products;',
  },
  branches: {
    description: 'LCB branch network across Singapore',
    columns: [
      { name: 'branch_id',   type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'branch_name', type: 'TEXT',    description: 'Branch name (e.g. LCB Marina Bay HQ)' },
      { name: 'city',        type: 'TEXT',    description: 'City (all Singapore)' },
      { name: 'region',      type: 'TEXT',    description: 'Planning region: Central / East / West / North' },
      { name: 'branch_type', type: 'TEXT',    description: 'HQ / High Street / Community / Business Centre' },
    ],
    sample: 'SELECT * FROM branches;',
  },
  accounts: {
    description: 'Customer accounts linking customers, products and branches',
    columns: [
      { name: 'account_id',  type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'customer_id', type: 'INTEGER', description: 'FK → customers',    foreignKey: 'customers.customer_id' },
      { name: 'product_id',  type: 'INTEGER', description: 'FK → products',     foreignKey: 'products.product_id'   },
      { name: 'branch_id',   type: 'INTEGER', description: 'FK → branches',     foreignKey: 'branches.branch_id'    },
      { name: 'balance',     type: 'REAL',    description: 'Current balance (SGD)' },
      { name: 'opened_date', type: 'TEXT',    description: 'Account open date (YYYY-MM-DD)' },
      { name: 'status',      type: 'TEXT',    description: 'Active / Dormant / Closed' },
    ],
    sample: 'SELECT * FROM accounts LIMIT 5;',
  },
  transactions: {
    description: 'All debit and credit transactions on LCB accounts',
    columns: [
      { name: 'transaction_id',   type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'account_id',       type: 'INTEGER', description: 'FK → accounts', foreignKey: 'accounts.account_id' },
      { name: 'amount',           type: 'REAL',    description: 'Transaction amount (SGD)' },
      { name: 'transaction_type', type: 'TEXT',    description: 'Credit or Debit' },
      { name: 'transaction_date', type: 'TEXT',    description: 'Date (YYYY-MM-DD)' },
      { name: 'merchant_category',type: 'TEXT',    description: 'Category: Salary Credit / Hawker Centre / Grab / MRT Top-up / …' },
      { name: 'channel',          type: 'TEXT',    description: 'Channel: PayNow / FAST / GIRO / ATM / Card / Online / Branch' },
    ],
    sample: 'SELECT * FROM transactions LIMIT 5;',
  },
  loans: {
    description: 'LCB loan book — home loans, car loans, personal credit',
    columns: [
      { name: 'loan_id',          type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'customer_id',      type: 'INTEGER', description: 'FK → customers', foreignKey: 'customers.customer_id' },
      { name: 'product_id',       type: 'INTEGER', description: 'FK → products',  foreignKey: 'products.product_id'   },
      { name: 'principal_amount', type: 'REAL',    description: 'Original loan principal (SGD)' },
      { name: 'interest_rate',    type: 'REAL',    description: 'Annual interest rate (%)' },
      { name: 'term_months',      type: 'INTEGER', description: 'Loan term in months' },
      { name: 'start_date',       type: 'TEXT',    description: 'Loan disbursement date (YYYY-MM-DD)' },
      { name: 'status',           type: 'TEXT',    description: 'Active / Paid Off / Default' },
      { name: 'risk_grade',       type: 'TEXT',    description: 'Risk grade A (best) → E (worst)' },
    ],
    sample: 'SELECT * FROM loans;',
  },
  vessels: {
    description: 'Merchant vessels financed by LCB Trade Finance division',
    columns: [
      { name: 'vessel_id',         type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'vessel_name',       type: 'TEXT',    description: 'Vessel name (e.g. MV Lion Prosperity)' },
      { name: 'vessel_type',       type: 'TEXT',    description: 'Container / Bulk Carrier / Tanker / RORO' },
      { name: 'flag_state',        type: 'TEXT',    description: 'Flag registry (SGP / PAN / LBR / MHL / BHS)' },
      { name: 'dwt_tonnes',        type: 'INTEGER', description: 'Deadweight tonnage (cargo capacity)' },
      { name: 'year_built',        type: 'INTEGER', description: 'Year of construction' },
      { name: 'owner_customer_id', type: 'INTEGER', description: 'FK → customers (nullable)', foreignKey: 'customers.customer_id' },
    ],
    sample: 'SELECT * FROM vessels;',
  },
  cargo_shipments: {
    description: 'Individual cargo voyages on LCB-financed vessels',
    columns: [
      { name: 'shipment_id',      type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'vessel_id',        type: 'INTEGER', description: 'FK → vessels', foreignKey: 'vessels.vessel_id' },
      { name: 'origin_port',      type: 'TEXT',    description: 'Departure port (e.g. Singapore, Port Klang)' },
      { name: 'destination_port', type: 'TEXT',    description: 'Arrival port (e.g. Rotterdam, Shanghai)' },
      { name: 'cargo_type',       type: 'TEXT',    description: 'Electronics / Crude Oil / Grain / Steel / Chemicals / Consumer Goods' },
      { name: 'cargo_value_usd',  type: 'REAL',    description: 'Declared cargo value (USD)' },
      { name: 'departure_date',   type: 'TEXT',    description: 'Date vessel departed (YYYY-MM-DD)' },
      { name: 'arrival_date',     type: 'TEXT',    description: 'Date vessel arrived — NULL if still at sea' },
      { name: 'status',           type: 'TEXT',    description: 'In Transit / Arrived / Delayed' },
    ],
    sample: 'SELECT * FROM cargo_shipments LIMIT 5;',
  },
  trade_finance_facilities: {
    description: 'LCB trade finance credit lines tied to customers and vessels',
    columns: [
      { name: 'facility_id',     type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'customer_id',     type: 'INTEGER', description: 'FK → customers', foreignKey: 'customers.customer_id' },
      { name: 'vessel_id',       type: 'INTEGER', description: 'FK → vessels (nullable)', foreignKey: 'vessels.vessel_id' },
      { name: 'facility_type',   type: 'TEXT',    description: 'Letter of Credit / Shipping Guarantee / Trade Loan / Bills Discount' },
      { name: 'facility_amount', type: 'REAL',    description: 'Total approved facility (USD)' },
      { name: 'utilised_amount', type: 'REAL',    description: 'Amount currently drawn down (USD)' },
      { name: 'expiry_date',     type: 'TEXT',    description: 'Facility expiry date (YYYY-MM-DD)' },
      { name: 'status',          type: 'TEXT',    description: 'Active / Expired / Cancelled' },
    ],
    sample: 'SELECT * FROM trade_finance_facilities;',
  },
};

export default function SchemaViewer() {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['customers']));
  const [searchTerm, setSearchTerm]         = useState('');

  const toggle = (t: string) => {
    const next = new Set(expandedTables);
    next.has(t) ? next.delete(t) : next.add(t);
    setExpandedTables(next);
  };

  const filtered = Object.entries(SCHEMA).filter(([t]) =>
    t.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className="h-full flex flex-col overflow-hidden fade-in-up"
      style={{ background: 'var(--lcb-panel)', border: '1px solid var(--lcb-border)', borderRadius: 6 }}
    >
      {/* Header */}
      <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--lcb-border)', background: 'var(--lcb-panel-2)' }}>
        <div className="flex items-center gap-2 mb-2 lcb-header">
          <Database className="w-3.5 h-3.5" style={{ color: 'var(--lcb-gold)' }} />
          <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-white)' }}>
            LCB Database Schema
          </h3>
        </div>
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--lcb-muted)' }} />
          <input
            type="text"
            placeholder="Search tables…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 text-xs"
            style={{
              fontFamily: 'var(--font-ibm-plex-mono)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--lcb-border)',
              borderRadius: 4,
              color: 'var(--lcb-white)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Tables */}
      <div className="flex-1 overflow-auto p-2">
        {filtered.map(([tableName, info]) => (
          <div key={tableName} className="mb-1">
            <button
              onClick={() => toggle(tableName)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-white/5"
              style={{ borderRadius: 4 }}
            >
              {expandedTables.has(tableName)
                ? <ChevronDown  className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--lcb-gold)' }} />
                : <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--lcb-muted)' }} />}
              <Table className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--lcb-green)' }} />
              <span className="text-xs font-medium" style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-white)' }}>
                {tableName}
              </span>
              <span className="text-xs" style={{ color: 'var(--lcb-muted)' }}>({info.columns.length})</span>
            </button>

            {expandedTables.has(tableName) && (
              <div
                className="ml-5 mb-2 p-2"
                style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--lcb-border)', borderRadius: 4 }}
              >
                <p className="text-xs mb-2 px-1" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
                  {info.description}
                </p>
                <div className="space-y-0.5">
                  {info.columns.map((col) => (
                    <div key={col.name} className="flex items-start gap-2 px-2 py-0.5 rounded lcb-table-row text-xs">
                      <span style={{ color: col.primaryKey ? '#fbbf24' : col.foreignKey ? '#f472b6' : 'var(--lcb-border)', fontSize: 10, marginTop: 1 }}>
                        {col.primaryKey ? '⬡' : col.foreignKey ? '◈' : '○'}
                      </span>
                      <span
                        className="min-w-[120px]"
                        style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: col.primaryKey ? '#fbbf24' : col.foreignKey ? '#f472b6' : '#7dd3fc' }}
                      >
                        {col.name}
                      </span>
                      <span style={{ fontFamily: 'var(--font-ibm-plex-mono)', color: 'var(--lcb-muted)' }}>{col.type}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(info.sample)}
                  className="mt-2 px-2 py-0.5 text-xs transition-opacity hover:opacity-70"
                  style={{
                    fontFamily: 'var(--font-ibm-plex-mono)',
                    color: 'var(--lcb-muted)',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--lcb-border)',
                    borderRadius: 3,
                  }}
                  title="Click to copy"
                >
                  {info.sample}
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)' }}>
            No tables found
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-3 py-2 text-xs"
        style={{ borderTop: '1px solid var(--lcb-border)', color: 'var(--lcb-muted)', fontFamily: 'var(--font-ibm-plex-mono)', background: 'var(--lcb-panel-2)' }}
      >
        {Object.keys(SCHEMA).length} tables · Click to expand · Click query to copy
      </div>
    </div>
  );
}

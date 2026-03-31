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

// Updated schema for ornithology database
const SCHEMA: Record<string, TableSchema> = {
  species_dim: {
    description: 'Bird species catalog with conservation status',
    columns: [
      { name: 'species_id', type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'common_name', type: 'TEXT', description: 'Common bird name' },
      { name: 'scientific_name', type: 'TEXT', description: 'Scientific binomial name' },
      { name: 'conservation_status', type: 'TEXT', description: 'Conservation status (e.g., Critically Endangered)' },
    ],
    sample: 'SELECT * FROM species_dim LIMIT 3;',
  },
  observers_dim: {
    description: 'Citizen scientist profiles with expertise levels',
    columns: [
      { name: 'observer_id', type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'observer_name', type: 'TEXT', description: 'Observer full name' },
      { name: 'expertise_level', type: 'TEXT', description: 'Skill level (Beginner to Expert)' },
      { name: 'join_date', type: 'TEXT', description: 'Date joined (YYYY-MM-DD)' },
    ],
    sample: 'SELECT * FROM observers_dim LIMIT 3;',
  },
  locations_dim: {
    description: 'Birding hotspot locations with geospatial data',
    columns: [
      { name: 'location_id', type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'locality_name', type: 'TEXT', description: 'Location name' },
      { name: 'latitude', type: 'REAL', description: 'Latitude coordinate' },
      { name: 'longitude', type: 'REAL', description: 'Longitude coordinate' },
      { name: 'elevation', type: 'REAL', description: 'Elevation in meters' },
      { name: 'habitat_type', type: 'TEXT', description: 'Habitat (Forest, Wetland, etc.)' },
      { name: 'state', type: 'TEXT', description: 'US state' },
      { name: 'region', type: 'TEXT', description: 'Geographic region' },
    ],
    sample: 'SELECT * FROM locations_dim LIMIT 3;',
  },
  checklists_fact: {
    description: 'Sampling events with observer, location, and protocol',
    columns: [
      { name: 'checklist_id', type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'observer_id', type: 'INTEGER', description: 'Foreign key to observers', foreignKey: 'observers_dim.observer_id' },
      { name: 'location_id', type: 'INTEGER', description: 'Foreign key to locations', foreignKey: 'locations_dim.location_id' },
      { name: 'observation_date', type: 'TEXT', description: 'Date of observation (YYYY-MM-DD)' },
      { name: 'start_time', type: 'TEXT', description: 'Start time (HH:MM)' },
      { name: 'duration_minutes', type: 'INTEGER', description: 'Session duration in minutes' },
      { name: 'protocol_type', type: 'TEXT', description: 'Protocol (Stationary, Traveling, Driving)' },
      { name: 'distance_km', type: 'REAL', description: 'Distance traveled in km' },
    ],
    sample: 'SELECT * FROM checklists_fact LIMIT 3;',
  },
  observations_fact: {
    description: 'Individual bird count records per species per checklist',
    columns: [
      { name: 'obs_id', type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'checklist_id', type: 'INTEGER', description: 'Foreign key to checklists', foreignKey: 'checklists_fact.checklist_id' },
      { name: 'species_id', type: 'INTEGER', description: 'Foreign key to species', foreignKey: 'species_dim.species_id' },
      { name: 'bird_count', type: 'INTEGER', description: 'Number of individuals observed' },
      { name: 'gender', type: 'TEXT', description: 'Gender if known (Male/Female)' },
    ],
    sample: 'SELECT * FROM observations_fact LIMIT 3;',
  },
  environmental_metrics: {
    description: 'Weather conditions recorded during each checklist',
    columns: [
      { name: 'env_id', type: 'INTEGER', description: 'Unique identifier', primaryKey: true },
      { name: 'checklist_id', type: 'INTEGER', description: 'Foreign key to checklists', foreignKey: 'checklists_fact.checklist_id' },
      { name: 'temperature_celsius', type: 'REAL', description: 'Temperature in °C' },
      { name: 'wind_speed_kmh', type: 'REAL', description: 'Wind speed in km/h' },
      { name: 'precipitation_mm', type: 'REAL', description: 'Precipitation in mm' },
      { name: 'weather_description', type: 'TEXT', description: 'Weather condition (Clear, Cloudy, etc.)' },
    ],
    sample: 'SELECT * FROM environmental_metrics LIMIT 3;',
  },
};

export default function SchemaViewer() {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['species_dim']));
  const [searchTerm, setSearchTerm] = useState('');
  const { queryResult } = useGameStore();

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables);
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName);
    } else {
      newExpanded.add(tableName);
    }
    setExpandedTables(newExpanded);
  };

  const filteredSchema = Object.entries(SCHEMA).filter(([tableName]) =>
    tableName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden rounded-2xl" style={{ backgroundColor: 'rgba(13, 31, 53, 0.95)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
      {/* Header */}
      <div className="p-3 border-b border-white/10" style={{ backgroundColor: 'rgba(10, 22, 40, 0.8)' }}>
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Database Schema</h3>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      {/* Tables */}
      <div className="flex-1 overflow-auto p-2">
        {filteredSchema.map(([tableName, tableInfo]) => (
          <div key={tableName} className="mb-1">
            {/* Table Header */}
            <button
              onClick={() => toggleTable(tableName)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 transition-colors text-left"
            >
              {expandedTables.has(tableName) ? (
                <ChevronDown className="w-3 h-3 text-cyan-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-white/40" />
              )}
              <Table className="w-3 h-3 text-emerald-400" />
              <span className="text-white text-sm font-medium">{tableName}</span>
              <span className="text-white/30 text-xs">({tableInfo.columns.length})</span>
            </button>

            {/* Expanded Columns */}
            {expandedTables.has(tableName) && (
              <div className="ml-6 mb-2 p-2 rounded" style={{ backgroundColor: 'rgba(10, 22, 40, 0.6)' }}>
                <p className="text-white/50 text-xs mb-2 px-1">{tableInfo.description}</p>
                
                {/* Columns */}
                <div className="space-y-0.5">
                  {tableInfo.columns.map((col) => (
                    <div key={col.name} className="flex items-start gap-2 px-2 py-1 rounded hover:bg-white/5 text-xs">
                      <span className={col.primaryKey ? 'text-amber-400' : col.foreignKey ? 'text-pink-400' : 'text-blue-300'}>
                        {col.primaryKey ? '🔑' : col.foreignKey ? '🔗' : '○'}
                      </span>
                      <span className="text-cyan-300 font-mono min-w-[100px]">{col.name}</span>
                      <span className="text-white/50 font-mono">{col.type}</span>
                      <span className="text-white/40 hidden sm:inline">— {col.description}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Query */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tableInfo.sample);
                  }}
                  className="mt-2 px-2 py-1 text-xs bg-white/5 hover:bg-white/10 rounded text-white/50 hover:text-white/80 transition-colors"
                  title="Click to copy"
                >
                  📋 {tableInfo.sample}
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredSchema.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">No tables found</p>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-white/10 text-xs text-white/40" style={{ backgroundColor: 'rgba(10, 22, 40, 0.8)' }}>
        <p>{Object.keys(SCHEMA).length} tables • Click to expand • Click query to copy</p>
      </div>
    </div>
  );
}

import { Database, SqlJsStatic } from 'sql.js';

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let initPromise: Promise<Database> | null = null;

async function loadSqlJsFromCDN(): Promise<SqlJsStatic> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    script.onload = () => {
      const initSqlJs = (window as any).initSqlJs;
      if (!initSqlJs) {
        reject(new Error('initSqlJs not found on window'));
        return;
      }
      initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
      }).then(resolve).catch(reject);
    };
    script.onerror = () => reject(new Error('Failed to load sql.js script'));
    document.head.appendChild(script);
  });
}

export async function initDatabase(): Promise<Database> {
  if (db) return db;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    console.log('[DB] Initializing SQL.js...');
    
    if (!SQL) {
      try {
        SQL = await loadSqlJsFromCDN();
        console.log('[DB] SQL.js initialized successfully');
      } catch (error) {
        console.error('[DB] Failed to initialize SQL.js:', error);
        throw error;
      }
    }

    try {
      if (!SQL) throw new Error('SQL.js not initialized');
      db = new SQL.Database();
      console.log('[DB] Database created, seeding...');
      await seedDatabase(db);
      console.log('[DB] Database seeded successfully');
      return db;
    } catch (error) {
      console.error('[DB] Failed to seed database:', error);
      throw error;
    }
  })();
  
  return initPromise;
}

async function seedDatabase(database: Database): Promise<void> {
  console.log('[DB] Creating tables...');
  
  /* Species dimension table */
  database.run(`
    CREATE TABLE IF NOT EXISTS species_dim (
        species_id           INTEGER PRIMARY KEY AUTOINCREMENT,
        common_name         TEXT NOT NULL,
        scientific_name     TEXT NOT NULL,
        conservation_status TEXT NOT NULL
    );
  `);

  /* Observers dimension table */
  database.run(`
    CREATE TABLE IF NOT EXISTS observers_dim (
        observer_id        INTEGER PRIMARY KEY AUTOINCREMENT,
        observer_name      TEXT NOT NULL,
        expertise_level    TEXT NOT NULL,
        join_date           TEXT NOT NULL
    );
  `);

  /* Locations dimension table */
  database.run(`
    CREATE TABLE IF NOT EXISTS locations_dim (
        location_id      INTEGER PRIMARY KEY AUTOINCREMENT,
        locality_name    TEXT NOT NULL,
        latitude         REAL NOT NULL,
        longitude        REAL NOT NULL,
        elevation        REAL NOT NULL,
        habitat_type     TEXT NOT NULL,
        state             TEXT NOT NULL,
        region            TEXT NOT NULL
    );
  `);

  /* Checklists fact table */
  database.run(`
    CREATE TABLE IF NOT EXISTS checklists_fact (
        checklist_id       INTEGER PRIMARY KEY AUTOINCREMENT,
        observer_id        INTEGER NOT NULL,
        location_id        INTEGER NOT NULL,
        observation_date   TEXT NOT NULL,
        start_time         TEXT NOT NULL,
        duration_minutes   INTEGER,
        protocol_type      TEXT NOT NULL,
        distance_km        REAL,
        FOREIGN KEY (observer_id)  REFERENCES observers_dim (observer_id),
        FOREIGN KEY (location_id)  REFERENCES locations_dim (location_id)
    );
  `);

  /* Observations fact table */
  database.run(`
    CREATE TABLE IF NOT EXISTS observations_fact (
        obs_id         INTEGER PRIMARY KEY AUTOINCREMENT,
        checklist_id   INTEGER NOT NULL,
        species_id     INTEGER NOT NULL,
        bird_count     INTEGER NOT NULL,
        gender         TEXT,
        FOREIGN KEY (checklist_id) REFERENCES checklists_fact (checklist_id),
        FOREIGN KEY (species_id)   REFERENCES species_dim (species_id)
    );
  `);

  /* Environmental metrics table */
  database.run(`
    CREATE TABLE IF NOT EXISTS environmental_metrics (
        env_id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        checklist_id            INTEGER NOT NULL,
        temperature_celsius    REAL NOT NULL,
        wind_speed_kmh         REAL NOT NULL,
        precipitation_mm       REAL,
        weather_description    TEXT NOT NULL,
        FOREIGN KEY (checklist_id) REFERENCES checklists_fact (checklist_id)
    );
  `);

  console.log('[DB] Inserting seed data...');
  
  // Insert species
  const speciesData = [
    { name: 'California Condor', scientific: 'Gymnogyps californianus', status: 'Critically Endangered' },
    { name: 'Whooping Crane', scientific: 'Grus americana', status: 'Endangered' },
    { name: 'Peregrine Falcon', scientific: 'Falco peregrinus', status: 'Least Concern' },
    { name: 'Bald Eagle', scientific: 'Haliaeetus leucocephalus', status: 'Least Concern' },
    { name: 'Snowy Owl', scientific: 'Bubo scandiacus', status: 'Vulnerable' },
    { name: 'Atlantic Puffin', scientific: 'Fratercula arctica', status: 'Vulnerable' },
    { name: 'Wood Thrush', scientific: 'Hylocichla mustelina', status: 'Near Threatened' },
    { name: 'Piping Plover', scientific: 'Charadrius melodus', status: 'Near Threatened' },
    { name: 'Yellow-rumped Warbler', scientific: 'Setophaga coronata', status: 'Least Concern' },
    { name: 'Northern Cardinal', scientific: 'Cardinalis cardinalis', status: 'Least Concern' },
    { name: 'American Robin', scientific: 'Turdus migratorius', status: 'Least Concern' },
    { name: 'Blue Jay', scientific: 'Cyanocitta cristata', status: 'Least Concern' },
    { name: 'Red-tailed Hawk', scientific: 'Buteo jamaicensis', status: 'Least Concern' },
    { name: 'Great Blue Heron', scientific: 'Ardea herodias', status: 'Least Concern' },
    { name: 'Ruby-throated Hummingbird', scientific: 'Archilochus colubris', status: 'Least Concern' },
  ];
  
  speciesData.forEach((s) => {
    database.run(
      `INSERT INTO species_dim (common_name, scientific_name, conservation_status) VALUES (?, ?, ?)`,
      [s.name, s.scientific, s.status]
    );
  });

  // Insert observers
  const expertiseLevels = ['Beginner', 'Amateur', 'Intermediate', 'Professional', 'Expert'];
  const observerNames = [
    'Alice Chen', 'Bob Martinez', 'Carol Johnson', 'David Kim', 'Emma Wilson',
    'Frank Brown', 'Grace Lee', 'Henry Davis', 'Iris Taylor', 'Jack Anderson',
    'Karen White', 'Leo Garcia', 'Maria Rodriguez', 'Nathan Moore', 'Olivia Thomas'
  ];
  
  for (let i = 0; i < 15; i++) {
    const joinDate = new Date(2020 + Math.floor(i / 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    database.run(
      `INSERT INTO observers_dim (observer_name, expertise_level, join_date) VALUES (?, ?, ?)`,
      [observerNames[i], expertiseLevels[i % expertiseLevels.length], joinDate.toISOString().split('T')[0]]
    );
  }

  // Insert locations
  const habitats = ['Forest', 'Wetland', 'Grassland', 'Coastal', 'Mountain', 'Urban'];
  const states = ['California', 'Texas', 'Florida', 'New York', 'Colorado', 'Washington'];
  const locationNames = [
    'Yosemite Valley', 'Everglades', 'Central Park', 'Rocky Mountain NP', 'Olympic Peninsula',
    'Great Smoky Mountains', 'Grand Canyon', 'Yellowstone', 'Acadia', 'Zion',
    'Sequoia National Park', 'Death Valley', 'Shenandoah', ' Glacier National Park', 'Big Bend'
  ];
  
  for (let i = 0; i < 15; i++) {
    const lat = 25 + Math.random() * 25;
    const lon = -120 + Math.random() * 50;
    const elev = Math.floor(Math.random() * 3000);
    database.run(
      `INSERT INTO locations_dim (locality_name, latitude, longitude, elevation, habitat_type, state, region) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [locationNames[i], lat, lon, elev, habitats[i % habitats.length], states[i % states.length], 'USA']
    );
  }

  // Insert checklists and observations
  const protocols = ['Stationary', 'Traveling', 'Driving'];
  const baseDate = new Date('2024-01-01');
  
  for (let i = 0; i < 50; i++) {
    const observerId = (i % 15) + 1;
    const locationId = (i % 15) + 1;
    const date = new Date(baseDate.getTime() + i * 86400000);
    const dateStr = date.toISOString().split('T')[0];
    const startTime = `${String(Math.floor(Math.random() * 12) + 6).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
    const duration = Math.floor(Math.random() * 120) + 15;
    const protocol = protocols[i % protocols.length];
    const distance = protocol === 'Stationary' ? 0 : Math.random() * 10;
    
    database.run(
      `INSERT INTO checklists_fact (observer_id, location_id, observation_date, start_time, duration_minutes, protocol_type, distance_km) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [observerId, locationId, dateStr, startTime, duration, protocol, distance]
    );
    
    // Add environmental metrics for this checklist
    const temp = Math.random() * 35 - 5;
    const wind = Math.random() * 50;
    const precip = Math.random() * 20;
    const weather = ['Clear', 'Cloudy', 'Rainy', 'Stormy', 'Foggy'][Math.floor(Math.random() * 5)];
    
    database.run(
      `INSERT INTO environmental_metrics (checklist_id, temperature_celsius, wind_speed_kmh, precipitation_mm, weather_description) VALUES (?, ?, ?, ?, ?)`,
      [i + 1, temp, wind, precip, weather]
    );
    
    // Add 2-4 observations per checklist
    const numObs = Math.floor(Math.random() * 3) + 2;
    for (let j = 0; j < numObs; j++) {
      const speciesId = (Math.floor(Math.random() * speciesData.length)) + 1;
      const count = Math.floor(Math.random() * 10) + 1;
      const gender = Math.random() > 0.5 ? (Math.random() > 0.5 ? 'Male' : 'Female') : null;
      
      database.run(
        `INSERT INTO observations_fact (checklist_id, species_id, bird_count, gender) VALUES (?, ?, ?, ?)`,
        [i + 1, speciesId, count, gender]
      );
    }
  }

  // Create indexes
  database.run('CREATE INDEX IF NOT EXISTS idx_species_status ON species_dim(conservation_status)');
  database.run('CREATE INDEX IF NOT EXISTS idx_observers_expertise ON observers_dim(expertise_level)');
  database.run('CREATE INDEX IF NOT EXISTS idx_locations_habitat ON locations_dim(habitat_type)');
  database.run('CREATE INDEX IF NOT EXISTS idx_checklists_observer ON checklists_fact(observer_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_checklists_location ON checklists_fact(location_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_checklists_date ON checklists_fact(observation_date)');
  database.run('CREATE INDEX IF NOT EXISTS idx_observations_checklist ON observations_fact(checklist_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_observations_species ON observations_fact(species_id)');
  database.run('CREATE INDEX IF NOT EXISTS idx_env_checklist ON environmental_metrics(checklist_id)');
  
  console.log('[DB] Seed data inserted successfully');
}

export function executeQuery(sql: string): { columns: string[]; values: unknown[][] } {
  if (!db) {
    throw new Error('Database not initialized');
  }

  try {
    const results = db.exec(sql);
    if (results.length === 0) {
      return { columns: [], values: [] };
    }
    return {
      columns: results[0].columns,
      values: results[0].values,
    };
  } catch (error) {
    throw error;
  }
}

export function getDatabase(): Database | null {
  return db;
}

import type { Level } from '@/types';

export const levels: Level[] = [
  // ============================================
  // FOUNDATIONAL (Levels 1-15)
  // Basic SQL: SELECT, WHERE, COUNT, SUM, AVG
  // ============================================
  {
    id: 1,
    title: "Critical Species Retrieval",
    description: `Extract the common and scientific names for all birds currently classified as 'Critically Endangered' in the species_dim table.

Return the common_name and scientific_name columns.`,
    hint: "Select from species_dim. Filter where conservation_status matches the危 status.",
    seedQuery: `SELECT common_name,
       scientific_name
  FROM species_dim
 WHERE conservation_status = 'Critically Endangered'`,
    solutionQuery: `SELECT common_name,
       scientific_name
  FROM species_dim
 WHERE conservation_status = 'Critically Endangered'`,
    epoch: "Foundational",
    difficulty: 1,
  },
  {
    id: 2,
    title: "Observer Count",
    description: `Calculate the total number of unique observers registered in the database.

Return a single value as total_observers.`,
    hint: "Count unique observer IDs from observers_dim.",
    seedQuery: `SELECT COUNT(DISTINCT observer_id) AS total_observers
  FROM observers_dim`,
    solutionQuery: `SELECT COUNT(DISTINCT observer_id) AS total_observers
  FROM observers_dim`,
    epoch: "Foundational",
    difficulty: 1,
  },
  {
    id: 3,
    title: "High Elevation Hotspots",
    description: `List the names of all birding hotspots located at an elevation of 2,500 meters or higher.

Return locality_name and elevation.`,
    hint: "From locations_dim, filter localities where elevation meets or exceeds 2500 meters.",
    seedQuery: `SELECT locality_name,
       elevation
  FROM locations_dim
 WHERE elevation >= 2500`,
    solutionQuery: `SELECT locality_name,
       elevation
  FROM locations_dim
 WHERE elevation >= 2500`,
    epoch: "Foundational",
    difficulty: 1,
  },
  {
    id: 4,
    title: "May 2024 Migration Records",
    description: `Retrieve all checklist IDs submitted during the primary migration month of May 2024.

Return checklist_id and observation_date.`,
    hint: "Query checklists_fact for dates within May 2024.",
    seedQuery: `SELECT checklist_id,
       observation_date
  FROM checklists_fact
 WHERE observation_date BETWEEN '2024-05-01' AND '2024-05-31'`,
    solutionQuery: `SELECT checklist_id,
       observation_date
  FROM checklists_fact
 WHERE observation_date BETWEEN '2024-05-01' AND '2024-05-31'`,
    epoch: "Foundational",
    difficulty: 1,
  },
  {
    id: 5,
    title: "Solitary Sightings",
    description: `Find all observation records where only a single individual was counted.

Return obs_id and species_id.`,
    hint: "Find records in observations_fact where a single bird was counted.",
    seedQuery: `SELECT obs_id,
       species_id
  FROM observations_fact
 WHERE bird_count = 1`,
    solutionQuery: `SELECT obs_id,
       species_id
  FROM observations_fact
 WHERE bird_count = 1`,
    epoch: "Foundational",
    difficulty: 1,
  },
  {
    id: 6,
    title: "Total Bird Abundance",
    description: `Determine the total number of individual birds recorded across all observations in the dataset.

Return a single value as aggregate_bird_abundance.`,
    hint: "Sum all bird_count values from observations_fact.",
    seedQuery: `SELECT SUM(bird_count) AS aggregate_bird_abundance
  FROM observations_fact`,
    solutionQuery: `SELECT SUM(bird_count) AS aggregate_bird_abundance
  FROM observations_fact`,
    epoch: "Foundational",
    difficulty: 1,
  },
  {
    id: 7,
    title: "Expert Observers",
    description: `List all observers who have reached the 'Professional' or 'Expert' expertise level.

Return observer_name and expertise_level.`,
    hint: "Filter observers_dim for the two highest expertise levels.",
    seedQuery: `SELECT observer_name,
       expertise_level
  FROM observers_dim
 WHERE expertise_level IN ('Professional', 'Expert')`,
    solutionQuery: `SELECT observer_name,
       expertise_level
  FROM observers_dim
 WHERE expertise_level IN ('Professional', 'Expert')`,
    epoch: "Foundational",
    difficulty: 1,
  },
  {
    id: 8,
    title: "Species Names in Observations",
    description: `Join the observations_fact and species_dim tables to return the common name for every bird count recorded.

Return obs_id, common_name, and bird_count.

Return the first 20 results.`,
    hint: "Join observations_fact to species_dim to connect counts with species names.",
    seedQuery: `SELECT o.obs_id,
       s.common_name,
       o.bird_count
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 LIMIT 20`,
    solutionQuery: `SELECT o.obs_id,
       s.common_name,
       o.bird_count
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 LIMIT 20`,
    epoch: "Foundational",
    difficulty: 2,
  },
  {
    id: 9,
    title: "Coastal Habitat Locations",
    description: `Identify all locations that contain the term 'Coastal' in their habitat description.

Return locality_name and habitat_type.`,
    hint: "Search locations_dim for habitats containing 'Coastal'.",
    seedQuery: `SELECT locality_name,
       habitat_type
  FROM locations_dim
 WHERE habitat_type LIKE '%Coastal%'`,
    solutionQuery: `SELECT locality_name,
       habitat_type
  FROM locations_dim
 WHERE habitat_type LIKE '%Coastal%'`,
    epoch: "Foundational",
    difficulty: 2,
  },
  {
    id: 10,
    title: "Species Richness per Checklist",
    description: `Count the number of distinct species identified in each submitted checklist.

Return checklist_id and species_richness.

Return the first 15 results.`,
    hint: "Group observations_fact by checklist and count species per group.",
    seedQuery: `SELECT checklist_id,
       COUNT(species_id) AS species_richness
  FROM observations_fact
 GROUP BY checklist_id
 LIMIT 15`,
    solutionQuery: `SELECT checklist_id,
       COUNT(species_id) AS species_richness
  FROM observations_fact
 GROUP BY checklist_id
 LIMIT 15`,
    epoch: "Foundational",
    difficulty: 2,
  },
  {
    id: 11,
    title: "Average Sampling Duration",
    description: `Calculate the mean duration of all birding sessions in the checklists_fact table.

Return a single value as average_sampling_duration.`,
    hint: "Calculate the average duration from checklists_fact.",
    seedQuery: `SELECT AVG(duration_minutes) AS average_sampling_duration
  FROM checklists_fact`,
    solutionQuery: `SELECT AVG(duration_minutes) AS average_sampling_duration
  FROM checklists_fact`,
    epoch: "Foundational",
    difficulty: 2,
  },
  {
    id: 12,
    title: "Temperature Extremes",
    description: `Find the maximum and minimum temperatures recorded during any sampling event.

Return max_temp and min_temp.`,
    hint: "Find the extreme temperature values from environmental_metrics.",
    seedQuery: `SELECT MAX(temperature_celsius) AS max_temp,
       MIN(temperature_celsius) AS min_temp
  FROM environmental_metrics`,
    solutionQuery: `SELECT MAX(temperature_celsius) AS max_temp,
       MIN(temperature_celsius) AS min_temp
  FROM environmental_metrics`,
    epoch: "Foundational",
    difficulty: 2,
  },
  {
    id: 13,
    title: "Recent Observers",
    description: `Sort the list of observers by their join date, from the most recent to the earliest.

Return observer_name and join_date.`,
    hint: "Sort observers_dim by join_date in descending order.",
    seedQuery: `SELECT observer_name,
       join_date
  FROM observers_dim
 ORDER BY join_date DESC`,
    solutionQuery: `SELECT observer_name,
       join_date
  FROM observers_dim
 ORDER BY join_date DESC`,
    epoch: "Foundational",
    difficulty: 2,
  },
  {
    id: 14,
    title: "Missing Duration Records",
    description: `Identify any checklists that were submitted without an associated duration value.

Return checklist_id.`,
    hint: "Find checklists where duration_minutes has no value.",
    seedQuery: `SELECT checklist_id
  FROM checklists_fact
 WHERE duration_minutes IS NULL`,
    solutionQuery: `SELECT checklist_id
  FROM checklists_fact
 WHERE duration_minutes IS NULL`,
    epoch: "Foundational",
    difficulty: 2,
  },
  {
    id: 15,
    title: "Formatted Taxonomy",
    description: `Create a formatted list of all species as "Common Name [Scientific Name]".

Return the formatted taxonomy string.

Return the first 10 results.`,
    hint: "Concatenate common_name with scientific_name using brackets.",
    seedQuery: `SELECT common_name || ' [' || scientific_name || ']' AS formatted_taxonomy
  FROM species_dim
 LIMIT 10`,
    solutionQuery: `SELECT common_name || ' [' || scientific_name || ']' AS formatted_taxonomy
  FROM species_dim
 LIMIT 10`,
    epoch: "Foundational",
    difficulty: 2,
  },

  // ============================================
  // INTERMEDIATE (Levels 16-30)
  // Window functions, subqueries, CASE, JOINs
  // ============================================
  {
    id: 16,
    title: "Habitat-Specific Abundance Ranking",
    description: `Rank the species within each habitat type based on their total individual count.

Return habitat_type, common_name, total_count, and habitat_rank.

Return the first 20 results.`,
    hint: "Use RANK() with PARTITION BY habitat_type and ORDER BY total_count to create rankings.",
    seedQuery: `SELECT l.habitat_type,
       s.common_name,
       SUM(o.bird_count) AS total_count,
       RANK() OVER (
           PARTITION BY l.habitat_type
           ORDER BY SUM(o.bird_count) DESC
       ) AS habitat_rank
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 GROUP BY l.habitat_type,
          s.common_name
 LIMIT 20`,
    solutionQuery: `SELECT l.habitat_type,
       s.common_name,
       SUM(o.bird_count) AS total_count,
       RANK() OVER (
           PARTITION BY l.habitat_type
           ORDER BY SUM(o.bird_count) DESC
       ) AS habitat_rank
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 GROUP BY l.habitat_type,
          s.common_name
 LIMIT 20`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 17,
    title: "Top Species Observers",
    description: `Find the top three observers who have sighted the highest number of unique species.

Return observer_name and unique_bird_count.`,
    hint: "Count distinct species per observer, order by count descending, limit to top 3.",
    seedQuery: `SELECT ob.observer_name,
       COUNT(DISTINCT o.species_id) AS unique_bird_count
  FROM observers_dim AS ob
       JOIN checklists_fact AS c
       ON ob.observer_id = c.observer_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY ob.observer_name
 ORDER BY unique_bird_count DESC
 LIMIT 3`,
    solutionQuery: `SELECT ob.observer_name,
       COUNT(DISTINCT o.species_id) AS unique_bird_count
  FROM observers_dim AS ob
       JOIN checklists_fact AS c
       ON ob.observer_id = c.observer_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY ob.observer_name
 ORDER BY unique_bird_count DESC
 LIMIT 3`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 18,
    title: "Sex Ratio Analysis",
    description: `Calculate the percentage of identified birds for each species that were recorded as 'Male'.

Return common_name and male_percentage.

Return the first 15 results.`,
    hint: "Use CASE to count only Male observations, then divide by total for percentage.",
    seedQuery: `SELECT s.common_name,
       100.0 * SUM(CASE WHEN o.gender = 'Male' THEN 1 ELSE 0 END) / COUNT(*) AS male_percentage
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 GROUP BY s.common_name
 LIMIT 15`,
    solutionQuery: `SELECT s.common_name,
       100.0 * SUM(CASE WHEN o.gender = 'Male' THEN 1 ELSE 0 END) / COUNT(*) AS male_percentage
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 GROUP BY s.common_name
 LIMIT 15`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 19,
    title: "Monthly Migration Totals",
    description: `Calculate the total birds sighted per month during 2024 to identify migration peaks.

Return month_start and monthly_total.

Return the first 12 results.`,
    hint: "Extract year-month from observation_date to group by month.",
    seedQuery: `SELECT strftime('%Y-%m', c.observation_date) AS month_start,
       SUM(o.bird_count) AS monthly_total
  FROM checklists_fact AS c
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 WHERE c.observation_date >= '2024-01-01'
   AND c.observation_date <= '2024-12-31'
 GROUP BY 1
 ORDER BY 1
 LIMIT 12`,
    solutionQuery: `SELECT strftime('%Y-%m', c.observation_date) AS month_start,
       SUM(o.bird_count) AS monthly_total
  FROM checklists_fact AS c
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 WHERE c.observation_date >= '2024-01-01'
   AND c.observation_date <= '2024-12-31'
 GROUP BY 1
 ORDER BY 1
 LIMIT 12`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 20,
    title: "Observer Cumulative Counts",
    description: `Generate a report showing the date of each checklist and the cumulative total of birds an observer has seen up to that date.

Return observer_id, observation_date, and cumulative_birds.

Return the first 20 results.`,
    hint: "Use a cumulative window function partitioned by observer_id to sum bird counts over time.",
    seedQuery: `SELECT c.observer_id,
       c.observation_date,
       SUM(SUM(o.bird_count)) OVER (
           PARTITION BY c.observer_id
           ORDER BY c.observation_date
       ) AS cumulative_birds
  FROM checklists_fact AS c
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY c.observer_id,
          c.observation_date
 LIMIT 20`,
    solutionQuery: `SELECT c.observer_id,
       c.observation_date,
       SUM(SUM(o.bird_count)) OVER (
           PARTITION BY c.observer_id
           ORDER BY c.observation_date
       ) AS cumulative_birds
  FROM checklists_fact AS c
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY c.observer_id,
          c.observation_date
 LIMIT 20`,
    epoch: "Intermediate",
    difficulty: 4,
  },
  {
    id: 21,
    title: "Multi-Habitat Species",
    description: `Identify species that have been observed in both 'Wetland' and 'Forest' habitats using a set operator.

Return common_name.`,
    hint: "Use INTERSECT to find species appearing in both Wetland and Forest habitats.",
    seedQuery: `SELECT s.common_name
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 WHERE l.habitat_type = 'Wetland'

INTERSECT

SELECT s.common_name
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 WHERE l.habitat_type = 'Forest'`,
    solutionQuery: `SELECT s.common_name
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 WHERE l.habitat_type = 'Wetland'

INTERSECT

SELECT s.common_name
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 WHERE l.habitat_type = 'Forest'`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 22,
    title: "Protocol Data Validation",
    description: `Identify checklists where the protocol was 'Stationary' but a 'distance_traveled' was incorrectly recorded as greater than zero.

Return checklist_id and observer_id.`,
    hint: "Find checklists where protocol_type is 'Stationary' but distance_km is greater than zero.",
    seedQuery: `SELECT checklist_id,
       observer_id
  FROM checklists_fact
 WHERE protocol_type = 'Stationary'
   AND distance_km > 0`,
    solutionQuery: `SELECT checklist_id,
       observer_id
  FROM checklists_fact
 WHERE protocol_type = 'Stationary'
   AND distance_km > 0`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 23,
    title: "Weather Correlation",
    description: `What is the average wind speed recorded during sightings of 'Peregrine Falcons'?

Return avg_wind_speed.`,
    hint: "Join environmental_metrics through checklists and observations to reach species_dim.",
    seedQuery: `SELECT AVG(e.wind_speed_kmh) AS avg_wind_speed
  FROM environmental_metrics AS e
       JOIN checklists_fact AS c
       ON e.checklist_id = c.checklist_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 WHERE s.common_name = 'Peregrine Falcon'`,
    solutionQuery: `SELECT AVG(e.wind_speed_kmh) AS avg_wind_speed
  FROM environmental_metrics AS e
       JOIN checklists_fact AS c
       ON e.checklist_id = c.checklist_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 WHERE s.common_name = 'Peregrine Falcon'`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 24,
    title: "High-Activity Hotspots",
    description: `List localities that have recorded more than 100 individual birds using the HAVING clause.

Return locality_name and total_birds.`,
    hint: "Group by location, filter with HAVING where total birds exceed 100.",
    seedQuery: `SELECT l.locality_name,
       SUM(o.bird_count) AS total_birds
  FROM locations_dim AS l
       JOIN checklists_fact AS c
       ON l.location_id = c.location_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY l.locality_name
HAVING SUM(o.bird_count) > 100`,
    solutionQuery: `SELECT l.locality_name,
       SUM(o.bird_count) AS total_birds
  FROM locations_dim AS l
       JOIN checklists_fact AS c
       ON l.location_id = c.location_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY l.locality_name
HAVING SUM(o.bird_count) > 100`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 25,
    title: "Year-over-Year Growth",
    description: `Calculate the percentage change in the number of checklists submitted between 2023 and 2024.

Return pct_change.`,
    hint: "Use a CTE to compute annual checklist counts, then calculate percentage change between years.",
    seedQuery: `WITH annual_counts AS (
    SELECT strftime('%Y', observation_date) AS yr,
           COUNT(*) AS cnt
      FROM checklists_fact
     WHERE strftime('%Y', observation_date) IN ('2023', '2024')
     GROUP BY 1
)
SELECT 100.0 * (t2.cnt - t1.cnt) / t1.cnt AS pct_change
  FROM annual_counts AS t1,
       annual_counts AS t2
 WHERE t1.yr = '2023'
   AND t2.yr = '2024'`,
    solutionQuery: `WITH annual_counts AS (
    SELECT strftime('%Y', observation_date) AS yr,
           COUNT(*) AS cnt
      FROM checklists_fact
     WHERE strftime('%Y', observation_date) IN ('2023', '2024')
     GROUP BY 1
)
SELECT 100.0 * (t2.cnt - t1.cnt) / t1.cnt AS pct_change
  FROM annual_counts AS t1,
       annual_counts AS t2
 WHERE t1.yr = '2023'
   AND t2.yr = '2024'`,
    epoch: "Intermediate",
    difficulty: 4,
  },
  {
    id: 26,
    title: "Above-Average Species",
    description: `List species that were sighted in counts higher than the average count for all species in the database.

Return common_name and bird_count.

Return the first 15 results.`,
    hint: "Use a subquery to find the average bird_count, then filter observations exceeding that value.",
    seedQuery: `SELECT s.common_name,
       o.bird_count
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 WHERE o.bird_count > (
     SELECT AVG(bird_count)
       FROM observations_fact
 )
 LIMIT 15`,
    solutionQuery: `SELECT s.common_name,
       o.bird_count
  FROM observations_fact AS o
       JOIN species_dim AS s
       ON o.species_id = s.species_id
 WHERE o.bird_count > (
     SELECT AVG(bird_count)
       FROM observations_fact
 )
 LIMIT 15`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 27,
    title: "Median Rainfall",
    description: `Find the median precipitation value across all checklists.

Return median_rainfall.`,
    hint: "Use PERCENTILE_CONT to find the median precipitation value.",
    seedQuery: `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY precipitation_mm) AS median_rainfall
  FROM environmental_metrics`,
    solutionQuery: `SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY precipitation_mm) AS median_rainfall
  FROM environmental_metrics`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 28,
    title: "Species-Location Grid",
    description: `Create a list of every unique species paired with every unique location to generate a master survey template.

Return common_name and locality_name.

Return the first 30 results.`,
    hint: "Use CROSS JOIN between species and locations to create all possible combinations.",
    seedQuery: `SELECT s.common_name,
       l.locality_name
  FROM species_dim AS s
       CROSS JOIN locations_dim AS l
 LIMIT 30`,
    solutionQuery: `SELECT s.common_name,
       l.locality_name
  FROM species_dim AS s
       CROSS JOIN locations_dim AS l
 LIMIT 30`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 29,
    title: "First Arrival of Season",
    description: `For each species, find the date of its first sighting in the year 2024.

Return common_name and first_appearance.`,
    hint: "Find the earliest observation_date for each species in 2024.",
    seedQuery: `SELECT s.common_name,
       MIN(c.observation_date) AS first_appearance
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
 WHERE c.observation_date >= '2024-01-01'
 GROUP BY s.common_name`,
    solutionQuery: `SELECT s.common_name,
       MIN(c.observation_date) AS first_appearance
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
 WHERE c.observation_date >= '2024-01-01'
 GROUP BY s.common_name`,
    epoch: "Intermediate",
    difficulty: 3,
  },
  {
    id: 30,
    title: "Rare Birds in Storms",
    description: `Retrieve all observations of 'Endangered' birds that occurred during a 'Storm' event.

Return common_name, bird_count, and weather_description.

Return the first 15 results.`,
    hint: "Join species, observations, checklists, and environmental_metrics. Filter by Endangered status and Storm weather.",
    seedQuery: `SELECT s.common_name,
       o.bird_count,
       e.weather_description
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN environmental_metrics AS e
       ON c.checklist_id = e.checklist_id
 WHERE s.conservation_status = 'Endangered'
   AND e.weather_description = 'Storm'
 LIMIT 15`,
    solutionQuery: `SELECT s.common_name,
       o.bird_count,
       e.weather_description
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN environmental_metrics AS e
       ON c.checklist_id = e.checklist_id
 WHERE s.conservation_status = 'Endangered'
   AND e.weather_description = 'Storm'
 LIMIT 15`,
    epoch: "Intermediate",
    difficulty: 4,
  },

  // ============================================
  // ADVANCED (Levels 31-40)
  // Complex queries, CTEs, advanced patterns
  // ============================================
  {
    id: 31,
    title: "Protocol Duration Classification",
    description: `Classify checklists as 'Brief' (<15 min), 'Standard' (15-60 min), or 'Extended' (>60 min).

Return checklist_id, duration_minutes, and duration_class.

Return the first 20 results.`,
    hint: "Use CASE to classify duration: below 15 is Brief, 15-60 is Standard, above 60 is Extended.",
    seedQuery: `SELECT checklist_id,
       duration_minutes,
       CASE
           WHEN duration_minutes < 15 THEN 'Brief'
           WHEN duration_minutes <= 60 THEN 'Standard'
           ELSE 'Extended'
       END AS duration_class
  FROM checklists_fact
 LIMIT 20`,
    solutionQuery: `SELECT checklist_id,
       duration_minutes,
       CASE
           WHEN duration_minutes < 15 THEN 'Brief'
           WHEN duration_minutes <= 60 THEN 'Standard'
           ELSE 'Extended'
       END AS duration_class
  FROM checklists_fact
 LIMIT 20`,
    epoch: "Advanced",
    difficulty: 3,
  },
  {
    id: 32,
    title: "Missing Species Names",
    description: `Display species names, using 'Unknown Species' if the common name is missing in the database.

Return bird_name.

Return the first 15 results.`,
    hint: "Use COALESCE to provide 'Unknown Species' when common_name is NULL.",
    seedQuery: `SELECT COALESCE(common_name, 'Unknown Species') AS bird_name
  FROM species_dim
 LIMIT 15`,
    solutionQuery: `SELECT COALESCE(common_name, 'Unknown Species') AS bird_name
  FROM species_dim
 LIMIT 15`,
    epoch: "Advanced",
    difficulty: 3,
  },
  {
    id: 33,
    title: "Concurrent Observations",
    description: `Find instances where the same observer submitted two different checklists at the exact same start time.

Return checklist_id, observer_id, and start_time.

Return the first 10 results.`,
    hint: "Self-join checklists_fact on observer_id and start_time to find duplicates.",
    seedQuery: `SELECT a.checklist_id,
       b.checklist_id,
       a.observer_id,
       a.start_time
  FROM checklists_fact AS a
       JOIN checklists_fact AS b
       ON a.observer_id = b.observer_id
       AND a.start_time = b.start_time
       AND a.checklist_id < b.checklist_id
 LIMIT 10`,
    solutionQuery: `SELECT a.checklist_id,
       b.checklist_id,
       a.observer_id,
       a.start_time
  FROM checklists_fact AS a
       JOIN checklists_fact AS b
       ON a.observer_id = b.observer_id
       AND a.start_time = b.start_time
       AND a.checklist_id < b.checklist_id
 LIMIT 10`,
    epoch: "Advanced",
    difficulty: 4,
  },
  {
    id: 34,
    title: "Birds per Expertise Level",
    description: `Calculate the average number of birds sighted per checklist for each expertise level.

Return expertise_level and avg_birds_per_session.`,
    hint: "Join observers, checklists, and observations. Group by expertise_level to calculate averages.",
    seedQuery: `SELECT ob.expertise_level,
       AVG(o.bird_count) AS avg_birds_per_session
  FROM observers_dim AS ob
       JOIN checklists_fact AS c
       ON ob.observer_id = c.observer_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY ob.expertise_level`,
    solutionQuery: `SELECT ob.expertise_level,
       AVG(o.bird_count) AS avg_birds_per_session
  FROM observers_dim AS ob
       JOIN checklists_fact AS c
       ON ob.observer_id = c.observer_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY ob.expertise_level`,
    epoch: "Advanced",
    difficulty: 3,
  },
  {
    id: 35,
    title: "Spatial Bounding Box",
    description: `Select all localities within a specific latitude/longitude bounding box (Lat: 25-40, Lon: -120 to -75).

Return locality_name, latitude, and longitude.`,
    hint: "Filter locations_dim using BETWEEN for both latitude (25-40) and longitude (-120 to -75).",
    seedQuery: `SELECT locality_name,
       latitude,
       longitude
  FROM locations_dim
 WHERE latitude BETWEEN 25 AND 40
   AND longitude BETWEEN -120 AND -75`,
    solutionQuery: `SELECT locality_name,
       latitude,
       longitude
  FROM locations_dim
 WHERE latitude BETWEEN 25 AND 40
   AND longitude BETWEEN -120 AND -75`,
    epoch: "Advanced",
    difficulty: 3,
  },
  {
    id: 36,
    title: "Taxonomic Lineage",
    description: `Find all species in the 'Forest' habitat that have appeared in more than 5 checklists.

Return common_name and checklist_count.

Return the first 15 results.`,
    hint: "Join species through observations and checklists to locations. Filter for Forest, group by species, filter with HAVING for count > 5.",
    seedQuery: `SELECT s.common_name,
       COUNT(*) AS checklist_count
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 WHERE l.habitat_type = 'Forest'
 GROUP BY s.common_name
HAVING COUNT(*) > 5
 LIMIT 15`,
    solutionQuery: `SELECT s.common_name,
       COUNT(*) AS checklist_count
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 WHERE l.habitat_type = 'Forest'
 GROUP BY s.common_name
HAVING COUNT(*) > 5
 LIMIT 15`,
    epoch: "Advanced",
    difficulty: 4,
  },
  {
    id: 37,
    title: "Yearly Species Counts",
    description: `Calculate the total count per species for each year.

Return year, common_name, and yearly_total.

Return the first 20 results.`,
    hint: "Extract year from observation_date, group by year and species to get yearly totals.",
    seedQuery: `SELECT strftime('%Y', c.observation_date) AS yr,
       s.common_name,
       SUM(o.bird_count) AS yearly_total
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
 GROUP BY 1,
          2
 ORDER BY 1,
          2
 LIMIT 20`,
    solutionQuery: `SELECT strftime('%Y', c.observation_date) AS yr,
       s.common_name,
       SUM(o.bird_count) AS yearly_total
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
 GROUP BY 1,
          2
 ORDER BY 1,
          2
 LIMIT 20`,
    epoch: "Advanced",
    difficulty: 3,
  },
  {
    id: 38,
    title: "Observer State Comparison",
    description: `Find all observers who have submitted checklists from more than one different state.

Return observer_name and state_count.`,
    hint: "Count distinct states per observer, filter with HAVING for more than 1 state.",
    seedQuery: `SELECT ob.observer_name,
       COUNT(DISTINCT l.state) AS state_count
  FROM observers_dim AS ob
       JOIN checklists_fact AS c
       ON ob.observer_id = c.observer_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 GROUP BY ob.observer_name
HAVING COUNT(DISTINCT l.state) > 1`,
    solutionQuery: `SELECT ob.observer_name,
       COUNT(DISTINCT l.state) AS state_count
  FROM observers_dim AS ob
       JOIN checklists_fact AS c
       ON ob.observer_id = c.observer_id
       JOIN locations_dim AS l
       ON c.location_id = l.location_id
 GROUP BY ob.observer_name
HAVING COUNT(DISTINCT l.state) > 1`,
    epoch: "Advanced",
    difficulty: 4,
  },
  {
    id: 39,
    title: "7-Day Moving Average",
    description: `Calculate a 7-day trailing moving average of the total birds observed at each location.

Return observation_date, daily_total, and moving_avg_7d.

Return the first 25 results.`,
    hint: "Use a window function with AVG and ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for 7-day moving average.",
    seedQuery: `SELECT observation_date,
       daily_total,
       AVG(daily_total) OVER (
           ORDER BY observation_date
           ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS moving_avg_7d
  FROM (
      SELECT c.observation_date,
             SUM(o.bird_count) AS daily_total
        FROM checklists_fact AS c
             JOIN observations_fact AS o
             ON c.checklist_id = o.checklist_id
       GROUP BY c.observation_date
  ) AS daily_series
 LIMIT 25`,
    solutionQuery: `SELECT observation_date,
       daily_total,
       AVG(daily_total) OVER (
           ORDER BY observation_date
           ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS moving_avg_7d
  FROM (
      SELECT c.observation_date,
             SUM(o.bird_count) AS daily_total
        FROM checklists_fact AS c
             JOIN observations_fact AS o
             ON c.checklist_id = o.checklist_id
       GROUP BY c.observation_date
  ) AS daily_series
 LIMIT 25`,
    epoch: "Advanced",
    difficulty: 5,
  },
  {
    id: 40,
    title: "Correlated Subquery: High Altitude Specialists",
    description: `Find observers who only submit checklists at locations above the average elevation in their respective state.

Return observer_id (unique).

Return the first 10 results.`,
    hint: "Use a correlated subquery to compare each location's elevation against the average for its state.",
    seedQuery: `SELECT DISTINCT c1.observer_id
  FROM checklists_fact AS c1
       JOIN locations_dim AS l1
       ON c1.location_id = l1.location_id
 WHERE l1.elevation > (
     SELECT AVG(l2.elevation)
       FROM locations_dim AS l2
      WHERE l2.state = l1.state
 )
 LIMIT 10`,
    solutionQuery: `SELECT DISTINCT c1.observer_id
  FROM checklists_fact AS c1
       JOIN locations_dim AS l1
       ON c1.location_id = l1.location_id
 WHERE l1.elevation > (
     SELECT AVG(l2.elevation)
       FROM locations_dim AS l2
      WHERE l2.state = l1.state
 )
 LIMIT 10`,
    epoch: "Advanced",
    difficulty: 5,
  },

  // ============================================
  // EXPERT (Levels 41-50)
  // Complex modeling, optimization, edge cases
  // ============================================
  {
    id: 41,
    title: "Seasonal Presence Pivot",
    description: `Show the total count of 'Northern Cardinal' in each month (Jan-Dec) as separate columns.

Return common_name and 12 monthly columns.

Return a single row.`,
    hint: "Use CASE expressions to pivot monthly counts into separate columns (Jan-Dec). Group by species.",
    seedQuery: `SELECT s.common_name,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '01' THEN o.bird_count ELSE 0 END) AS Jan,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '02' THEN o.bird_count ELSE 0 END) AS Feb,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '03' THEN o.bird_count ELSE 0 END) AS Mar,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '04' THEN o.bird_count ELSE 0 END) AS Apr,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '05' THEN o.bird_count ELSE 0 END) AS May,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '06' THEN o.bird_count ELSE 0 END) AS Jun,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '07' THEN o.bird_count ELSE 0 END) AS Jul,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '08' THEN o.bird_count ELSE 0 END) AS Aug,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '09' THEN o.bird_count ELSE 0 END) AS Sep,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '10' THEN o.bird_count ELSE 0 END) AS Oct,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '11' THEN o.bird_count ELSE 0 END) AS Nov,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '12' THEN o.bird_count ELSE 0 END) AS Dec
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
 WHERE s.common_name = 'Northern Cardinal'
 GROUP BY s.common_name`,
    solutionQuery: `SELECT s.common_name,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '01' THEN o.bird_count ELSE 0 END) AS Jan,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '02' THEN o.bird_count ELSE 0 END) AS Feb,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '03' THEN o.bird_count ELSE 0 END) AS Mar,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '04' THEN o.bird_count ELSE 0 END) AS Apr,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '05' THEN o.bird_count ELSE 0 END) AS May,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '06' THEN o.bird_count ELSE 0 END) AS Jun,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '07' THEN o.bird_count ELSE 0 END) AS Jul,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '08' THEN o.bird_count ELSE 0 END) AS Aug,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '09' THEN o.bird_count ELSE 0 END) AS Sep,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '10' THEN o.bird_count ELSE 0 END) AS Oct,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '11' THEN o.bird_count ELSE 0 END) AS Nov,
       SUM(CASE WHEN strftime('%m', c.observation_date) = '12' THEN o.bird_count ELSE 0 END) AS Dec
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
 WHERE s.common_name = 'Northern Cardinal'
 GROUP BY s.common_name`,
    epoch: "Expert",
    difficulty: 5,
  },
  {
    id: 42,
    title: "Top 10th Percentile Observers",
    description: `Rank observers by their 'Data Quality Score' and return those in the top 10th percentile.

Return observer_id and expertise_level.

Return the first 5 results.`,
    hint: "Use PERCENT_RANK() to rank observers by expertise level. Filter for top 10th percentile.",
    seedQuery: `SELECT observer_id,
       expertise_level
  FROM (
      SELECT observer_id,
             expertise_level,
             PERCENT_RANK() OVER (
                 ORDER BY CASE expertise_level
                     WHEN 'Expert' THEN 5
                     WHEN 'Professional' THEN 4
                     WHEN 'Intermediate' THEN 3
                     WHEN 'Amateur' THEN 2
                     ELSE 1
                 END DESC
             ) AS p_rank
        FROM observers_dim
  ) AS ranked_observers
 WHERE p_rank <= 0.1
 LIMIT 5`,
    solutionQuery: `SELECT observer_id,
       expertise_level
  FROM (
      SELECT observer_id,
             expertise_level,
             PERCENT_RANK() OVER (
                 ORDER BY CASE expertise_level
                     WHEN 'Expert' THEN 5
                     WHEN 'Professional' THEN 4
                     WHEN 'Intermediate' THEN 3
                     WHEN 'Amateur' THEN 2
                     ELSE 1
                 END DESC
             ) AS p_rank
        FROM observers_dim
  ) AS ranked_observers
 WHERE p_rank <= 0.1
 LIMIT 5`,
    epoch: "Expert",
    difficulty: 5,
  },
  {
    id: 43,
    title: "Duplicate Checklist Detection",
    description: `Identify checklists submitted by the same observer at the same location within 10 minutes of each other.

Return checklist_id, observer_id, location_id, and start_time.

Return the first 10 results.`,
    hint: "Use LAG to access the previous checklist time per observer/location. Check if times are within 10 minutes.",
    seedQuery: `SELECT checklist_id,
       observer_id,
       location_id,
       start_time
  FROM (
      SELECT checklist_id,
             observer_id,
             location_id,
             start_time,
             LAG(start_time) OVER (
                 PARTITION BY observer_id,
                            location_id
                 ORDER BY start_time
             ) AS prev_time
        FROM checklists_fact
  )
 WHERE prev_time IS NOT NULL
 LIMIT 10`,
    solutionQuery: `SELECT checklist_id,
       observer_id,
       location_id,
       start_time
  FROM (
      SELECT checklist_id,
             observer_id,
             location_id,
             start_time,
             LAG(start_time) OVER (
                 PARTITION BY observer_id,
                            location_id
                 ORDER BY start_time
             ) AS prev_time
        FROM checklists_fact
  )
 WHERE prev_time IS NOT NULL
 LIMIT 10`,
    epoch: "Expert",
    difficulty: 5,
  },
  {
    id: 44,
    title: "Third Highest Population Year",
    description: `Find the year that recorded the third-highest total count for 'Bald Eagles'.

Return obs_year and total_count.`,
    hint: "Use DENSE_RANK() to rank years by total Bald Eagle count. Filter for rank = 3.",
    seedQuery: `SELECT obs_year,
       total_count
  FROM (
      SELECT strftime('%Y', c.observation_date) AS obs_year,
             SUM(o.bird_count) AS total_count,
             DENSE_RANK() OVER (
                 ORDER BY SUM(o.bird_count) DESC
             ) AS population_rank
        FROM observations_fact AS o
             JOIN checklists_fact AS c
             ON o.checklist_id = c.checklist_id
             JOIN species_dim AS s
             ON o.species_id = s.species_id
       WHERE s.common_name = 'Bald Eagle'
       GROUP BY 1
  ) AS ranked_years
 WHERE population_rank = 3`,
    solutionQuery: `SELECT obs_year,
       total_count
  FROM (
      SELECT strftime('%Y', c.observation_date) AS obs_year,
             SUM(o.bird_count) AS total_count,
             DENSE_RANK() OVER (
                 ORDER BY SUM(o.bird_count) DESC
             ) AS population_rank
        FROM observations_fact AS o
             JOIN checklists_fact AS c
             ON o.checklist_id = c.checklist_id
             JOIN species_dim AS s
             ON o.species_id = s.species_id
       WHERE s.common_name = 'Bald Eagle'
       GROUP BY 1
  ) AS ranked_years
 WHERE population_rank = 3`,
    epoch: "Expert",
    difficulty: 5,
  },
  {
    id: 45,
    title: "Relative Abundance Trend",
    description: `Calculate the year-over-year change in 'Relative Abundance' (species count / total bird count) for 'Peregrine Falcon'.

Return year, rel_abundance, and abundance_trend.

Return the first 5 results.`,
    hint: "Use LAG() to calculate year-over-year change in relative abundance for Peregrine Falcon.",
    seedQuery: `WITH annual_stats AS (
    SELECT strftime('%Y', c.observation_date) AS yr,
           1.0 * SUM(CASE WHEN s.common_name = 'Peregrine Falcon' THEN o.bird_count ELSE 0 END) / 
           SUM(o.bird_count) AS rel_abundance
      FROM observations_fact AS o
           JOIN checklists_fact AS c
           ON o.checklist_id = c.checklist_id
           JOIN species_dim AS s
           ON o.species_id = s.species_id
     GROUP BY 1
)
SELECT yr,
       rel_abundance,
       rel_abundance - LAG(rel_abundance) OVER (
           ORDER BY yr
       ) AS abundance_trend
  FROM annual_stats
 LIMIT 5`,
    solutionQuery: `WITH annual_stats AS (
    SELECT strftime('%Y', c.observation_date) AS yr,
           1.0 * SUM(CASE WHEN s.common_name = 'Peregrine Falcon' THEN o.bird_count ELSE 0 END) / 
           SUM(o.bird_count) AS rel_abundance
      FROM observations_fact AS o
           JOIN checklists_fact AS c
           ON o.checklist_id = c.checklist_id
           JOIN species_dim AS s
           ON o.species_id = s.species_id
     GROUP BY 1
)
SELECT yr,
       rel_abundance,
       rel_abundance - LAG(rel_abundance) OVER (
           ORDER BY yr
       ) AS abundance_trend
  FROM annual_stats
 LIMIT 5`,
    epoch: "Expert",
    difficulty: 6,
  },
  {
    id: 46,
    title: "Gaps and Islands: Observer Streaks",
    description: `Identify observers who have submitted checklists for 3 or more consecutive days.

Return observer_id and streak_length.

Return the first 10 results.`,
    hint: "Use row numbers to detect gaps and islands in consecutive observation dates for each observer.",
    seedQuery: `WITH daily_activity AS (
    SELECT DISTINCT observer_id,
           observation_date
      FROM checklists_fact
),
grouped_activity AS (
    SELECT observer_id,
           observation_date,
           DATE(observation_date, '-' || (ROW_NUMBER() OVER (
               PARTITION BY observer_id
               ORDER BY observation_date
           ) - 1) || ' days') AS streak_group
      FROM daily_activity
)
SELECT observer_id,
       COUNT(*) AS streak_length
  FROM grouped_activity
 GROUP BY observer_id,
          streak_group
HAVING COUNT(*) >= 3
 LIMIT 10`,
    solutionQuery: `WITH daily_activity AS (
    SELECT DISTINCT observer_id,
           observation_date
      FROM checklists_fact
),
grouped_activity AS (
    SELECT observer_id,
           observation_date,
           DATE(observation_date, '-' || (ROW_NUMBER() OVER (
               PARTITION BY observer_id
               ORDER BY observation_date
           ) - 1) || ' days') AS streak_group
      FROM daily_activity
)
SELECT observer_id,
       COUNT(*) AS streak_length
  FROM grouped_activity
 GROUP BY observer_id,
          streak_group
HAVING COUNT(*) >= 3
 LIMIT 10`,
    epoch: "Expert",
    difficulty: 6,
  },
  {
    id: 47,
    title: "Multi-Year Activity Analysis",
    description: `Find observers who were active in 2023, had no submissions in 2024, but have returned in 2025.

Return observer_id.`,
    hint: "Use EXCEPT and INTERSECT to find observers active in 2023, absent in 2024, returned in 2025.",
    seedQuery: `SELECT DISTINCT observer_id
  FROM checklists_fact
 WHERE strftime('%Y', observation_date) = '2023'

EXCEPT

SELECT DISTINCT observer_id
  FROM checklists_fact
 WHERE strftime('%Y', observation_date) = '2024'

INTERSECT

SELECT DISTINCT observer_id
  FROM checklists_fact
 WHERE strftime('%Y', observation_date) = '2025'`,
    solutionQuery: `SELECT DISTINCT observer_id
  FROM checklists_fact
 WHERE strftime('%Y', observation_date) = '2023'

EXCEPT

SELECT DISTINCT observer_id
  FROM checklists_fact
 WHERE strftime('%Y', observation_date) = '2024'

INTERSECT

SELECT DISTINCT observer_id
  FROM checklists_fact
 WHERE strftime('%Y', observation_date) = '2025'`,
    epoch: "Expert",
    difficulty: 5,
  },
  {
    id: 48,
    title: "Weather Preference Analysis",
    description: `Find the most common weather condition for each species.

Return common_name and most_common_weather.

Return the first 15 results.`,
    hint: "Group by species, order by count descending to find the most frequent weather for each species.",
    seedQuery: `SELECT s.common_name,
       e.weather_description AS most_common_weather
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN environmental_metrics AS e
       ON c.checklist_id = e.checklist_id
 GROUP BY s.common_name
 ORDER BY s.common_name,
          COUNT(*) DESC
 LIMIT 15`,
    solutionQuery: `SELECT s.common_name,
       e.weather_description AS most_common_weather
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
       JOIN checklists_fact AS c
       ON o.checklist_id = c.checklist_id
       JOIN environmental_metrics AS e
       ON c.checklist_id = e.checklist_id
 GROUP BY s.common_name
 ORDER BY s.common_name,
          COUNT(*) DESC
 LIMIT 15`,
    epoch: "Expert",
    difficulty: 4,
  },
  {
    id: 49,
    title: "Species Diversity by State",
    description: `Calculate species diversity (unique species count) for each state.

Return state and species_diversity.

Return all results.`,
    hint: "Count distinct species per state by joining locations, checklists, and observations.",
    seedQuery: `SELECT l.state,
       COUNT(DISTINCT o.species_id) AS species_diversity
  FROM locations_dim AS l
       JOIN checklists_fact AS c
       ON l.location_id = c.location_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY l.state
 ORDER BY species_diversity DESC`,
    solutionQuery: `SELECT l.state,
       COUNT(DISTINCT o.species_id) AS species_diversity
  FROM locations_dim AS l
       JOIN checklists_fact AS c
       ON l.location_id = c.location_id
       JOIN observations_fact AS o
       ON c.checklist_id = o.checklist_id
 GROUP BY l.state
 ORDER BY species_diversity DESC`,
    epoch: "Expert",
    difficulty: 4,
  },
  {
    id: 50,
    title: "Conservation Status Summary",
    description: `Summarize the total bird counts by conservation status.

Return conservation_status, species_count, and total_individuals.`,
    hint: "Group observations by conservation_status. Use COUNT for species and SUM for total individuals.",
    seedQuery: `SELECT s.conservation_status,
       COUNT(DISTINCT s.species_id) AS species_count,
       SUM(o.bird_count) AS total_individuals
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
 GROUP BY s.conservation_status
 ORDER BY total_individuals DESC`,
    solutionQuery: `SELECT s.conservation_status,
       COUNT(DISTINCT s.species_id) AS species_count,
       SUM(o.bird_count) AS total_individuals
  FROM species_dim AS s
       JOIN observations_fact AS o
       ON s.species_id = o.species_id
 GROUP BY s.conservation_status
 ORDER BY total_individuals DESC`,
    epoch: "Expert",
    difficulty: 3,
  },
];

export const getLevel = (id: number): Level | undefined => {
  return levels.find((level) => level.id === id);
};

export const getLevelsByEpoch = (epoch: string): Level[] => {
  return levels.filter((level) => level.epoch === epoch);
};

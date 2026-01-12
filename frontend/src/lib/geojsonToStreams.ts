/**
 * Converte un GeoJSON (da GPX) in uno streams compatibile con Strava.
 * Supporta: latlng, altitude, distance, time (se disponibili),
 *           e cerca di estrarre FC, cadenza, potenza se presenti come estensioni.
 * Restituisce anche info su quali dati sono stati trovati.
 */
import { haversine, getRelativeTimes, getAltitudeArray, getLatLngArray, extractStreamsExtensions } from "./utils";

export function geojsonToStreams(geojson: any) {
  if (!geojson || !geojson.features || !geojson.features.length) return null;
  const feature = geojson.features[0];
  const coords = feature.geometry.coordinates; // [lon, lat, ele]
  const times = feature.properties.coordTimes || [];

  // --- Estrazione estensioni custom (es. FC, cadenza, potenza) ---
  const { hrArr, cadArr, powArr } = extractStreamsExtensions(feature.properties);

  // Calcolo distanza progressiva (in metri)
  let distanceArr: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    distanceArr[i] = distanceArr[i - 1] + haversine([prev[0], prev[1]], [curr[0], curr[1]]);
  }

  // Tempo relativo (secondi dall'inizio)
  let timeArr: number[] = [];
  if (times.length === coords.length) {
    timeArr = getRelativeTimes(times);
  }

  // Altitudine
  const altitudeArr = getAltitudeArray(coords);

  // LatLng
  const latlngArr = coords.map((c: any) => [c[1], c[0]]); // [lat, lon]

  // Info su dati trovati
  const info = {
    quota: altitudeArr.some(v => v != null),
    fc: !!hrArr,
    cadenza: !!cadArr,
    potenza: !!powArr,
    tempo: timeArr.length > 0,
    distanza: distanceArr.length > 0,
  };

  // Struttura compatibile con Strava
  return {
    latlng: { data: latlngArr },
    altitude: { data: altitudeArr },
    distance: { data: distanceArr },
    time: { data: timeArr.length ? timeArr : undefined },
    heartrate: hrArr ? { data: hrArr } : undefined,
    cadence: cadArr ? { data: cadArr } : undefined,
    watts: powArr ? { data: powArr } : undefined,
    _info: info, // campo ausiliario per la UI
  };
} 
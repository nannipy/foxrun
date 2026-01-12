import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDistance(meters: number): string {
  const kilometers = meters / 1000;
  return kilometers.toFixed(1);
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatPace(pace: number): string {
  if (!pace || isNaN(pace) || !isFinite(pace)) return "–";
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}/km`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Calcola la distanza in metri tra due coordinate [lon, lat] usando la formula di Haversine
export function haversine([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calcola array di secondi relativi dall'inizio, dato un array di stringhe ISO
export function getRelativeTimes(times: string[]): number[] {
  if (!Array.isArray(times) || times.length === 0) return [];
  const t0 = new Date(times[0]).getTime();
  return times.map(t => (new Date(t).getTime() - t0) / 1000);
}

// Estrae l'altitudine da un array di coordinate [lon, lat, ele]
export function getAltitudeArray(coords: any[]): (number|null)[] {
  return coords.map((c: any) => c[2] ?? null);
}

// Estrae array di [lat, lon] da array di coordinate [lon, lat, ele]
export function getLatLngArray(coords: any[]): [number, number][] {
  return coords.map((c: any) => [c[1], c[0]]);
}

// Estrae FC, cadenza, potenza da properties di un feature GeoJSON
export function extractStreamsExtensions(properties: any): {
  hrArr?: number[];
  cadArr?: number[];
  powArr?: number[];
} {
  let hrArr: number[] | undefined = undefined;
  let cadArr: number[] | undefined = undefined;
  let powArr: number[] | undefined = undefined;

  // 1. Cerca in properties.extensions (array di oggetti per ogni punto)
  if (properties.extensions && Array.isArray(properties.extensions)) {
    hrArr = properties.extensions.map((ext: any) => ext?.hr ?? null);
    cadArr = properties.extensions.map((ext: any) => ext?.cad ?? null);
    powArr = properties.extensions.map((ext: any) => ext?.power ?? null);
    // Se tutti null, ignora
    if (hrArr.every(v => v == null)) hrArr = undefined;
    if (cadArr.every(v => v == null)) cadArr = undefined;
    if (powArr.every(v => v == null)) powArr = undefined;
  }
  // 2. Alcuni parser mettono direttamente properties.hr, properties.cad, properties.power
  if (!hrArr && Array.isArray(properties.hr)) hrArr = properties.hr;
  if (!cadArr && Array.isArray(properties.cad)) cadArr = properties.cad;
  if (!powArr && Array.isArray(properties.power)) powArr = properties.power;

  return { hrArr, cadArr, powArr };
}

// Formatta secondi in mm:ss o hh:mm:ss
export function formatRecordTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "–";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Trova il miglior tempo su una distanza target, considerando anche i lap
export function getBestTimeForDistance(activities: any[], targetDistance: number) {
  const margin = targetDistance * 0.02;
  let best: any = null;
  let fromLap = false;
  activities.filter(a => a.type === "Run").forEach(a => {
    // 1. Prova con i lap, se presenti
    if (a.laps && Array.isArray(a.laps) && a.laps.length > 0) {
      a.laps.forEach((lap: any) => {
        if (
          lap.distance >= targetDistance - margin &&
          lap.distance <= targetDistance + margin &&
          lap.moving_time > 0
        ) {
          if (!best || lap.moving_time < best.moving_time) {
            best = {
              moving_time: lap.moving_time,
              start_date: lap.start_date || a.start_date,
              activity: a,
              fromLap: true
            };
            fromLap = true;
          }
        }
      });
    }
    // 2. Fallback: attività intera
    if (
      a.distance >= targetDistance - margin &&
      a.distance <= targetDistance + margin &&
      a.moving_time > 0 &&
      (!best || a.moving_time < best.moving_time)
    ) {
      best = {
        moving_time: a.moving_time,
        start_date: a.start_date,
        activity: a,
        fromLap: false
      };
    }
  });
  return best;
}

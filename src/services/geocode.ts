import axios from "axios";
import Geocode from "../models/Geocode";

const SEARCH_RESULT_LIMIT = 20;

type LocationAddress = {
  aeroway?: string;
  town?: string;
  village?: string;
  borough?: string;
  city?: string;
  suburb?: string;
  neighbourhood?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state?: string;
  province?: string;
  region?: string;
  postcode?: string;
  country?: string;
};

function buildLabelFromAddress(address: LocationAddress, fallback?: string) {
  let subject =
    address.aeroway ??
    address.town ??
    address.village ??
    address.borough ??
    address.city ??
    address.suburb ??
    address.neighbourhood ??
    address.hamlet ??
    address.municipality ??
    address.county;

  const state =
    address.state ??
    address.province ??
    address.region ??
    address.county ??
    address.city;

  if (subject === state) {
    if (subject === address.city) {
      subject =
        address.neighbourhood ??
        address.hamlet ??
        address.municipality ??
        address.county;
    } else subject = "";
  }

  const label = [
    subject ? `${subject},` : "",
    state,
    address.postcode,
  ].filter((x) => x);

  if (label.length === 0) {
    if (address.country) label.push(address.country);
    else if (fallback) label.push(fallback);
  }

  return label.join(" ");
}

function formatCoordinateLabel(lat: number | string, lon: number | string) {
  return `${lat}, ${lon}`;
}

export async function reverse(lat: number, lon: number): Promise<Geocode> {
  // TODO type response (it's weird)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;

  try {
    data = (
      await axios.get("/api/position/reverse", {
        params: {
          format: "jsonv2",
          lat,
          lon,
        },
      })
    ).data;
  } catch (_e) {
    data = {};
  }

  // Coordinates in ocean? API down?
  if (!data.address || !data)
    return {
      lat,
      lon,
      label: formatCoordinateLabel(lat, lon),
      isFallbackLabel: true,
    };

  return {
    lat,
    lon,
    label: buildLabelFromAddress(data.address),
  };
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name?: string;
  address?: LocationAddress;
}

export async function searchLocations(
  q: string,
  limit = SEARCH_RESULT_LIMIT,
): Promise<Geocode[]> {
  const { data } = await axios.get<SearchResult[]>("/api/position/search", {
    params: {
      format: "jsonv2",
      limit,
      q,
    },
  });

  if (!Array.isArray(data) || data.length === 0)
    throw new Error("No data found matching query");

  return data.map((result) => {
    const labelFallback =
      result.display_name ??
      formatCoordinateLabel(parseFloat(result.lat), parseFloat(result.lon));

    const label =
      result.address && Object.keys(result.address).length
        ? buildLabelFromAddress(result.address, labelFallback)
        : labelFallback;

    return {
      lat: +result.lat,
      lon: +result.lon,
      label,
    };
  });
}

export async function search(q: string): Promise<{ lat: number; lon: number }> {
  const results = await searchLocations(q, 1);

  if (!results.length) throw new Error("No data found matching query");

  const [result] = results;

  return {
    lat: result.lat,
    lon: result.lon,
  };
}

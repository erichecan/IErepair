export type Store = {
  id: string;
  name: string;
  address: string;
  city: string;
  eircode: string;
  phone: string;
  email: string;
  hours: Record<string, string>;
  lat: number;
  lng: number;
  mapsUrl: string;
  rating: number;
  reviewCount: number;
};

export const STORES: Store[] = [
  {
    id: "ierepair-dublin-city",
    name: "IErepair Dublin City",
    address: "14 Henry Street",
    city: "Dublin 1",
    eircode: "D01 F9X6",
    phone: "+353 1 234 5678",
    email: "dublin@ierepair.ie",
    hours: {
      "Mon–Fri": "9:00 – 18:00",
      "Saturday": "10:00 – 17:00",
      "Sunday": "Closed",
    },
    lat: 53.3491,
    lng: -6.2612,
    mapsUrl: "https://maps.google.com/?q=14+Henry+Street+Dublin",
    rating: 4.9,
    reviewCount: 312,
  },
  {
    id: "ierepair-cork",
    name: "IErepair Cork",
    address: "22 St. Patrick's Street",
    city: "Cork",
    eircode: "T12 DF28",
    phone: "+353 21 456 7890",
    email: "cork@ierepair.ie",
    hours: {
      "Mon–Fri": "9:00 – 18:00",
      "Saturday": "10:00 – 17:00",
      "Sunday": "Closed",
    },
    lat: 51.8985,
    lng: -8.4756,
    mapsUrl: "https://maps.google.com/?q=22+St+Patricks+Street+Cork",
    rating: 4.8,
    reviewCount: 198,
  },
  {
    id: "ierepair-galway",
    name: "IErepair Galway",
    address: "8 Shop Street",
    city: "Galway",
    eircode: "H91 YD65",
    phone: "+353 91 123 456",
    email: "galway@ierepair.ie",
    hours: {
      "Mon–Fri": "9:00 – 18:00",
      "Saturday": "10:00 – 17:00",
      "Sunday": "Closed",
    },
    lat: 53.2743,
    lng: -9.0514,
    mapsUrl: "https://maps.google.com/?q=8+Shop+Street+Galway",
    rating: 4.9,
    reviewCount: 145,
  },
  {
    id: "ierepair-limerick",
    name: "IErepair Limerick",
    address: "45 O'Connell Street",
    city: "Limerick",
    eircode: "V94 N6E5",
    phone: "+353 61 234 567",
    email: "limerick@ierepair.ie",
    hours: {
      "Mon–Fri": "9:00 – 18:00",
      "Saturday": "10:00 – 17:00",
      "Sunday": "Closed",
    },
    lat: 52.6638,
    lng: -8.6267,
    mapsUrl: "https://maps.google.com/?q=45+OConnell+Street+Limerick",
    rating: 4.7,
    reviewCount: 89,
  },
];

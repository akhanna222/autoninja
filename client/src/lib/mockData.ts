export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  fuelType: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Automatic" | "Manual";
  imageUrl: string;
  verificationScore: number;
  history: {
    owners: number;
    accidents: boolean;
    finance: boolean;
    serviceHistory: "Full" | "Partial" | "None";
  };
  badges: {
    logbookVerified: boolean;
    mileageVerified: boolean;
    photosVerified: boolean;
    priceGood: boolean;
  };
}

export const mockCars: Car[] = [
  {
    id: "1",
    make: "BMW",
    model: "5 Series 520d M Sport",
    year: 2023,
    price: 54950,
    mileage: 12500,
    location: "Dublin",
    fuelType: "Diesel",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&q=80&w=1000",
    verificationScore: 98,
    history: {
      owners: 1,
      accidents: false,
      finance: false,
      serviceHistory: "Full",
    },
    badges: {
      logbookVerified: true,
      mileageVerified: true,
      photosVerified: true,
      priceGood: true,
    },
  },
  {
    id: "2",
    make: "Audi",
    model: "A6 S Line Black Edition",
    year: 2021,
    price: 42000,
    mileage: 45000,
    location: "Cork",
    fuelType: "Diesel",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1603584173870-7b2310d618c6?auto=format&fit=crop&q=80&w=1000",
    verificationScore: 92,
    history: {
      owners: 1,
      accidents: false,
      finance: false,
      serviceHistory: "Full",
    },
    badges: {
      logbookVerified: true,
      mileageVerified: true,
      photosVerified: true,
      priceGood: false,
    },
  },
  {
    id: "3",
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2022,
    price: 38500,
    mileage: 28000,
    location: "Galway",
    fuelType: "Electric",
    transmission: "Automatic",
    imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000",
    verificationScore: 100,
    history: {
      owners: 1,
      accidents: false,
      finance: false,
      serviceHistory: "Full",
    },
    badges: {
      logbookVerified: true,
      mileageVerified: true,
      photosVerified: true,
      priceGood: true,
    },
  },
  {
    id: "4",
    make: "Volkswagen",
    model: "Golf R-Line",
    year: 2020,
    price: 24950,
    mileage: 62000,
    location: "Limerick",
    fuelType: "Petrol",
    transmission: "Manual",
    imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000",
    verificationScore: 85,
    history: {
      owners: 2,
      accidents: false,
      finance: false,
      serviceHistory: "Partial",
    },
    badges: {
      logbookVerified: true,
      mileageVerified: false,
      photosVerified: true,
      priceGood: true,
    },
  },
];

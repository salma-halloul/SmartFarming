export type AnimalHealth = 'healthy' | 'warning' | 'critical';

export type Animal = {
    id: string;
    name: string;
    type: 'Vache' | 'Taureau' | 'Veau' | 'Brebis' | 'Chèvre' | string;
    age: string;
    health: AnimalHealth;
    lastCheck: string;
    photoBase64?: string;
    createdAt?: Date;
  };
  
  export type AnimalAlert = {
    id: string;
    name: string;
    issue: string;
    level: 'warning' | 'critical';
  };
  
  export type LivestockData = {
    all: Animal[];
    alerts: AnimalAlert[];
  };
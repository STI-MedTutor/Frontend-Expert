// Types et interfaces pour tout le système STI

// ════════════════════════════════════════════════════════════════════
// AUTH & APPRENANT
// ════════════════════════════════════════════════════════════════════

export interface Apprenant {
  id: number;
  nom: string;
  prenom: string;
  age: number;
  niveau_scolaire: string;
  email: string;
  sexe: string;
  langue: string;
  notes_tuteur: string;
  points: number;
  niveau: string;
  date_creation: string;
  derniere_connexion: string;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  age: number;
  niveau_scolaire: string;
  email: string;
  mot_de_passe: string;
  sexe: string;
  langue: string;
}

export interface LoginData {
  email: string;
  mot_de_passe: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user_type: 'apprenant' | 'gerant';
  user: Apprenant;
}

export interface ApprenantStats {
  points: number;
  niveau: string;
  points_prochain_niveau: number | null;
  points_restants: number;
  date_creation: string;
}

// ════════════════════════════════════════════════════════════════════
// CAS CLINIQUE (Structure Figure 1 - Expert Agent)
// ═══════════════════════════════════════════════════════════════════

export interface MetadataClinique {
  pathologie: string;
  niveau_complexite: string;
  preuve_integrite: string;
  variante?: string;
}

export interface DonneesPersonnelles {
  age: number;
  sexe: string;
  etat_civil?: string;
  profession?: string;
  nombre_enfants?: number;
  groupe_sanguin?: string;
  qualite_eau?: string;
  moustiquaire?: boolean;
  animal_compagnie?: string;
  lieu?: string;
}

export interface ParametresVitaux {
  poids_kg?: number;
  taille_cm?: number;
  temperature?: number;
  pression_arterielle?: string;
  frequence_cardiaque?: number;
  saturation_o2?: number;
  frequence_respiratoire?: number;
}

export interface VoyageInfo {
  nom: string;
  frequence?: string;
  duree?: string;
}

export interface AddictionInfo {
  nom: string;
  frequence?: string;
  duree?: string;
}

export interface Symptome {
  nom: string;
  localisation?: string;
  date_debut?: string;
  frequence?: string;
  duree?: string;
  evolution?: string;
  activite_declenchante?: string;
}

export interface DiagnosticPhysique {
  nom: string;
  resultat: string;
}

export interface TraitementObservation {
  nom: string;
  mode_transmission?: string;
  date_observation?: string;
  observation?: string;
  efficacite?: string;
}

export interface ExamenComplementaire {
  resultat: string;
  anatomie?: string;
}

export interface MaladieChronique {
  nom: string;
  observation?: string;
}

export interface AllergieInfo {
  manifestation?: string;
  declencheur?: string;
  nom: string;
  date_debut_fin?: string;
}

export interface TraitementPrescrit {
  nom: string;
  duree?: string;
  posologie?: string;
}

export interface ChirurgieInfo {
  nom: string;
  date: string;
}

export interface AntecedentObstetrical {
  nom: string;
  date: string;
  nombre_grossesses?: number;
}

export interface HistoireMaladieDetaillee {
  motif_consultation: string;
  debut_symptomes?: string;
  evolution?: string;
  facteurs_associes?: string;
}

export interface TutorContext {
  patient_id: string;
  age: number;
  antecedents?: string[];
  vitals?: Record<string, string>;
  symptomes_connus?: string[];
}

export interface CasClinique {
  id: string;
  date_extraction: string;
  metadata: MetadataClinique;
  donnees_personnelles: DonneesPersonnelles;
  parametres_vitaux?: ParametresVitaux;
  voyage?: VoyageInfo[];
  mode_vie?: {
    activite_physique?: string;
    alimentation?: string;
    situation_familiale?: string;
  };
  addictions?: AddictionInfo[];
  addiction?: AddictionInfo[]; // certains dumps utilisent le singulier
  symptomes: Symptome[];
  diagnostic_physique?: DiagnosticPhysique[];
  traitement_en_cours?: TraitementObservation[];
  motif_consultation: string;
  examen_complementaire?: ExamenComplementaire[];
  antecedents_familiaux?: string[];
  antecedents_medicaux?: {
    maladies?: MaladieChronique[];
    allergies?: AllergieInfo[];
  };
  traitement?: TraitementPrescrit[];
  chirurgie?: ChirurgieInfo[];
  antecedents_obstetricaux?: AntecedentObstetrical[];
  histoire_maladie: HistoireMaladieDetaillee;
  comportement?: {
    temperament?: string;
    langue?: string;
    niveau_langage?: string;
  };
  // Champs uniquement disponibles côté Expert pour la validation finale
  diagnosis_reel?: string;
  examens_attendus?: string[];
  traitements_attendus?: string[];
}

// Historique cas cliniques (table backend)
export interface CasCliniqueHistorique {
  id: number;
  apprenant_id: number;
  cas_id: number; // INTEGER dans SQLite
  titre: string;
  type: string;
  description_courte: string;
  date_consultation: string;
}


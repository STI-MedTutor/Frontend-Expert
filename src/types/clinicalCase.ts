export interface MedicalStaff {
    username: string;
    first_name: string;
    last_name: string;
    role: string;
}

export interface Patient {
    id: string;
    add_date: string;
    first_name: string;
    last_name: string;
    gender: string;
    phone_number: string;
    birth_date: string;
    address: string;
    email: string;
    condition: string;
    status: string;
    medical_folder?: {
        create_date: string;
        last_modification_date: string;
        folder_code: string;
        is_closed: boolean;
    };
}

export interface MedicalParameters {
    weight?: number;
    height?: number;
    temperature?: number;
    blood_pressure?: string;
    heart_rate?: number;
    chronical_diseases?: string;
    allergies?: string;
    surgeries?: string;
    current_medication?: string;
    family_medical_history?: string;
    skin_appearance?: string;
}

export interface MedicalFolderPage {
    page_number?: number;
    add_date?: string;
    nurse_note?: string;
    doctor_note?: string;
    diagnostic?: string;
    parameters?: MedicalParameters;
}

// Types pour les examens médicaux
export interface ExamResult {
    add_date: string;
    notes: string;
    exam_file?: string;
}

export interface Exam {
    exam_name: string;
    exam_cost: number;
    exam_description: string;
}

export interface ExamRequest {
    add_date: string;
    exam_name: string;
    exam_status: string;
    notes?: string;
    exam: Exam;
    results: ExamResult[];
}

// Types pour les prescriptions
export interface Medicament {
    name: string;
    price: number;
    current_stock: number;
}

export interface Drug {
    quantity: number;
    dosage: string;
    instructions: string;
    frequency: string;
    duration: string;
    medicament: Medicament;
}

export interface Prescription {
    add_date: string;
    note?: string;
    drugs: Drug[];
}

// Types pour les hospitalisations
export interface Room {
    room_label: string;
    beds: number;
    busy_beds: number;
    price: number;
    type: string;
}

export interface Hospitalisation {
    at_date: string;
    bed_label: string;
    note?: string;
    is_active: boolean;
    payment_status: string;
    remove_at?: string;
    room: Room;
}

// Types pour la facturation
export interface Bill {
    bill_code: string;
    date: string;
    amount: number;
    is_accounted: boolean;
}

export interface BillItem {
    quantity: number;
    unity_price: number;
    designation: string;
    total: number;
    bill: Bill;
}

// Types pour les rendez-vous
export interface Appointment {
    at_date: string;
    reason: string;
    state: string;
    status: string;
}

// Métadonnées du cas clinique (pour STI)
export interface CaseMetadata {
    pathologie: string;
    domaine?: string;
    niveau_complexite: 'debutant' | 'intermediaire' | 'avance';
    preuve_integrite?: string;
    cas_type?: 'clinique' | 'ecole';
}

// Type complet du cas clinique (conforme à fultang.json)
export interface ClinicalCase {
    id: string;
    consultation_date: string;
    consultation_price: number;
    consultation_reason: string;
    consultation_notes?: string;
    payment_status: string;
    state: string;
    state_patient: string;
    consultation_type: {
        type_doctor: string;
        price: number;
    };
    medical_staff_giver?: MedicalStaff;
    medical_staff_sender?: MedicalStaff;
    patient: Patient;
    medical_folder_page?: MedicalFolderPage;
    exam_requests?: ExamRequest[];
    prescriptions?: Prescription[];
    hospitalisations?: Hospitalisation[];
    bill_items?: BillItem[];
    appointments?: Appointment[];
    metadata?: CaseMetadata;
}

export interface IncidentSource {
  name: string;
  url: string;
  category: "media" | "stk" | "regulatory";
}

export const TURKISH_INCIDENT_SOURCES: IncidentSource[] = [
  { name: "TurkInform", url: "https://turkinform.com.tr", category: "media" },
  { name: "DonanımHaber", url: "https://www.donanimhaber.com", category: "media" },
  { name: "ShiftDelete", url: "https://shiftdelete.net", category: "media" },
  { name: "Technopat", url: "https://www.technopat.net", category: "media" },
  { name: "Webrazzi", url: "https://webrazzi.com", category: "media" },
  { name: "EGirişim", url: "https://egirisim.com", category: "media" },
  { name: "Anadolu Ajansı", url: "https://www.aa.com.tr", category: "media" },
  { name: "TRT Haber", url: "https://www.trthaber.com", category: "media" },
  { name: "KVKK", url: "https://www.kvkk.gov.tr", category: "regulatory" },
  { name: "BTK", url: "https://www.btk.gov.tr", category: "regulatory" },
  { name: "Türkiye Bilişim Derneği", url: "https://www.tbd.org.tr", category: "stk" },
  { name: "Türkiye Bilişim Vakfı", url: "https://www.tbv.org.tr", category: "stk" },
  { name: "TÜBİSAD", url: "https://www.tubisad.org.tr", category: "stk" },
  { name: "TÜBİTAK", url: "https://www.tubitak.gov.tr", category: "regulatory" },
];


interface Capability {
  icon: string;
  titleKey: keyof typeof import('./translations').translations['pl']['help'];
  descriptionKey: keyof typeof import('./translations').translations['pl']['help'];
}

export const helpCapabilities: Capability[] = [
  {
    icon: "📅",
    titleKey: "schedules",
    descriptionKey: "schedulesDesc",
  },
  {
    icon: "👤",
    titleKey: "contacts",
    descriptionKey: "contactsDesc",
  },
  {
    icon: "📝",
    titleKey: "forms",
    descriptionKey: "formsDesc",
  },
  {
    icon: "🗺️",
    titleKey: "routes",
    descriptionKey: "routesDesc",
  },
  {
    icon: "📧",
    titleKey: "emails",
    descriptionKey: "emailsDesc",
  },
  {
    icon: "📊",
    titleKey: "grades",
    descriptionKey: "gradesDesc",
  },
  {
    icon: "ℹ️",
    titleKey: "info",
    descriptionKey: "infoDesc",
  },
];

export const helpExampleKeys = [
  "example1",
  "example2",
  "example3",
  "example4",
] as const;

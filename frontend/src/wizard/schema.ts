export type FieldType = 'single' | 'multi' | 'short' | 'long' | 'number' | 'money';

export interface Option {
  value: string;
  labelKey: string;
}

export interface Field {
  id: string;
  type: FieldType;
  labelKey: string;
  placeholderKey?: string;
  required?: boolean;
  options?: Option[];
  allowCustom?: boolean;
  helpKey?: string;
  // Conditional visibility: show this field only if another field's value matches.
  // The check walks across all step answers (any step, so it works across sections).
  visibleWhen?: { field: string; in: string[] };
}

// Which business models count as "has a physical location" (storefront/premises).
export const PHYSICAL_MODELS = [
  'retail', 'gastro', 'cafe', 'bar', 'craft', 'taxi', 'care', 'beauty',
  'fitness', 'medical', 'therapy', 'realestate', 'events', 'autoservice',
  'cleaning', 'logistics', 'manufacturing',
];
// Which business models are strongly regulated (need permits/certifications)
export const REGULATED_MODELS = [
  'care', 'medical', 'therapy', 'gastro', 'cafe', 'bar', 'taxi',
  'autoservice', 'education', 'realestate',
];

export interface Step {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  fields: Field[];
}

export interface Section {
  id: 'executive_summary' | 'business_idea' | 'customers' | 'company' | 'finance' | 'appendix';
  titleKey: string;
  descriptionKey?: string;
  steps: Step[];
}

const BUSINESS_MODELS: Option[] = [
  { value: 'retail', labelKey: 'models.retail' },
  { value: 'ecommerce', labelKey: 'models.ecommerce' },
  { value: 'gastro', labelKey: 'models.gastro' },
  { value: 'cafe', labelKey: 'models.cafe' },
  { value: 'bar', labelKey: 'models.bar' },
  { value: 'craft', labelKey: 'models.craft' },
  { value: 'taxi', labelKey: 'models.taxi' },
  { value: 'care', labelKey: 'models.care' },
  { value: 'beauty', labelKey: 'models.beauty' },
  { value: 'fitness', labelKey: 'models.fitness' },
  { value: 'medical', labelKey: 'models.medical' },
  { value: 'therapy', labelKey: 'models.therapy' },
  { value: 'realestate', labelKey: 'models.realestate' },
  { value: 'education', labelKey: 'models.education' },
  { value: 'events', labelKey: 'models.events' },
  { value: 'photography', labelKey: 'models.photography' },
  { value: 'autoservice', labelKey: 'models.autoservice' },
  { value: 'cleaning', labelKey: 'models.cleaning' },
  { value: 'logistics', labelKey: 'models.logistics' },
  { value: 'saas', labelKey: 'models.saas' },
  { value: 'agency', labelKey: 'models.agency' },
  { value: 'consulting', labelKey: 'models.consulting' },
  { value: 'service', labelKey: 'models.service' },
  { value: 'manufacturing', labelKey: 'models.manufacturing' },
  { value: 'other', labelKey: 'models.other' },
];

const LEGAL_FORMS: Option[] = [
  { value: 'einzelunternehmen', labelKey: 'legal.einzelunternehmen' },
  { value: 'gbr', labelKey: 'legal.gbr' },
  { value: 'ug', labelKey: 'legal.ug' },
  { value: 'gmbh', labelKey: 'legal.gmbh' },
  { value: 'ag', labelKey: 'legal.ag' },
  { value: 'freelancer', labelKey: 'legal.freelancer' },
  { value: 'other', labelKey: 'legal.other' },
];

export const SECTIONS: Section[] = [
  {
    id: 'business_idea',
    titleKey: 'sections.business_idea.title',
    descriptionKey: 'sections.business_idea.desc',
    steps: [
      {
        id: 'idea_core',
        titleKey: 'steps.idea_core.title',
        fields: [
          { id: 'company_name', type: 'short', labelKey: 'f.company_name', required: true },
          { id: 'business_model', type: 'single', labelKey: 'f.business_model', options: BUSINESS_MODELS, required: true },
          { id: 'one_liner', type: 'short', labelKey: 'f.one_liner', helpKey: 'f.one_liner.help' },
          { id: 'products', type: 'long', labelKey: 'f.products', helpKey: 'f.products.help', required: true },
          { id: 'customer_value', type: 'long', labelKey: 'f.customer_value' },
        ],
      },
      {
        id: 'market',
        titleKey: 'steps.market.title',
        fields: [
          { id: 'market_size', type: 'long', labelKey: 'f.market_size' },
          { id: 'competitors', type: 'long', labelKey: 'f.competitors' },
          { id: 'usp', type: 'long', labelKey: 'f.usp' },
        ],
      },
    ],
  },
  {
    id: 'customers',
    titleKey: 'sections.customers.title',
    steps: [
      {
        id: 'target_group',
        titleKey: 'steps.target_group.title',
        fields: [
          {
            id: 'target_type',
            type: 'multi',
            labelKey: 'f.target_type',
            options: [
              { value: 'b2c_private', labelKey: 'target.b2c_private' },
              { value: 'b2b_small', labelKey: 'target.b2b_small' },
              { value: 'b2b_mid', labelKey: 'target.b2b_mid' },
              { value: 'b2b_enterprise', labelKey: 'target.b2b_enterprise' },
              { value: 'public', labelKey: 'target.public' },
            ],
          },
          { id: 'target_description', type: 'long', labelKey: 'f.target_description' },
        ],
      },
      {
        id: 'channels',
        titleKey: 'steps.channels.title',
        fields: [
          {
            id: 'channels',
            type: 'multi',
            labelKey: 'f.channels',
            options: [
              { value: 'web', labelKey: 'channels.web' },
              { value: 'store', labelKey: 'channels.store' },
              { value: 'direct', labelKey: 'channels.direct' },
              { value: 'partners', labelKey: 'channels.partners' },
              { value: 'marketplace', labelKey: 'channels.marketplace' },
              { value: 'social', labelKey: 'channels.social' },
            ],
            allowCustom: true,
          },
          { id: 'retention', type: 'long', labelKey: 'f.retention' },
        ],
      },
    ],
  },
  {
    id: 'company',
    titleKey: 'sections.company.title',
    steps: [
      {
        id: 'founders',
        titleKey: 'steps.founders.title',
        fields: [
          { id: 'founders', type: 'long', labelKey: 'f.founders', helpKey: 'f.founders.help' },
          { id: 'employees', type: 'long', labelKey: 'f.employees' },
          { id: 'partners', type: 'long', labelKey: 'f.partners' },
        ],
      },
      {
        id: 'location_legal',
        titleKey: 'steps.location_legal.title',
        fields: [
          { id: 'location', type: 'short', labelKey: 'f.location', visibleWhen: { field: 'business_model', in: PHYSICAL_MODELS } },
          { id: 'legal_form', type: 'single', labelKey: 'f.legal_form', options: LEGAL_FORMS, required: true },
          { id: 'regulations', type: 'long', labelKey: 'f.regulations', visibleWhen: { field: 'business_model', in: REGULATED_MODELS } },
          { id: 'risks', type: 'long', labelKey: 'f.risks' },
        ],
      },
    ],
  },
  {
    id: 'finance',
    titleKey: 'sections.finance.title',
    steps: [
      {
        id: 'capital',
        titleKey: 'steps.capital.title',
        fields: [
          { id: 'capital_need', type: 'money', labelKey: 'f.capital_need', required: true },
          { id: 'equity', type: 'money', labelKey: 'f.equity' },
          {
            id: 'financing',
            type: 'multi',
            labelKey: 'f.financing',
            options: [
              { value: 'equity', labelKey: 'fin.equity' },
              { value: 'bank_loan', labelKey: 'fin.bank_loan' },
              { value: 'kfw', labelKey: 'fin.kfw' },
              { value: 'microloan', labelKey: 'fin.microloan' },
              { value: 'grant', labelKey: 'fin.grant' },
              { value: 'investor', labelKey: 'fin.investor' },
              { value: 'crowdfunding', labelKey: 'fin.crowdfunding' },
            ],
            allowCustom: true,
          },
          { id: 'private_need', type: 'money', labelKey: 'f.private_need' },
        ],
      },
      {
        id: 'plan',
        titleKey: 'steps.plan.title',
        descriptionKey: 'steps.plan.desc',
        fields: [],
      },
    ],
  },
  {
    id: 'appendix',
    titleKey: 'sections.appendix.title',
    steps: [
      {
        id: 'extras',
        titleKey: 'steps.extras.title',
        fields: [
          { id: 'extra_notes', type: 'long', labelKey: 'f.extra_notes' },
        ],
      },
    ],
  },
  {
    id: 'executive_summary',
    titleKey: 'sections.executive_summary.title',
    descriptionKey: 'sections.executive_summary.desc',
    steps: [
      {
        id: 'summary_review',
        titleKey: 'steps.summary_review.title',
        descriptionKey: 'steps.summary_review.desc',
        fields: [],
      },
    ],
  },
];

export const SECTION_ORDER = SECTIONS.map((s) => s.id);

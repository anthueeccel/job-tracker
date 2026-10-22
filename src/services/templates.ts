import { JobOpportunity, RecruiterContact } from '../types/job';

export type TemplateLanguage = 'en' | 'es' | 'pt';

export interface LocalizedContent {
  title: string;
  description: string;
  subject: string;
  body: string;
}

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'followup' | 'thank_you' | 'feedback' | 'offer';
  description: string;
  subject: string;
  body: string;
}

export interface MultiLangMessageTemplate {
  id: string;
  category: 'followup' | 'thank_you' | 'feedback' | 'offer';
  translations: Record<TemplateLanguage, LocalizedContent>;
}

export const MULTILANG_TEMPLATES: MultiLangMessageTemplate[] = [
  {
    id: 'followup_7_days',
    category: 'followup',
    translations: {
      en: {
        title: '5-7 Days Status Check Follow-up',
        description: 'Polite and enthusiastic message inquiring about the status of your application or initial screen.',
        subject: 'Following up on {{jobTitle}} application - {{company}}',
        body: `Hi {{recruiterName}},

I hope you're having a great week!

I wanted to briefly follow up and reiterate my strong interest in the {{jobTitle}} position at {{company}}. I remain very excited about your team's mission and technical direction.

Could you let me know if there are any updates regarding the next steps in the hiring process, or if you need any additional portfolio pieces or information from my end?

Thank you so much for your time and guidance.

Best regards,`
      },
      es: {
        title: 'Seguimiento tras 5-7 días sin respuesta',
        description: 'Mensaje cordial y profesional para consultar el estado del proceso selectivo.',
        subject: 'Seguimiento de candidatura - {{jobTitle}} en {{company}}',
        body: `Hola {{recruiterName}},

Espero que estés teniendo una excelente semana.

Te escribo brevemente para reiterar mi gran interés en la oportunidad de {{jobTitle}} en {{company}}. Sigo muy entusiasmado(a) con la visión del equipo y los desafíos técnicos que están abordando.

¿Podrías comentarme si hay alguna novedad sobre las próximas etapas del proceso de selección, o si necesitáis algún detalle o documentación adicional por mi parte?

Muchas gracias por tu tiempo y dedicación.

Un cordial saludo,`
      },
      pt: {
        title: 'Acompanhamento após 5-7 dias sem resposta',
        description: 'Mensagem cordial demonstrando interesse contínuo na oportunidade após candidatura ou triagem.',
        subject: 'Acompanhamento da candidatura - {{jobTitle}} na {{company}}',
        body: `Olá {{recruiterName}}, tudo bem?

Espero que esta mensagem o(a) encontre bem.

Gostaria de reiterar meu grande interesse na oportunidade de {{jobTitle}} na {{company}}. Continuo muito entusiasmado(a) com a missão e os desafios da equipe.

Gostaria de saber se há alguma atualização sobre o andamento do processo seletivo ou se vocês precisam de mais alguma informação ou material adicional da minha parte.

Agradeço pela atenção e sigo à disposição!

Atenciosamente,`
      }
    }
  },
  {
    id: 'thank_you_interview',
    category: 'thank_you',
    translations: {
      en: {
        title: 'Post-Interview Thank You Note',
        description: 'Send within 24 hours of your interview with the recruiter, hiring manager, or technical panel.',
        subject: 'Thank you for our conversation - {{jobTitle}} at {{company}}',
        body: `Hi {{recruiterName}},

Thank you so much for taking the time to speak with me today about the {{jobTitle}} opportunity at {{company}}.

I really enjoyed learning more about the team's current roadmaps and technical initiatives. Our conversation reinforced my enthusiasm for the role, and I am confident that my background will allow me to make an immediate, meaningful impact.

Please let me know if you need any further details or references. I look forward to hearing about the next steps!

Warm regards,`
      },
      es: {
        title: 'Agradecimiento posterior a la entrevista',
        description: 'Para enviar el mismo día o al día siguiente de la entrevista con RRHH o el equipo técnico.',
        subject: 'Agradecimiento por la entrevista - {{jobTitle}} - {{company}}',
        body: `Hola {{recruiterName}},

Muchas gracias por la enriquecedora conversación que tuvimos hoy sobre la posición de {{jobTitle}} en {{company}}.

Me ha motivado aún más conocer en profundidad los proyectos actuales y la cultura del equipo. Estoy convencido(a) de que mi experiencia puede aportar valor inmediato a los objetivos comentados.

Quedo a la espera de los siguientes pasos y a tu completa disposición ante cualquier información adicional.

Un cordial saludo,`
      },
      pt: {
        title: 'Agradecimento pós-entrevista',
        description: 'Excelente para enviar no mesmo dia ou no dia seguinte à entrevista com o RH ou gestor.',
        subject: 'Agradecimento pela entrevista - {{jobTitle}} - {{company}}',
        body: `Olá {{recruiterName}},

Muito obrigado(a) pela conversa enriquecedora que tivemos hoje sobre a vaga de {{jobTitle}} na {{company}}.

Fiquei ainda mais motivado(a) ao conhecer mais sobre os projetos atuais e a cultura da equipe. Tenho convicção de que minha experiência pode agregar valor significativo aos objetivos discutidos.

Fico no aguardo dos próximos passos e continuo à disposição caso necessitem de qualquer detalhe complementar.

Um abraço cordial,`
      }
    }
  },
  {
    id: 'challenge_submission',
    category: 'followup',
    translations: {
      en: {
        title: 'Technical Challenge / Take-Home Follow-up',
        description: 'For following up on submitted take-home assignments or code challenges.',
        subject: 'Status update on submitted challenge - {{jobTitle}} - {{company}}',
        body: `Hi {{recruiterName}},

I hope you're doing well. I submitted the take-home challenge for the {{jobTitle}} position last week and wanted to check in to see if the engineering team has had a chance to review it.

I'd welcome the opportunity to walk through my architectural decisions, discuss test coverage, and answer any questions the evaluators might have.

Thanks again, and I look forward to your thoughts!`
      },
      es: {
        title: 'Seguimiento de prueba técnica / Take-home',
        description: 'Para consultar el estado de revisión de la prueba de código o caso práctico entregado.',
        subject: 'Estado de evaluación de la prueba técnica - {{jobTitle}} - {{company}}',
        body: `Hola {{recruiterName}},

¿Qué tal? Entregué el desafío técnico para la posición de {{jobTitle}} la semana pasada y me gustaría saber si el equipo de ingeniería ha tenido oportunidad de revisarlo.

Estaré encantado(a) de presentar la solución, comentar las decisiones de arquitectura adoptadas y responder a cualquier duda del equipo evaluador.

¡Muchas gracias y que tengas una excelente semana!`
      },
      pt: {
        title: 'Acompanhamento de desafio técnico / Take-home',
        description: 'Para acompanhar a avaliação do case ou teste prático enviado.',
        subject: 'Status da avaliação do desafio prático - {{jobTitle}} - {{company}}',
        body: `Olá {{recruiterName}},

Tudo bem? Entreguei o desafio técnico para a vaga de {{jobTitle}} na semana passada e gostaria de checar se a equipe de engenharia teve a oportunidade de revisá-lo.

Estou muito disponível para apresentar a solução, detalhar minhas decisões de arquitetura e trocar ideias com os avaliadores técnicos.

Obrigado(a) pelo retorno e tenham uma ótima semana!`
      }
    }
  },
  {
    id: 'constructive_feedback',
    category: 'feedback',
    translations: {
      en: {
        title: 'Graceful Constructive Feedback Request',
        description: 'When notified that an application is not advancing, to collect valuable professional feedback.',
        subject: 'Thank you & quick feedback request - {{jobTitle}} at {{company}}',
        body: `Hi {{recruiterName}},

Thank you for letting me know the outcome for the {{jobTitle}} role at {{company}}.

While I am disappointed that we won't be moving forward together right now, I truly enjoyed meeting the team and learning about your culture. If you or the interviewers have a moment to share any constructive feedback on areas where I could strengthen my profile for future roles, I would greatly appreciate it.

I wish {{company}} continued success and hope our paths cross again in the future!

Best,`
      },
      es: {
        title: 'Solicitud de feedback constructivo',
        description: 'Cuando la empresa comunica que no avanza el proceso, para recoger aprendizajes valiosos.',
        subject: 'Agradecimiento y solicitud de feedback - {{jobTitle}} en {{company}}',
        body: `Hola {{recruiterName}},

Muchas gracias por informarme del resultado del proceso para {{jobTitle}} en {{company}}.

Aunque lamento que no avancemos en esta ocasión, ha sido un placer conocer al equipo y la cultura de la empresa. Si dispones de un momento y te resulta posible, agradecería cualquier feedback constructivo sobre aspectos en los que pueda fortalecer mi perfil de cara a futuras oportunidades.

Deseo muchos éxitos a {{company}} y espero que sigamos en contacto en LinkedIn.

Un cordial saludo,`
      },
      pt: {
        title: 'Solicitação de feedback construtivo',
        description: 'Quando a empresa comunica encerramento do processo, para colher aprendizados valiosos.',
        subject: 'Agradecimento e feedback - Processo {{jobTitle}} - {{company}}',
        body: `Olá {{recruiterName}},

Agradeço pelo retorno sobre a posição de {{jobTitle}} na {{company}}.

Embora eu lamente não avançarmos neste momento, foi um prazer imenso conhecer vocês e a organização. Se for possível e fizer sentido no seu tempo, adoraria receber algum feedback pontual sobre pontos que eu possa aprimorar para futuras oportunidades na {{company}}.

Desejo muito sucesso ao time e espero que possamos manter contato no LinkedIn!

Um abraço,`
      }
    }
  },
  {
    id: 'competing_offer',
    category: 'offer',
    translations: {
      en: {
        title: 'Timeline Acceleration (Competing Offer Received)',
        description: 'To let the company know you received another offer while keeping them as your top choice.',
        subject: 'Important timeline update regarding {{jobTitle}} - {{company}}',
        body: `Hi {{recruiterName}},

I hope all is well with you.

I wanted to reach out with a quick update regarding my timeline. I have recently received a formal offer from another organization with an upcoming response deadline.

However, {{company}} remains my top choice and preferred opportunity for {{jobTitle}}. Could you share where things stand with your review process and if there is a possibility to expedite the remaining stages?

I sincerely appreciate your help and flexibility!`
      },
      es: {
        title: 'Aceleración de tiempos (Oferta competidora recibida)',
        description: 'Para comunicar cordialmente que tienes otra oferta activa, manteniendo su empresa como tu opción prioritaria.',
        subject: 'Actualización de disponibilidad y tiempos - {{jobTitle}} en {{company}}',
        body: `Hola {{recruiterName}},

Espero que todo vaya muy bien.

Me pongo en contacto para compartir una breve actualización respecto a mis tiempos: recientemente he recibido una oferta formal de otra compañía con una fecha límite de respuesta próxima.

No obstante, la oportunidad de {{jobTitle}} en {{company}} sigue siendo mi máxima prioridad y opción preferida. Por ello, me gustaría consultar si tenéis previsión sobre las siguientes fases para coordinar mis plazos con total transparencia.

¡Agradezco enormemente vuestra comprensión y apoyo!`
      },
      pt: {
        title: 'Aceleração de prazos (Outra oferta recebida)',
        description: 'Para informar gentilmente que você recebeu outra proposta, mas a vaga deles é a sua preferida.',
        subject: 'Atualização importante de disponibilidade - Processo {{jobTitle}} - {{company}}',
        body: `Olá {{recruiterName}},

Espero que esteja tendo uma excelente semana.

Estou entrando em contato para compartilhar uma atualização rápida: recebi recentemente uma proposta formal de outra empresa com um prazo de resposta próximo.

No entanto, a oportunidade de {{jobTitle}} na {{company}} continua sendo minha principal prioridade e maior interesse profissional. Por isso, gostaria de checar se vocês têm previsão sobre as próximas etapas para que eu possa alinhar meus prazos com transparência.

Agradeço imensamente pela consideração e compreensão!`
      }
    }
  }
];

export function getLocalizedTemplate(
  template: MultiLangMessageTemplate,
  lang: TemplateLanguage
): MessageTemplate {
  const trans = template.translations[lang] || template.translations['en'];
  return {
    id: template.id,
    category: template.category,
    title: trans.title,
    description: trans.description,
    subject: trans.subject,
    body: trans.body
  };
}

export function getAllTemplatesForLanguage(lang: TemplateLanguage): MessageTemplate[] {
  return MULTILANG_TEMPLATES.map((t) => getLocalizedTemplate(t, lang));
}

// Backward-compatible default export in English
export const FOLLOWUP_TEMPLATES: MessageTemplate[] = getAllTemplatesForLanguage('en');

export function fillTemplate(
  template: MessageTemplate,
  job: JobOpportunity,
  contact?: RecruiterContact,
  lang: TemplateLanguage = 'en'
): { subject: string; body: string } {
  let defaultRecruiter = 'Hiring Team';
  if (lang === 'es') defaultRecruiter = 'Equipo de Selección';
  if (lang === 'pt') defaultRecruiter = 'Equipe de Seleção';

  const recruiterName = contact?.name || defaultRecruiter;
  const company = job.company;
  const jobTitle = job.title;

  const replaceVars = (text: string) => {
    return text
      .replace(/{{recruiterName}}/g, recruiterName)
      .replace(/{{company}}/g, company)
      .replace(/{{jobTitle}}/g, jobTitle);
  };

  return {
    subject: replaceVars(template.subject),
    body: replaceVars(template.body)
  };
}

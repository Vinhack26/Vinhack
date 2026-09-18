import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

/**
 * Generate fallback mock analysis when LLM_API_KEY is not set or API fails
 * @param {object} incident - Incident database record
 */

const generateMockAnalysis = (incident) => {
  const possibleData = Array.isArray(incident.possible_data_exposed)
    ? incident.possible_data_exposed
    : typeof incident.possible_data_exposed === 'string'
      ? JSON.parse(incident.possible_data_exposed || '[]')
      : [];

  return {
    summary: `Initial automated breach triage for "${incident.title}". Suspected exposure involving ${incident.affected_system || 'affected system'}. Current status is logged as '${incident.current_status}'. Immediate containment and log preservation are recommended.`,

    dataCategories: [
      {
        category: "contact_information",
        items: possibleData.filter(d => d.includes('email') || d.includes('phone') || d.includes('address')),
        status: "potentially_exposed"
      },
      {
        category: "identity_credentials",
        items: possibleData.filter(d => !d.includes('email') && !d.includes('phone') && !d.includes('address')),
        status: "potentially_exposed"
      }
    ].filter(cat => cat.items.length > 0),

    possibleImpact: [
      {
        impact: "targeted_phishing",
        reason: "Exposure of contact information (emails/phone numbers) significantly increases susceptibility to spear-phishing campaigns.",
        severity: "medium"
      },
      {
        impact: "unauthorized_reconnaissance",
        reason: "Public or unauthenticated endpoints could allow external scanning of internal asset structures.",
        severity: "low"
      }
    ],

    missingInformation: [
      {
        question: "Were full network flow / firewall logs retained during the discovery window?",
        reason: "Essential to calculate precise exfiltration data volume."
      },
      {
        question: "Is the affected database or host accessible from external public IP addresses?",
        reason: "Determines if exposure is limited to local subnet or publicly accessible."
      }
    ],

    confirmedFacts: [
      `Incident reported as '${incident.title}' on system '${incident.affected_system}'.`,
      `Discovery time recorded at ${incident.discovery_time}.`,
      `Actions taken prior to report: ${incident.actions_already_taken || 'None specified'}.`
    ],

    userAssumptions: [
      "Assuming exposure was limited to the categories reported.",
      "Assuming database access has been contained or restricted."
    ],

    aiInterpretations: [
      "Based on available input, this incident is categorized as a suspected exposure.",
      "No direct evidence of data exfiltration or active compromise is present in initial telemetry.",
      "Disclaimer: This guidance is an initial operational aid, not legal or forensic certification."
    ],

    checklist: [
      {
        task: `Isolate and revoke public or unauthenticated access to ${incident.affected_system}`,
        category: "containment",
        priority: "high"
      },
      {
        task: "Preserve all server access logs, netflow logs, and firewall event logs for forensic review",
        category: "investigation",
        priority: "high"
      },
      {
        task: "Audit all active database administrative accounts and rotate secrets/API keys",
        category: "recovery",
        priority: "medium"
      },
      {
        task: "Prepare an initial internal incident briefing for leadership and technical response team",
        category: "communication",
        priority: "medium"
      }
    ],

    notificationDraft: {
      subject: `[Security Advisory] Notice regarding suspected exposure on ${incident.affected_system}`,
      body: `Dear Affected Stakeholders,\n\nWe are writing to provide an initial update regarding a suspected security event affecting ${incident.affected_system}.\n\nWhat Happened:\nOn ${new Date(incident.discovery_time).toUTCString()}, we identified a potential misconfiguration affecting ${incident.affected_system}.\n\nPotentially Impacted Data Categories:\n- ${possibleData.join('\n- ')}\n\nActions Taken:\nWe immediately initiated containment procedures: ${incident.actions_already_taken || 'System isolation and log preservation'}.\n\nNext Steps:\nWe are conducting a complete investigation. Further updates will be provided as verified facts become available.\n\nBreachBuddy Incident Response Team`
    }
  };
};

/**
 * Analyzes an incident using Gemini LLM API or fallback Mock service
 * @param {object} incident - Incident record from DB
 */
export const analyzeIncidentWithAI = async (incident) => {
  // Fallback to Mock provider if API key is missing
  if (!env.LLM_API_KEY || env.LLM_API_KEY.trim() === '') {
    if (env.NODE_ENV !== 'test') {
      console.log('[AI Service] LLM_API_KEY not configured. Utilizing built-in Mock AI Analysis provider.');
    }
    return generateMockAnalysis(incident);
  }

  try {
    const ai = new GoogleGenAI({ apiKey: env.LLM_API_KEY });
    const prompt = `
You are a senior cybersecurity incident response architect.
Analyze the following suspected data breach incident and return a strict JSON object.

INCIDENT DETAILS:
Title: ${incident.title}
Type: ${incident.incident_type}
Description: ${incident.description}
Discovery Time: ${incident.discovery_time}
Affected System: ${incident.affected_system}
Current Status: ${incident.current_status}
Possible Data Exposed: ${JSON.stringify(incident.possible_data_exposed)}
Actions Already Taken: ${incident.actions_already_taken || 'None'}

STRICT AI SAFETY RULES:
1. Never claim data was stolen or exfiltrated without explicit concrete evidence.
2. Never claim a breach is confirmed if current status is suspected or unverified.
3. Clearly distinguish confirmed facts from user assumptions and AI interpretations.
4. Identify critical unknown or missing information needed to assess impact.
5. Do not request real passwords, secret keys, or API tokens.
6. Do not generate unsupported legal conclusions or binding statements.
7. Include explicit disclaimer that this is an initial guide, not legal or forensic advice.

OUTPUT REQUIREMENTS:
Respond ONLY with a valid JSON object matching this exact structure:
{
  "summary": "String concise executive summary",
  "dataCategories": [
    {
      "category": "contact_information | financial | credentials | identity | other",
      "items": ["list", "of", "items"],
      "status": "potentially_exposed"
    }
  ],
  "possibleImpact": [
    {
      "impact": "phishing | credential_stuffing | identity_theft | unauthorized_access | other",
      "reason": "explanation string",
      "severity": "high | medium | low"
    }
  ],
  "missingInformation": [
    {
      "question": "Question string",
      "reason": "Why this question matters"
    }
  ],
  "confirmedFacts": ["Fact 1", "Fact 2"],
  "userAssumptions": ["Assumption 1"],
  "aiInterpretations": ["Interpretation 1"],
  "checklist": [
    {
      "task": "Task action description",
      "category": "containment | investigation | recovery | communication",
      "priority": "high | medium | low"
    }
  ],
  "notificationDraft": {
    "subject": "Email subject string",
    "body": "Email draft body string using verified facts only"
  }
}
`;

    const response = await ai.models.generateContent({
      model: env.LLM_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text();
    const parsedData = JSON.parse(responseText);
    return parsedData;
  } catch (err) {
    console.error('[AI Service Error] Failed to query LLM API. Falling back to Mock AI Provider.', err.message);
    return generateMockAnalysis(incident);
  }
};

export default {
  analyzeIncidentWithAI
};

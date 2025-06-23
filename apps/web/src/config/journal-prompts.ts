export interface JournalTemplateVars {
  content: string;    // The main journal content from textarea
  date: string;      // Formatted date
  author: string;    // Author's name
  subject: string;   // Name of person under care
}

export const JOURNAL_SYSTEM_PROMPT = `
Du er en AI-assistent, der har til opgave at forbedre socialarbejdernes arbejdsjournaler. Denne opgave er afgørende for at opretholde compliance, forberede sig på potentielle revisioner og sikre socialrådgivernes fortsatte ansættelse og deres organisationers succes. Dit mål er at analysere en given journalpost og generere en forbedret version, der overholder bedste praksis.

Du får udleveret følgende oplysninger:

<entry_date>
{{date}}
</entry_date>

<forfatter_navn>
{{author}}
</author_name>.

<borger_navn>
{{subject}}
</citizen_name> </citizen_name

<journal_entry>
{{content}}
</journal_entry> </journal_entry

Her er de bedste praksis metoder til at skrive effektive dagbogsoptegnelser:

0. Inkluder {{date}} øverst i den forbedrede post, men udelad de omsluttende tags <entry_date> fra svaret.
1. Vær objektiv og faktuel, og undgå personlige meninger eller vurderinger.
2. Brug et klart og kortfattet sprog, og sørg for at bruge verber og bestemte artikler konsekvent af hensyn til læsbarheden. Vær helt sikker på, at du ikke forkorter lange input - det er en risiko for at fjerne information.
3. Medtag specifikke detaljer om subjektets interaktion med verden, herunder dato, tid og sted. Undgå at opfinde detaljer, som ikke er til stede i det oprindelige indlæg, men spor kun det, der er til stede i det oprindelige indlæg.
4. Dokumenter borgerens adfærd, humør og eventuelle ændringer, der er observeret.
5. Registrer eventuelle interventioner eller ydelser
6. Noter eventuelle opfølgende handlinger eller planer, der skal huskes for {{subject}}.
7. Brug professionel terminologi, der passer til området
8. Bevar fortroligheden ved kun at bruge nødvendige identificerende oplysninger
9. Læs korrektur for stave- og grammatikfejl
10. Undgå for enhver pris at navngive andre personer i indlægget, brug kun navnet på {{subject}} og {{author}} af indlægget. Alle andre, der ved et uheld bliver nævnt, skal forkortes til det første bogstav i deres fornavn.
11. Overhold altid dette datoformat: DD-MM-YYYY.

Analysér den medfølgende dagbogspost, mens du holder dig disse best practices for øje. Lav derefter en forbedret version af dagbogsposten, som inkorporerer disse best practices, samtidig med at du bevarer de væsentlige oplysninger fra den oprindelige post.

Giv dit svar i følgende format (markdown command words are prepended to the respective target line using []):

[h3] Borgernavn: {{subject}}
[h3] Forfatter: {{author}}
[h3] Dato: {{date}}

[h4] Morgen: [text]<alt hvad der skete om morgenen, inklusive tid og sted, i overensstemmelse med bedste praksis metoder>.
[h4] Middag: [text]<alt hvad der skete midt på dagen, inklusive tid og sted, i overensstemmelse med bedste praksis metoder>
[h4] Om aftenen: [text]<alt hvad der skete om aftenen, inklusive tid og sted, i overensstemmelse med bedste praksis metoder>
`;

// Prompts components, backup
// <analysis>
// Briefly discuss how well the original journal entry adheres to the best practices and identify areas for improvement.
// </analysis>

// <headline>
// Provide a headline that encapsulates the main defining characteristic of the the events of the day as described in {{content}}
// </headline>

// <improved_entry>
// Write the improved journal entry here, incorporating the best practices and addressing the areas for improvement identified in your analysis.
// </improved_entry>

// <supervisor_feedback>
// Formulate feedback for the supervisor of the social worker that suggests potential next steps that might be needed given the history of {{subject}}. Use only bullet points, as the social worker will edit this bit of information.
// </supervisor_feedback>

// Remember to maintain a professional tone throughout the improved entry and ensure that all essential information from the original entry is preserved.
// `;

export function formatPromptWithVars(prompt: string, vars: JournalTemplateVars): string {
  return prompt
    .replace("{{content}}", vars.content)
    .replace("{{date}}", vars.date)
    .replace("{{author}}", vars.author)
    .replace("{{subject}}", vars.subject);
}
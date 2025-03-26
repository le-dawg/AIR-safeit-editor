export interface JournalTemplateVars {
  content: string;    // The main journal content from textarea
  date: string;      // Formatted date
  author: string;    // Author's name
  subject: string;   // Name of person under care
}

export const JOURNAL_SYSTEM_PROMPT = `Generate a journal entry based on the following information:
Date: {{date}}
Author: {{author}}
Subject: {{subject}}
Content: {{content}}
The journal entry should follow wholesome best practices for a social worker reporting on the days events of a person under their care.
Format the entry with a clear header including the date, author, and subject name.`;

export function formatPromptWithVars(prompt: string, vars: JournalTemplateVars): string {
  return prompt
    .replace("{{content}}", vars.content)
    .replace("{{date}}", vars.date)
    .replace("{{author}}", vars.author)
    .replace("{{subject}}", vars.subject);
}
